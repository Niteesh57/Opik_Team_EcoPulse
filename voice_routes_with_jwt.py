from fastapi import WebSocket, WebSocketDisconnect, APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional
import uuid
import json
from datetime import datetime
from app.dependencies import get_current_active_user
from app.models.user import User as UserModel
from app.database import SessionLocal
from jose import JWTError, jwt
from app.core.config import settings


router = APIRouter(prefix="/voice", tags=["voice"])


class VoiceRoom:
    """Represents a voice call room."""
    def __init__(self, room_id: str, created_by: int, room_name: str = None):
        self.room_id = room_id
        self.created_by = created_by
        self.room_name = room_name or f"Room {room_id[:8]}"
        self.created_at = datetime.now()
        self.participants: Dict[int, Dict] = {}  # user_id -> {name, websocket, joined_at}
        self.is_active = True
        self.recording_enabled = False
    
    def add_participant(self, user_id: int, user_name: str, websocket: WebSocket):
        """Add a participant to the room."""
        self.participants[user_id] = {
            "name": user_name,
            "websocket": websocket,
            "joined_at": datetime.now().isoformat()
        }
    
    def remove_participant(self, user_id: int):
        """Remove a participant from the room."""
        if user_id in self.participants:
            del self.participants[user_id]
    
    def get_status(self):
        """Get room status."""
        return {
            "room_id": self.room_id,
            "room_name": self.room_name,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat(),
            "is_active": self.is_active,
            "participant_count": len(self.participants),
            "participants": [
                {
                    "user_id": user_id,
                    "name": data["name"],
                    "joined_at": data["joined_at"]
                }
                for user_id, data in self.participants.items()
            ],
            "recording_enabled": self.recording_enabled
        }


class VoiceConnectionManager:
    """Manages voice call connections and rooms."""
    def __init__(self):
        self.rooms: Dict[str, VoiceRoom] = {}  # room_id -> VoiceRoom
        self.user_rooms: Dict[int, str] = {}  # user_id -> room_id (current room)

    async def create_room(self, user_id: int, room_name: str = None) -> str:
        """Create a new voice room."""
        room_id = str(uuid.uuid4())
        room = VoiceRoom(room_id, user_id, room_name)
        self.rooms[room_id] = room
        print(f"Voice room {room_id} created by user {user_id}")
        return room_id

    async def connect(self, websocket: WebSocket, room_id: str, user_id: int, user_name: str):
        """Connect a user to a voice room."""
        if room_id not in self.rooms:
            raise ValueError(f"Room {room_id} does not exist")
        
        room = self.rooms[room_id]
        if not room.is_active:
            raise ValueError(f"Room {room_id} is not active")
        
        await websocket.accept()
        room.add_participant(user_id, user_name, websocket)
        self.user_rooms[user_id] = room_id
        
        print(f"User {user_id} ({user_name}) joined room {room_id}")
        
        # Notify others about new participant
        await self.broadcast_status(room_id, user_id, "user_joined")

    def disconnect(self, user_id: int, room_id: str):
        """Disconnect a user from a voice room."""
        if room_id in self.rooms:
            room = self.rooms[room_id]
            room.remove_participant(user_id)
            
            if user_id in self.user_rooms:
                del self.user_rooms[user_id]
            
            print(f"User {user_id} left room {room_id}")
            
            # Close room if empty
            if len(room.participants) == 0:
                room.is_active = False
                print(f"Room {room_id} is now empty and closed")

    async def broadcast(self, data: bytes, room_id: str, sender_id: int):
        """Broadcast voice data to all participants except sender."""
        if room_id in self.rooms:
            room = self.rooms[room_id]
            for user_id, participant in room.participants.items():
                if user_id != sender_id:
                    try:
                        await participant["websocket"].send_bytes(data)
                    except Exception as e:
                        print(f"Error sending to user {user_id}: {e}")

    async def broadcast_status(self, room_id: str, trigger_user_id: int, event_type: str):
        """Broadcast room status to all participants."""
        if room_id in self.rooms:
            room = self.rooms[room_id]
            status_data = room.get_status()
            status_message = json.dumps({
                "event": event_type,
                "timestamp": datetime.now().isoformat(),
                "room": status_data,
                "trigger_user_id": trigger_user_id
            })
            
            for user_id, participant in room.participants.items():
                try:
                    await participant["websocket"].send_text(status_message)
                except Exception as e:
                    print(f"Error sending status to user {user_id}: {e}")

    def get_room_status(self, room_id: str) -> Optional[Dict]:
        """Get status of a specific room."""
        if room_id in self.rooms:
            return self.rooms[room_id].get_status()
        return None

    def list_active_rooms(self) -> List[Dict]:
        """List all active rooms."""
        return [room.get_status() for room in self.rooms.values() if room.is_active]

    def get_user_room(self, user_id: int) -> Optional[str]:
        """Get the room ID of a user's current connection."""
        return self.user_rooms.get(user_id)


# Global manager instance
manager = VoiceConnectionManager()


async def get_user_from_websocket_token(websocket: WebSocket) -> Optional[UserModel]:
    """Extract and validate JWT token from WebSocket connection."""
    try:
        # Try to get token from query params
        token = websocket.query_params.get("token")
        
        if not token:
            return None
        
        # Decode and validate token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("sub")
        
        if user_id is None:
            return None
        
        # Get user from database
        db = SessionLocal()
        try:
            user = db.query(UserModel).filter(UserModel.id == user_id).first()
            return user
        finally:
            db.close()
            
    except JWTError:
        return None
    except Exception as e:
        print(f"Error validating WebSocket token: {e}")
        return None


# --- REST API Endpoints ---

@router.post("/rooms", response_model=Dict)
async def create_voice_room(
    room_name: Optional[str] = None,
    current_user: UserModel = Depends(get_current_active_user)
):
    """Create a new voice call room."""
    try:
        room_id = await manager.create_room(current_user.id, room_name)
        room = manager.rooms[room_id]
        
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "status": "success",
                "room_id": room_id,
                "room_name": room.room_name,
                "created_by": current_user.id,
                "created_at": room.created_at.isoformat(),
                "join_url": f"/api/v1/voice/ws/{room_id}",
                "message": f"Voice room created successfully. Share the room ID to invite others."
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"status": "error", "message": str(e)}
        )


@router.get("/rooms/{room_id}", response_model=Dict)
async def get_room_status(
    room_id: str,
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get the status of a voice room."""
    room_status = manager.get_room_status(room_id)
    
    if room_status is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Room {room_id} not found"
        )
    
    return {
        "status": "success",
        "room": room_status
    }


@router.get("/rooms", response_model=Dict)
async def list_voice_rooms(
    current_user: UserModel = Depends(get_current_active_user)
):
    """List all active voice rooms."""
    active_rooms = manager.list_active_rooms()
    
    return {
        "status": "success",
        "total_active_rooms": len(active_rooms),
        "rooms": active_rooms,
        "your_current_room": manager.get_user_room(current_user.id)
    }


@router.get("/my-room", response_model=Dict)
async def get_my_current_room(
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get the current room the user is in."""
    current_room_id = manager.get_user_room(current_user.id)
    
    if current_room_id is None:
        return {
            "status": "no_room",
            "message": "You are not currently in any voice room"
        }
    
    room_status = manager.get_room_status(current_room_id)
    
    return {
        "status": "success",
        "room": room_status
    }


@router.post("/rooms/{room_id}/end", response_model=Dict)
async def end_voice_room(
    room_id: str,
    current_user: UserModel = Depends(get_current_active_user)
):
    """End a voice room (only room creator can do this)."""
    room = manager.rooms.get(room_id)
    
    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Room {room_id} not found"
        )
    
    if room.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only room creator can end the room"
        )
    
    room.is_active = False
    
    return {
        "status": "success",
        "message": f"Voice room {room_id} has been ended",
        "room_id": room_id
    }


# --- WebSocket Endpoint ---

@router.websocket("/ws/{room_id}")
async def websocket_voice_endpoint(websocket: WebSocket, room_id: str):
    """WebSocket endpoint for voice streaming with JWT authentication."""
    user_id = None
    user_name = None
    
    try:
        # Authenticate user from JWT token
        user = await get_user_from_websocket_token(websocket)
        
        if user is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication required")
            print(f"WebSocket authentication failed for room {room_id}")
            return
        
        user_id = user.id
        user_name = user.full_name or user.username or f"User {user_id}"
        
        print(f"Authenticated user {user_id} ({user_name}) for room {room_id}")
        
        # Connect to room
        await manager.connect(websocket, room_id, user_id, user_name)
        
        # Main loop for receiving and broadcasting voice data
        while True:
            # Check if it's text (status/control) or binary (voice data)
            try:
                data = await websocket.receive_bytes()
                # Broadcast voice data to other participants
                await manager.broadcast(data, room_id, user_id)
            except RuntimeError:
                # Try receiving text for control messages
                text_data = await websocket.receive_text()
                message = json.loads(text_data)
                
                # Handle control messages
                if message.get("type") == "status_request":
                    await websocket.send_text(json.dumps({
                        "event": "status",
                        "room": manager.get_room_status(room_id)
                    }))
                
    except WebSocketDisconnect:
        if user_id and room_id:
            manager.disconnect(user_id, room_id)
            # Notify others about disconnection
            if room_id in manager.rooms:
                await manager.broadcast_status(room_id, user_id, "user_left")
    
    except Exception as e:
        print(f"WebSocket error: {e}")
        if user_id and room_id:
            manager.disconnect(user_id, room_id)
        try:
            await websocket.close(code=status.WS_1011_SERVER_ERROR, reason=str(e))
        except:
            pass

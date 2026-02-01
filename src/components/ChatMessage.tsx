import React, { useRef, useState, useEffect } from "react";
import SharePopup from "./SharePopup";

type Message = {
	imageUrl?: string;
	mediaUrl?: string;
	type?: string;
	url?: string;
	alt?: string;
	// You can add other properties of the message object here
	[key: string]: any;
};

type ChatMessageProps = {
	message: Message;
};

export default function ChatMessage({ message }: ChatMessageProps) {
	const [showShare, setShowShare] = useState(false);
	const shareRef = useRef<HTMLDivElement | null>(null);
	const imageUrl =
		message.imageUrl ||
		message.mediaUrl ||
		(message.type === "image" ? message.url : undefined);

	useEffect(() => {
		function onDocClick(e: MouseEvent) {
			if (!shareRef.current) return;
			if (!shareRef.current.contains(e.target as Node)) {
				setShowShare(false);
			}
		}
		if (showShare) document.addEventListener("click", onDocClick);
		return () => document.removeEventListener("click", onDocClick);
	}, [showShare]);

	return (
		<div className="chat-message">
			{/* ...existing rendering of message content... */}
			{!!imageUrl && (
				<div className="image-message" style={{ position: "relative" }}>
					<img src={imageUrl} alt={message.alt || "image"} />
					<div
						className="image-actions"
						ref={shareRef}
						style={{
							position: "absolute",
							right: 8,
							bottom: 8,
						}}
					>
						{/* share icon (simple button) */}
						<button
							className="share-icon"
							aria-label="Share image"
							title="Share"
							onClick={(e) => {
								e.stopPropagation();
								setShowShare((s) => !s);
							}}
							style={{
								width: 34,
								height: 34,
								borderRadius: "50%",
								border: "1px solid rgba(0,0,0,0.08)",
								background: "rgba(255,255,255,0.95)",
								boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
								cursor: "pointer",
								display: "grid",
								placeItems: "center",
								fontSize: 16,
							}}
						>
							{/* A simple share icon */}
							↗
						</button>

						{showShare && (
							<div
								style={{
									position: "absolute",
									bottom: "100%", // Position above the button
									right: 0,
									marginBottom: 6,
									zIndex: 100,
								}}
							>
								<SharePopup imageUrl={imageUrl} onClose={() => setShowShare(false)} />
							</div>
						)}
					</div>
				</div>
			)}
			{/* ...existing code... */}
		</div>
	);
}
import React from 'react';
import { Users, Plus } from 'lucide-react';

const TaskCard = ({ title, plantName, image, priority, neighbors }) => {
  return (
    <div className="glass-panel" style={{
      minWidth: '260px',
      height: '320px',
      marginRight: '16px',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Priority Tag */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(255,255,255,0.9)',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        color: 'var(--color-sage-green)',
        zIndex: 10
      }}>
        {priority}
      </div>

      {/* Image Area */}
      <div style={{
        height: '180px',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '12px',
        position: 'relative'
      }}>
        <img
          src={image}
          alt={plantName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ marginBottom: '4px' }}>{title}</h3>
          <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{plantName}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Neighbor Avatars */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', marginRight: '8px' }}>
              {neighbors.map((n, i) => (
                <div key={i} style={{
                  width: '24px', height: '24px', borderRadius: '50%', background: '#ddd',
                  border: '2px solid white', marginLeft: i > 0 ? '-8px' : '0',
                  overflow: 'hidden'
                }}>
                  <img src={n} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>+3</span>
          </div>

          {/* Join Button */}
          <button style={{
            background: 'var(--color-sage-green)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 20px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

import React from 'react';
import { Bell, Sparkles } from 'lucide-react';

export const Navbar = ({ title }) => {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <h2>{title}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="status-pill">
          <Sparkles size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          System Active • Phase 0
        </div>
        <button 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-secondary)', 
            cursor: 'pointer',
            padding: 8,
            display: 'flex'
          }}
          title="Notifications"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
};

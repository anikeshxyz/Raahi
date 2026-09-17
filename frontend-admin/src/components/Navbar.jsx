import React from 'react';
import { Bell, Sparkles, Menu } from 'lucide-react';

export const Navbar = ({ title, onOpenSidebar }) => {
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={onOpenSidebar}
          aria-label="Open navigation drawer"
        >
          <Menu size={22} />
        </button>

        <div className="topbar-title">
          <h2>{title}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="status-pill topbar-status-pill">
          <Sparkles size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          <span>Active • v1.0.0</span>
        </div>
        <button 
          className="topbar-icon-btn"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  CookingPot, 
  Package, 
  Users, 
  BarChart3, 
  Menu
} from 'lucide-react';

export const MobileBottomNav = ({ onOpenSidebar }) => {
  const navItems = [
    { to: '/pos', label: 'POS', icon: UtensilsCrossed },
    { to: '/kot', label: 'KDS', icon: CookingPot },
    { to: '/inventory', label: 'Stock', icon: Package },
    { to: '/employees', label: 'Staff', icon: Users },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Bar">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon-wrap">
              <Icon size={20} />
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        );
      })}

      <button 
        type="button" 
        className="mobile-nav-tab more-tab" 
        onClick={onOpenSidebar}
        aria-label="Open all modules menu"
      >
        <div className="mobile-nav-icon-wrap">
          <Menu size={20} />
        </div>
        <span className="mobile-nav-label">More</span>
      </button>
    </nav>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Coffee, 
  UtensilsCrossed, 
  Package, 
  Users, 
  BarChart3, 
  LogOut,
  CookingPot,
  Truck
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { to: '/pos', label: 'POS & Tables', icon: UtensilsCrossed },
    { to: '/kot', label: 'KDS / Kitchen', icon: CookingPot },
    { to: '/inventory', label: 'Inventory & Recipes', icon: Package },
    { to: '/purchase', label: 'Purchase & Vendors', icon: Truck },
    { to: '/employees', label: 'Staff & Attendance', icon: Users },
    { to: '/reports', label: 'Sales & Reports', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-badge">
          <Coffee size={22} />
        </div>
        <div className="brand-text">
          <h1>Raahi Café</h1>
          <span>Operations Suite</span>
        </div>
      </div>

      <ul className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="nav-item">
              <NavLink 
                to={item.to} 
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-meta">
            <span className="user-name">Manager On Duty</span>
            <span className="user-role">Owner / Admin</span>
          </div>
          <NavLink to="/login" title="Logout" style={{ color: '#ef4444', display: 'flex' }}>
            <LogOut size={16} />
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

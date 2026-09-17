import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileBottomNav } from './MobileBottomNav';

const titlesMap = {
  '/pos': 'Point of Sale & Live Tables',
  '/kot': 'Kitchen Order Tickets & KDS',
  '/inventory': 'Inventory Management & Recipe Mapping',
  '/purchase': 'Purchase & Supplier Management',
  '/employees': 'Staff Management, Attendance & Leaves',
  '/reports': 'Executive Reports & Business Analytics',
};

export const Layout = () => {
  const location = useLocation();
  const title = titlesMap[location.pathname] || 'Raahi Café Management';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <div className="main-content">
        <Navbar 
          title={title} 
          onOpenSidebar={() => setIsSidebarOpen(true)} 
        />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>

      {/* Native-style Mobile Bottom Navigation Bar (< 768px) */}
      <MobileBottomNav onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
};

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const titlesMap = {
  '/pos': 'Point of Sale & Live Tables',
  '/kot': 'Kitchen Order Tickets & KDS',
  '/inventory': 'Inventory Management & Recipe Mapping',
  '/employees': 'Staff Management, Attendance & Leaves',
  '/reports': 'Executive Reports & Business Analytics',
};

export const Layout = () => {
  const location = useLocation();
  const title = titlesMap[location.pathname] || 'Raahi Café Management';

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title={title} />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

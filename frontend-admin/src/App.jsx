import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { POSDashboard } from './pages/pos/POSDashboard';
import { KOTDashboard } from './pages/kot/KOTDashboard';
import { InventoryDashboard } from './pages/inventory/InventoryDashboard';
import { EmployeeDashboard } from './pages/employees/EmployeeDashboard';
import { ReportsDashboard } from './pages/reports/ReportsDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/pos" replace />} />
          <Route path="pos" element={<POSDashboard />} />
          <Route path="kot" element={<KOTDashboard />} />
          <Route path="inventory" element={<InventoryDashboard />} />
          <Route path="employees" element={<EmployeeDashboard />} />
          <Route path="reports" element={<ReportsDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/**
 * New Dashboard Layout - For Role-based Dashboards
 * Layout для новых role-based дашбордов (Patient, Doctor, Clinic, Partner, Admin)
 * Использует children вместо Outlet
 */
export const NewDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};


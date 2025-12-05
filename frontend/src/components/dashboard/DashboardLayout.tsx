import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/**
 * Old Dashboard Layout - For Legacy Routes
 * Layout для старых nested роутов (/dashboard/*)
 * Использует Outlet для вложенных маршрутов
 */
export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};



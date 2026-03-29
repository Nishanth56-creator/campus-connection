import { useState } from 'react';
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';
import './AppLayout.css';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}

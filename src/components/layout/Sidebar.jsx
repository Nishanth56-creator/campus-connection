import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  X, LayoutDashboard, Settings, Palette, Shield, Info,
  Bug, LogOut, Home, FolderKanban, Terminal, Compass, Users, ChevronRight
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const mainLinks = [
    { to: '/', icon: <Home size={20} />, label: 'Home' },
    { to: '/projects', icon: <FolderKanban size={20} />, label: 'My Projects' },
    { to: '/playground', icon: <Terminal size={20} />, label: 'Code Playground' },
    { to: '/explore', icon: <Compass size={20} />, label: 'Explore' },
    { to: '/collaborate', icon: <Users size={20} />, label: 'Collaborate' },
  ];

  const menuLinks = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '#settings', icon: <Settings size={20} />, label: 'Settings' },
    { to: '#personalization', icon: <Palette size={20} />, label: 'Personalization' },
    { to: '#security', icon: <Shield size={20} />, label: 'Security' },
  ];

  const bottomLinks = [
    { to: '#about', icon: <Info size={20} />, label: 'About Us' },
    { to: '#report', icon: <Bug size={20} />, label: 'Report Bug' },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-user-info">
            <div className="avatar avatar-lg" style={{ background: user?.avatar || 'var(--primary-500)' }}>
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h4 className="sidebar-user-name">{user?.fullName}</h4>
              <p className="sidebar-user-email">{user?.email}</p>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <span className="sidebar-section-title">Navigation</span>
            {mainLinks.map(link => (
              <Link
                key={link.label}
                to={link.to}
                className={`sidebar-link ${location.pathname === link.to ? 'active' : ''}`}
                onClick={onClose}
              >
                {link.icon}
                <span>{link.label}</span>
                <ChevronRight size={16} className="sidebar-link-arrow" />
              </Link>
            ))}
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-section">
            <span className="sidebar-section-title">Menu</span>
            {menuLinks.map(link => (
              <Link
                key={link.label}
                to={link.to}
                className="sidebar-link"
                onClick={onClose}
              >
                {link.icon}
                <span>{link.label}</span>
                <ChevronRight size={16} className="sidebar-link-arrow" />
              </Link>
            ))}
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-section">
            {bottomLinks.map(link => (
              <Link
                key={link.label}
                to={link.to}
                className="sidebar-link"
                onClick={onClose}
              >
                {link.icon}
                <span>{link.label}</span>
                <ChevronRight size={16} className="sidebar-link-arrow" />
              </Link>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-link sidebar-logout" onClick={() => { logout(); onClose(); }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

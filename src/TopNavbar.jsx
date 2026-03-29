import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Code2, Menu, Home, FolderKanban, Terminal, Bell, Search, Compass } from 'lucide-react';
import './TopNavbar.css';

export default function TopNavbar({ onMenuClick }) {
  const { user } = useAuth();
  const { notifications } = useWorkspace();
  const location = useLocation();
  const unread = notifications.filter(n => !n.read).length;

  const navLinks = [
    { to: '/', icon: <Home size={18} />, label: 'Home' },
    { to: '/projects', icon: <FolderKanban size={18} />, label: 'My Projects' },
    { to: '/playground', icon: <Terminal size={18} />, label: 'Code Playground' },
    { to: '/explore', icon: <Compass size={18} />, label: 'Explore' },
  ];

  return (
    <nav className="top-navbar" id="top-navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={onMenuClick} id="menu-toggle">
          <Menu size={22} />
        </button>
        <Link to="/" className="navbar-logo">
          <img 
            src="/logo.png" 
            alt="Campus Connection Logo" 
            className="navbar-logo-image" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              document.getElementById('fallback-logo-icon').style.display = 'flex';
            }}
          />
          <div className="navbar-logo-icon" id="fallback-logo-icon" style={{ display: 'none' }}>
            <Code2 size={20} />
          </div>
          <span className="navbar-logo-text">Campus Connection</span>
        </Link>
      </div>

      <div className="navbar-center">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="navbar-right">
        <button className="navbar-icon-btn tooltip" data-tooltip="Notifications" id="notifications-btn">
          <Bell size={20} />
          {unread > 0 && <span className="navbar-badge">{unread}</span>}
        </button>
        <div className="navbar-user">
          <div className="avatar" style={{ background: user?.avatar || 'var(--primary-500)' }}>
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="navbar-username">{user?.fullName?.split(' ')[0]}</span>
        </div>
      </div>
    </nav>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Code2, Menu, Home, FolderKanban, Terminal, Bell, Compass, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import './TopNavbar.css';

export default function TopNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { notifications } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinks = [
    { to: '/', icon: <Home size={18} />, label: 'Home' },
    { to: '/projects', icon: <FolderKanban size={18} />, label: 'My Projects' },
    { to: '/playground', icon: <Terminal size={18} />, label: 'Code Playground' },
    { to: '/explore', icon: <Compass size={18} />, label: 'Explore' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/auth');
  };

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

        {/* Profile Dropdown */}
        <div className="navbar-user-wrap" ref={dropdownRef}>
          <button
            className="navbar-user"
            onClick={() => setDropdownOpen(prev => !prev)}
            id="profile-btn"
          >
            <div className="avatar" style={{ background: user?.avatar || 'var(--primary-500)' }}>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="navbar-username">{user?.fullName?.split(' ')[0]}</span>
            <ChevronDown size={14} className={`navbar-chevron ${dropdownOpen ? 'open' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="navbar-dropdown">
              {/* Profile Info */}
              <div className="navbar-dropdown-header">
                <div className="avatar avatar-lg" style={{ background: user?.avatar || 'var(--primary-500)' }}>
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="navbar-dropdown-name">{user?.fullName}</p>
                  <p className="navbar-dropdown-email">{user?.email}</p>
                </div>
              </div>

              <div className="navbar-dropdown-divider" />

              <button className="navbar-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/projects'); }}>
                <FolderKanban size={16} />
                My Projects
              </button>

              <button className="navbar-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/playground'); }}>
                <Terminal size={16} />
                Playground
              </button>

              <div className="navbar-dropdown-divider" />

              <button className="navbar-dropdown-item navbar-dropdown-item-danger" onClick={handleLogout} id="logout-btn">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { FolderKanban, Clock, Users, Search, Grid3X3, List, ArrowRight, Code2 } from 'lucide-react';
import './ProjectsPage.css';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { workspaces } = useWorkspace();
  const navigate = useNavigate();
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const myWorkspaces = workspaces.filter(w => w.members?.some(m => m.id === user?.id));

  const filtered = myWorkspaces.filter(w => {
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'owned' && w.ownerId !== user?.id) return false;
    if (filter === 'joined' && w.ownerId === user?.id) return false;
    return true;
  });

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="projects-page">
      <div className="pj-header">
        <div>
          <h1>My Projects</h1>
          <p>{myWorkspaces.length} workspace{myWorkspaces.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="pj-controls">
          <div className="pj-search">
            <Search size={16} />
            <input
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="pj-filters">
            {['all', 'owned', 'joined'].map(f => (
              <button key={f} className={`pj-filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="pj-view-toggle">
            <button className={`pj-view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>
              <Grid3X3 size={16} />
            </button>
            <button className={`pj-view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={48} />
          <h3>No projects yet</h3>
          <p>Create a workspace from the home page to start your first project.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Home</button>
        </div>
      ) : (
        <div className={`pj-grid ${view === 'list' ? 'pj-list' : ''}`}>
          {filtered.map(ws => (
            <div key={ws.id} className="pj-card" onClick={() => navigate(`/workspace/${ws.id}`)}>
              <div className="pj-card-header">
                <div className="pj-card-icon">
                  <Code2 size={20} />
                </div>
                <span className="badge badge-success">Active</span>
              </div>
              <h3 className="pj-card-title">{ws.name}</h3>
              <p className="pj-card-desc">{ws.description || 'No description'}</p>
              <div className="pj-card-meta">
                <span><Clock size={12} /> {formatDate(ws.updatedAt || ws.createdAt)}</span>
                <span><Users size={12} /> {ws.members?.length || 1}</span>
              </div>
              <div className="pj-card-footer">
                <div className="pj-card-members">
                  {ws.members?.slice(0, 3).map((m, i) => (
                    <div key={i} className="avatar avatar-sm" style={{ background: m.avatar, marginLeft: i > 0 ? '-8px' : 0, zIndex: 3 - i }}>
                      {m.name?.charAt(0)}
                    </div>
                  ))}
                </div>
                <ArrowRight size={16} className="pj-card-arrow" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

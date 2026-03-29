import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import {
  Plus, Users, Compass, Rocket, Code2, FolderKanban,
  MessageSquare, GitBranch, Zap, ArrowRight, Globe,
  Sparkles, Search, UserPlus, X
} from 'lucide-react';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();
  const { createWorkspace, joinWorkspace, workspaces } = useWorkspace();
  const toast = useToast();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', template: 'blank' });
  const [joinCode, setJoinCode] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) { toast.error('Please enter a project name'); return; }
    
    try {
      const ws = await createWorkspace(createForm);
      if (ws) {
        toast.success('Workspace created! 🚀');
        setShowCreateModal(false);
        setCreateForm({ name: '', description: '', template: 'blank' });
        navigate(`/workspace/${ws.id}`);
      } else {
        toast.error('Failed to create workspace');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) { toast.error('Please enter an invite code'); return; }
    
    try {
      const result = await joinWorkspace(joinCode);
      if (result.success) {
        toast.success('Joined workspace! 🎉');
        setShowJoinModal(false);
        setJoinCode('');
        navigate(`/workspace/${result.workspace.id}`);
      } else {
        toast.error(result.error || 'Failed to join workspace');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  const recentWorkspaces = workspaces
    .filter(w => w.members.some(m => m.id === user?.id))
    .slice(-3)
    .reverse();

  const features = [
    { icon: <Code2 size={24} />, title: 'Live Coding', desc: 'Real-time collaborative code editing with live cursors', color: '#6366f1' },
    { icon: <MessageSquare size={24} />, title: 'Team Chat', desc: 'Built-in messaging linked to your code and tasks', color: '#8b5cf6' },
    { icon: <FolderKanban size={24} />, title: 'Task Manager', desc: 'Assign roles, set deadlines, track progress', color: '#a855f7' },
    { icon: <GitBranch size={24} />, title: 'Version Control', desc: 'Simplified Git-like system for beginners', color: '#c084fc' },
    { icon: <Zap size={24} />, title: 'AI Assistant', desc: 'Smart code suggestions and conflict detection', color: '#ec4899' },
    { icon: <Rocket size={24} />, title: 'One-Click Deploy', desc: 'Deploy your project to a live URL instantly', color: '#f43f5e' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-bg">
          <div className="home-hero-orb home-hero-orb-1"></div>
          <div className="home-hero-orb home-hero-orb-2"></div>
          <div className="home-hero-grid"></div>
        </div>
        <div className="home-hero-content">
          <div className="home-hero-badge animate-fade-in-up">
            <Sparkles size={14} />
            <span>Welcome back, {user?.fullName?.split(' ')[0]}!</span>
          </div>
          <h1 className="home-hero-title animate-fade-in-up delay-1">
            Build Together,
            <span className="gradient-text"> Ship Faster</span>
          </h1>
          <p className="home-hero-subtitle animate-fade-in-up delay-2">
            Your all-in-one collaborative workspace for coding, communicating, and deploying projects with your team.
          </p>
          <div className="home-hero-actions animate-fade-in-up delay-3">
            <button className="btn btn-primary btn-lg" onClick={() => setShowCreateModal(true)} id="create-workspace-btn">
              <Plus size={20} />
              Create Workspace
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => setShowJoinModal(true)} id="join-workspace-btn">
              <Users size={20} />
              Join Workspace
            </button>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="home-grid-2">
            {/* Workspace Panel */}
            <div className="home-panel">
              <div className="home-panel-header">
                <div className="home-panel-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <Code2 size={22} />
                </div>
                <div>
                  <h3>Workspace</h3>
                  <p>Create or join a collaborative workspace</p>
                </div>
              </div>
              <div className="home-panel-actions">
                <button className="home-action-card" onClick={() => setShowCreateModal(true)}>
                  <Plus size={20} />
                  <div>
                    <h4>Create Workspace</h4>
                    <p>Start a new project</p>
                  </div>
                  <ArrowRight size={16} className="home-action-arrow" />
                </button>
                <button className="home-action-card" onClick={() => setShowJoinModal(true)}>
                  <UserPlus size={20} />
                  <div>
                    <h4>Join Workspace</h4>
                    <p>Enter invite code</p>
                  </div>
                  <ArrowRight size={16} className="home-action-arrow" />
                </button>
              </div>
              {recentWorkspaces.length > 0 && (
                <div className="home-recent">
                  <span className="home-recent-label">Recent</span>
                  {recentWorkspaces.map(ws => (
                    <button key={ws.id} className="home-recent-item" onClick={() => navigate(`/workspace/${ws.id}`)}>
                      <div className="home-recent-dot"></div>
                      <span>{ws.name}</span>
                      <ArrowRight size={14} className="home-action-arrow" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Explore Panel */}
            <div className="home-panel">
              <div className="home-panel-header">
                <div className="home-panel-icon" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                  <Compass size={22} />
                </div>
                <div>
                  <h3>Explore</h3>
                  <p>Discover projects and find teammates</p>
                </div>
              </div>
              <div className="home-panel-actions">
                <button className="home-action-card" onClick={() => navigate('/explore')}>
                  <Search size={20} />
                  <div>
                    <h4>Discover Projects</h4>
                    <p>Browse open-source projects</p>
                  </div>
                  <ArrowRight size={16} className="home-action-arrow" />
                </button>
                <button className="home-action-card" onClick={() => navigate('/collaborate')}>
                  <Globe size={20} />
                  <div>
                    <h4>Find Teammates</h4>
                    <p>Connect with developers</p>
                  </div>
                  <ArrowRight size={16} className="home-action-arrow" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="home-section home-features-section">
        <div className="home-section-inner">
          <h2 className="home-section-title">Everything you need, in one place</h2>
          <p className="home-section-desc">No more switching between tools. Campus Connection brings it all together.</p>
          <div className="home-features-grid">
            {features.map((f, i) => (
              <div key={i} className="home-feature-card" style={{ '--feature-color': f.color }}>
                <div className="home-feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Workspace</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="input-group">
                <label htmlFor="ws-name">Project Name</label>
                <input
                  id="ws-name"
                  className="input-field"
                  placeholder="My Awesome Project"
                  value={createForm.name}
                  onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div className="input-group">
                <label htmlFor="ws-desc">Description</label>
                <textarea
                  id="ws-desc"
                  className="input-field"
                  placeholder="What's this project about?"
                  rows={3}
                  value={createForm.description}
                  onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="input-group">
                <label htmlFor="ws-template">Template</label>
                <select id="ws-template" className="input-field" value={createForm.template} onChange={e => setCreateForm(prev => ({ ...prev, template: e.target.value }))}>
                  <option value="blank">Blank Project</option>
                  <option value="html-css-js">HTML + CSS + JS</option>
                  <option value="react">React App</option>
                  <option value="python">Python Script</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Rocket size={16} />
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Workspace Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Join a Workspace</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowJoinModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleJoin} className="modal-form">
              <div className="input-group">
                <label htmlFor="invite-code">Invite Code</label>
                <input
                  id="invite-code"
                  className="input-field"
                  placeholder="Enter 6-character code"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '4px' }}
                  autoFocus
                />
              </div>
              <p className="modal-hint">Ask your team lead for the invite code to join their workspace.</p>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowJoinModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Users size={16} />
                  Join Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

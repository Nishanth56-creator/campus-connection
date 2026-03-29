import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Users, Plus, X, Send, CheckCircle, XCircle, Clock,
  Code2, Globe, Lock, User, MessageSquare, Filter
} from 'lucide-react';
import './CollaborationPage.css';

const SAMPLE_LISTINGS = [
  {
    id: 'c1', title: 'AI-Powered Resume Builder', description: 'Building an intelligent resume builder that uses NLP to optimize resumes for ATS systems.', tech: ['React', 'Python', 'GPT-4', 'FastAPI'], status: 'Development', collaboration: 'Open', teamSize: 3, maxTeam: 5, owner: { name: 'Aisha Patel', avatar: '#ec4899' },
    requests: []
  },
  {
    id: 'c2', title: 'Campus Navigation AR App', description: 'Augmented reality app to help new students navigate campus buildings and find classrooms.', tech: ['React Native', 'ARKit', 'Node.js'], status: 'Idea', collaboration: 'Open', teamSize: 1, maxTeam: 4, owner: { name: 'Marcus Chen', avatar: '#3b82f6' },
    requests: []
  },
  {
    id: 'c3', title: 'Smart Attendance System', description: 'Facial recognition-based attendance system for classrooms using edge computing.', tech: ['Python', 'OpenCV', 'TensorFlow', 'Raspberry Pi'], status: 'Development', collaboration: 'Open', teamSize: 4, maxTeam: 6, owner: { name: 'Raj Kumar', avatar: '#f97316' },
    requests: []
  },
  {
    id: 'c4', title: 'Peer Tutoring Marketplace', description: 'Platform connecting students who need help with peer tutors from the same university.', tech: ['Next.js', 'PostgreSQL', 'Stripe', 'Socket.io'], status: 'Idea', collaboration: 'Open', teamSize: 2, maxTeam: 5, owner: { name: 'Sofia Rodriguez', avatar: '#a855f7' },
    requests: []
  },
  {
    id: 'c5', title: 'Green Campus Dashboard', description: 'IoT dashboard monitoring energy usage, waste, and sustainability metrics across campus.', tech: ['Vue.js', 'InfluxDB', 'MQTT', 'D3.js'], status: 'Completed', collaboration: 'Closed', teamSize: 5, maxTeam: 5, owner: { name: 'Emily Wilson', avatar: '#10b981' },
    requests: []
  },
];

const STATUS_COLORS = { 'Idea': '#f59e0b', 'Development': '#6366f1', 'Completed': '#10b981' };
const COLLAB_COLORS = { 'Open': '#10b981', 'Closed': '#ef4444' };

export default function CollaborationPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [listings, setListings] = useState(SAMPLE_LISTINGS);
  const [showCreate, setShowCreate] = useState(false);
  const [showRequest, setShowRequest] = useState(null);
  const [requestMsg, setRequestMsg] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sent, setSent] = useState([]);

  const [createForm, setCreateForm] = useState({
    title: '', description: '', tech: '', status: 'Idea',
    collaboration: 'Open', maxTeam: 4
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const newListing = {
      id: Date.now().toString(),
      ...createForm,
      tech: createForm.tech.split(',').map(t => t.trim()).filter(Boolean),
      teamSize: 1,
      maxTeam: parseInt(createForm.maxTeam),
      owner: { name: user?.fullName, avatar: user?.avatar },
      requests: []
    };
    setListings(prev => [newListing, ...prev]);
    setShowCreate(false);
    setCreateForm({ title: '', description: '', tech: '', status: 'Idea', collaboration: 'Open', maxTeam: 4 });
    toast.success('Project listed for collaboration! 🎉');
  };

  const handleRequest = (listingId) => {
    if (!requestMsg.trim()) { toast.error('Please add a message'); return; }
    setSent(prev => [...prev, listingId]);
    setShowRequest(null);
    setRequestMsg('');
    toast.success('Collaboration request sent! 🤝');
  };

  const filtered = listings.filter(l => {
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) &&
        !l.tech.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filter === 'open' && l.collaboration !== 'Open') return false;
    if (filter === 'idea' && l.status !== 'Idea') return false;
    if (filter === 'development' && l.status !== 'Development') return false;
    return true;
  });

  return (
    <div className="collab-page">
      <div className="cb-header">
        <div>
          <h1>Open Collaboration</h1>
          <p>Showcase your projects and find collaborators</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Post Project
        </button>
      </div>

      <div className="cb-toolbar">
        <div className="cb-search">
          <Code2 size={16} />
          <input placeholder="Search projects or tech stack..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="cb-filters">
          {[
            { key: 'all', label: 'All' },
            { key: 'open', label: 'Open' },
            { key: 'idea', label: 'Ideas' },
            { key: 'development', label: 'In Dev' },
          ].map(f => (
            <button key={f.key} className={`cb-filter ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cb-listings">
        {filtered.map(listing => (
          <div key={listing.id} className="cb-card">
            <div className="cb-card-header">
              <div>
                <h3>{listing.title}</h3>
                <div className="cb-card-badges">
                  <span className="cb-status" style={{ color: STATUS_COLORS[listing.status], background: `${STATUS_COLORS[listing.status]}15` }}>
                    {listing.status}
                  </span>
                  <span className="cb-collab" style={{ color: COLLAB_COLORS[listing.collaboration], background: `${COLLAB_COLORS[listing.collaboration]}15` }}>
                    {listing.collaboration === 'Open' ? <Globe size={10} /> : <Lock size={10} />}
                    {listing.collaboration}
                  </span>
                </div>
              </div>
              <div className="cb-card-owner">
                <div className="avatar avatar-sm" style={{ background: listing.owner.avatar }}>
                  {listing.owner.name?.charAt(0)}
                </div>
                <span>{listing.owner.name}</span>
              </div>
            </div>

            <p className="cb-card-desc">{listing.description}</p>

            <div className="cb-card-tech">
              {listing.tech.map((t, i) => (
                <span key={i} className="cb-tech-tag">{t}</span>
              ))}
            </div>

            <div className="cb-card-footer">
              <div className="cb-card-meta">
                <span><Users size={12} /> {listing.teamSize}/{listing.maxTeam} members</span>
              </div>
              {listing.collaboration === 'Open' && listing.owner.name !== user?.fullName && (
                <button
                  className={`btn ${sent.includes(listing.id) ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  onClick={() => sent.includes(listing.id) ? null : setShowRequest(listing.id)}
                  disabled={sent.includes(listing.id)}
                >
                  {sent.includes(listing.id) ? <><Clock size={14} /> Requested</> : <><Send size={14} /> Request to Join</>}
                </button>
              )}
              {listing.collaboration === 'Closed' && (
                <span className="cb-closed-badge"><Lock size={12} /> Closed</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Post Project for Collaboration</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowCreate(false)}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleCreate}>
              <div className="input-group">
                <label>Project Title</label>
                <input className="input-field" placeholder="My Awesome Project" value={createForm.title} onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea className="input-field" rows={3} placeholder="Describe your project..." value={createForm.description} onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} required />
              </div>
              <div className="input-group">
                <label>Tech Stack (comma separated)</label>
                <input className="input-field" placeholder="React, Node.js, MongoDB" value={createForm.tech} onChange={e => setCreateForm(p => ({ ...p, tech: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="input-group">
                  <label>Status</label>
                  <select className="input-field" value={createForm.status} onChange={e => setCreateForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="Idea">Idea</option>
                    <option value="Development">Development</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Max Team Size</label>
                  <input type="number" className="input-field" min={2} max={10} value={createForm.maxTeam} onChange={e => setCreateForm(p => ({ ...p, maxTeam: e.target.value }))} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={16} /> Post Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequest && (
        <div className="modal-overlay" onClick={() => setShowRequest(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request to Join</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowRequest(null)}><X size={20} /></button>
            </div>
            <div className="modal-form">
              <div className="input-group">
                <label>Your Message</label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Introduce yourself and explain why you'd like to join this project..."
                  value={requestMsg}
                  onChange={e => setRequestMsg(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowRequest(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => handleRequest(showRequest)}>
                  <Send size={16} /> Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, User, Code2, MapPin, GraduationCap, UserPlus, ExternalLink, Filter } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './ExplorePage.css';

const SAMPLE_USERS = [
  { id: '101', fullName: 'Aisha Patel', email: 'aisha@uni.edu', domain: 'AI / ML', college: 'Stanford University', degree: 'M.S. CS', year: '2nd Year', avatar: '#ec4899', skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP'], bio: 'ML researcher focused on NLP and transformer models.' },
  { id: '102', fullName: 'Marcus Chen', email: 'marcus@uni.edu', domain: 'Web Development', college: 'MIT', degree: 'B.Tech CSE', year: '3rd Year', avatar: '#3b82f6', skills: ['React', 'Next.js', 'TypeScript', 'GraphQL'], bio: 'Full-stack developer building modern web applications.' },
  { id: '103', fullName: 'Sofia Rodriguez', email: 'sofia@uni.edu', domain: 'Mobile Development', college: 'UC Berkeley', degree: 'B.S. CS', year: '4th Year', avatar: '#a855f7', skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'], bio: 'Mobile developer with a passion for beautiful UIs.' },
  { id: '104', fullName: 'Raj Kumar', email: 'raj@uni.edu', domain: 'Cloud Computing', college: 'IIT Delhi', degree: 'B.Tech IT', year: '3rd Year', avatar: '#f97316', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'], bio: 'Cloud architect and DevOps enthusiast.' },
  { id: '105', fullName: 'Emily Wilson', email: 'emily@uni.edu', domain: 'Data Science', college: 'Harvard', degree: 'M.S. Data Science', year: '1st Year', avatar: '#10b981', skills: ['Python', 'R', 'SQL', 'Tableau'], bio: 'Data scientist passionate about storytelling with data.' },
  { id: '106', fullName: 'Kenji Tanaka', email: 'kenji@uni.edu', domain: 'Game Development', college: 'Tokyo Tech', degree: 'B.S. CS', year: '2nd Year', avatar: '#ef4444', skills: ['Unity', 'C#', 'Unreal Engine', 'Blender'], bio: 'Indie game developer and 3D artist.' },
];

const SAMPLE_PROJECTS = [
  { id: 'p1', name: 'EcoTrack', desc: 'AI-powered sustainability tracker for campus', tech: ['React', 'Python', 'TensorFlow'], members: 3, status: 'Development' },
  { id: 'p2', name: 'StudyMate', desc: 'Collaborative study platform with AI tutoring', tech: ['Next.js', 'GPT-4', 'PostgreSQL'], members: 4, status: 'Completed' },
  { id: 'p3', name: 'CampusConnect', desc: 'Social networking app for university students', tech: ['React Native', 'Firebase', 'Node.js'], members: 5, status: 'Development' },
  { id: 'p4', name: 'CodeReview AI', desc: 'Automated code review using machine learning', tech: ['Python', 'FastAPI', 'Docker'], members: 2, status: 'Idea' },
  { id: 'p5', name: 'HealthHub', desc: 'Health monitoring dashboard for students', tech: ['Vue.js', 'Flask', 'MongoDB'], members: 3, status: 'Development' },
  { id: 'p6', name: 'EventBuzz', desc: 'Campus event discovery and management platform', tech: ['React', 'Node.js', 'Redis'], members: 4, status: 'Completed' },
];

const STATUS_COLORS = {
  'Idea': '#f59e0b',
  'Development': '#6366f1',
  'Completed': '#10b981',
};

export default function ExplorePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('users');
  const [search, setSearch] = useState('');
  const [connected, setConnected] = useState([]);

  const allUsers = [...SAMPLE_USERS, ...(user ? [{ ...user, skills: user.skills || ['React'], bio: user.bio || '' }] : [])];
  
  const filteredUsers = allUsers.filter(u =>
    u.id !== user?.id &&
    (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
     u.domain?.toLowerCase().includes(search.toLowerCase()) ||
     u.skills?.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  const filteredProjects = SAMPLE_PROJECTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.desc.toLowerCase().includes(search.toLowerCase()) ||
    p.tech.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const handleConnect = (userId) => {
    if (connected.includes(userId)) return;
    setConnected(prev => [...prev, userId]);
    toast.success('Connection request sent! 🤝');
  };

  return (
    <div className="explore-page">
      <div className="ex-header">
        <div>
          <h1>Explore</h1>
          <p>Discover developers and projects in the community</p>
        </div>
      </div>

      <div className="ex-search-bar">
        <Search size={20} className="ex-search-icon" />
        <input
          className="ex-search-input"
          placeholder={tab === 'users' ? 'Search by name, skills, or domain...' : 'Search projects by name or tech stack...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="ex-tabs">
        <button className={`ex-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          <User size={16} /> Developers ({filteredUsers.length})
        </button>
        <button className={`ex-tab ${tab === 'projects' ? 'active' : ''}`} onClick={() => setTab('projects')}>
          <Code2 size={16} /> Projects ({filteredProjects.length})
        </button>
      </div>

      {tab === 'users' ? (
        <div className="ex-users-grid">
          {filteredUsers.map(u => (
            <div key={u.id} className="ex-user-card">
              <div className="ex-user-top">
                <div className="avatar avatar-xl" style={{ background: u.avatar }}>
                  {u.fullName?.charAt(0)}
                </div>
                <h3>{u.fullName}</h3>
                <p className="ex-user-domain">{u.domain}</p>
              </div>
              {u.bio && <p className="ex-user-bio">{u.bio}</p>}
              <div className="ex-user-details">
                {u.college && <span><GraduationCap size={12} /> {u.college}</span>}
                {u.degree && <span><MapPin size={12} /> {u.degree} • {u.year}</span>}
              </div>
              <div className="ex-user-skills">
                {u.skills?.map((s, i) => (
                  <span key={i} className="ex-skill-tag">{s}</span>
                ))}
              </div>
              <button
                className={`btn ${connected.includes(u.id) ? 'btn-secondary' : 'btn-primary'} btn-sm ex-connect-btn`}
                onClick={() => handleConnect(u.id)}
                disabled={connected.includes(u.id)}
              >
                {connected.includes(u.id) ? 'Request Sent' : <><UserPlus size={14} /> Connect</>}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="ex-projects-grid">
          {filteredProjects.map(p => (
            <div key={p.id} className="ex-project-card">
              <div className="ex-project-header">
                <h3>{p.name}</h3>
                <span className="ex-status" style={{ color: STATUS_COLORS[p.status], background: `${STATUS_COLORS[p.status]}15` }}>
                  {p.status}
                </span>
              </div>
              <p className="ex-project-desc">{p.desc}</p>
              <div className="ex-project-tech">
                {p.tech.map((t, i) => (
                  <span key={i} className="ex-tech-tag">{t}</span>
                ))}
              </div>
              <div className="ex-project-footer">
                <span><User size={12} /> {p.members} members</span>
                <button className="btn btn-ghost btn-sm">
                  <ExternalLink size={14} /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

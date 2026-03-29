import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import FileExplorer from '../components/workspace/FileExplorer';
import CodeEditor from '../components/workspace/CodeEditor';
import TaskManager from '../components/workspace/TaskManager';
import TeamChat from '../components/workspace/TeamChat';
import VersionHistory from '../components/workspace/VersionHistory';
import AIAssistant from '../components/workspace/AIAssistant';
import TeamActivity from '../components/workspace/TeamActivity';
import DeployPanel from '../components/workspace/DeployPanel';
import {
  Code2, ArrowLeft, MessageSquare, CheckSquare, GitBranch,
  Users, Rocket, Bot, Copy, ChevronDown, ChevronUp,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Save
} from 'lucide-react';
import './WorkspacePage.css';

export default function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspaces, workspacesLoaded, setCurrentWorkspace, currentWorkspace, saveWorkspaceFiles } = useWorkspace();
  const toast = useToast();

  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanel, setRightPanel] = useState(null); // 'ai' | 'activity' | 'versions' | 'deploy'
  const [bottomPanel, setBottomPanel] = useState(null); // 'tasks' | 'chat'
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!workspacesLoaded) return; // Still loading, wait
    const ws = workspaces.find(w => w.id === id);
    if (ws) {
      setCurrentWorkspace(ws);
    } else {
      toast.error('Workspace not found');
      navigate('/');
    }
    return () => setCurrentWorkspace(null);
  }, [id, workspaces, workspacesLoaded]);

  if (!currentWorkspace) {
    return <div className="page-loader"><div className="spinner spinner-lg"></div><p>Loading workspace...</p></div>;
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(currentWorkspace.inviteCode);
    toast.success('Invite code copied!');
  };

  const toggleRightPanel = (panel) => {
    setRightPanel(prev => prev === panel ? null : panel);
  };

  const toggleBottomPanel = (panel) => {
    setBottomPanel(prev => prev === panel ? null : panel);
  };

  const handleSaveFiles = async () => {
    if (!saveWorkspaceFiles) return;
    const toastId = toast.info('Saving files...', { duration: 1000 });
    const result = await saveWorkspaceFiles();
    if (result && result.success) {
      toast.success('Files saved successfully!');
    } else {
      toast.error(result?.error || 'Failed to save files');
    }
  };

  return (
    <div className="workspace-page">
      {/* Workspace Top Bar */}
      <div className="ws-topbar">
        <div className="ws-topbar-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="ws-topbar-divider"></div>
          <div className="ws-topbar-info">
            <Code2 size={18} className="ws-topbar-icon" />
            <h2>{currentWorkspace.name}</h2>
          </div>
          <button className="ws-invite-btn" onClick={copyInviteCode}>
            <span className="ws-invite-code">{currentWorkspace.inviteCode}</span>
            <Copy size={12} />
          </button>
        </div>
        <div className="ws-topbar-right">
          <TeamActivity />
          <div className="ws-topbar-actions">
            <button
              className="ws-action-btn"
              onClick={handleSaveFiles}
              title="Save Files"
              style={{ color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)' }}
            >
              <Save size={16} />
              <span>Save</span>
            </button>
            <div className="ws-topbar-divider" style={{height: '24px'}}></div>
            <button
              className={`ws-action-btn ${bottomPanel === 'tasks' ? 'active' : ''}`}
              onClick={() => toggleBottomPanel('tasks')}
              title="Tasks"
            >
              <CheckSquare size={16} />
              <span>Tasks</span>
            </button>
            <button
              className={`ws-action-btn ${chatOpen ? 'active' : ''}`}
              onClick={() => setChatOpen(!chatOpen)}
              title="Chat"
            >
              <MessageSquare size={16} />
              <span>Chat</span>
            </button>
            <button
              className={`ws-action-btn ${rightPanel === 'versions' ? 'active' : ''}`}
              onClick={() => toggleRightPanel('versions')}
              title="Version History"
            >
              <GitBranch size={16} />
              <span>Versions</span>
            </button>
            <button
              className={`ws-action-btn ${rightPanel === 'ai' ? 'active' : ''}`}
              onClick={() => toggleRightPanel('ai')}
              title="AI Assistant"
            >
              <Bot size={16} />
              <span>AI</span>
            </button>
            <button
              className={`ws-action-btn ${rightPanel === 'deploy' ? 'active' : ''}`}
              onClick={() => toggleRightPanel('deploy')}
              title="Deploy"
            >
              <Rocket size={16} />
              <span>Deploy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ws-content">
        {/* Left Panel - File Explorer */}
        <div className={`ws-left-panel ${leftPanelOpen ? '' : 'collapsed'}`}>
          <div className="ws-panel-toggle-bar">
            <button className="ws-panel-toggle" onClick={() => setLeftPanelOpen(!leftPanelOpen)}>
              {leftPanelOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          </div>
          {leftPanelOpen && <FileExplorer />}
        </div>

        {/* Center - Code Editor */}
        <div className="ws-center">
          <CodeEditor />
          {/* Bottom Panel */}
          {bottomPanel === 'tasks' && (
            <div className="ws-bottom-panel">
              <div className="ws-bottom-header">
                <h4><CheckSquare size={16} /> Tasks</h4>
                <button className="btn btn-ghost btn-sm" onClick={() => setBottomPanel(null)}>
                  <ChevronDown size={16} />
                </button>
              </div>
              <TaskManager />
            </div>
          )}
        </div>

        {/* Right Panel */}
        {rightPanel && (
          <div className="ws-right-panel">
            <div className="ws-right-header">
              <h4>
                {rightPanel === 'ai' && <><Bot size={16} /> AI Assistant</>}
                {rightPanel === 'versions' && <><GitBranch size={16} /> Version History</>}
                {rightPanel === 'deploy' && <><Rocket size={16} /> Deploy</>}
                {rightPanel === 'activity' && <><Users size={16} /> Team Activity</>}
              </h4>
              <button className="btn btn-ghost btn-sm" onClick={() => setRightPanel(null)}>
                <PanelRightClose size={16} />
              </button>
            </div>
            {rightPanel === 'ai' && <AIAssistant />}
            {rightPanel === 'versions' && <VersionHistory />}
            {rightPanel === 'deploy' && <DeployPanel />}
          </div>
        )}

        {/* Chat Overlay */}
        {chatOpen && (
          <div className="ws-chat-overlay">
            <TeamChat onClose={() => setChatOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

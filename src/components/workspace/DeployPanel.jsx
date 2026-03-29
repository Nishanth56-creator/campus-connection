import { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { Rocket, Globe, ExternalLink, Copy, Check, Loader2 } from 'lucide-react';
import './DeployPanel.css';

export default function DeployPanel() {
  const { currentWorkspace, files } = useWorkspace();
  const toast = useToast();
  const [deploying, setDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleDeploy = () => {
    setDeploying(true);
    setDeployUrl(null);

    // Simulate deployment process
    setTimeout(() => {
      const slug = currentWorkspace.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const url = `https://${slug}-${currentWorkspace.id.slice(-4)}.campusconnection.app`;
      setDeployUrl(url);
      setDeploying(false);
      toast.success('Project deployed successfully! 🚀');
    }, 3000);
  };

  const handleCopy = () => {
    if (deployUrl) {
      navigator.clipboard.writeText(deployUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="deploy-panel">
      <div className="dp-hero">
        <div className="dp-icon">
          <Rocket size={28} />
        </div>
        <h4>One-Click Deploy</h4>
        <p>Deploy your project to a live URL instantly.</p>
      </div>

      <div className="dp-stats">
        <div className="dp-stat">
          <span className="dp-stat-value">{Object.keys(files).length}</span>
          <span className="dp-stat-label">Files</span>
        </div>
        <div className="dp-stat">
          <span className="dp-stat-value">{currentWorkspace?.members?.length || 1}</span>
          <span className="dp-stat-label">Members</span>
        </div>
        <div className="dp-stat">
          <span className="dp-stat-value">
            {Math.round(Object.values(files).reduce((acc, f) => acc + (f.content?.length || 0), 0) / 1024)}KB
          </span>
          <span className="dp-stat-label">Size</span>
        </div>
      </div>

      {deploying ? (
        <div className="dp-deploying">
          <Loader2 size={24} className="dp-spinner" />
          <p>Deploying your project...</p>
          <div className="dp-progress-bar">
            <div className="dp-progress-fill"></div>
          </div>
        </div>
      ) : deployUrl ? (
        <div className="dp-success">
          <div className="dp-url-card">
            <Globe size={16} />
            <span className="dp-url">{deployUrl}</span>
            <button className="dp-copy" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <div className="dp-actions">
            <a href={deployUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              <ExternalLink size={14} /> Open Site
            </a>
            <button className="btn btn-secondary btn-sm" onClick={handleDeploy}>
              <Rocket size={14} /> Redeploy
            </button>
          </div>
        </div>
      ) : (
        <button className="btn btn-primary btn-lg dp-deploy-btn" onClick={handleDeploy}>
          <Rocket size={18} />
          Deploy Now
        </button>
      )}

      <div className="dp-note">
        <p>⚡ Deployments are instant and include all your project files.</p>
      </div>
    </div>
  );
}

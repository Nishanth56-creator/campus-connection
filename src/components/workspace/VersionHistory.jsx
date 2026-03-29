import { useWorkspace } from '../../context/WorkspaceContext';
import { Clock, RotateCcw, FileCode } from 'lucide-react';
import './VersionHistory.css';

export default function VersionHistory() {
  const { versions, restoreVersion, activeFile } = useWorkspace();

  const fileVersions = [...versions]
    .filter(v => v.filename === activeFile)
    .reverse();

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString();
  };

  return (
    <div className="version-history">
      <div className="vh-info">
        <FileCode size={14} />
        <span>{activeFile || 'No file selected'}</span>
      </div>

      {fileVersions.length === 0 ? (
        <div className="vh-empty">
          <Clock size={24} />
          <p>No versions yet</p>
          <span>Versions are saved automatically as you edit.</span>
        </div>
      ) : (
        <div className="vh-list">
          {fileVersions.map((ver, i) => (
            <div key={ver.id} className="vh-item">
              <div className="vh-timeline">
                <div className={`vh-dot ${i === 0 ? 'latest' : ''}`}></div>
                {i < fileVersions.length - 1 && <div className="vh-line"></div>}
              </div>
              <div className="vh-content">
                <div className="vh-header">
                  <span className="vh-label">{ver.label}</span>
                  {i === 0 && <span className="badge badge-primary">Latest</span>}
                </div>
                <span className="vh-meta">
                  <Clock size={10} /> {formatTime(ver.timestamp)}
                </span>
                <span className="vh-user">{ver.userName}</span>
                {i > 0 && (
                  <button className="btn btn-sm btn-ghost vh-restore" onClick={() => restoreVersion(ver.id)}>
                    <RotateCcw size={12} /> Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

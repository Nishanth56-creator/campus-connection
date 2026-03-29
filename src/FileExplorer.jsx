import { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import {
  File, FileCode, FileText, FolderOpen, Plus, Trash2, X,
  FileJson, FileImage
} from 'lucide-react';
import './FileExplorer.css';

const FILE_ICONS = {
  'html': <FileCode size={14} style={{ color: '#e34c26' }} />,
  'css': <FileCode size={14} style={{ color: '#264de4' }} />,
  'js': <FileCode size={14} style={{ color: '#f7df1e' }} />,
  'jsx': <FileCode size={14} style={{ color: '#61dafb' }} />,
  'ts': <FileCode size={14} style={{ color: '#3178c6' }} />,
  'json': <FileJson size={14} style={{ color: '#f5a623' }} />,
  'md': <FileText size={14} style={{ color: '#ffffff' }} />,
  'py': <FileCode size={14} style={{ color: '#3776ab' }} />,
  'default': <File size={14} style={{ color: '#94a3b8' }} />,
};

function getFileIcon(filename) {
  const ext = filename.split('.').pop();
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

function getLanguage(filename) {
  const ext = filename.split('.').pop();
  const map = {
    'html': 'html', 'css': 'css', 'js': 'javascript', 'jsx': 'javascript',
    'ts': 'typescript', 'tsx': 'typescript', 'json': 'json', 'md': 'markdown',
    'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c',
  };
  return map[ext] || 'plaintext';
}

export default function FileExplorer() {
  const { files, activeFile, openFileTab, createFile, deleteFile } = useWorkspace();
  const toast = useToast();
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    const lang = getLanguage(name);
    const success = createFile(name, lang);
    if (success) {
      toast.success(`Created ${name}`);
      setNewFileName('');
      setShowNewFile(false);
    } else {
      toast.error('File already exists');
    }
  };

  const handleDelete = (filename, e) => {
    e.stopPropagation();
    if (Object.keys(files).length <= 1) {
      toast.error("Can't delete the last file");
      return;
    }
    deleteFile(filename);
    toast.info(`Deleted ${filename}`);
  };

  return (
    <div className="file-explorer">
      <div className="fe-header">
        <div className="fe-header-title">
          <FolderOpen size={14} />
          <span>EXPLORER</span>
        </div>
        <button className="fe-add-btn" onClick={() => setShowNewFile(!showNewFile)} title="New File">
          <Plus size={14} />
        </button>
      </div>

      {showNewFile && (
        <form className="fe-new-file" onSubmit={handleCreate}>
          <input
            className="fe-new-input"
            placeholder="filename.js"
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            autoFocus
          />
          <button type="button" className="fe-cancel-btn" onClick={() => { setShowNewFile(false); setNewFileName(''); }}>
            <X size={12} />
          </button>
        </form>
      )}

      <div className="fe-files">
        {Object.keys(files).sort().map(filename => (
          <div
            key={filename}
            className={`fe-file ${activeFile === filename ? 'active' : ''}`}
            onClick={() => openFileTab(filename)}
          >
            {getFileIcon(filename)}
            <span className="fe-filename">{filename}</span>
            <button
              className="fe-delete-btn"
              onClick={(e) => handleDelete(filename, e)}
              title="Delete file"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

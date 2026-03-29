import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { X } from 'lucide-react';
import { MonacoBinding } from 'y-monaco';
import './CodeEditor.css';

const LANGUAGE_MAP = {
  'html': 'html',
  'css': 'css',
  'js': 'javascript',
  'jsx': 'javascript',
  'ts': 'typescript',
  'tsx': 'typescript',
  'json': 'json',
  'md': 'markdown',
  'py': 'python',
  'java': 'java',
  'cpp': 'cpp',
  'c': 'c',
  'rb': 'ruby',
  'go': 'go',
  'rs': 'rust',
  'sql': 'sql',
  'xml': 'xml',
  'yaml': 'yaml',
  'yml': 'yaml',
  'sh': 'shell',
  'txt': 'plaintext',
};

function getLanguage(filename) {
  const ext = filename?.split('.').pop();
  return LANGUAGE_MAP[ext] || 'plaintext';
}

export default function CodeEditor() {
  const { 
    files, activeFile, openFiles, 
    openFileTab, closeFileTab, 
    yDoc, yProvider 
  } = useWorkspace();
  
  const editorRef = useRef(null);
  const bindingRef = useRef(null);

  const currentFile = files[activeFile];
  const language = getLanguage(activeFile);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    setupBinding();
  };

  const setupBinding = () => {
    if (!editorRef.current || !yDoc || !activeFile || !currentFile) return;

    // Destroy previous binding
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    const yText = yDoc.getText(currentFile.name);

    // If yText is empty but we have local default content, initialize it
    if (yText.length === 0 && currentFile.content) {
      yText.insert(0, currentFile.content);
    }

    bindingRef.current = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      yProvider ? yProvider.awareness : undefined
    );
  };

  // Re-setup binding when active file changes
  useEffect(() => {
    setupBinding();
    
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    };
  }, [activeFile, yDoc, yProvider]);

  return (
    <div className="code-editor">
      {/* Tabs */}
      <div className="ce-tabs">
        {openFiles.map(filename => (
          <div
            key={filename}
            className={`ce-tab ${activeFile === filename ? 'active' : ''}`}
            onClick={() => openFileTab(filename)}
          >
            <span className="ce-tab-name">{filename}</span>
            <button
              className="ce-tab-close"
              onClick={(e) => { e.stopPropagation(); closeFileTab(filename); }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="ce-editor-area">
        {currentFile ? (
          <Editor
            height="100%"
            language={language}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              fontLigatures: true,
              minimap: { enabled: true, scale: 1 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              padding: { top: 12 },
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true },
              wordWrap: 'on',
              automaticLayout: true,
              suggest: { showKeywords: true, showSnippets: true },
              tabSize: 2,
            }}
          />
        ) : (
          <div className="ce-empty">
            <p>Select a file to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
}

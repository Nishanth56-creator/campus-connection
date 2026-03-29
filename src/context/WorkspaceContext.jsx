import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const WorkspaceContext = createContext(null);

const DEFAULT_FILES = {
  'index.html': { name: 'index.html', language: 'html', content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>My Project</title>\n</head>\n<body>\n  <h1>Hello, Campus Connection! 🚀</h1>\n</body>\n</html>` },
  'style.css': { name: 'style.css', language: 'css', content: `body { font-family: sans-serif; }` },
  'script.js': { name: 'script.js', language: 'javascript', content: `console.log("Loaded!");` },
};

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [workspacesLoaded, setWorkspacesLoaded] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  
  // Workspace state
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [versions, setVersions] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // File state
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState('index.html');
  const [openFiles, setOpenFiles] = useState(['index.html']);

  // Sync connections
  const [socket, setSocket] = useState(null);
  const [yDoc, setYDoc] = useState(null);
  const [yProvider, setYProvider] = useState(null);

  // 1. Fetch user workspaces on mount
  useEffect(() => {
    if (user) {
      setWorkspacesLoaded(false);
      api.workspaces.getUserWorkspaces(user.id)
        .then(list => { setWorkspaces(list); setWorkspacesLoaded(true); })
        .catch(err => { console.error(err); setWorkspacesLoaded(true); });
    } else {
      setWorkspaces([]);
      setWorkspacesLoaded(true);
    }
  }, [user]);

  // 2. Initialize Socket and Yjs when joining a workspace
  useEffect(() => {
    if (currentWorkspace && user) {
      // Connect to Socket.io
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('workspace:join', { workspaceId: currentWorkspace.id, user });
      });

      // Fetch historic data
      api.workspaces.getTasks(currentWorkspace.id).then(setTasks).catch(console.error);
      api.workspaces.getMessages(currentWorkspace.id).then(setMessages).catch(console.error);
      api.workspaces.getVersions(currentWorkspace.id).then(setVersions).catch(console.error);

      // Listen to socket events
      newSocket.on('chat:message', (msg) => setMessages(prev => [...prev, msg]));
      newSocket.on('task:created', (task) => setTasks(prev => [task, ...prev])); // Add new to top
      newSocket.on('task:updated', ({ taskId, updates }) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t)));
      newSocket.on('task:deleted', ({ taskId }) => setTasks(prev => prev.filter(t => t.id !== taskId)));
      newSocket.on('version:saved', (version) => setVersions(prev => [version, ...prev]));
      newSocket.on('presence:users', (users) => setOnlineUsers(users));
      newSocket.on('member:joined', ({ userId, userName, avatar }) => { 
        setCurrentWorkspace(prev => {
          if (!prev) return prev;
          if (prev.members.some(m => m.id === userId)) return prev;
          return {
            ...prev,
            members: [...prev.members, { id: userId, name: userName, avatar, role: 'member' }]
          };
        });
        setNotifications(prev => [{
          id: Date.now().toString(),
          title: 'New Member',
          message: `${userName} just joined your workspace!`,
          read: false,
          timestamp: new Date().toISOString()
        }, ...prev]);
      });

      // Connect to Yjs websocket
      const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
      const doc = new Y.Doc();
      const wsProvider = new WebsocketProvider(WS_URL + '/yjs', currentWorkspace.id, doc);
      
      setYDoc(doc);
      setYProvider(wsProvider);

      return () => {
        newSocket.disconnect();
        wsProvider.destroy();
        doc.destroy();
      };
    } else {
      setTasks([]);
      setMessages([]);
      setVersions([]);
      setOnlineUsers([]);
      setSocket(null);
      setYDoc(null);
      setYProvider(null);
    }
  }, [currentWorkspace, user]);

  useEffect(() => {
    if (socket && activeFile) {
      socket.emit('presence:file', { workspaceId: currentWorkspace?.id, filename: activeFile });
    }
  }, [activeFile, socket, currentWorkspace]);

  // Workspaces API wrappers
  const createWorkspace = async (data) => {
    const res = await api.workspaces.create({
      ...data,
      ownerId: user.id,
      ownerName: user.fullName,
      ownerAvatar: user.avatar
    });
    if (res.success) {
      setWorkspaces(prev => [...prev, res.workspace]);
      return res.workspace;
    }
    return null;
  };

  const joinWorkspace = async (code) => {
    const res = await api.workspaces.join({
      inviteCode: code,
      userId: user.id,
      userName: user.fullName,
      userAvatar: user.avatar
    });
    if (res.success) {
      setWorkspaces(prev => [...prev, res.workspace]);
      return { success: true, workspace: res.workspace };
    }
    return { success: false, error: res.error || 'Failed to join' };
  };

  // Files handlers
  const updateFile = (filename, content) => {
    setFiles(prev => ({
      ...prev,
      [filename]: { ...prev[filename], content }
    }));
    // Note: the socket version snapshot still works but the real text sync is done by CodeEditor y-monaco
  };

  const createFile = (filename, language = 'javascript') => {
    if (files[filename]) return false;
    setFiles(prev => ({
      ...prev,
      [filename]: { name: filename, language, content: '' }
    }));
    setOpenFiles(prev => [...prev, filename]);
    setActiveFile(filename);
    return true;
  };

  const deleteFile = (filename) => {
    if (Object.keys(files).length <= 1) return false;
    setFiles(prev => {
      const next = { ...prev };
      delete next[filename];
      return next;
    });
    setOpenFiles(prev => prev.filter(f => f !== filename));
    if (activeFile === filename) {
      const remaining = Object.keys(files).filter(f => f !== filename);
      setActiveFile(remaining[0] || '');
    }
    return true;
  };

  const openFileTab = (filename) => {
    if (!openFiles.includes(filename)) setOpenFiles(prev => [...prev, filename]);
    setActiveFile(filename);
  };

  const closeFileTab = (filename) => {
    setOpenFiles(prev => prev.filter(f => f !== filename));
    if (activeFile === filename) {
      const idx = openFiles.indexOf(filename);
      const next = openFiles[idx - 1] || openFiles[idx + 1];
      setActiveFile(next || '');
    }
  };

  // Socket wrappers
  const addTask = (task) => {
    if (socket && currentWorkspace) {
      socket.emit('task:create', { workspaceId: currentWorkspace.id, task: { ...task, createdBy: user.fullName } });
    }
  };

  const updateTask = (id, updates) => {
    if (socket && currentWorkspace) socket.emit('task:update', { workspaceId: currentWorkspace.id, taskId: id, updates });
  };

  const deleteTask = (id) => {
    if (socket && currentWorkspace) socket.emit('task:delete', { workspaceId: currentWorkspace.id, taskId: id });
  };

  const addMessage = (text) => {
    if (socket && currentWorkspace) {
      socket.emit('chat:message', {
        workspaceId: currentWorkspace.id,
        message: { text, userId: user.id, userName: user.fullName, avatar: user.avatar }
      });
    }
  };

  const addVersion = (filename) => {
    if (socket && currentWorkspace) {
      socket.emit('version:save', {
        workspaceId: currentWorkspace.id,
        version: { filename, content: files[filename]?.content || '', userId: user.id, userName: user.fullName, label: 'Manual Save' }
      });
    }
  };

  const restoreVersion = (versionId) => {
    const ver = versions.find(v => v.id === versionId);
    if (!ver) return;
    updateFile(ver.filename, ver.content);
  };

  const addNotification = (notification) => {
    setNotifications(prev => [{ id: Date.now().toString(), ...notification, read: false, timestamp: new Date().toISOString() }, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces, workspacesLoaded, currentWorkspace, setCurrentWorkspace,
      createWorkspace, joinWorkspace,
      files, activeFile, openFiles,
      setActiveFile, openFileTab, closeFileTab,
      updateFile, createFile, deleteFile,
      tasks, addTask, updateTask, deleteTask,
      messages, addMessage,
      versions, addVersion, restoreVersion,
      onlineUsers, setOnlineUsers,
      notifications, addNotification, markNotificationRead,
      yDoc, yProvider, DEFAULT_FILES
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
};

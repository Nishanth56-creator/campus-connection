const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return res.json();
    },
    signup: async (data) => {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  },
  workspaces: {
    create: async (data) => {
      const res = await fetch(`${API_URL}/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    join: async (data) => {
      const res = await fetch(`${API_URL}/workspaces/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    getUserWorkspaces: async (userId) => {
      const res = await fetch(`${API_URL}/workspaces/user/${userId}`);
      return res.json();
    },
    getTasks: async (workspaceId) => {
      const res = await fetch(`${API_URL}/workspaces/${workspaceId}/tasks`);
      return res.json();
    },
    getMessages: async (workspaceId) => {
      const res = await fetch(`${API_URL}/workspaces/${workspaceId}/messages`);
      return res.json();
    },
    getVersions: async (workspaceId) => {
      const res = await fetch(`${API_URL}/workspaces/${workspaceId}/versions`);
      return res.json();
    }
  },
  ai: {
    ask: async (prompt, code, filename) => {
      const res = await fetch(`${API_URL}/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, code, filename })
      });
      return res.json();
    }
  }
};

import { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Clock, User, CheckCircle2, Circle, Timer } from 'lucide-react';
import './TaskManager.css';

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: <Circle size={14} />, color: '#94a3b8' },
  'in-progress': { label: 'In Progress', icon: <Timer size={14} />, color: '#f59e0b' },
  completed: { label: 'Completed', icon: <CheckCircle2 size={14} />, color: '#10b981' },
};

export default function TaskManager() {
  const { tasks, addTask, updateTask, deleteTask, currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', deadline: '', status: 'pending' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addTask(form);
    setForm({ title: '', description: '', assignedTo: '', deadline: '', status: 'pending' });
    setShowForm(false);
  };

  const cycleStatus = (task) => {
    const statuses = ['pending', 'in-progress', 'completed'];
    const idx = statuses.indexOf(task.status);
    const next = statuses[(idx + 1) % statuses.length];
    updateTask(task.id, { status: next });
  };

  const members = currentWorkspace?.members || [];

  return (
    <div className="task-manager">
      <div className="tm-toolbar">
        <button className="btn btn-sm btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} /> Add Task
        </button>
        <div className="tm-counts">
          <span className="tm-count"><Circle size={12} /> {tasks.filter(t => t.status === 'pending').length}</span>
          <span className="tm-count"><Timer size={12} /> {tasks.filter(t => t.status === 'in-progress').length}</span>
          <span className="tm-count"><CheckCircle2 size={12} /> {tasks.filter(t => t.status === 'completed').length}</span>
        </div>
      </div>

      {showForm && (
        <form className="tm-form" onSubmit={handleSubmit}>
          <input
            className="tm-input"
            placeholder="Task title..."
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            autoFocus
          />
          <div className="tm-form-row">
            <select className="tm-select" value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}>
              <option value="">Assign to...</option>
              {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
            <input
              type="date"
              className="tm-input"
              value={form.deadline}
              onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
            />
            <button type="submit" className="btn btn-sm btn-primary">Add</button>
          </div>
        </form>
      )}

      <div className="tm-list">
        {tasks.length === 0 ? (
          <div className="tm-empty">No tasks yet. Add one to get started!</div>
        ) : (
          tasks.map(task => {
            const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
            return (
              <div key={task.id} className={`tm-task tm-task-${task.status}`}>
                <button className="tm-status-btn" onClick={() => cycleStatus(task)} style={{ color: status.color }}>
                  {status.icon}
                </button>
                <div className="tm-task-info">
                  <span className={`tm-task-title ${task.status === 'completed' ? 'done' : ''}`}>{task.title}</span>
                  <div className="tm-task-meta">
                    {task.assignedTo && <span><User size={10} /> {task.assignedTo}</span>}
                    {task.deadline && <span><Clock size={10} /> {new Date(task.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
                <span className="tm-status-badge" style={{ color: status.color, background: `${status.color}15` }}>
                  {status.label}
                </span>
                <button className="tm-delete" onClick={() => deleteTask(task.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

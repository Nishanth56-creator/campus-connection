import { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Send, Code, Wand2, ListTodo, AlertTriangle, Bot, User, Copy, Check } from 'lucide-react';
import './AIAssistant.css';

const QUICK_ACTIONS = [
  { icon: <Code size={14} />, label: 'Explain Code', prompt: 'Explain the current code in simple terms.' },
  { icon: <Wand2 size={14} />, label: 'Improve Code', prompt: 'Suggest improvements for the current code.' },
  { icon: <ListTodo size={14} />, label: 'Suggest Tasks', prompt: 'Suggest project tasks based on the current codebase.' },
  { icon: <AlertTriangle size={14} />, label: 'Detect Issues', prompt: 'Detect potential bugs or issues in the code.' },
];

import { api } from '../../services/api';

export default function AIAssistant() {
  const { files, activeFile } = useWorkspace();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = async (prompt) => {
    const code = files[activeFile]?.content || '';
    
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    setInput('');
    setTyping(true);

    try {
      const res = await api.ai.ask(prompt, code, activeFile);
      setMessages(prev => [...prev, { role: 'assistant', content: res.response || 'Sorry, I encounted an error.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection to AI server failed.' }]);
    } finally {
      setTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ai-assistant">
      {messages.length === 0 && (
        <div className="ai-welcome">
          <div className="ai-welcome-icon">
            <Bot size={28} />
          </div>
          <h4>AI Assistant</h4>
          <p>Ask me anything about your code, or use the quick actions below.</p>
          <div className="ai-quick-actions">
            {QUICK_ACTIONS.map((action, i) => (
              <button key={i} className="ai-action-btn" onClick={() => sendMessage(action.prompt)}>
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ai-messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`ai-msg ai-msg-${msg.role}`}>
            <div className="ai-msg-avatar">
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className="ai-msg-content">
              <pre className="ai-msg-text">{msg.content}</pre>
              {msg.role === 'assistant' && (
                <button className="ai-copy-btn" onClick={() => handleCopy(msg.content)}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="ai-msg ai-msg-assistant">
            <div className="ai-msg-avatar"><Bot size={14} /></div>
            <div className="ai-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div className="ai-input-area">
        {messages.length > 0 && (
          <div className="ai-quick-row">
            {QUICK_ACTIONS.map((action, i) => (
              <button key={i} className="ai-quick-chip" onClick={() => sendMessage(action.prompt)}>
                {action.icon} {action.label}
              </button>
            ))}
          </div>
        )}
        <form className="ai-input-form" onSubmit={handleSubmit}>
          <input
            className="ai-input"
            placeholder="Ask about your code..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" className="ai-send" disabled={!input.trim() || typing}>
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

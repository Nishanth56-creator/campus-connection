import { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { Send, X } from 'lucide-react';
import './TeamChat.css';

export default function TeamChat({ onClose }) {
  const { messages, addMessage } = useWorkspace();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addMessage(text.trim());
    setText('');
  };

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="team-chat">
      <div className="tc-header">
        <h4>Team Chat</h4>
        {onClose && (
          <button className="tc-close" onClick={onClose}>
            <X size={16} />
          </button>
        )}
      </div>

      <div className="tc-messages" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="tc-empty">
            <p>No messages yet.</p>
            <p>Start a conversation with your team! 💬</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.userId === user?.id;
            return (
              <div key={msg.id} className={`tc-msg ${isMe ? 'tc-msg-me' : ''}`}>
                {!isMe && (
                  <div className="avatar avatar-sm" style={{ background: msg.avatar || 'var(--primary-500)' }}>
                    {msg.userName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="tc-msg-content">
                  {!isMe && <span className="tc-msg-name">{msg.userName}</span>}
                  <div className="tc-msg-bubble">{msg.text}</div>
                  <span className="tc-msg-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form className="tc-input-area" onSubmit={handleSend}>
        <input
          className="tc-input"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
        />
        <button type="submit" className="tc-send" disabled={!text.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

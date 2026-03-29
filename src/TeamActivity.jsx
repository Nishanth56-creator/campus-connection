import { useWorkspace } from '../../context/WorkspaceContext';
import './TeamActivity.css';

export default function TeamActivity() {
  const { onlineUsers, currentWorkspace } = useWorkspace();

  if (!currentWorkspace) return null;

  return (
    <div className="team-activity">
      <div className="ta-avatars">
        {currentWorkspace.members.slice(0, 4).map((member, i) => {
          const isOnline = onlineUsers.some(u => u.userId === member.id);
          return (
            <div key={member.id} className="ta-avatar-wrapper" style={{ zIndex: 4 - i }} title={member.name}>
              <div className="avatar avatar-sm" style={{ background: member.avatar || 'var(--primary-500)' }}>
                {member.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className={`ta-status ${isOnline ? 'online' : 'offline'}`}></div>
            </div>
          );
        })}
        {currentWorkspace.members.length > 4 && (
          <div className="ta-more">+{currentWorkspace.members.length - 4}</div>
        )}
      </div>
    </div>
  );
}

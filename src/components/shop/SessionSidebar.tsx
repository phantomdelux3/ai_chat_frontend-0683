import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  created_at: string;
  updated_at: string;
}

interface SessionSidebarProps {
  userId: string | null;
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

const API_BASE = 'https://c351da9cbae0.ngrok-free.app';

export function SessionSidebar({
  userId,
  currentSessionId,
  onSessionSelect,
  onNewSession,
}: SessionSidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/sessions/user/${userId}`);
        if (response.ok) {
          const data = await response.json() as { sessions?: Session[] };
          if (data && Array.isArray(data.sessions)) {
            setSessions(data.sessions);
          }
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col h-full">
      <div className="p-4 border-b">
        <Button onClick={onNewSession} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No sessions yet
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg transition-colors',
                  'hover:bg-muted flex items-center gap-2',
                  currentSessionId === session.id && 'bg-muted'
                )}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    Session {session.id.substring(0, 8)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(session.updated_at)}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

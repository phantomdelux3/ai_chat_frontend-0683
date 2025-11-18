import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, X } from 'lucide-react';
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
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE = 'https://b4b7cd081fa7.ngrok-free.app';

export function SessionSidebar({
  userId,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  isOpen,
  onClose,
}: SessionSidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSessions = async (userIdToUse: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/sessions/user/${userIdToUse}`);
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

  useEffect(() => {
    if (!userId) return;
    loadSessions(userId);
  }, [userId]);

  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      const { userId: refreshUserId } = event.detail;
      if (refreshUserId) {
        loadSessions(refreshUserId);
      }
    };

    window.addEventListener('refresh-sessions', handleRefresh as EventListener);
    return () => {
      window.removeEventListener('refresh-sessions', handleRefresh as EventListener);
    };
  }, []);

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
    <aside
      className={cn(
        'fixed md:relative inset-y-0 left-0 z-50 w-72 md:w-64',
        'border-r bg-background flex flex-col h-full',
        'transform transition-transform duration-300 ease-in-out',
        'md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="p-3 md:p-4 border-b flex items-center justify-between gap-2">
        <Button onClick={onNewSession} className="flex-1" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="md:hidden h-9 w-9"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8 px-4">
              No sessions yet
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={cn(
                  'w-full text-left px-3 py-2.5 md:py-2 rounded-lg transition-colors',
                  'hover:bg-muted flex items-center gap-2 min-h-[44px] md:min-h-0',
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
    </aside>
  );
}

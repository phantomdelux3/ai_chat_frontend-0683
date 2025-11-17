import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from './ProductCard';
import { SessionSidebar } from './SessionSidebar';
import { Send, Bot, User, Menu } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Product {
  id: string;
  title: string;
  price: number | string;
  discounted_price: number | string;
  url: string;
  image: string;
  description: string;
  brand?: string;
  category?: string;
  score?: number;
  rank?: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
}

const API_BASE = 'https://c351da9cbae0.ngrok-free.app';

export function ShoppingChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem('shop_user_id');
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
    }
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSessionMessages = async (sessionIdToLoad: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/sessions/messages/${sessionIdToLoad}`);
      
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json() as { messages?: any[] };
      
      if (data && Array.isArray(data.messages)) {
        const loadedMessages: Message[] = data.messages.map((msg: any) => [
          {
            id: `user-${msg.id}`,
            role: 'user' as const,
            content: msg.user_content,
          },
          {
            id: `assistant-${msg.id}`,
            role: 'assistant' as const,
            content: msg.assistant_content,
            products: msg.products || [],
          },
        ]).flat();
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Failed to load session messages:', error);
      setMessages([]);
    }
  };

  const handleSessionSelect = (selectedSessionId: string) => {
    setSessionId(selectedSessionId);
    loadSessionMessages(selectedSessionId);
    setIsSidebarOpen(false);
  };

  const handleNewSession = () => {
    setSessionId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    try {
      const payload: { message: string; sessionId?: string } = {
        message: messageToSend,
      };
      
      if (sessionId) {
        payload.sessionId = sessionId;
      }

      const response = await fetch(`${API_BASE}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json() as {
        sessionId?: string;
        userId?: string;
        assistantResponse?: string;
        products?: Product[];
      };

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      if (data.userId && !userId) {
        setUserId(data.userId);
        localStorage.setItem('shop_user_id', data.userId);
      }

      let assistantContent = 'I understand. How can I help you find products?';
      let products: Product[] = [];

      if (data.assistantResponse) {
        assistantContent = data.assistantResponse;
      }
      if (Array.isArray(data.products)) {
        products = data.products;
      }

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: assistantContent,
        products,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full relative">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <SessionSidebar
        userId={userId}
        currentSessionId={sessionId}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b bg-background md:hidden px-3 py-2 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="h-10 w-10"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h2 className="text-sm font-semibold truncate">
            {sessionId ? `Session ${sessionId.substring(0, 8)}` : 'New Chat'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
              <img src="/ai-bot-icon-9JPpe.png" alt="AI Assistant" className="w-20 h-20 md:w-24 md:h-24 opacity-50" />
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-semibold">Welcome to ShopAssist AI</h3>
                <p className="text-sm md:text-base text-muted-foreground max-w-md">
                  I'm your personal shopping assistant. Tell me what you're looking for, 
                  your budget, and I'll help you find the perfect products!
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-4">
                <div
                  className={`flex gap-2 md:gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3 py-2 md:px-4 md:py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                  )}
                </div>

                {message.products && message.products.length > 0 && (
                  <div className="md:pl-11 space-y-3">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Recommended Products ({message.products.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      {message.products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t bg-background p-3 md:p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What are you looking for today?"
              disabled={isLoading}
              className="flex-1 h-10 md:h-11 text-sm md:text-base"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              className="h-10 w-10 md:h-11 md:w-11"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

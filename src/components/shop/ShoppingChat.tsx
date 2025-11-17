import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from './ProductCard';
import { SessionSidebar } from './SessionSidebar';
import { Send, Bot, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Product {
  id: string;
  title: string;
  price: number;
  discounted_price: number;
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
  };

  const handleNewSession = () => {
    setSessionId(null);
    setMessages([]);
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
    <div className="flex h-full">
      <SessionSidebar
        userId={userId}
        currentSessionId={sessionId}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <img src="/ai-bot-icon-9JPpe.png" alt="AI Assistant" className="w-24 h-24 opacity-50" />
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Welcome to ShopAssist AI</h3>
                <p className="text-muted-foreground max-w-md">
                  I'm your personal shopping assistant. Tell me what you're looking for, 
                  your budget, and I'll help you find the perfect products!
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-4">
                <div
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>

                {message.products && message.products.length > 0 && (
                  <div className="pl-11 space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      Recommended Products ({message.products.length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        <div className="border-t bg-background p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What are you looking for today?"
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

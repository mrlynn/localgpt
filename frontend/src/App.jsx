// /frontend/src/App.jsx
import { useState, useEffect, useRef } from 'react';
import ChatMessage from './components/ChatMessage';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from './components/Sidebar';
import {    
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Trash2,
  MoreVertical,
  Copy,
  CheckCircle2,
  RotateCcw,
  Settings,
  MessageSquare,
  Moon,
  Sun,
} from "lucide-react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat sessions
  useEffect(() => {
    fetchChats();
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
    }
  }, [activeChat]);

  const fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setChats(data.sessions);
        // Set first chat as active if none selected
        if (!activeChat && data.sessions.length > 0) {
          setActiveChat(data.sessions[0].sessionId);
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/history/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleNewChat = async () => {
    setActiveChat(null);
    setMessages([]);
    await fetchChats(); // Refresh chat list
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = input.trim();
    setInput('');

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': activeChat || ''
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(data.history);
      if (!activeChat) {
        setActiveChat(data.sessionId);
        await fetchChats(); // Refresh chat list
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = async () => {
    try {
      await fetch(`http://localhost:3000/api/clear/${activeChat || ''}`, { method: 'POST' });
      setMessages([]);
      await fetchChats(); // Refresh chat list
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const copyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(content);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const regenerateLastResponse = async () => {
    if (messages.length < 2) return;
    
    const lastUserMessage = [...messages].reverse()
      .find(msg => msg.role === 'user')?.content;
      
    if (lastUserMessage) {
      setInput(lastUserMessage);
      setMessages(messages.slice(0, -2));
      setTimeout(() => handleSubmit({ preventDefault: () => {}, target: null }), 0);
    }
  };

  return (
    <div className="flex min-h-screen max-h-screen bg-background">
      <div className="w-80 flex-shrink-0">
        <Sidebar 
          chats={chats}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          onNewChat={handleNewChat}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-[600px] max-w-[1200px]">
        <div className="border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              <h1 className="text-xl font-bold">Local Chat</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Card className="h-full border-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground mt-8 space-y-2">
                    <MessageSquare className="w-12 h-12 mx-auto opacity-50" />
                    <p className="text-lg">Start a conversation</p>
                    <p className="text-sm">Local is ready to help</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`group relative ${
                          message.role === 'user' ? 'ml-12' : 'mr-12'
                        }`}
                      >
                        <div className={`flex items-start gap-2 rounded-lg p-4 ${
                          message.role === 'user' ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-medium mb-1 text-sm">
                              {message.role === 'user' ? 'You' : 'Assistant'}
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ChatMessage 
                                message={message.content}
                                isDarkMode={isDarkMode}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        <div className="p-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={clearChat}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={regenerateLastResponse}
                disabled={messages.length < 2 || isLoading}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Regenerate
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-grow min-h-[50px] text-base py-6 px-4"
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
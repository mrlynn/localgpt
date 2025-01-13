// App.jsx
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Trash2 } from "lucide-react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(data.history);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch('http://localhost:3000/api/clear', { method: 'POST' });
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-4xl mx-auto p-4 w-full">
      <div className="flex justify-between items-center mb-4 w-full">
        <h1 className="text-2xl font-bold">Chat with Deepseek</h1>
        <Button 
          variant="outline" 
          onClick={clearChat}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear Chat
        </Button>
      </div>

      <div className="flex-1 min-h-0 mb-4 w-full">
        <Card className="h-full border w-full">
          <ScrollArea className="h-[calc(100vh-200px)] w-full">
            <div className="p-4 w-full">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  Start a conversation by typing a message below.
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 p-3 rounded-lg w-3/4 ${
                    message.role === 'user' 
                      ? 'bg-blue-100 ml-auto' 
                      : 'bg-gray-100 mr-auto'
                  }`}
                >
                  <div className="font-medium mb-1">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className="whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-grow"
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
  );
}

export default App;
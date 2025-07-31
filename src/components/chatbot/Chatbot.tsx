import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { ChatbotService } from './chatbotService';
import { ChatMessage, ChatResponse, UserFAQ } from './types';
import { globalFAQs } from './faqs';

interface ChatbotProps {
  className?: string;
}

export function Chatbot({ className }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { role, department, isAdmin, isHR, isTeamMember } = useUserRole();
  
  const chatbotService = new ChatbotService(supabase, user?.id, role, department);

  const [input, setInput] = useState("");
  const [userFAQs, setUserFAQs] = useState<UserFAQ[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatbotService.processMessage(inputValue.trim());
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'bot',
        timestamp: new Date(),
        data: response.data,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `Hello! I'm your BAU/OKR assistant. I can help you with tasks, OKRs, and more. What would you like to know?`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: ChatMessage) => {
    const isBot = message.sender === 'bot';
    
    return (
      <div
        key={message.id}
        className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div className={`flex max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isBot ? 'bg-blue-500 text-white mr-2' : 'bg-gray-500 text-white ml-2'
          }`}>
            {isBot ? <Bot size={16} /> : <User size={16} />}
          </div>
          <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
            <div className={`rounded-lg px-4 py-2 ${
              isBot 
                ? 'bg-gray-100 text-gray-900' 
                : 'bg-blue-500 text-white'
            }`}>
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {message.data && (
                <div className="mt-2">
                  {message.data.tasks && (
                    <div className="space-y-2">
                      {message.data.tasks.map((task: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-gray-600">{task.description}</div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{task.status}</Badge>
                            <Badge variant="outline">{task.priority}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {message.data.templates && (
                    <div className="space-y-2">
                      {message.data.templates.map((template: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600">{template.description}</div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{template.frequency}</Badge>
                            <Badge variant="outline">{template.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {message.data.stats && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(message.data.stats).map(([key, value]) => (
                        <div key={key} className="bg-white p-2 rounded border text-center">
                          <div className="text-sm font-medium">{key}</div>
                          <div className="text-lg font-bold text-blue-600">{value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={`text-xs text-gray-500 mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  function handleSuggestionClick(question: string) {
    setInput(question);
    // Optionally auto-send:
    // sendMessage(question);
  }

  return (
    <div className={className}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={handleOpenChat}
          size="lg"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg"
        >
          <MessageCircle size={24} />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot size={20} />
                BAU Assistant
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
            {role && (
              <Badge variant="secondary" className="w-fit">
                {role}
              </Badge>
            )}
          </CardHeader>
          
          <CardContent className="p-0 h-full flex flex-col">
            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 pb-4" ref={scrollAreaRef}>
              <div className="space-y-2">
                {messages.map(renderMessage)}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="flex flex-row">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white mr-2 flex items-center justify-center">
                        <Bot size={16} />
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your tasks, OKRs, or anything else..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
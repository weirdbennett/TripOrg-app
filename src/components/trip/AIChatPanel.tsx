import React, { useState, useEffect } from 'react';
import type { AIChatMessage, AIChatSession } from '@/types';
import { apiAdapter } from '@/services/apiAdapter';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface AIChatPanelProps {
  tripId: string;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ tripId }) => {
  const [session, setSession] = useState<AIChatSession | null>(null);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const sessionData = await apiAdapter.getAIChatSession(tripId);
      setSession(sessionData);
      const messagesData = await apiAdapter.getAIMessages(tripId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to fetch AI chat session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 2000);
    return () => clearInterval(interval);
  }, [tripId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || session?.isLocked) return;

    try {
      await apiAdapter.sendAIMessage(tripId, { content: newMessage });
      setNewMessage('');
      setTimeout(fetchSession, 100);
    } catch (error) {
      console.error('Failed to send AI message:', error);
      alert('AI chat is currently locked. Please wait for the response.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        Loading AI chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Assistant</h3>
          {session?.isLocked && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400">AI is responding...</span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {format(new Date(message.timestamp), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={session?.isLocked ? 'AI is responding...' : 'Ask AI assistant...'}
            rows={2}
            className="flex-1"
            disabled={session?.isLocked}
          />
          <Button type="submit" className="self-end" disabled={session?.isLocked}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};


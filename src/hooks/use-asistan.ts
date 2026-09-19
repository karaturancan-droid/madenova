import { useState, useCallback, useEffect } from 'react';
import { callBackend } from '@/lib/tauri';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggested_action?: {
    type: string;
    description: string;
    payload: Record<string, unknown>;
  };
}

export interface ChatHistory {
  messages: Message[];
}

export const useAsistan = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result = await callBackend<ChatHistory>('asistan_get_history', {});
        if (result && result.messages) {
          setMessages(result.messages);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Sohbet geçmişi yüklenemedi';
        setError(errorMsg);
      }
    };

    loadHistory();
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await callBackend<Message>('asistan_mesaj_gonder', {
          mesaj: message,
        });

        if (result) {
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              role: 'user',
              content: message,
              timestamp: new Date().toISOString(),
            },
            {
              id: result.id,
              role: 'assistant',
              content: result.content,
              timestamp: result.timestamp,
              suggested_action: result.suggested_action,
            },
          ]);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Mesaj gönderilemedi';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
};

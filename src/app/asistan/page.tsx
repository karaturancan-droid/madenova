'use client';

import { ChatWindow } from '@/components/asistan/chat-window';
import { useAsistan } from '@/hooks/use-asistan';

export default function AsistanPage() {
  const { messages, isLoading, error, sendMessage } = useAsistan();

  return (
    <div className="h-full">
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        error={error}
      />
    </div>
  );
}

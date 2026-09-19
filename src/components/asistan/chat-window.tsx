'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageList } from './message-list';
import { InputArea } from './input-area';
import { Message } from '@/hooks/use-asistan';
import { Info } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  error?: string | null;
}

export function ChatWindow({
  messages,
  isLoading,
  onSendMessage,
  error,
}: ChatWindowProps) {
  const [selectedAction, setSelectedAction] = useState<Message['suggested_action'] | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const handleApproveAction = async () => {
    if (selectedAction) {
      setIsApproving(true);
      try {
        // Here you would execute the suggested action
        // For now, we'll just close the dialog
        setSelectedAction(null);
      } finally {
        setIsApproving(false);
      }
    }
  };

  const handleRejectAction = () => {
    setSelectedAction(null);
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Asistan</CardTitle>
              <div 
                className="h-4 w-4 text-gray-500 cursor-help" 
                title="Yapay zeka destekli işletme asistanı. Tüm yazma işlemleri onay gerektirir."
              >
                <Info className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {error && (
            <div className="bg-red-50 border-b border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          <MessageList messages={messages} isLoading={isLoading} />
          <InputArea onSendMessage={onSendMessage} isLoading={isLoading} />
        </CardContent>
      </Card>

      <Dialog open={!!selectedAction} onOpenChange={(open) => !open && setSelectedAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşlem Onayı</DialogTitle>
            <DialogDescription>
              Asistan şu işlemi yapmak istiyor:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700">
              {selectedAction?.description}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleRejectAction}
              disabled={isApproving}
            >
              İptal
            </Button>
            <Button
              onClick={handleApproveAction}
              disabled={isApproving}
            >
              Onayla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTitle: string;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function RestoreDialog({
  open,
  onOpenChange,
  itemTitle,
  onConfirm,
  isLoading = false,
}: RestoreDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Öğeyi Geri Yükle</DialogTitle>
          <DialogDescription>
            "{itemTitle}" öğesini geri yüklemek istediğinizden emin misiniz?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            İptal
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Yükleniyor...' : 'Geri Yükle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

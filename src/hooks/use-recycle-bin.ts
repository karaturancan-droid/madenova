'use client';

import { useState, useCallback, useEffect } from 'react';
import { callBackend } from '@/lib/tauri';

export interface RecycleBinItem {
  id: string;
  entity_type: string;
  record_data: Record<string, unknown>;
  deleted_at: string;
  restore_deadline: string;
  days_left?: number;
}

export function useRecycleBin() {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Geri dönüşüm kutusunu listele
  const loadRecycleBin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBackend<RecycleBinItem[]>('list_recycle_bin');
      // Her öğe için kalan günleri hesapla
      const itemsWithDaysLeft = result.map((item) => {
        const deadline = new Date(item.restore_deadline);
        const now = new Date();
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...item,
          days_left: Math.max(0, daysLeft),
        };
      });
      setItems(itemsWithDaysLeft);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Geri dönüşüm kutusu yüklenemedi';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Öğeyi geri yükle
  const restoreItem = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await callBackend('restore_from_recycle_bin', { id });
      // Listeden kaldır
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Öğe geri yüklenemedi';
      setError(message);
      throw err;
    }
  }, []);

  // Öğeyi kalıcı olarak sil
  const permanentlyDeleteItem = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await callBackend('permanently_delete_recycle_item', { id });
      // Listeden kaldır
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Öğe silinemedi';
      setError(message);
      throw err;
    }
  }, []);

  // İlk yükleme
  useEffect(() => {
    loadRecycleBin();
  }, [loadRecycleBin]);

  return {
    items,
    loading,
    error,
    loadRecycleBin,
    restoreItem,
    permanentlyDeleteItem,
  };
}

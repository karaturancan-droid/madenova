'use client';

import { useState, useCallback } from 'react';
import { callBackend } from '@/lib/tauri';

export interface Notification {
  id: string;
  title: string;
  module: string;
  related_id?: string;
  due_date?: string;
  days_left?: number;
  status: 'aktif' | 'okundu' | 'ertelendi';
  source_type?: string;
  created_at: string;
}

export function useBildirimler() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bildirimleri listele
  const loadNotifications = useCallback(async (filters?: { module?: string; status?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBackend<Notification[]>('list_notifications', filters || {});
      setNotifications(result || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bildirimler yüklenemedi';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Bildirimleri yenile
  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await callBackend('refresh_notifications');
      await loadNotifications();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bildirimler yenilenemedi';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loadNotifications]);

  // Bildirim durumunu güncelle
  const updateNotificationStatus = useCallback(
    async (id: string, status: 'aktif' | 'okundu' | 'ertelendi') => {
      setLoading(true);
      setError(null);
      try {
        await callBackend('update_notification_status', { id, status });
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === id ? { ...notif, status } : notif))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Bildirim güncellenemedi';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Bildirim sil
  const deleteNotification = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await callBackend('delete_notification', { id });
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bildirim silinemedi';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    loadNotifications,
    refreshNotifications,
    updateNotificationStatus,
    deleteNotification,
  };
}

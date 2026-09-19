'use client';

import { useState, useCallback } from 'react';
import { callBackend } from '@/lib/tauri';

export interface Settings {
  company_name?: string;
  tax_no?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  abacus_api_key?: string;
}

export function useAyarlar() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ayarı getir
  const getSetting = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBackend<string | null>('get_setting', { key });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ayar alınamadı';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ayarı kaydet
  const setSetting = useCallback(async (key: string, value: string) => {
    setLoading(true);
    setError(null);
    try {
      await callBackend('set_setting', { key, value });
      setSettings((prev) => ({ ...prev, [key]: value }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ayar kaydedilemedi';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tüm ayarları yükle
  const loadAllSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const keys = ['company_name', 'tax_no', 'phone', 'email', 'contact_person', 'abacus_api_key'];
      const result: Settings = {};

      for (const key of keys) {
        try {
          const value = await callBackend<string | null>('get_setting', { key });
          if (value) {
            result[key as keyof Settings] = value;
          }
        } catch {
          // Ignore individual setting errors
        }
      }

      setSettings(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ayarlar yüklenemedi';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Yedek oluştur
  const exportBackup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBackend<string>('export_backup');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Yedek oluşturulamadı';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Yedekten geri yükle
  const importBackup = useCallback(async (jsonData: string) => {
    setLoading(true);
    setError(null);
    try {
      await callBackend('import_backup', { json: jsonData });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Yedek geri yüklenemedi';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // API anahtarını test et
  const testApiKey = useCallback(async (apiKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callBackend<{ valid: boolean }>('test_api_key', { api_key: apiKey });
      return result?.valid || false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'API anahtarı test edilemedi';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    settings,
    loading,
    error,
    getSetting,
    setSetting,
    loadAllSettings,
    exportBackup,
    importBackup,
    testApiKey,
  };
}

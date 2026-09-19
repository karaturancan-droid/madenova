'use client';

import { useState, useEffect } from 'react';
import { useAyarlar } from '@/hooks/use-ayarlar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react';

export function ApiKeySection() {
  const { loading, getSetting, setSetting, testApiKey } = useAyarlar();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const key = await getSetting('abacus_api_key');
      if (key) {
        setApiKey(key);
      }
    } catch (err) {
      // Ignore errors on load
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert('API anahtarı boş olamaz');
      return;
    }

    setIsSaving(true);
    try {
      await setSetting('abacus_api_key', apiKey);
      alert('API anahtarı kaydedildi');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Kaydetme başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      alert('API anahtarı boş olamaz');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const isValid = await testApiKey(apiKey);
      setTestResult(isValid);
      if (isValid) {
        alert('API anahtarı geçerli');
      } else {
        alert('API anahtarı geçersiz');
      }
    } catch (err) {
      setTestResult(false);
      alert(err instanceof Error ? err.message : 'Test başarısız');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Anahtarı</CardTitle>
        <CardDescription>
          Fatura Aktarımı ve Asistan modülleri için gereklidir. Anahtar güvenli şekilde saklanır.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="api_key">API Anahtarı</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api_key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="sk_live_..."
                disabled={isSaving || isTesting}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {testResult !== null && (
          <div
            className={`flex items-center gap-2 rounded-lg p-3 ${
              testResult
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {testResult ? (
              <>
                <Check className="h-4 w-4" />
                <span>API anahtarı geçerli</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                <span>API anahtarı geçersiz</span>
              </>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button
            onClick={handleTest}
            disabled={isSaving || isTesting || !apiKey.trim()}
            variant="outline"
          >
            {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Et
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isTesting || !apiKey.trim()}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </div>

        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <p>
            <strong>Not:</strong> API anahtarı olmadan Fatura Aktarımı ve Asistan modüllerinin
            manuel giriş kısımları yine de tam çalışır durumda olacaktır.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

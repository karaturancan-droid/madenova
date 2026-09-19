'use client';

import { useState, useEffect } from 'react';
import { useAyarlar, Settings } from '@/hooks/use-ayarlar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function ProfileSection() {
  const { settings, loading, setSetting, loadAllSettings } = useAyarlar();
  const [formData, setFormData] = useState<Settings>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const keys: (keyof Settings)[] = [
        'company_name',
        'tax_no',
        'phone',
        'email',
        'contact_person',
      ];

      for (const key of keys) {
        if (formData[key]) {
          await setSetting(key, formData[key] as string);
        }
      }

      alert('Profil ayarları kaydedildi');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Kaydetme başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Bilgileri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="company_name">İşletme Adı</Label>
          <Input
            id="company_name"
            value={formData.company_name || ''}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            placeholder="İşletme adı"
            disabled={isSaving}
          />
        </div>

        <div>
          <Label htmlFor="tax_no">VKN</Label>
          <Input
            id="tax_no"
            value={formData.tax_no || ''}
            onChange={(e) => setFormData({ ...formData, tax_no: e.target.value })}
            placeholder="Vergi Kimlik Numarası"
            disabled={isSaving}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+90 5XX XXX XXXX"
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="info@example.com"
              disabled={isSaving}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="contact_person">Yetkili Kişi</Label>
          <Input
            id="contact_person"
            value={formData.contact_person || ''}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            placeholder="Yetkili kişi adı"
            disabled={isSaving}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

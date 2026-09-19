'use client';

import { useState, useEffect } from 'react';
import { Document } from '@/hooks/use-belgeler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface DocumentFormProps {
  document?: Document;
  onSubmit: (data: Omit<Document, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  'Muhasebe',
  'Vergi',
  'Araç',
  'Depo',
  'İşçi',
  'Diğer',
];

const FILE_TYPES = [
  'PDF',
  'Word',
  'Excel',
  'Resim',
  'Diğer',
];

export function DocumentForm({ document, onSubmit, onCancel, isLoading = false }: DocumentFormProps) {
  const [formData, setFormData] = useState<Omit<Document, 'id' | 'created_at'>>({
    title: '',
    category: '',
    file_type: '',
    file_path: '',
    related_type: '',
    related_id: '',
    expiry_date: '',
    tags: '',
    notes: '',
  });

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        category: document.category || '',
        file_type: document.file_type || '',
        file_path: document.file_path || '',
        related_type: document.related_type || '',
        related_id: document.related_id || '',
        expiry_date: document.expiry_date || '',
        tags: document.tags || '',
        notes: document.notes || '',
      });
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Başlık gereklidir');
      return;
    }
    await onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{document ? 'Belgeyi Düzenle' : 'Yeni Belge Ekle'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Belge başlığı"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category || ''}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={isLoading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="file_type">Dosya Tipi</Label>
              <Select
                value={formData.file_type || ''}
                onValueChange={(value) => setFormData({ ...formData, file_type: value })}
                disabled={isLoading}
              >
                <SelectTrigger id="file_type">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {FILE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="file_path">Dosya Yolu</Label>
            <Input
              id="file_path"
              value={formData.file_path}
              onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
              placeholder="/path/to/file"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="related_type">İlişkili Tür</Label>
              <Input
                id="related_type"
                value={formData.related_type}
                onChange={(e) => setFormData({ ...formData, related_type: e.target.value })}
                placeholder="Örn: firma, araç"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="related_id">İlişkili ID</Label>
              <Input
                id="related_id"
                value={formData.related_id}
                onChange={(e) => setFormData({ ...formData, related_id: e.target.value })}
                placeholder="ID"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="expiry_date">Son Geçerlilik Tarihi</Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="tags">Etiketler (virgülle ayrılmış)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="etiket1, etiket2, etiket3"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ek notlar..."
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {document ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

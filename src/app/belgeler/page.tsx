'use client';

import { useState, useEffect } from 'react';
import { useBelgeler, Document } from '@/hooks/use-belgeler';
import { DocumentList } from '@/components/belgeler/document-list';
import { DocumentForm } from '@/components/belgeler/document-form';
import { DocumentDetails } from '@/components/belgeler/document-details';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function BelgelerPage() {
  const { createDocument, updateDocument, deleteDocument, loadDocuments } = useBelgeler();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (doc: Document) => {
    setSelectedDocument(doc);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu belgeyi silmek istediğinizden emin misiniz?')) {
      setIsLoading(true);
      deleteDocument(id)
        .then(() => {
          alert('Belge silindi');
          loadDocuments();
        })
        .catch((err) => {
          alert(err.message || 'Belge silinemedi');
        })
        .finally(() => setIsLoading(false));
    }
  };

  const handleSubmit = async (data: Omit<Document, 'id' | 'created_at'>) => {
    setIsLoading(true);
    try {
      if (selectedDocument) {
        await updateDocument(selectedDocument.id, data);
        alert('Belge güncellendi');
      } else {
        await createDocument(data);
        alert('Belge oluşturuldu');
      }
      setShowForm(false);
      setSelectedDocument(null);
      loadDocuments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'İşlem başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Belge Arşivi</h1>
          <p className="text-gray-600">Tüm belgelerinizi yönetin ve takip edin</p>
        </div>
        <Button onClick={() => {
          setSelectedDocument(null);
          setShowForm(true);
        }}>
          Belge Ekle
        </Button>
      </div>

      <DocumentList
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={loadDocuments}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDocument ? 'Belgeyi Düzenle' : 'Yeni Belge Ekle'}</DialogTitle>
          </DialogHeader>
          <DocumentForm
            document={selectedDocument || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedDocument(null);
            }}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

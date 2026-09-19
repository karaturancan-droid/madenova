'use client';

import { useState, useEffect } from 'react';
import { useBelgeler, Document } from '@/hooks/use-belgeler';
import { formatDateTR } from '@/lib/format';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, Trash2, Edit2 } from 'lucide-react';

interface DocumentListProps {
  onEdit: (doc: Document) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function DocumentList({ onEdit, onDelete, onRefresh }: DocumentListProps) {
  const { documents, loading, error, loadDocuments } = useBelgeler();
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    let filtered = documents;

    if (categoryFilter) {
      filtered = filtered.filter((doc) => doc.category === categoryFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(term) ||
          (doc.tags && doc.tags.toLowerCase().includes(term))
      );
    }

    setFilteredDocs(filtered);
  }, [documents, searchTerm, categoryFilter]);

  const getExpiryBadge = (expiryDate?: string) => {
    if (!expiryDate) return null;

    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return <Badge variant="destructive">Süresi Doldu</Badge>;
    } else if (daysLeft <= 30) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        {daysLeft} Gün Kaldı
      </Badge>;
    }

    return null;
  };

  const handleDownload = (doc: Document) => {
    if (doc.file_path) {
      // Tauri dosya indirme işlemi
      const link = document.createElement('a');
      link.href = doc.file_path;
      link.download = doc.title;
      link.click();
    }
  };

  const categories = Array.from(new Set(documents.map((doc) => doc.category).filter(Boolean)));

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">Hata: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0 && !loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Belge arşivinde kayıt bulunmamaktadır.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Başlık veya etiket ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tümü</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat || ''}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>BAŞLIK</TableHead>
              <TableHead>KATEGORİ</TableHead>
              <TableHead>TİP</TableHead>
              <TableHead>SON GEÇERLİLİK</TableHead>
              <TableHead>ETİKETLER</TableHead>
              <TableHead>İŞLEMLER</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="inline h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : filteredDocs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Sonuç bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filteredDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell>{doc.category || '-'}</TableCell>
                  <TableCell>{doc.file_type || '-'}</TableCell>
                  <TableCell>
                    {doc.expiry_date ? (
                      <div className="flex flex-col gap-1">
                        <span>{formatDateTR(doc.expiry_date)}</span>
                        {getExpiryBadge(doc.expiry_date)}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {doc.tags ? (
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.split(',').map((tag) => (
                          <Badge key={tag.trim()} variant="outline">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(doc)}
                        title="Düzenle"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {doc.file_path && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(doc)}
                          title="İndir"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(doc.id)}
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

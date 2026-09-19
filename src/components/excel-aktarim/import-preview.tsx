'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImportPreviewProps {
  data: Array<Record<string, string>>;
  onConfirm: (entityType: string) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}

const ENTITY_TYPES = [
  { value: 'firma', label: 'Firma' },
  { value: 'urun', label: 'Ürün' },
  { value: 'arac', label: 'Araç' },
  { value: 'isci', label: 'İşçi' },
];

export function ImportPreview({
  data,
  onConfirm,
  onBack,
  isLoading = false,
}: ImportPreviewProps) {
  const [entityType, setEntityType] = useState('firma');
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adım 2: Önizleme ve Eşleme</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="entity_type">Veri Türü</Label>
          <Select value={entityType} onValueChange={setEntityType} disabled={isLoading}>
            <SelectTrigger id="entity_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col} className="whitespace-nowrap">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row, idx) => (
                <TableRow key={startIndex + idx}>
                  {columns.map((col) => (
                    <TableCell key={`${startIndex + idx}-${col}`} className="whitespace-nowrap">
                      {row[col] || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Sayfa {currentPage + 1} / {totalPages} ({data.length} satır)
          </span>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0 || isLoading}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1 || isLoading}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button onClick={onBack} disabled={isLoading} variant="outline">
            Geri
          </Button>
          <Button onClick={() => onConfirm(entityType)} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            İçe Aktar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

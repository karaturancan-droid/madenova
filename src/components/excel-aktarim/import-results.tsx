'use client';

import { ImportResult } from '@/hooks/use-excel-aktarim';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ImportResultsProps {
  result: ImportResult;
  onReset: () => void;
}

export function ImportResults({ result, onReset }: ImportResultsProps) {
  const successRate = Math.round((result.success / (result.success + result.errors)) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adım 3: İçe Aktarma Sonuçları</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Başarılı</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-green-600">{result.success}</p>
          </div>

          <div className="rounded-lg bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-gray-600">Hata</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-red-600">{result.errors}</p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <span className="text-sm text-gray-600">Başarı Oranı</span>
            <p className="mt-2 text-2xl font-bold text-blue-600">{successRate}%</p>
          </div>
        </div>

        {result.details.length > 0 && (
          <div>
            <h3 className="mb-4 font-semibold">Hata Detayları</h3>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SATIR</TableHead>
                    <TableHead>HATA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.details.map((detail, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{detail.row}</TableCell>
                      <TableCell className="text-red-600">{detail.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onReset}>Yeni Dosya Yükle</Button>
        </div>
      </CardContent>
    </Card>
  );
}

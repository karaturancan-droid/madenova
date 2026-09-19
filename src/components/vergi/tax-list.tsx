'use client';

import { TaxItem } from '@/hooks/use-vergi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrencyTRY, formatDateTR } from '@/lib/format';

interface TaxListProps {
  items: TaxItem[];
  loading: boolean;
  onEdit: (item: TaxItem) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
}

export function TaxList({
  items,
  loading,
  onEdit,
  onDelete,
  onMarkAsPaid,
}: TaxListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Vergi kaydı bulunmamaktadır.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'bekliyor':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Bekliyor</Badge>;
      case 'ödendi':
        return <Badge className="bg-green-700 hover:bg-green-800">Ödendi</Badge>;
      case 'gecikti':
        return <Badge className="bg-red-600 hover:bg-red-700">Gecikti</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>TİP</TableHead>
            <TableHead>DÖNEM</TableHead>
            <TableHead className="text-right">TUTAR</TableHead>
            <TableHead>VADESİ</TableHead>
            <TableHead>DURUM</TableHead>
            <TableHead className="text-right">İŞLEMLER</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.type}</TableCell>
              <TableCell>{item.period || '-'}</TableCell>
              <TableCell className="text-right">{formatCurrencyTRY(item.amount)}</TableCell>
              <TableCell>{formatDateTR(item.due_date)}</TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    Düzenle
                  </Button>
                  {item.status !== 'ödendi' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsPaid(item.id)}
                    >
                      Ödendi İşaretle
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                  >
                    Sil
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

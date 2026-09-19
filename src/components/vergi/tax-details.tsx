'use client';

import { TaxItem } from '@/hooks/use-vergi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyTRY, formatDateTR } from '@/lib/format';

interface TaxDetailsProps {
  item: TaxItem | null;
  onEdit: (item: TaxItem) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
}

export function TaxDetails({
  item,
  onEdit,
  onDelete,
  onMarkAsPaid,
}: TaxDetailsProps) {
  if (!item) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Detayları görmek için bir vergi kaydı seçiniz.
          </p>
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{item.type}</CardTitle>
            <CardDescription>{item.period || 'Dönem belirtilmemiş'}</CardDescription>
          </div>
          {getStatusBadge(item.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Tutar</p>
            <p className="text-lg font-semibold">{formatCurrencyTRY(item.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vade Tarihi</p>
            <p className="text-lg font-semibold">{formatDateTR(item.due_date)}</p>
          </div>
        </div>

        {item.notes && (
          <div>
            <p className="text-sm text-muted-foreground">Notlar</p>
            <p className="text-sm">{item.notes}</p>
          </div>
        )}

        {item.receipt_path && (
          <div>
            <p className="text-sm text-muted-foreground">Makbuz Dosya Yolu</p>
            <p className="text-sm font-mono">{item.receipt_path}</p>
          </div>
        )}

        <div className="pt-4 border-t space-y-2">
          <p className="text-xs text-muted-foreground">
            Oluşturulma: {formatDateTR(item.created_at)}
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onEdit(item)}
            className="flex-1"
          >
            Düzenle
          </Button>
          {item.status !== 'ödendi' && (
            <Button
              variant="outline"
              onClick={() => onMarkAsPaid(item.id)}
              className="flex-1"
            >
              Ödendi İşaretle
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => onDelete(item.id)}
            className="flex-1"
          >
            Sil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

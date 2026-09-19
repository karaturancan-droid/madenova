'use client';

import { StockMovement } from '@/hooks/use-depo';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDateTR } from '@/lib/format';

interface StockMovementsProps {
  movements: StockMovement[];
  loading: boolean;
}

export function StockMovements({ movements, loading }: StockMovementsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Bu ürün için stok hareketi bulunmamaktadır.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>TARİH</TableHead>
            <TableHead>TİP</TableHead>
            <TableHead className="text-right">MİKTAR</TableHead>
            <TableHead>NOT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>{formatDateTR(movement.date)}</TableCell>
              <TableCell>
                <Badge variant={movement.type === 'giriş' ? 'default' : 'destructive'}>
                  {movement.type === 'giriş' ? 'Giriş' : 'Çıkış'}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">{movement.quantity}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{movement.note || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

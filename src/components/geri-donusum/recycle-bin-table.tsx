'use client';

import * as React from 'react';
import { formatDateTR } from '@/lib/format';
import { RecycleBinItem } from '@/hooks/use-recycle-bin';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RestoreDialog } from './restore-dialog';
import { DeleteDialog } from './delete-dialog';
import { useToast } from '@/components/ui/toast';

interface RecycleBinTableProps {
  items: RecycleBinItem[];
  onRestore: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

// Entity type to Turkish label mapping
const entityTypeLabels: Record<string, string> = {
  company: 'Firma',
  ledger_entry: 'Hareket',
  product: 'Ürün',
  vehicle: 'Araç',
  vehicle_expense: 'Araç Masrafı',
  tire: 'Lastik',
  worker: 'İşçi',
  leave: 'İzin',
  overtime: 'Mesai',
  payroll: 'Maaş',
  document: 'Belge',
  tax_item: 'Vergi',
};

// Extract title from record_data based on entity type
function extractTitle(entityType: string, recordData: Record<string, unknown>): string {
  switch (entityType) {
    case 'company':
      return (recordData.name as string) || 'Bilinmeyen Firma';
    case 'ledger_entry':
      return (recordData.description as string) || (recordData.document_no as string) || 'Bilinmeyen Hareket';
    case 'product':
      return (recordData.name as string) || 'Bilinmeyen Ürün';
    case 'vehicle':
      return (recordData.plate as string) || (recordData.name as string) || 'Bilinmeyen Araç';
    case 'vehicle_expense':
      return (recordData.description as string) || 'Bilinmeyen Araç Masrafı';
    case 'tire':
      return (recordData.serial_no as string) || (recordData.brand as string) || 'Bilinmeyen Lastik';
    case 'worker':
      return (recordData.name as string) || 'Bilinmeyen İşçi';
    case 'leave':
      return (recordData.type as string) || 'Bilinmeyen İzin';
    case 'overtime':
      return (recordData.description as string) || 'Bilinmeyen Mesai';
    case 'payroll':
      return (recordData.period as string) || 'Bilinmeyen Maaş';
    case 'document':
      return (recordData.name as string) || (recordData.file_name as string) || 'Bilinmeyen Belge';
    case 'tax_item':
      return (recordData.name as string) || 'Bilinmeyen Vergi';
    default:
      return 'Bilinmeyen Öğe';
  }
}

export function RecycleBinTable({
  items,
  onRestore,
  onDelete,
  isLoading = false,
}: RecycleBinTableProps) {
  const { addToast } = useToast();
  const [restoreDialogOpen, setRestoreDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<RecycleBinItem | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  const handleRestoreClick = (item: RecycleBinItem) => {
    setSelectedItem(item);
    setRestoreDialogOpen(true);
  };

  const handleDeleteClick = (item: RecycleBinItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      await onRestore(selectedItem.id);
      addToast({
        title: 'Başarılı',
        description: 'Öğe geri yüklendi.',
        variant: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'Geri yükleme başarısız oldu.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      await onDelete(selectedItem.id);
      addToast({
        title: 'Başarılı',
        description: 'Öğe kalıcı olarak silindi.',
        variant: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'Silme başarısız oldu.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Geri dönüşüm kutunuz boş.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ENTITY_TYPE</TableHead>
              <TableHead>BAŞLIK</TableHead>
              <TableHead>SİLİNDİ</TableHead>
              <TableHead>KALAN GÜN</TableHead>
              <TableHead>DURUM</TableHead>
              <TableHead className="text-right">İŞLEMLER</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {entityTypeLabels[item.entity_type] || item.entity_type}
                </TableCell>
                <TableCell>{extractTitle(item.entity_type, item.record_data)}</TableCell>
                <TableCell>{formatDateTR(item.deleted_at)}</TableCell>
                <TableCell>
                  {item.days_left !== undefined ? `${item.days_left} gün` : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="success">Geri Yüklenebilir</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreClick(item)}
                      disabled={isLoading || actionLoading}
                    >
                      Geri Yükle
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(item)}
                      disabled={isLoading || actionLoading}
                    >
                      Kalıcı Sil
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedItem && (
        <>
          <RestoreDialog
            open={restoreDialogOpen}
            onOpenChange={setRestoreDialogOpen}
            itemTitle={extractTitle(selectedItem.entity_type, selectedItem.record_data)}
            onConfirm={handleRestoreConfirm}
            isLoading={actionLoading}
          />
          <DeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            itemTitle={extractTitle(selectedItem.entity_type, selectedItem.record_data)}
            onConfirm={handleDeleteConfirm}
            isLoading={actionLoading}
          />
        </>
      )}
    </>
  );
}

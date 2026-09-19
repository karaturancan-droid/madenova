'use client';

import { useState, useCallback } from 'react';
import { useVergi, type TaxItem } from '@/hooks/use-vergi';
import { TaxList } from '@/components/vergi/tax-list';
import { TaxForm } from '@/components/vergi/tax-form';
import { TaxDetails } from '@/components/vergi/tax-details';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
} from '@/components/ui/select';

export default function VergiPage() {
  const vergi = useVergi();
  const [taxFormOpen, setTaxFormOpen] = useState(false);
  const [editingTaxItem, setEditingTaxItem] = useState<TaxItem | null>(null);
  const [selectedTaxId, setSelectedTaxId] = useState<string | null>(null);

  const selectedTaxItem = vergi.allTaxItems.find((item) => item.id === selectedTaxId);

  // Vergi Formu İşlemleri
  const handleAddTax = useCallback(() => {
    setEditingTaxItem(null);
    setTaxFormOpen(true);
  }, []);

  const handleEditTax = useCallback((item: TaxItem) => {
    setEditingTaxItem(item);
    setTaxFormOpen(true);
  }, []);

  const handleDeleteTax = useCallback(
    async (id: string) => {
      const confirmed = window.confirm(
        'Bu vergi kaydını silmek istediğiniz emin misiniz?'
      );

      if (confirmed) {
        try {
          await vergi.deleteTaxItem(id);
          if (selectedTaxId === id) {
            setSelectedTaxId(null);
          }
        } catch (error) {
          // Hata zaten hook tarafından işleniyor
        }
      }
    },
    [selectedTaxId, vergi]
  );

  const handleSubmitTaxForm = useCallback(
    async (data: {
      type: string;
      period?: string;
      amount: number;
      due_date: string;
      notes?: string;
      receipt_path?: string;
    }) => {
      if (editingTaxItem) {
        await vergi.updateTaxItem(editingTaxItem.id, data);
      } else {
        await vergi.createTaxItem(data);
      }
    },
    [editingTaxItem, vergi]
  );

  const handleMarkAsPaid = useCallback(
    async (id: string) => {
      try {
        await vergi.markAsPaid(id);
      } catch (error) {
        // Hata zaten hook tarafından işleniyor
      }
    },
    [vergi]
  );

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Başlık ve Filtreler */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vergi Takibi</h1>
          <p className="text-muted-foreground">Vergi ödemelerini yönetin</p>
        </div>
        <Button onClick={handleAddTax}>Vergi Ekle</Button>
      </div>

      {/* Durum Filtresi */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Durum Filtresi:</label>
            <Select
              value={vergi.statusFilter}
              onValueChange={(value: any) => vergi.setStatusFilter(value)}
            >
              <option value="tümü">Tümü</option>
              <option value="bekliyor">Bekliyor</option>
              <option value="ödendi">Ödendi</option>
              <option value="gecikti">Gecikti</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ana İçerik */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vergi Listesi */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Vergi Kayıtları</CardTitle>
            </CardHeader>
            <CardContent>
              <TaxList
                items={vergi.taxItems}
                loading={vergi.loading}
                onEdit={handleEditTax}
                onDelete={handleDeleteTax}
                onMarkAsPaid={handleMarkAsPaid}
              />
            </CardContent>
          </Card>
        </div>

        {/* Detaylar */}
        <div>
          <TaxDetails
            item={selectedTaxItem || null}
            onEdit={handleEditTax}
            onDelete={handleDeleteTax}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </div>
      </div>

      {/* Vergi Formu Dialog */}
      <TaxForm
        open={taxFormOpen}
        onOpenChange={setTaxFormOpen}
        onSubmit={handleSubmitTaxForm}
        initialData={editingTaxItem || undefined}
        isLoading={vergi.loading}
      />
    </div>
  );
}

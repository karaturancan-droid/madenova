'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useRecycleBin } from '@/hooks/use-recycle-bin';
import { RecycleBinTable } from '@/components/geri-donusum/recycle-bin-table';

export default function GeriDonusumPage() {
  const { items, loading, error, restoreItem, permanentlyDeleteItem } = useRecycleBin();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Geri Dönüşüm Kutusu</CardTitle>
          <CardDescription>
            Silinen kayıtları görüntüleyin, geri yükleyin veya kalıcı olarak silin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Yükleniyor...</div>
            </div>
          ) : (
            <RecycleBinTable
              items={items}
              onRestore={restoreItem}
              onDelete={permanentlyDeleteItem}
              isLoading={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

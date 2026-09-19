'use client';

import { useState, useMemo } from 'react';
import { Worker } from '@/hooks/use-isciler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WorkerListProps {
  workers: Worker[];
  selectedWorkerId: string | null;
  onSelectWorker: (id: string) => void;
  onAddWorker: () => void;
  loading: boolean;
}

export function WorkerList({
  workers,
  selectedWorkerId,
  onSelectWorker,
  onAddWorker,
  loading,
}: WorkerListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWorkers = useMemo(() => {
    return workers.filter((w) =>
      w.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workers, searchTerm]);

  const getStatusBadge = (exitDate?: string) => {
    if (exitDate) {
      return <Badge className="bg-gray-500 hover:bg-gray-600">Ayrılmış</Badge>;
    }
    return <Badge className="bg-green-700 hover:bg-green-800">Aktif</Badge>;
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          placeholder="İşçi ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button onClick={onAddWorker}>İşçi Ekle</Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Yükleniyor...</p>
            </div>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground text-sm">İşçi bulunmamaktadır.</p>
          </div>
        ) : (
          filteredWorkers.map((worker) => (
            <Card
              key={worker.id}
              className={`p-4 cursor-pointer transition-colors ${
                selectedWorkerId === worker.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
              onClick={() => onSelectWorker(worker.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{worker.full_name}</p>
                  <p className="text-sm opacity-75 truncate">
                    {worker.position || 'Pozisyon belirtilmemiş'}
                  </p>
                </div>
                {getStatusBadge(worker.exit_date)}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

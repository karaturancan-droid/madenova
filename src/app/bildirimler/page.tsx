'use client';

import { useState, useEffect } from 'react';
import { useBildirimler } from '@/hooks/use-bildirimler';
import { NotificationList } from '@/components/bildirimler/notification-list';
import { NotificationFilters } from '@/components/bildirimler/notification-filters';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function BildirimlerPage() {
  const { refreshNotifications, loadNotifications } = useBildirimler();
  const [moduleFilter, setModuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotifications();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bildirimler</h1>
          <p className="text-gray-600">Önemli olayları ve son tarihler hakkında bildirim alın</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>

      <NotificationFilters
        moduleFilter={moduleFilter}
        statusFilter={statusFilter}
        onModuleChange={setModuleFilter}
        onStatusChange={setStatusFilter}
      />

      <NotificationList
        moduleFilter={moduleFilter}
        statusFilter={statusFilter}
        onRefresh={handleRefresh}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useBildirimler, Notification } from '@/hooks/use-bildirimler';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Trash2, Check, Clock } from 'lucide-react';

interface NotificationListProps {
  moduleFilter?: string;
  statusFilter?: string;
  onRefresh: () => void;
}

const MODULE_LABELS: Record<string, string> = {
  vergi: 'Vergi',
  araclar: 'Araçlar',
  belgeler: 'Belgeler',
  depo: 'Depo',
  isciler: 'İşçiler',
};

export function NotificationList({
  moduleFilter,
  statusFilter,
  onRefresh,
}: NotificationListProps) {
  const { notifications, loading, error, loadNotifications, updateNotificationStatus, deleteNotification } =
    useBildirimler();
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications({ module: moduleFilter, status: statusFilter });
  }, [loadNotifications, moduleFilter, statusFilter]);

  useEffect(() => {
    let filtered = notifications;

    if (moduleFilter) {
      filtered = filtered.filter((notif) => notif.module === moduleFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((notif) => notif.status === statusFilter);
    }

    setFilteredNotifications(filtered);
  }, [notifications, moduleFilter, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktif':
        return <Badge className="bg-blue-500">Aktif</Badge>;
      case 'okundu':
        return <Badge variant="secondary">Okundu</Badge>;
      case 'ertelendi':
        return <Badge className="bg-yellow-500">Ertelendi</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDaysLeftColor = (daysLeft?: number) => {
    if (daysLeft === undefined) return 'text-gray-600';
    if (daysLeft < 0) return 'text-red-600 font-semibold';
    if (daysLeft <= 7) return 'text-orange-600 font-semibold';
    return 'text-green-600';
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateNotificationStatus(id, 'okundu');
      onRefresh();
    } catch (err) {
      console.error('Bildirim okundu işaretiyle güncellenemedi:', err);
    }
  };

  const handleMarkAsPostponed = async (id: string) => {
    try {
      await updateNotificationStatus(id, 'ertelendi');
      onRefresh();
    } catch (err) {
      console.error('Bildirim ertelendi işaretiyle güncellenemedi:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteNotification(id);
        onRefresh();
      } catch (err) {
        console.error('Bildirim silinemedi:', err);
      }
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">Hata: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0 && !loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Bildirim bulunmamaktadır.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>BAŞLIK</TableHead>
            <TableHead>MODÜL</TableHead>
            <TableHead>KALAN GÜN</TableHead>
            <TableHead>DURUM</TableHead>
            <TableHead>İŞLEMLER</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <Loader2 className="inline h-6 w-6 animate-spin" />
              </TableCell>
            </TableRow>
          ) : filteredNotifications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                Sonuç bulunamadı
              </TableCell>
            </TableRow>
          ) : (
            filteredNotifications.map((notif) => (
              <TableRow key={notif.id}>
                <TableCell className="font-medium">{notif.title}</TableCell>
                <TableCell>{MODULE_LABELS[notif.module] || notif.module}</TableCell>
                <TableCell>
                  <span className={getDaysLeftColor(notif.days_left)}>
                    {notif.days_left !== undefined ? `${notif.days_left} Gün` : '-'}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(notif.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {notif.status !== 'okundu' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notif.id)}
                        title="Okundu İşaretle"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {notif.status !== 'ertelendi' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsPostponed(notif.id)}
                        title="Ertelendi İşaretle"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(notif.id)}
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

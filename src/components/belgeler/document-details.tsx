'use client';

import { Document } from '@/hooks/use-belgeler';
import { formatDateTR } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DocumentDetailsProps {
  document: Document;
}

export function DocumentDetails({ document }: DocumentDetailsProps) {
  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;

    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { text: 'Süresi Doldu', variant: 'destructive' as const };
    } else if (daysLeft <= 30) {
      return { text: `${daysLeft} Gün Kaldı`, variant: 'secondary' as const };
    }

    return { text: 'Geçerli', variant: 'default' as const };
  };

  const expiryStatus = getExpiryStatus(document.expiry_date);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{document.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Kategori</p>
            <p className="font-medium">{document.category || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Dosya Tipi</p>
            <p className="font-medium">{document.file_type || '-'}</p>
          </div>
        </div>

        {document.expiry_date && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Son Geçerlilik</p>
              <p className="font-medium">{formatDateTR(document.expiry_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Durum</p>
              {expiryStatus && (
                <Badge variant={expiryStatus.variant}>{expiryStatus.text}</Badge>
              )}
            </div>
          </div>
        )}

        {document.tags && (
          <div>
            <p className="text-sm text-gray-600">Etiketler</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {document.tags.split(',').map((tag) => (
                <Badge key={tag.trim()} variant="outline">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {document.related_type && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">İlişkili Tür</p>
              <p className="font-medium">{document.related_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">İlişkili ID</p>
              <p className="font-medium">{document.related_id || '-'}</p>
            </div>
          </div>
        )}

        {document.notes && (
          <div>
            <p className="text-sm text-gray-600">Notlar</p>
            <p className="mt-2 whitespace-pre-wrap">{document.notes}</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500">
            Oluşturulma: {formatDateTR(document.created_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

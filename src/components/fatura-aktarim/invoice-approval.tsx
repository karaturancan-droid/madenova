'use client';

import { Invoice } from '@/hooks/use-fatura-aktarim';
import { formatCurrencyTRY, formatDateTR } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface InvoiceApprovalProps {
  invoice: Invoice;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  onReset: () => void;
  isLoading?: boolean;
}

export function InvoiceApproval({
  invoice,
  onApprove,
  onReject,
  onReset,
  isLoading = false,
}: InvoiceApprovalProps) {
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const handleApproveClick = () => {
    setShowApproveConfirm(true);
  };

  const handleConfirmApprove = async () => {
    setShowApproveConfirm(false);
    await onApprove();
  };

  const handleRejectClick = () => {
    setShowRejectConfirm(true);
  };

  const handleConfirmReject = async () => {
    setShowRejectConfirm(false);
    await onReject();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Adım 3: Faturayı Onayla</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Fatura No</p>
              <p className="mt-2 text-lg font-semibold">{invoice.invoice_no || '-'}</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Tarih</p>
              <p className="mt-2 text-lg font-semibold">
                {invoice.date ? formatDateTR(invoice.date) : '-'}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Ara Toplam</p>
              <p className="mt-2 text-lg font-semibold">
                {invoice.subtotal ? formatCurrencyTRY(invoice.subtotal) : '-'}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">KDV</p>
              <p className="mt-2 text-lg font-semibold">
                {invoice.vat_amount ? formatCurrencyTRY(invoice.vat_amount) : '-'}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-gray-600">Toplam Tutar</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {invoice.total ? formatCurrencyTRY(invoice.total) : '-'}
            </p>
          </div>

          {invoice.iban && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">IBAN</p>
              <p className="mt-2 font-mono text-sm">{invoice.iban}</p>
            </div>
          )}

          <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            <p>
              <strong>Uyarı:</strong> Bu faturayı onayladıktan sonra muhasebe defterine otomatik
              olarak kaydedilecektir. Devam etmek istediğinizden emin misiniz?
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button onClick={handleRejectClick} disabled={isLoading} variant="outline">
              <XCircle className="mr-2 h-4 w-4" />
              Reddet
            </Button>
            <Button onClick={handleApproveClick} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle className="mr-2 h-4 w-4" />
              Onayla
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Faturayı Onayla</DialogTitle>
            <DialogDescription>
              Bu faturayı onaylamak istediğinizden emin misiniz? Onaylandıktan sonra muhasebe
              defterine kaydedilecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button onClick={() => setShowApproveConfirm(false)} variant="outline">
              İptal
            </Button>
            <Button onClick={handleConfirmApprove} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Onayla
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Faturayı Reddet</DialogTitle>
            <DialogDescription>
              Bu faturayı reddetmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button onClick={() => setShowRejectConfirm(false)} variant="outline">
              İptal
            </Button>
            <Button onClick={handleConfirmReject} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reddet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

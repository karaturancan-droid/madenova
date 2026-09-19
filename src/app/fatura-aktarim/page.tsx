'use client';

import { useState } from 'react';
import { useFaturaAktarim, Invoice } from '@/hooks/use-fatura-aktarim';
import { InvoiceUpload } from '@/components/fatura-aktarim/invoice-upload';
import { InvoicePreview } from '@/components/fatura-aktarim/invoice-preview';
import { InvoiceApproval } from '@/components/fatura-aktarim/invoice-approval';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Step = 'upload' | 'preview' | 'approval' | 'success';

export default function FaturaAktarimPage() {
  const { uploadAndExtractInvoice, approveInvoice, rejectInvoice, updateInvoice, loading } =
    useFaturaAktarim();
  const [step, setStep] = useState<Step>('upload');
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const handleFileSelect = async (file: File) => {
    try {
      const result = await uploadAndExtractInvoice(file);
      setInvoice(result);
      setStep('preview');
      alert('Fatura başarıyla yüklendi ve işlendi');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fatura yüklenemedi');
    }
  };

  const handleApprove = async () => {
    if (!invoice?.id) return;

    try {
      await approveInvoice(invoice.id);
      setStep('success');
      alert('Fatura onaylandı ve muhasebe defterine kaydedildi');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fatura onaylanamadı');
    }
  };

  const handleReject = async () => {
    if (!invoice?.id) return;

    try {
      await rejectInvoice(invoice.id);
      setStep('upload');
      setInvoice(null);
      alert('Fatura reddedildi');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fatura reddedilemedi');
    }
  };

  const handleUpdate = (data: Partial<Invoice>) => {
    if (!invoice?.id) return;

    // Update local state immediately for UI responsiveness
    setInvoice({ ...invoice, ...data });
  };

  const handleReset = () => {
    setStep('upload');
    setInvoice(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fatura Aktarımı</h1>
        <p className="text-gray-600">PDF, JPG veya PNG formatındaki faturalardan veri çıkarın</p>
      </div>

      {step === 'upload' && <InvoiceUpload onFileSelect={handleFileSelect} isLoading={loading} />}

      {step === 'preview' && invoice && (
        <InvoicePreview
          invoice={invoice}
          onConfirm={async () => setStep('approval')}
          onBack={() => setStep('upload')}
          onUpdate={handleUpdate}
          isLoading={loading}
        />
      )}

      {step === 'approval' && invoice && (
        <InvoiceApproval
          invoice={invoice}
          onApprove={handleApprove}
          onReject={handleReject}
          onReset={handleReset}
          isLoading={loading}
        />
      )}

      {step === 'success' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Başarılı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-800">
              Fatura başarıyla onaylandı ve muhasebe defterine kaydedildi.
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Yeni Fatura Yükle
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

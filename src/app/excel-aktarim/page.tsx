'use client';

import { useState } from 'react';
import { useExcelAktarim, ImportResult } from '@/hooks/use-excel-aktarim';
import { ImportForm } from '@/components/excel-aktarim/import-form';
import { ImportPreview } from '@/components/excel-aktarim/import-preview';
import { ImportResults } from '@/components/excel-aktarim/import-results';

type Step = 'upload' | 'preview' | 'results';

export default function ExcelAktarimPage() {
  const { checkImportHash, recordImportHash, parseExcelFile, importData, loading } =
    useExcelAktarim();
  const [step, setStep] = useState<Step>('upload');
  const [parsedData, setParsedData] = useState<Array<Record<string, string>>>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const calculateFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  // Fallback hash function for Node.js crypto
  const calculateFileHashFallback = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileSelect = async (file: File) => {
    try {
      // Check for duplicate
      const hash = await calculateFileHash(file);
      const isDuplicate = await checkImportHash(hash);

      if (isDuplicate) {
        alert('Bu dosya daha önce yüklenmiş. Tekrar yüklenmeyecektir.');
        return;
      }

      // Parse file
      const data = await parseExcelFile(file);
      if (data.length === 0) {
        alert('Dosyada veri bulunamadı');
        return;
      }

      setParsedData(data);
      setCurrentFile(file);
      setStep('preview');
      alert(`${data.length} satır yüklendi`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Dosya yüklenemedi');
    }
  };

  const handleConfirmImport = async (entityType: string) => {
    if (!currentFile) return;

    try {
      const result = await importData(parsedData, entityType as any);
      setImportResult(result);

      // Record the hash after successful import
      const hash = await calculateFileHash(currentFile);
      await recordImportHash(hash, currentFile.name);

      setStep('results');
      alert('Veriler başarıyla içe aktarıldı');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'İçe aktarma başarısız');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setParsedData([]);
    setImportResult(null);
    setCurrentFile(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Excel Aktarımı</h1>
        <p className="text-gray-600">Excel, CSV dosyalarından veri aktarın</p>
      </div>

      {step === 'upload' && <ImportForm onFileSelect={handleFileSelect} isLoading={loading} />}

      {step === 'preview' && (
        <ImportPreview
          data={parsedData}
          onConfirm={handleConfirmImport}
          onBack={() => setStep('upload')}
          isLoading={loading}
        />
      )}

      {step === 'results' && importResult && (
        <ImportResults result={importResult} onReset={handleReset} />
      )}
    </div>
  );
}

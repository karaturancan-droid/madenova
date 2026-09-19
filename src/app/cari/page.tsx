'use client';

import { useState, useCallback } from 'react';
import { useCari, type Company, type LedgerEntry } from '@/hooks/use-cari';
import { CompanyList } from '@/components/cari/company-list';
import { CompanyForm } from '@/components/cari/company-form';
import { CompanyDetails } from '@/components/cari/company-details';
import { LedgerForm } from '@/components/cari/ledger-form';

export default function CariPage() {
  const cari = useCari();
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [ledgerFormOpen, setLedgerFormOpen] = useState(false);
  const [editingLedgerEntry, setEditingLedgerEntry] = useState<LedgerEntry | null>(null);

  const selectedCompany = cari.companies.find(
    (c) => c.id === cari.selectedCompanyId
  );

  // Firma Formu İşlemleri
  const handleAddCompany = useCallback(() => {
    setEditingCompany(null);
    setCompanyFormOpen(true);
  }, []);

  const handleEditCompany = useCallback(() => {
    if (selectedCompany) {
      setEditingCompany(selectedCompany);
      setCompanyFormOpen(true);
    }
  }, [selectedCompany]);

  const handleDeleteCompany = useCallback(async () => {
    if (!selectedCompany) return;

    const confirmed = window.confirm(
      `Bu firmayı silmek istediğiniz emin misiniz?\n\n${selectedCompany.name}`
    );

    if (confirmed) {
      try {
        await cari.deleteCompany(selectedCompany.id);
      } catch (error) {
        // Hata zaten hook tarafından işleniyor
      }
    }
  }, [selectedCompany, cari]);

  const handleSubmitCompanyForm = useCallback(
    async (data: {
      name: string;
      tax_no?: string;
      phone?: string;
      email?: string;
      contact_person?: string;
    }) => {
      if (editingCompany) {
        await cari.updateCompany(editingCompany.id, data);
      } else {
        await cari.createCompany(data);
      }
    },
    [editingCompany, cari]
  );

  // Hareket Formu İşlemleri
  const handleAddLedgerEntry = useCallback(() => {
    setEditingLedgerEntry(null);
    setLedgerFormOpen(true);
  }, []);

  const handleEditLedgerEntry = useCallback((entry: LedgerEntry) => {
    setEditingLedgerEntry(entry);
    setLedgerFormOpen(true);
  }, []);

  const handleDeleteLedgerEntry = useCallback(
    async (id: string) => {
      const confirmed = window.confirm(
        'Bu hareketi silmek istediğiniz emin misiniz?'
      );

      if (confirmed) {
        try {
          await cari.deleteLedgerEntry(id);
        } catch (error) {
          // Hata zaten hook tarafından işleniyor
        }
      }
    },
    [cari]
  );

  const handleSubmitLedgerForm = useCallback(
    async (data: {
      date: string;
      document_no?: string;
      description?: string;
      debit: number;
      credit: number;
      entry_type?: string;
    }) => {
      if (!cari.selectedCompanyId) return;

      if (editingLedgerEntry) {
        await cari.updateLedgerEntry(editingLedgerEntry.id, data);
      } else {
        await cari.createLedgerEntry({
          company_id: cari.selectedCompanyId,
          ...data,
        });
      }
    },
    [editingLedgerEntry, cari]
  );

  // CSV Export
  const handleExportCSV = useCallback(() => {
    if (!selectedCompany || cari.ledgerEntries.length === 0) return;

    const headers = ['SIRA', 'TARİH', 'BELGE NO', 'AÇIKLAMA', 'BORÇ', 'ALACAK', 'BAKİYE'];
    const rows: string[][] = [];

    cari.ledgerEntries.forEach((entry, index) => {
      const date = new Date(entry.date).toLocaleDateString('tr-TR');
      rows.push([
        (index + 1).toString(),
        date,
        entry.document_no || '',
        entry.description || '',
        entry.debit > 0 ? entry.debit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '',
        entry.credit > 0 ? entry.credit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '',
        entry.running_balance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      ]);
    });

    // Toplam satırı
    if (cari.ledgerSummary) {
      rows.push([
        '',
        '',
        '',
        'TOPLAM',
        cari.ledgerSummary.total_debit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        cari.ledgerSummary.total_credit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        cari.ledgerSummary.net.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      ]);
    }

    // CSV oluştur
    const csvContent = [
      `Firma: ${selectedCompany.name} | Dönem: ${cari.yearFilter || 'Tüm Yıllar'}`,
      '',
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // UTF-8 BOM ile indir
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const fileName = `cari_${selectedCompany.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedCompany, cari.ledgerEntries, cari.ledgerSummary, cari.yearFilter]);

  return (
    <div className="h-full flex gap-4">
      {/* Sol Panel - Firma Listesi */}
      <div className="w-80 border-r">
        <CompanyList
          companies={cari.companies}
          selectedCompanyId={cari.selectedCompanyId}
          onSelectCompany={cari.selectCompany}
          onAddCompany={handleAddCompany}
          loading={cari.loading}
        />
      </div>

      {/* Sağ Panel - Firma Detayları */}
      <div className="flex-1">
        <CompanyDetails
          company={selectedCompany || null}
          ledgerEntries={cari.ledgerEntries}
          ledgerSummary={cari.ledgerSummary}
          yearFilter={cari.yearFilter}
          onChangeYearFilter={cari.changeYearFilter}
          onEditCompany={handleEditCompany}
          onDeleteCompany={handleDeleteCompany}
          onAddLedgerEntry={handleAddLedgerEntry}
          onEditLedgerEntry={handleEditLedgerEntry}
          onDeleteLedgerEntry={handleDeleteLedgerEntry}
          onExportCSV={handleExportCSV}
          loading={cari.loading}
        />
      </div>

      {/* Firma Formu Dialog */}
      <CompanyForm
        open={companyFormOpen}
        onOpenChange={setCompanyFormOpen}
        onSubmit={handleSubmitCompanyForm}
        initialData={editingCompany || undefined}
        isLoading={cari.loading}
      />

      {/* Hareket Formu Dialog */}
      <LedgerForm
        open={ledgerFormOpen}
        onOpenChange={setLedgerFormOpen}
        onSubmit={handleSubmitLedgerForm}
        initialData={editingLedgerEntry || undefined}
        isLoading={cari.loading}
      />
    </div>
  );
}

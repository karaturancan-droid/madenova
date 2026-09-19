'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrencyTRY, formatDateTR } from '@/lib/format';
import type { Company, LedgerEntry, LedgerSummary } from '@/hooks/use-cari';

interface CompanyDetailsProps {
  company: Company | null;
  ledgerEntries: LedgerEntry[];
  ledgerSummary: LedgerSummary | null;
  yearFilter: number | null;
  onChangeYearFilter: (year: number | null) => void;
  onEditCompany: () => void;
  onDeleteCompany: () => void;
  onAddLedgerEntry: () => void;
  onEditLedgerEntry: (entry: LedgerEntry) => void;
  onDeleteLedgerEntry: (id: string) => void;
  onExportCSV: () => void;
  loading: boolean;
}

export function CompanyDetails({
  company,
  ledgerEntries,
  ledgerSummary,
  yearFilter,
  onChangeYearFilter,
  onEditCompany,
  onDeleteCompany,
  onAddLedgerEntry,
  onEditLedgerEntry,
  onDeleteLedgerEntry,
  onExportCSV,
  loading,
}: CompanyDetailsProps) {
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  if (!company) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg">Sol taraftan bir firma seçerek cari hareketlerini inceleyin</p>
        </div>
      </div>
    );
  }

  // Tüm yılları topla
  const allYears = Array.from(
    new Set(
      ledgerEntries.map((entry) => parseInt(entry.date.substring(0, 4)))
    )
  ).sort((a, b) => b - a);

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col h-full gap-4 overflow-y-auto">
      {/* Firma Başlığı ve Bilgileri */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl">{company.name}</CardTitle>
              {company.tax_no && (
                <p className="text-sm text-gray-600 mt-1">
                  VKN: {company.tax_no}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onEditCompany}
                disabled={loading}
              >
                Düzenle
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteCompany}
                disabled={loading}
              >
                Sil
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* İletişim Bilgileri */}
          <div className="grid grid-cols-2 gap-4">
            {company.phone && (
              <div>
                <p className="text-xs text-gray-600">Telefon</p>
                <p className="font-medium">{company.phone}</p>
              </div>
            )}
            {company.email && (
              <div>
                <p className="text-xs text-gray-600">E-posta</p>
                <p className="font-medium break-all">{company.email}</p>
              </div>
            )}
            {company.contact_person && (
              <div className="col-span-2">
                <p className="text-xs text-gray-600">Yetkili Kişi</p>
                <p className="font-medium">{company.contact_person}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Özet Kartları */}
      {ledgerSummary && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 mb-1">Toplam Borç</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrencyTRY(ledgerSummary.total_debit)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 mb-1">Toplam Alacak</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrencyTRY(ledgerSummary.total_credit)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtreler ve İşlemler */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium block mb-2">Dönem / Yıl</label>
          <Select
            value={yearFilter?.toString() || 'all'}
            onValueChange={(value) => {
              onChangeYearFilter(value === 'all' ? null : parseInt(value));
            }}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Yıllar</SelectItem>
              {allYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCSV}
          disabled={loading || ledgerEntries.length === 0}
        >
          Excel'e Aktar
        </Button>
        <Button
          size="sm"
          onClick={onAddLedgerEntry}
          disabled={loading}
        >
          + Hareket Ekle
        </Button>
      </div>

      {/* Hareket Tablosu */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cari Hareketler</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {loading && ledgerEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Hareketler yükleniyor...
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Bu dönemde hareket bulunmamaktadır
            </div>
          ) : (
            <div className="space-y-2">
              {/* Tablo Başlığı */}
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 pb-2 border-b sticky top-0 bg-white">
                <div className="col-span-1">SIRA</div>
                <div className="col-span-2">TARİH</div>
                <div className="col-span-2">BELGE NO</div>
                <div className="col-span-2">AÇIKLAMA</div>
                <div className="col-span-1 text-right">BORÇ</div>
                <div className="col-span-1 text-right">ALACAK</div>
                <div className="col-span-1 text-right">BAKİYE</div>
                <div className="col-span-1">İŞLEM</div>
              </div>

              {/* Tablo Satırları */}
              {ledgerEntries.map((entry, index) => (
                <div key={entry.id}>
                  <div className="grid grid-cols-12 gap-2 text-xs py-2 border-b hover:bg-gray-50 items-center">
                    <div className="col-span-1">{index + 1}</div>
                    <div className="col-span-2">{formatDateTR(entry.date)}</div>
                    <div className="col-span-2 truncate">
                      {entry.document_no || '-'}
                    </div>
                    <div className="col-span-2 truncate">
                      {entry.description || '-'}
                    </div>
                    <div className="col-span-1 text-right font-medium">
                      {entry.debit > 0 ? formatCurrencyTRY(entry.debit) : '-'}
                    </div>
                    <div className="col-span-1 text-right font-medium">
                      {entry.credit > 0 ? formatCurrencyTRY(entry.credit) : '-'}
                    </div>
                    <div className="col-span-1 text-right font-bold">
                      {formatCurrencyTRY(entry.running_balance)}
                    </div>
                    <div className="col-span-1 flex gap-1">
                      <button
                        onClick={() => onEditLedgerEntry(entry)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 text-xs"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => onDeleteLedgerEntry(entry.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 disabled:text-gray-400 text-xs"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Toplam Satırı */}
              {ledgerEntries.length > 0 && ledgerSummary && (
                <div className="grid grid-cols-12 gap-2 text-xs font-bold py-2 border-t-2 bg-gray-50">
                  <div className="col-span-1"></div>
                  <div className="col-span-2"></div>
                  <div className="col-span-2"></div>
                  <div className="col-span-2 text-right">TOPLAM</div>
                  <div className="col-span-1 text-right">
                    {formatCurrencyTRY(ledgerSummary.total_debit)}
                  </div>
                  <div className="col-span-1 text-right">
                    {formatCurrencyTRY(ledgerSummary.total_credit)}
                  </div>
                  <div className="col-span-1 text-right">
                    {formatCurrencyTRY(ledgerSummary.net)}
                  </div>
                  <div className="col-span-1"></div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

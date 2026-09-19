import {
  Wallet,
  Trash2,
  FileSpreadsheet,
  ReceiptText,
  FolderArchive,
  Warehouse,
  Truck,
  Landmark,
  Users,
  Bell,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/cari", label: "Cari Hesaplar", icon: Wallet },
  { href: "/geri-donusum", label: "Geri Dönüşüm Kutusu", icon: Trash2 },
  { href: "/excel-aktarim", label: "Excel Aktarımı", icon: FileSpreadsheet },
  { href: "/fatura-aktarim", label: "Fatura Aktarımı", icon: ReceiptText },
  { href: "/belgeler", label: "Belge Arşivi", icon: FolderArchive },
  { href: "/depo", label: "Depo", icon: Warehouse },
  { href: "/araclar", label: "Araçlar", icon: Truck },
  { href: "/vergi", label: "Vergi Takibi", icon: Landmark },
  { href: "/isciler", label: "İşçiler", icon: Users },
  { href: "/bildirimler", label: "Bildirimler", icon: Bell },
  { href: "/asistan", label: "Asistan", icon: Sparkles },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

export const ROUTE_TITLES: Record<string, string> = NAV_ITEMS.reduce(
  (acc, item) => {
    acc[item.href] = item.label;
    return acc;
  },
  {} as Record<string, string>
);

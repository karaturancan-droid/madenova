<div align="center">

# ⛏️ Madenova

**Maden ve inşaat sektörü için masaüstü işletme yönetim uygulaması**
**Desktop business management app for the mining & construction sector**

<p>
  <a href="#-türkçe">🇹🇷 Türkçe</a> •
  <a href="#-english">🇬🇧 English</a>
</p>

<p>
  <img src="https://img.shields.io/badge/Tauri-2.x-24C8DB?style=for-the-badge&logo=tauri&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Rust-src--tauri-DE4B23?style=for-the-badge&logo=rust&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-Database-07405E?style=for-the-badge&logo=sqlite&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-informational?style=flat-square" />
  <img src="https://img.shields.io/badge/status-active%20development-success?style=flat-square" />
  <img src="https://img.shields.io/badge/license-Private-lightgrey?style=flat-square" />
</p>

</div>

---

## 🇹🇷 Türkçe

### 📌 Proje Hakkında

**Madenova**, maden ocakları ve inşaat firmalarının günlük operasyonlarını tek bir masaüstü uygulamadan yönetebilmesi için geliştirilmiş, tamamen Türkçe arayüzlü bir işletme yönetim sistemidir. Uygulama **Tauri** (Rust) altyapısı üzerinde çalışır, verileri yerel bir **SQLite** veritabanında saklar ve internet bağlantısına ihtiyaç duymadan çalışabilir.

### ✨ Özellikler / Modüller

| Modül | Açıklama |
|---|---|
| 💳 **Cari Hesaplar** | Müşteri/tedarikçi cari hesap takibi, bakiye ve hareket geçmişi |
| 🗑️ **Geri Dönüşüm Kutusu** | Silinen kayıtları geri yükleme ve kalıcı silme |
| 📦 **Depo** | Stok ve malzeme takibi |
| 🚚 **Araçlar** | Araç filosu, bakım ve masraf takibi |
| 🧾 **Vergi Takibi** | Vergi ödemeleri ve son tarih takibi |
| 👷 **İşçiler** | Personel/işçi kayıtları ve bilgileri |
| 📄 **Belgeler** | Şirket belgelerinin dijital arşivi |
| 🔔 **Bildirimler** | Önemli hatırlatma ve uyarı bildirimleri |
| 📊 **Excel Aktarımı** | Verileri Excel'e aktarma/içe aktarma |
| 🧮 **Fatura Aktarımı** | Fatura verilerini içe aktarma |
| ⚙️ **Ayarlar** | Uygulama genel ayarları |
| 🤖 **Asistan** | Kullanıcıya yardımcı akıllı asistan modülü |

### 🛠️ Teknoloji Yığını

- **Masaüstü çatısı:** Tauri 2 (Rust)
- **Arayüz:** Next.js 15 + React 19 + TypeScript
- **Veritabanı:** SQLite (yerel, çevrimdışı çalışır)
- **Paket yöneticisi:** pnpm

### 🚀 Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükle
pnpm install

# Geliştirme modunda çalıştır (Tauri masaüstü penceresi açılır)
pnpm tauri dev

# Üretim için derle
pnpm tauri build
```

> Not: Tauri için Rust ve platforma özgü sistem bağımlılıklarının kurulu olması gerekir. Detaylar için [Tauri kurulum kılavuzu](https://tauri.app/start/prerequisites/) sayfasına bakın.

### 📁 Proje Yapısı

```
madenapp/
├── src/                # Next.js / React frontend
│   └── app/            # Modül sayfaları (cari, depo, araclar, vergi, ...)
├── src-tauri/          # Rust backend (Tauri) ve SQLite entegrasyonu
└── public/             # Statik dosyalar
```

### 🗺️ Yol Haritası

- [ ] Gerçek ekran görüntülerinin eklenmesi
- [ ] Raporlama ve grafik modülü
- [ ] Çoklu kullanıcı desteği
- [ ] Otomatik güncelleme mekanizması

---

## 🇬🇧 English

### 📌 About

**Madenova** is a fully Turkish-language desktop business management system built for mining and construction companies to manage their daily operations from a single application. It runs on **Tauri** (Rust), stores data in a local **SQLite** database, and works fully offline.

### ✨ Features / Modules

| Module | Description |
|---|---|
| 💳 **Current Accounts** | Customer/supplier account tracking, balances and transaction history |
| 🗑️ **Recycle Bin** | Restore or permanently delete removed records |
| 📦 **Warehouse** | Stock and material tracking |
| 🚚 **Vehicles** | Fleet, maintenance and expense tracking |
| 🧾 **Tax Tracking** | Tax payments and deadline tracking |
| 👷 **Workers** | Employee/worker records |
| 📄 **Documents** | Digital archive of company documents |
| 🔔 **Notifications** | Reminders and important alerts |
| 📊 **Excel Import/Export** | Import/export data to/from Excel |
| 🧮 **Invoice Import** | Import invoice data |
| ⚙️ **Settings** | General application settings |
| 🤖 **Assistant** | Smart assistant module for the user |

### 🛠️ Tech Stack

- **Desktop framework:** Tauri 2 (Rust)
- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Database:** SQLite (local, works offline)
- **Package manager:** pnpm

### 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Run in development mode (opens the Tauri desktop window)
pnpm tauri dev

# Build for production
pnpm tauri build
```

> Note: Rust and platform-specific system dependencies are required for Tauri. See the [Tauri prerequisites guide](https://tauri.app/start/prerequisites/) for details.

### 📁 Project Structure

```
madenapp/
├── src/                # Next.js / React frontend
│   └── app/            # Module pages (cari, depo, araclar, vergi, ...)
├── src-tauri/          # Rust backend (Tauri) with SQLite integration
└── public/             # Static assets
```

### 🗺️ Roadmap

- [ ] Add real screenshots
- [ ] Reporting & charts module
- [ ] Multi-user support
- [ ] Auto-update mechanism

---

<div align="center">

Geliştirici / Developer: **[karaturancan-droid](https://github.com/karaturancan-droid)**

</div>

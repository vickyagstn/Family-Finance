<div align="center">

# 💰 Family Finance
### Sistem Manajemen Keuangan Keluarga Berbasis Web

**Kelola keuangan keluarga lebih mudah, lebih rapi, dan lebih transparan dalam satu aplikasi digital.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Family_Finance-blue?style=for-the-badge)](https://family-finance-cyan-beta.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

🌐 **Live Demo**

https://family-finance-cyan-beta.vercel.app

</div>

---

# 📌 Tentang Family Finance

**Family Finance** merupakan aplikasi web yang dirancang untuk membantu keluarga dalam mengelola keuangan secara digital. Aplikasi ini memudahkan pencatatan pemasukan, pengeluaran, pengelolaan anggota keluarga, jadwal kegiatan, pengingat pembayaran, serta penyusunan laporan keuangan dalam satu dashboard yang modern, responsif, dan mudah digunakan.

> Tidak perlu lagi mencatat keuangan secara manual. Semua transaksi dan laporan dapat dikelola secara digital sehingga lebih cepat, aman, dan transparan.

---

# ✨ Fitur Utama

## 👨‍💼 Admin

- 🔐 Login Admin
- 📊 Dashboard Keuangan
- 👨‍👩‍👧 Manajemen Anggota Keluarga
- 💰 Kas Masuk
- 💸 Kas Keluar
- 📅 Jadwal Acara
- 🔔 Reminder Pembayaran
- 📈 Laporan Keuangan
- 📄 Export PDF
- 📊 Export Excel
- 💬 Generate Pesan WhatsApp
- ⚙️ Pengaturan Sistem

---

## 👤 Anggota

- 🔐 Login Anggota
- 📊 Dashboard
- 👤 Profil Anggota
- 💰 Melihat Riwayat Keuangan
- 📅 Melihat Jadwal Acara
- 📈 Melihat Laporan

---

# 🖥️ Screenshot

| Login | Dashboard Admin |
|---|---|
| ![Login](public/images/login.png) | ![Dashboard Admin](public/images/dashboard-admin.png) |

| Dashboard Anggota |
|---|
| ![Dashboard Anggota](public/images/dashboard-anggota.png) |

---

# 🛠️ Tech Stack

| Teknologi | Kegunaan |
|------------|-------------------------|
| React 19 | Frontend Framework |
| Vite | Build Tool |
| Supabase | Database & Authentication |
| React Router DOM | Routing |
| Framer Motion | UI Animation |
| Recharts | Data Visualization |
| jsPDF | Export PDF |
| XLSX | Export Excel |
| html2canvas | Screenshot PDF |
| Vercel | Hosting & Deployment |

---

# 🔐 Akses Demo

Gunakan akun berikut untuk mencoba aplikasi.

| Role | Email | Password |
|------|-------|----------|
| 👨‍💼 **Admin** | `admin@familyfinance.com` | `admin123` |
| 👤 **Anggota** | `ajeng@familyfinance.com` | `ajeng123` |

> Login sesuai role untuk mengakses fitur yang tersedia.

---

# 🚀 Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone https://github.com/vickyagstn/Family-Finance.git
```

### 2. Masuk ke Folder Project

```bash
cd Family-Finance
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Buat File Environment

Buat file `.env`

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 5. Jalankan Project

```bash
npm run dev
```

Aplikasi akan berjalan di

```
http://localhost:5173
```

---

# 📁 Struktur Project

```text
Family-Finance
│
├── public
│   ├── images
│   │   ├── login.png
│   │   ├── dashboard-admin.png
│   │   └── dashboard-anggota.png
│   ├── favicon.svg
│   └── icons.svg
│
├── src
│   ├── assets
│   ├── components
│   ├── hooks
│   ├── pages
│   ├── services
│   ├── utils
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md
```

---

# 👥 Hak Akses

| Fitur | Admin | Anggota |
|-------|:-----:|:--------:|
| Dashboard | ✅ | ✅ |
| Kas Masuk | ✅ | 👀 |
| Kas Keluar | ✅ | 👀 |
| Laporan | ✅ | 👀 |
| Jadwal Acara | ✅ | ✅ |
| Data Anggota | ✅ | 👀 |
| Export PDF | ✅ | ❌ |
| Export Excel | ✅ | ❌ |
| Pengaturan | ✅ | ❌ |

> ✅ = Dapat Mengelola  
> 👀 = Hanya Melihat  
> ❌ = Tidak Memiliki Akses

---

# 🗺️ Roadmap

- ✅ Login Multi Role
- ✅ Dashboard Admin
- ✅ Dashboard Anggota
- ✅ Kas Masuk
- ✅ Kas Keluar
- ✅ Laporan Keuangan
- ✅ Export PDF
- ✅ Export Excel
- ✅ Jadwal Acara
- ✅ Reminder Pembayaran
- 🔄 Notifikasi WhatsApp
- 🔄 Backup Database
- 🔄 Dark Mode

---

# ☁️ Deployment

Aplikasi di-deploy menggunakan **Vercel**.

🌐 https://family-finance-cyan-beta.vercel.app

---

# 👨‍💻 Author

**Vicky Agustine**

GitHub: https://github.com/vickyagstn

---

<div align="center">

**Made with ❤️ using React, Supabase & Vite**

⭐ Jangan lupa memberikan **Star** jika repository ini bermanfaat.

</div>

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/ToastContext'

// ==== Halaman Bersama ====
import Login from './pages/Login'

// ==== Halaman Admin ====
import DashboardAdmin from './pages/admin/Dashboard'
import AnggotaKeluarga from './pages/admin/AnggotaKeluarga'
import TambahAnggota from './pages/admin/TambahAnggota'
import KasMasuk from './pages/admin/KasMasuk'
import TambahPembayaran from './pages/admin/TambahPembayaran'
import KasKeluar from './pages/admin/KasKeluar'
import TambahPengeluaran from './pages/admin/TambahPengeluaran'
import JadwalAcara from './pages/admin/Jadwalacara'
import TambahAcara from './pages/admin/TambahAcara'
import Pengingat from './pages/admin/Pengingat'
import Laporan from './pages/admin/Laporan'
import Pengaturan from './pages/admin/Pengaturan'
import DetailAnggota from './pages/admin/DetailAnggota'
import EditAnggota from './pages/admin/EditAnggota'
import EditPembayaran from './pages/admin/EditPembayaran'
import EditPengeluaran from './pages/admin/EditPengeluaran'

// ==== Halaman Anggota ====
import DashboardAnggota from './pages/anggota/Dashboard'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Bersama */}
          <Route path="/" element={<Login />} />

          {/* Admin */}
          <Route path="/admin" element={<DashboardAdmin />} />
          <Route path="/admin/anggota" element={<AnggotaKeluarga />} />
          <Route path="/admin/anggota/tambah" element={<TambahAnggota />} />
          <Route path="/admin/anggota/:id" element={<DetailAnggota />} />
          <Route path="/admin/anggota/edit/:id" element={<EditAnggota />} />
          <Route path="/admin/kas-masuk" element={<KasMasuk />} />
          <Route path="/admin/kas-masuk/tambah" element={<TambahPembayaran />} />
          <Route path="/admin/kas-keluar" element={<KasKeluar />} />
          <Route path="/admin/kas-keluar/tambah" element={<TambahPengeluaran />} />
          <Route path="/admin/acara" element={<JadwalAcara />} />
          <Route path="/admin/acara/tambah" element={<TambahAcara />} />
          <Route path="/admin/pengingat" element={<Pengingat />} />
          <Route path="/admin/laporan" element={<Laporan />} />
          <Route path="/admin/pengaturan" element={<Pengaturan />} />
          <Route path="/admin/kas-masuk/edit/:id" element={<EditPembayaran />} />
          <Route path="/admin/kas-keluar/edit/:id" element={<EditPengeluaran />} />

          {/* Anggota */}
          <Route path="/anggota" element={<DashboardAnggota />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
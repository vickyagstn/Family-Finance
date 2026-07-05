import { useState } from 'react'
import './admin.css'
import { useNavigate, Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'
import { tebakKategori } from '../../utils/autoKategori'

function TambahPengeluaran() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menyimpan, setMenyimpan] = useState(false)

  const [keterangan, setKeterangan] = useState('')
  const [kategori, setKategori] = useState('Operasional')
  const [kategoriManual, setKategoriManual] = useState(false) // true kalau user pilih sendiri
  const [tanggal, setTanggal] = useState('')
  const [nominal, setNominal] = useState('')
  const [catatan, setCatatan] = useState('')

  // Auto-kategori: jalan tiap kali user ngetik keterangan,
  // TAPI hanya kalau user belum pernah pilih kategori manual sendiri
  function handleKeteranganChange(e) {
    const teks = e.target.value
    setKeterangan(teks)

    if (!kategoriManual) {
      setKategori(tebakKategori(teks))
    }
  }

  // Kalau user ubah dropdown kategori sendiri, tandai manual
  // supaya auto-kategori berhenti nge-override
  function handleKategoriChange(e) {
    setKategori(e.target.value)
    setKategoriManual(true)
  }

  async function simpan(e) {
    e.preventDefault()

    if (!keterangan || !tanggal || !nominal) {
      alert('Keterangan, tanggal, dan nominal wajib diisi')
      return
    }

    setMenyimpan(true)

    const { error } = await supabase.from('kas_keluar').insert({
      keterangan,
      kategori,
      tanggal,
      nominal: Number(nominal),
      dicatat_oleh: 'Admin',
    })

    setMenyimpan(false)

    if (error) {
      alert('Gagal menyimpan: ' + error.message)
      return
    }

    navigate('/admin/kas-keluar')
  }

  return (
    <div className="dash">
      <Sidebar active="kas-keluar" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Tambah Pengeluaran</h2>
            <p>Catat pengeluaran kas keluarga</p>
          </div>
        </div>

        <form className="form-card" onSubmit={simpan}>
          <div className="form-group">
            <label>Keterangan</label>
            <input
              type="text"
              placeholder="Contoh: Sewa Tenda Acara"
              value={keterangan}
              onChange={handleKeteranganChange}
            />
          </div>

          <div className="form-group">
            <label>
              Kategori{' '}
              {!kategoriManual && keterangan && (
                <span className="auto-tag">✨ auto-terdeteksi</span>
              )}
            </label>
            <select value={kategori} onChange={handleKategoriChange}>
              <option value="Acara">Acara</option>
              <option value="Konsumsi">Konsumsi</option>
              <option value="Sosial">Sosial</option>
              <option value="Operasional">Operasional</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tanggal</label>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Nominal</label>
            <input
              type="number"
              placeholder="Contoh: 500000"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Catatan</label>
            <input
              type="text"
              placeholder="Catatan tambahan (opsional)"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <Link to="/admin/kas-keluar" className="btn-cancel">Batal</Link>
            <button type="submit" className="btn-save" disabled={menyimpan}>
              {menyimpan ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TambahPengeluaran
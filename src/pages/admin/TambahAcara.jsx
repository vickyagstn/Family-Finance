import { useState } from 'react'
import './admin.css'
import { useNavigate, Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

function TambahAcara() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menyimpan, setMenyimpan] = useState(false)

  const [nama, setNama] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [lokasi, setLokasi] = useState('')
  const [kategori, setKategori] = useState('Lainnya')
  const [catatan, setCatatan] = useState('')

  async function simpan(e) {
    e.preventDefault()

    if (!nama || !tanggal) {
      alert('Nama acara dan tanggal wajib diisi')
      return
    }

    setMenyimpan(true)

    const { error } = await supabase.from('acara').insert({
      nama,
      tanggal,
      lokasi: lokasi || null,
      kategori,
      catatan: catatan || null,
    })

    setMenyimpan(false)

    if (error) {
      alert('Gagal menyimpan: ' + error.message)
      return
    }

    navigate('/admin/acara')
  }

  return (
    <div className="dash">
      <Sidebar active="acara" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Tambah Acara</h2>
            <p>Buat jadwal kegiatan keluarga baru</p>
          </div>
        </div>

        <form className="form-card" onSubmit={simpan}>
          <div className="form-group">
            <label>Nama Acara</label>
            <input
              type="text"
              placeholder="Contoh: Liburan Keluarga"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Tanggal</label>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Lokasi</label>
            <input
              type="text"
              placeholder="Contoh: Puncak, Bogor"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
              <option value="Liburan">Liburan</option>
              <option value="Halal Bihalal">Halal Bihalal</option>
              <option value="Arisan">Arisan</option>
              <option value="BBQ">BBQ</option>
              <option value="Lainnya">Lainnya</option>
            </select>
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
            <Link to="/admin/acara" className="btn-cancel">Batal</Link>
            <button type="submit" className="btn-save" disabled={menyimpan}>
              {menyimpan ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TambahAcara
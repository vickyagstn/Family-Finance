import { useState, useEffect } from 'react'
import './admin.css'
import { useNavigate, Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

function TambahPembayaran() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menyimpan, setMenyimpan] = useState(false)
  const [daftarKeluarga, setDaftarKeluarga] = useState([])

  const [keluargaId, setKeluargaId] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [nominal, setNominal] = useState('')
  const [metode, setMetode] = useState('Tunai')
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    ambilKeluarga()
  }, [])

  async function ambilKeluarga() {
    const { data, error } = await supabase.from('keluarga').select('id, nama').order('nama')
    if (!error) setDaftarKeluarga(data)
  }

  async function simpan(e) {
    e.preventDefault()

    if (!keluargaId || !tanggal || !nominal) {
      alert('Keluarga, tanggal, dan nominal wajib diisi')
      return
    }

    setMenyimpan(true)

    const { error } = await supabase.from('kas_masuk').insert({
      keluarga_id: keluargaId,
      tanggal,
      nominal: Number(nominal),
      metode,
      catatan: catatan || null,
    })

    setMenyimpan(false)

    if (error) {
      alert('Gagal menyimpan: ' + error.message)
      return
    }

    navigate('/admin/kas-masuk')
  }

  return (
    <div className="dash">
      <Sidebar active="kas-masuk" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Tambah Pembayaran</h2>
            <p>Catat pemasukan kas dari keluarga</p>
          </div>
        </div>

        <form className="form-card" onSubmit={simpan}>
          <div className="form-group">
            <label>Pilih Keluarga</label>
            <select value={keluargaId} onChange={(e) => setKeluargaId(e.target.value)}>
              <option value="">-- Pilih Keluarga --</option>
              {daftarKeluarga.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
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
              placeholder="Contoh: 200000"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Metode Pembayaran</label>
            <select value={metode} onChange={(e) => setMetode(e.target.value)}>
              <option value="Tunai">Tunai</option>
              <option value="Transfer">Transfer</option>
              <option value="QRIS">QRIS</option>
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
            <Link to="/admin/kas-masuk" className="btn-cancel">Batal</Link>
            <button type="submit" className="btn-save" disabled={menyimpan}>
              {menyimpan ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TambahPembayaran
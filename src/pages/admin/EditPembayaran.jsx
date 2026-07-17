import { useState, useEffect } from 'react'
import './admin.css'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

function EditPembayaran() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [daftarKeluarga, setDaftarKeluarga] = useState([])
  const [form, setForm] = useState({
    keluarga_id: '', periode: '', tanggal: '', nominal: '', metode: 'transfer', catatan: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [memuat, setMemuat] = useState(true)
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    ambilKeluarga()
    ambilData()
  }, [])

  async function ambilKeluarga() {
    const { data } = await supabase.from('anggota_keluarga').select('id, nama').order('nama')
    setDaftarKeluarga(data || [])
  }

  async function ambilData() {
    const { data } = await supabase.from('kas_masuk').select('*').eq('id', id).single()
    if (data) {
      setForm({
        keluarga_id: data.keluarga_id || '',
        periode: data.periode || '',
        tanggal: data.tanggal || '',
        nominal: data.nominal || '',
        metode: data.metode || 'transfer',
        catatan: data.catatan || '',
      })
    }
    setMemuat(false)
  }

  function updateField(key, value) {
    setForm({ ...form, [key]: value })
  }

  async function handleUpdate() {
    setError('')

    if (!form.keluarga_id || !form.tanggal || !form.nominal) {
      setError('Keluarga, Tanggal, dan Nominal wajib diisi')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase
      .from('kas_masuk')
      .update({
        keluarga_id: form.keluarga_id,
        periode: form.periode,
        tanggal: form.tanggal,
        nominal: Number(form.nominal),
        metode: form.metode,
        catatan: form.catatan,
      })
      .eq('id', id)

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    navigate('/admin/kas-masuk', { state: { toast: 'Pembayaran berhasil diperbarui' } })
  }

  if (memuat) {
    return (
      <div className="dash">
        <Sidebar active="kas-masuk" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <p style={{ color: '#8a8a92' }}>Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dash">
      <Sidebar active="kas-masuk" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Edit Pembayaran</h2>
            <p>Perbarui data pemasukan kas</p>
          </div>
        </div>

        <div className="form-card">
          <div className="form-group">
            <label>Pilih Keluarga</label>
            <select value={form.keluarga_id} onChange={(e) => updateField('keluarga_id', e.target.value)}>
              <option value="">-- Pilih Keluarga --</option>
              {daftarKeluarga.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Periode</label>
            <input type="text" value={form.periode} onChange={(e) => updateField('periode', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Tanggal</label>
            <input type="date" value={form.tanggal} onChange={(e) => updateField('tanggal', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Nominal</label>
            <input type="number" value={form.nominal} onChange={(e) => updateField('nominal', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Metode Pembayaran</label>
            <select value={form.metode} onChange={(e) => updateField('metode', e.target.value)}>
              <option value="tunai">Tunai</option>
              <option value="transfer">Transfer</option>
              <option value="qris">QRIS</option>
            </select>
          </div>

          <div className="form-group">
            <label>Catatan</label>
            <input type="text" value={form.catatan} onChange={(e) => updateField('catatan', e.target.value)} />
          </div>

          {error && <p style={{ color: '#E5484D', fontSize: '12.5px', marginBottom: '14px' }}>{error}</p>}

          <div className="form-actions">
            <Link to="/admin/kas-masuk" className="btn-cancel">Batal</Link>
            <button className="btn-save" onClick={handleUpdate} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditPembayaran
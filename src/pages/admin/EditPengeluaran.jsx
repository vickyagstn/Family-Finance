import { useState, useEffect } from 'react'
import './admin.css'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

function EditPengeluaran() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [form, setForm] = useState({
    tanggal: '', keterangan: '', kategori: 'operasional', nominal: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [memuat, setMemuat] = useState(true)
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    ambilData()
  }, [])

  async function ambilData() {
    const { data } = await supabase.from('kas_keluar').select('*').eq('id', id).single()
    if (data) {
      setForm({
        tanggal: data.tanggal || '',
        keterangan: data.keterangan || '',
        kategori: data.kategori || 'operasional',
        nominal: data.nominal || '',
      })
    }
    setMemuat(false)
  }

  function updateField(key, value) {
    setForm({ ...form, [key]: value })
  }

  async function handleUpdate() {
    setError('')

    if (!form.tanggal || !form.keterangan || !form.nominal) {
      setError('Tanggal, Keterangan, dan Nominal wajib diisi')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase
      .from('kas_keluar')
      .update({
        tanggal: form.tanggal,
        keterangan: form.keterangan,
        kategori: form.kategori,
        nominal: Number(form.nominal),
      })
      .eq('id', id)

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    navigate('/admin/kas-keluar', { state: { toast: 'Pengeluaran berhasil diperbarui' } })
  }

  if (memuat) {
    return (
      <div className="dash">
        <Sidebar active="kas-keluar" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <p style={{ color: '#8a8a92' }}>Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dash">
      <Sidebar active="kas-keluar" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Edit Pengeluaran</h2>
            <p>Perbarui data pengeluaran kas</p>
          </div>
        </div>

        <div className="form-card">
          <div className="form-group">
            <label>Tanggal</label>
            <input type="date" value={form.tanggal} onChange={(e) => updateField('tanggal', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Keterangan</label>
            <input type="text" value={form.keterangan} onChange={(e) => updateField('keterangan', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select value={form.kategori} onChange={(e) => updateField('kategori', e.target.value)}>
              <option value="acara">Acara</option>
              <option value="konsumsi">Konsumsi</option>
              <option value="sosial">Sosial</option>
              <option value="operasional">Operasional</option>
            </select>
          </div>

          <div className="form-group">
            <label>Nominal</label>
            <input type="number" value={form.nominal} onChange={(e) => updateField('nominal', e.target.value)} />
          </div>

          {error && <p style={{ color: '#E5484D', fontSize: '12.5px', marginBottom: '14px' }}>{error}</p>}

          <div className="form-actions">
            <Link to="/admin/kas-keluar" className="btn-cancel">Batal</Link>
            <button className="btn-save" onClick={handleUpdate} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditPengeluaran
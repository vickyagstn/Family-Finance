import { useState } from 'react'
import './admin.css'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

function TambahPengeluaran() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [form, setForm] = useState({
    tanggal: '', keterangan: '', kategori: 'operasional', nominal: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function updateField(key, value) {
    setForm({ ...form, [key]: value })
  }

  async function handleSimpan() {
    setError('')

    if (!form.tanggal || !form.keterangan || !form.nominal) {
      setError('Tanggal, Keterangan, dan Nominal wajib diisi')
      return
    }

    setLoading(true)

    const { error: insertError } = await supabase.from('kas_keluar').insert([
      {
        tanggal: form.tanggal,
        keterangan: form.keterangan,
        kategori: form.kategori,
        nominal: Number(form.nominal),
      },
    ])

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    navigate('/admin/kas-keluar', { state: { toast: 'Pengeluaran berhasil ditambahkan' } })
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

        <div className="form-card">
          <div className="form-group form-group-icon">
            <label>Tanggal</label>
            <span className="fg-icon">📅</span>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => updateField('tanggal', e.target.value)}
            />
          </div>

          <div className="form-group form-group-icon">
            <label>Keterangan</label>
            <span className="fg-icon">📝</span>
            <input
              type="text"
              placeholder="Contoh: Sewa Tenda Acara"
              value={form.keterangan}
              onChange={(e) => updateField('keterangan', e.target.value)}
            />
          </div>

          <div className="form-group form-group-icon">
            <label>Kategori</label>
            <span className="fg-icon">🏷️</span>
            <select value={form.kategori} onChange={(e) => updateField('kategori', e.target.value)}>
              <option value="acara">Acara</option>
              <option value="konsumsi">Konsumsi</option>
              <option value="sosial">Sosial</option>
              <option value="operasional">Operasional</option>
            </select>
          </div>

          <div className="form-group form-group-icon">
            <label>Nominal</label>
            <span className="fg-icon">💵</span>
            <input
              type="number"
              placeholder="Contoh: 500000"
              value={form.nominal}
              onChange={(e) => updateField('nominal', e.target.value)}
            />
          </div>

          {error && (
            <p style={{ color: '#E5484D', fontSize: '12.5px', marginBottom: '14px' }}>{error}</p>
          )}

          <div className="form-actions">
            <Link to="/admin/kas-keluar" className="btn-cancel">Batal</Link>
            <button className="btn-save" onClick={handleSimpan} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TambahPengeluaran
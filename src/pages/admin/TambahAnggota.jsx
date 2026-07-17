import { useState } from 'react'
import './admin.css'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

function TambahAnggota() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [form, setForm] = useState({
    nama: '', ketua: '', jumlah_anggota: '', no_hp: '', alamat: '', status: 'lunas',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function updateField(key, value) {
    setForm({ ...form, [key]: value })
  }

  async function handleSimpan() {
    setError('')

    if (!form.nama || !form.ketua) {
      setError('Nama Keluarga dan Ketua Keluarga wajib diisi')
      return
    }

    setLoading(true)

    const { error: insertError } = await supabase.from('anggota_keluarga').insert([
      {
        nama: form.nama,
        ketua: form.ketua,
        jumlah_anggota: Number(form.jumlah_anggota) || 1,
        no_hp: form.no_hp,
        alamat: form.alamat,
        status: form.status,
      },
    ])

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    navigate('/admin/anggota', { state: { toast: 'Anggota keluarga berhasil ditambahkan' } })
  }

  return (
    <div className="dash">
      <Sidebar active="anggota" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Tambah Anggota</h2>
            <p>Daftarkan keluarga baru ke dalam sistem</p>
          </div>
        </div>

        <div className="form-card">
          <div className="form-group form-group-icon">
            <label>Nama Keluarga</label>
            <span className="fg-icon">👪</span>
            <input
              type="text"
              placeholder="Contoh: Keluarga Santoso"
              value={form.nama}
              onChange={(e) => updateField('nama', e.target.value)}
            />
          </div>

          <div className="form-group form-group-icon">
            <label>Ketua Keluarga</label>
            <span className="fg-icon">🧑</span>
            <input
              type="text"
              placeholder="Nama lengkap ketua keluarga"
              value={form.ketua}
              onChange={(e) => updateField('ketua', e.target.value)}
            />
          </div>

          <div className="form-group form-group-icon">
            <label>Jumlah Anggota</label>
            <span className="fg-icon">🔢</span>
            <input
              type="number"
              placeholder="Contoh: 4"
              value={form.jumlah_anggota}
              onChange={(e) => updateField('jumlah_anggota', e.target.value)}
            />
          </div>

          <div className="form-group form-group-icon">
            <label>No. HP</label>
            <span className="fg-icon">📱</span>
            <input
              type="text"
              placeholder="08xx-xxxx-xxxx"
              value={form.no_hp}
              onChange={(e) => updateField('no_hp', e.target.value)}
            />
          </div>

          <div className="form-group form-group-icon">
            <label>Alamat</label>
            <span className="fg-icon">📍</span>
            <input
              type="text"
              placeholder="Alamat lengkap"
              value={form.alamat}
              onChange={(e) => updateField('alamat', e.target.value)}
            />
          </div>

          <div className="form-group form-group-icon">
            <label>Status</label>
            <span className="fg-icon">🏷️</span>
            <select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
              <option value="lunas">Lunas</option>
              <option value="jatuh">Jatuh Tempo</option>
              <option value="tunggak">Menunggak</option>
            </select>
          </div>

          {error && (
            <p style={{ color: '#E5484D', fontSize: '12.5px', marginBottom: '14px' }}>{error}</p>
          )}

          <div className="form-actions">
            <Link to="/admin/anggota" className="btn-cancel">Batal</Link>
            <button className="btn-save" onClick={handleSimpan} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TambahAnggota
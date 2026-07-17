import { useState } from 'react'
import './admin.css'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

function formatRupiah(angka) {
  return 'Rp' + Number(angka).toLocaleString('id-ID')
}

function TambahAcara() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [form, setForm] = useState({ nama: '', tanggal: '', lokasi: '', deskripsi: '', jumlah_keluarga: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingAI, setLoadingAI] = useState(false)
  const [estimasi, setEstimasi] = useState(null)
  const [errorAI, setErrorAI] = useState('')
  const navigate = useNavigate()

  function updateField(key, value) {
    setForm({ ...form, [key]: value })
  }

  async function handlePerkiraanAI() {
    setErrorAI('')
    setEstimasi(null)

    if (!form.nama || !form.jumlah_keluarga) {
      setErrorAI('Isi dulu Nama Acara dan Jumlah Keluarga sebelum minta perkiraan AI')
      return
    }

    setLoadingAI(true)

    try {
      const { data, error } = await supabase.functions.invoke('rapid-worker', {
        body: {
          namaAcara: form.nama,
          lokasi: form.lokasi || 'belum ditentukan',
          jumlahKeluarga: form.jumlah_keluarga,
        },
      })

      if (error) throw error
      if (data.error) throw new Error(data.error)

      setEstimasi(data)
    } catch (err) {
      setErrorAI('Gagal mendapatkan perkiraan AI: ' + err.message)
    }

    setLoadingAI(false)
  }

  async function handleSimpan() {
    setError('')

    if (!form.nama || !form.tanggal) {
      setError('Nama Acara dan Tanggal wajib diisi')
      return
    }

    setLoading(true)

    const { error: insertError } = await supabase.from('acara').insert([
      {
        nama: form.nama,
        tanggal: form.tanggal,
        lokasi: form.lokasi,
        deskripsi: form.deskripsi,
      },
    ])

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    navigate('/admin/acara', { state: { toast: 'Acara berhasil ditambahkan' } })
  }

  return (
    <div className="dash">
      <Sidebar active="acara" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Tambah Acara</h2>
            <p>Buat jadwal acara keluarga besar</p>
          </div>
        </div>

        <div className="form-card">
          <div className="form-group form-group-icon">
            <label>Nama Acara</label>
            <span className="fg-icon">🎉</span>
            <input
              type="text"
              placeholder="Contoh: Liburan ke Pantai Kuta"
              value={form.nama}
              onChange={(e) => updateField('nama', e.target.value)}
            />
          </div>

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
            <label>Lokasi</label>
            <span className="fg-icon">📍</span>
            <input
              type="text"
              placeholder="Contoh: Pantai Kuta, Bali"
              value={form.lokasi}
              onChange={(e) => updateField('lokasi', e.target.value)}
            />
          </div>

          <div className="form-group form-group-icon">
            <label>Jumlah Keluarga Ikut</label>
            <span className="fg-icon">👪</span>
            <input
              type="number"
              placeholder="Contoh: 10"
              value={form.jumlah_keluarga}
              onChange={(e) => updateField('jumlah_keluarga', e.target.value)}
            />
          </div>

          <div className="form-group form-group-icon">
            <label>Deskripsi</label>
            <span className="fg-icon">📝</span>
            <input
              type="text"
              placeholder="Catatan tambahan (opsional)"
              value={form.deskripsi}
              onChange={(e) => updateField('deskripsi', e.target.value)}
            />
          </div>

          <button
            onClick={handlePerkiraanAI}
            disabled={loadingAI}
            style={{
              width: '100%', padding: '13px', border: '1.5px dashed #D4AF37',
              background: '#faf3dd', color: '#8a6d1a', borderRadius: '14px',
              fontFamily: 'inherit', fontWeight: 600, fontSize: '13px',
              cursor: 'pointer', marginBottom: '16px',
            }}
          >
            {loadingAI ? '🤖 Menghitung perkiraan...' : '✨ Perkirakan Biaya dengan AI'}
          </button>

          {errorAI && (
            <p style={{ color: '#E5484D', fontSize: '12.5px', marginBottom: '14px' }}>{errorAI}</p>
          )}

          {estimasi && (
            <div style={{
              background: '#fff', border: '1.5px solid #f0e3c0', borderRadius: '16px',
              padding: '18px', marginBottom: '20px',
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: '#800020' }}>
                🤖 Perkiraan Biaya (AI)
              </h4>
              {estimasi.rincian.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '12.5px', padding: '8px 0', borderBottom: '1px solid #f4f2f3',
                }}>
                  <span>{r.item}</span>
                  <b>{formatRupiah(r.estimasi)}</b>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '14px', fontWeight: 700, padding: '12px 0 4px', color: '#800020',
              }}>
                <span>Total Perkiraan</span>
                <span>{formatRupiah(estimasi.total)}</span>
              </div>
              {estimasi.catatan && (
                <p style={{ fontSize: '11px', color: '#8a8a92', marginTop: '8px', fontStyle: 'italic' }}>
                  💡 {estimasi.catatan}
                </p>
              )}
            </div>
          )}

          {error && (
            <p style={{ color: '#E5484D', fontSize: '12.5px', marginBottom: '14px' }}>{error}</p>
          )}

          <div className="form-actions">
            <Link to="/admin/acara" className="btn-cancel">Batal</Link>
            <button className="btn-save" onClick={handleSimpan} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TambahAcara
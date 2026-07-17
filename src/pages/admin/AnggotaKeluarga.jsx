import { useState, useEffect } from 'react'
import './admin.css'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

function statusLabel(status) {
  if (status === 'lunas') return { text: 'Lunas', cls: 'lunas' }
  if (status === 'tunggak') return { text: 'Menunggak', cls: 'tunggak' }
  return { text: 'Jatuh Tempo', cls: 'jatuh' }
}

function linkWhatsApp(k) {
  const nomor = '62' + (k.no_hp || '').replace(/-/g, '').replace(/^0/, '')
  const pesan = `Halo ${k.ketua}, ini pengingat kas keluarga dari Family Finance.`
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`
}

function AnggotaKeluarga() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState('semua')
  const [search, setSearch] = useState('')
  const [dataKeluarga, setDataKeluarga] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ambilData()
  }, [])

  async function ambilData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('anggota_keluarga')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setDataKeluarga(data)
    setLoading(false)
  }

  const filterList = [
    { key: 'semua', label: 'Semua' },
    { key: 'lunas', label: 'Lunas' },
    { key: 'jatuh', label: 'Belum Bayar' },
    { key: 'tunggak', label: 'Menunggak' },
  ]

  const dataTampil = dataKeluarga.filter((k) => {
    const cocokFilter = filter === 'semua' || k.status === filter
    const cocokSearch = k.nama.toLowerCase().includes(search.toLowerCase())
    return cocokFilter && cocokSearch
  })

  return (
    <div className="dash">
      <Sidebar active="anggota" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Anggota Keluarga</h2>
            <p>Kelola data seluruh keluarga besar</p>
          </div>
          <Link to="/admin/anggota/tambah" className="btn-add">＋ Tambah Anggota</Link>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Cari nama keluarga..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filter-group">
            {filterList.map((f) => (
              <button
                key={f.key}
                className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="keluarga-grid">
          {loading && <p style={{ color: '#8a8a92', fontSize: '13px' }}>Memuat data...</p>}

          {!loading && dataTampil.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state-icon">👪</div>
              <h4>Belum ada data keluarga</h4>
              <p>Klik "Tambah Anggota" untuk mulai menambahkan keluarga besar kamu.</p>
              <Link to="/admin/anggota/tambah" className="btn-add">＋ Tambah Anggota</Link>
            </div>
          )}

          {dataTampil.map((k) => {
            const s = statusLabel(k.status)
            const inisial = k.nama.split(' ')[1] ? k.nama.split(' ')[1].slice(0, 2).toUpperCase() : 'KK'
            return (
              <div className="keluarga-card" key={k.id}>
                <div className="kc-top">
                  <div className="kc-avatar">{inisial}</div>
                  <span className={`status-pill ${s.cls}`}>{s.text}</span>
                </div>

                <h3>{k.nama}</h3>
                <p className="kc-ketua">Ketua: {k.ketua}</p>

                <div className="kc-info">
                  <div><span>Jumlah Anggota</span><b>{k.jumlah_anggota} orang</b></div>
                  <div><span>No. HP</span><b>{k.no_hp || '-'}</b></div>
                  <div><span>Alamat</span><b>{k.alamat || '-'}</b></div>
                  <div><span>Terdaftar</span><b>{new Date(k.created_at).toLocaleDateString('id-ID')}</b></div>
                </div>

                <div className="kc-actions">
                  <Link to={`/admin/anggota/${k.id}`} className="ac-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>Detail</Link>
                  <Link to={`/admin/anggota/edit/${k.id}`} className="ac-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>Edit</Link>
                  <Link to={`/admin/anggota/${k.id}`} className="ac-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>Riwayat</Link>
                  <a href={linkWhatsApp(k)} target="_blank" rel="noreferrer" className="ac-btn wa" style={{ textDecoration: 'none', textAlign: 'center' }}>WhatsApp</a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AnggotaKeluarga
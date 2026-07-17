import { useState, useEffect } from 'react'
import './admin.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import Toast from '../../components/Toast'
import { supabase } from '../../supabaseClient'

function formatRupiah(angka) {
  return 'Rp' + Number(angka).toLocaleString('id-ID')
}

function kategoriLabel(k) {
  const map = { acara: 'Acara', konsumsi: 'Konsumsi', sosial: 'Sosial', operasional: 'Operasional' }
  return map[k] || k
}

function KasKeluar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState('semua')
  const [search, setSearch] = useState('')
  const [dataKasKeluar, setDataKasKeluar] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    ambilData()
  }, [])

  useEffect(() => {
    if (location.state?.toast) {
      tampilkanToast(location.state.toast)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state])

  function tampilkanToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: 'success' }), 3000)
  }

  async function ambilData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('kas_keluar')
      .select('*')
      .order('tanggal', { ascending: false })

    if (!error) setDataKasKeluar(data)
    setLoading(false)
  }

  async function handleHapus(id) {
    const konfirmasi = window.confirm('Yakin ingin menghapus data pengeluaran ini?')
    if (!konfirmasi) return

    const { error } = await supabase.from('kas_keluar').delete().eq('id', id)

    if (error) {
      tampilkanToast('Gagal menghapus data', 'error')
      return
    }

    setDataKasKeluar(dataKasKeluar.filter((d) => d.id !== id))
    tampilkanToast('Data pengeluaran berhasil dihapus')
  }

  const filterList = [
    { key: 'semua', label: 'Semua' },
    { key: 'acara', label: 'Acara' },
    { key: 'konsumsi', label: 'Konsumsi' },
    { key: 'sosial', label: 'Sosial' },
    { key: 'operasional', label: 'Operasional' },
  ]

  const dataTampil = dataKasKeluar.filter((d) => {
    const cocokFilter = filter === 'semua' || d.kategori === filter
    const cocokSearch = d.keterangan.toLowerCase().includes(search.toLowerCase())
    return cocokFilter && cocokSearch
  })

  const totalKeluar = dataTampil.reduce((sum, d) => sum + Number(d.nominal), 0)

  return (
    <div className="dash">
      <Sidebar active="kas-keluar" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Kas Keluar</h2>
            <p>Daftar seluruh pengeluaran kas keluarga</p>
          </div>
          <Link to="/admin/kas-keluar/tambah" className="btn-add">＋ Tambah Pengeluaran</Link>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Cari keterangan pengeluaran..."
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

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card red">
            <div className="icon-badge">💸</div>
            <div className="label">Total Kas Keluar</div>
            <div className="value">{formatRupiah(totalKeluar)}</div>
          </div>
          <div className="stat-card">
            <div className="icon-badge">🧾</div>
            <div className="label">Jumlah Transaksi</div>
            <div className="value">{dataTampil.length}</div>
          </div>
          <div className="stat-card">
            <div className="icon-badge">📅</div>
            <div className="label">Bulan Ini</div>
            <div className="value">{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Kategori</th>
                <th>Nominal</th>
                <th>Dicatat Oleh</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="empty-row"><td colSpan="6">Memuat data...</td></tr>
              )}
              {!loading && dataTampil.length === 0 && (
                <tr className="empty-row">
                  <td colSpan="6">
                    <div className="empty-state compact">
                      <div className="empty-state-icon">💸</div>
                      <h4>Belum ada data pengeluaran</h4>
                      <p>Coba ubah kategori atau kata kunci pencarian, atau catat pengeluaran baru.</p>
                    </div>
                  </td>
                </tr>
              )}
              {dataTampil.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.tanggal).toLocaleDateString('id-ID')}</td>
                  <td>{row.keterangan}</td>
                  <td><span className="status-pill jatuh">{kategoriLabel(row.kategori)}</span></td>
                  <td style={{ color: '#E5484D', fontWeight: 700 }}>{formatRupiah(row.nominal)}</td>
                  <td>{row.dicatat_oleh}</td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    <Link
                      to={`/admin/kas-keluar/edit/${row.id}`}
                      style={{
                        background: '#eaf1fb', color: '#3b7dd8', border: 'none',
                        borderRadius: '8px', padding: '6px 12px', fontSize: '11.5px',
                        fontWeight: 600, textDecoration: 'none',
                      }}
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => handleHapus(row.id)}
                      style={{
                        background: '#fdeaea', color: '#E5484D', border: 'none',
                        borderRadius: '8px', padding: '6px 12px', fontSize: '11.5px',
                        fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </div>
  )
}

export default KasKeluar
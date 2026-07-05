import { useState, useEffect } from 'react'
import './admin.css'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

function formatTanggal(tgl) {
  return new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatRupiah(angka) {
  return `Rp ${Number(angka).toLocaleString('id-ID')}`
}

const kategoriList = ['semua', 'Acara', 'Konsumsi', 'Sosial', 'Operasional', 'Lainnya']

function KasKeluar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState('semua')
  const [search, setSearch] = useState('')
  const [dataKasKeluar, setDataKasKeluar] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ambilData()
  }, [])

  async function ambilData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('kas_keluar')
      .select('*')
      .order('tanggal', { ascending: false })

    if (error) {
      console.error('Gagal ambil data kas keluar:', error)
    } else {
      setDataKasKeluar(data)
    }
    setLoading(false)
  }

  const dataTampil = dataKasKeluar.filter((row) => {
    const cocokFilter = filter === 'semua' || row.kategori === filter
    const cocokSearch = row.keterangan.toLowerCase().includes(search.toLowerCase())
    return cocokFilter && cocokSearch
  })

  const totalNominal = dataTampil.reduce((sum, row) => sum + Number(row.nominal), 0)

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
            {kategoriList.map((k) => (
              <button
                key={k}
                className={`filter-btn ${filter === k ? 'active' : ''}`}
                onClick={() => setFilter(k)}
              >
                {k === 'semua' ? 'Semua' : k}
              </button>
            ))}
          </div>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '20px' }}>
          <div className="stat-card red">
            <div className="icon-badge">💸</div>
            <div className="label">Total Kas Keluar</div>
            <div className="value">{formatRupiah(totalNominal)}</div>
          </div>
          <div className="stat-card">
            <div className="icon-badge">🧾</div>
            <div className="label">Jumlah Transaksi</div>
            <div className="value">{dataTampil.length}</div>
          </div>
        </div>

        {loading && <p style={{ color: '#8a8a92', fontSize: '13px' }}>Memuat data...</p>}

        {!loading && (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Keterangan</th>
                  <th>Kategori</th>
                  <th>Nominal</th>
                </tr>
              </thead>
              <tbody>
                {dataTampil.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan={4}>Belum ada pengeluaran.</td>
                  </tr>
                )}

                {dataTampil.map((row) => (
                  <tr key={row.id}>
                    <td>{formatTanggal(row.tanggal)}</td>
                    <td>{row.keterangan}</td>
                    <td>{row.kategori}</td>
                    <td style={{ color: '#E5484D', fontWeight: 600 }}>- {formatRupiah(row.nominal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default KasKeluar
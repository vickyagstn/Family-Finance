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

function KasMasuk() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dataKasMasuk, setDataKasMasuk] = useState([])
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
      .from('kas_masuk')
      .select('*, anggota_keluarga(nama)')
      .order('tanggal', { ascending: false })

    if (!error) setDataKasMasuk(data)
    setLoading(false)
  }

  async function handleHapus(id) {
    const konfirmasi = window.confirm('Yakin ingin menghapus data pembayaran ini?')
    if (!konfirmasi) return

    const { error } = await supabase.from('kas_masuk').delete().eq('id', id)

    if (error) {
      tampilkanToast('Gagal menghapus data', 'error')
      return
    }

    setDataKasMasuk(dataKasMasuk.filter((d) => d.id !== id))
    tampilkanToast('Data pembayaran berhasil dihapus')
  }

  return (
    <div className="dash">
      <Sidebar active="kas-masuk" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Kas Masuk</h2>
            <p>Daftar seluruh pemasukan kas keluarga</p>
          </div>
          <Link to="/admin/kas-masuk/tambah" className="btn-add">＋ Tambah Pembayaran</Link>
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama Keluarga</th>
                <th>Periode</th>
                <th>Nominal</th>
                <th>Metode</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="empty-row"><td colSpan="6">Memuat data...</td></tr>
              )}
              {!loading && dataKasMasuk.length === 0 && (
                <tr className="empty-row">
                  <td colSpan="6">
                    <div className="empty-state compact">
                      <div className="empty-state-icon">💰</div>
                      <h4>Belum ada data pembayaran</h4>
                      <p>Kas masuk yang kamu catat akan tampil di tabel ini.</p>
                    </div>
                  </td>
                </tr>
              )}
              {dataKasMasuk.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.tanggal).toLocaleDateString('id-ID')}</td>
                  <td>{row.anggota_keluarga?.nama || '-'}</td>
                  <td>{row.periode || '-'}</td>
                  <td style={{ color: '#1DAA61', fontWeight: 700 }}>{formatRupiah(row.nominal)}</td>
                  <td style={{ textTransform: 'capitalize' }}>{row.metode}</td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    <Link
                      to={`/admin/kas-masuk/edit/${row.id}`}
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

export default KasMasuk
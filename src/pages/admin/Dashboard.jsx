import { useState, useEffect } from 'react'
import './admin.css'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import WelcomeBanner from '../../components/WelcomeBanner'
import { supabase } from '../../supabaseClient'

function formatRupiah(angka) {
  return 'Rp' + Number(angka).toLocaleString('id-ID')
}

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [totalKeluarga, setTotalKeluarga] = useState(0)
  const [sudahBayar, setSudahBayar] = useState(0)
  const [belumBayar, setBelumBayar] = useState(0)
  const [saldoKas, setSaldoKas] = useState(0)
  const [transaksiTerbaru, setTransaksiTerbaru] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ambilData()
  }, [])

  async function ambilData() {
    setLoading(true)

    const { data: keluarga } = await supabase.from('anggota_keluarga').select('id, status')
    const totalK = (keluarga || []).length
    const lunas = (keluarga || []).filter((k) => k.status === 'lunas').length
    const belum = totalK - lunas

    const { data: masuk } = await supabase.from('kas_masuk').select('nominal')
    const { data: keluar } = await supabase.from('kas_keluar').select('nominal')

    const totalMasuk = (masuk || []).reduce((sum, r) => sum + Number(r.nominal), 0)
    const totalKeluar = (keluar || []).reduce((sum, r) => sum + Number(r.nominal), 0)

    const { data: terbaru } = await supabase
      .from('kas_masuk')
      .select('*, anggota_keluarga(nama)')
      .order('created_at', { ascending: false })
      .limit(4)

    setTotalKeluarga(totalK)
    setSudahBayar(lunas)
    setBelumBayar(belum)
    setSaldoKas(totalMasuk - totalKeluar)
    setTransaksiTerbaru(terbaru || [])
    setLoading(false)
  }

  return (
    <div className="dash">
      <Sidebar active="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <WelcomeBanner name="Admin" />

        <div className="stats-grid">
          <div className="stat-card maroon">
            <div className="icon-badge">💰</div>
            <div className="label">Saldo Kas</div>
            <div className="value">{loading ? '...' : formatRupiah(saldoKas)}</div>
          </div>
          <div className="stat-card">
            <div className="icon-badge">👪</div>
            <div className="label">Total Keluarga</div>
            <div className="value">{loading ? '...' : totalKeluarga}</div>
          </div>
          <div className="stat-card green">
            <div className="icon-badge">✅</div>
            <div className="label">Sudah Bayar</div>
            <div className="value">{loading ? '...' : sudahBayar}</div>
          </div>
          <div className="stat-card red">
            <div className="icon-badge">⚠️</div>
            <div className="label">Belum Bayar</div>
            <div className="value">{loading ? '...' : belumBayar}</div>
          </div>
        </div>

        <div className="main-grid-2">
          <div className="panel">
            <h3>Transaksi Terbaru</h3>
            {loading && <p style={{ color: '#8a8a92', fontSize: '13px' }}>Memuat...</p>}
            {!loading && transaksiTerbaru.length === 0 && (
              <div className="empty-state compact">
                <div className="empty-state-icon">💰</div>
                <h4>Belum ada transaksi</h4>
                <p>Transaksi kas masuk terbaru akan muncul di sini.</p>
              </div>
            )}
            {transaksiTerbaru.map((t) => (
              <div className="transaksi-row" key={t.id}>
                <div className="transaksi-icon">💰</div>
                <div>
                  <div className="transaksi-name">{t.anggota_keluarga?.nama || '-'}</div>
                  <div className="transaksi-sub">{new Date(t.tanggal).toLocaleDateString('id-ID')} · Kas Masuk</div>
                </div>
                <div className="transaksi-amount in">+{formatRupiah(t.nominal)}</div>
              </div>
            ))}
          </div>

          <div className="panel">
            <h3>Ringkasan</h3>
            <div className="ringkasan-row"><span>Total Keluarga</span><b>{totalKeluarga}</b></div>
            <div className="ringkasan-row"><span>Sudah Bayar</span><b className="green">{sudahBayar}</b></div>
            <div className="ringkasan-row"><span>Belum Bayar</span><b className="red">{belumBayar}</b></div>
            <div className="ringkasan-total">{formatRupiah(saldoKas)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
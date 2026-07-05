import { useState, useEffect } from 'react'
import './admin.css'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts'

const namaBulanSingkat = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function formatRupiah(angka) {
  return `Rp ${Number(angka).toLocaleString('id-ID')}`
}

function formatTanggal(tgl) {
  return new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusLabel(status) {
  if (status === 'lunas') return { text: 'Lunas', cls: 'lunas' }
  if (status === 'tunggak') return { text: 'Menunggak', cls: 'tunggak' }
  return { text: 'Jatuh Tempo', cls: 'jatuh' }
}

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [totalKeluarga, setTotalKeluarga] = useState(0)
  const [sudahBayar, setSudahBayar] = useState(0)
  const [belumBayar, setBelumBayar] = useState(0)
  const [saldo, setSaldo] = useState(0)
  const [totalMasukBulanIni, setTotalMasukBulanIni] = useState(0)
  const [totalKeluarBulanIni, setTotalKeluarBulanIni] = useState(0)
  const [grafikData, setGrafikData] = useState([])
  const [transaksiTerbaru, setTransaksiTerbaru] = useState([])
  const [pengingatList, setPengingatList] = useState([])
  const [acaraTerdekat, setAcaraTerdekat] = useState([])

  useEffect(() => {
    ambilSemuaData()
  }, [])

  async function ambilSemuaData() {
    setLoading(true)

    const [{ data: keluargaData }, { data: masukData }, { data: keluarData }, { data: acaraData }] =
      await Promise.all([
        supabase.from('keluarga').select('*'),
        supabase.from('kas_masuk').select('*'),
        supabase.from('kas_keluar').select('*'),
        supabase.from('acara').select('*').gte('tanggal', new Date().toISOString().slice(0, 10)).order('tanggal').limit(4),
      ])

    const daftarKeluarga = keluargaData || []
    const daftarMasuk = masukData || []
    const daftarKeluar = keluarData || []
    const daftarAcara = acaraData || []

    // Statistik keluarga
    setTotalKeluarga(daftarKeluarga.length)
    const jumlahLunas = daftarKeluarga.filter((k) => k.status === 'lunas').length
    setSudahBayar(jumlahLunas)
    setBelumBayar(daftarKeluarga.length - jumlahLunas)

    // Saldo total
    const totalMasuk = daftarMasuk.reduce((s, r) => s + Number(r.nominal), 0)
    const totalKeluar = daftarKeluar.reduce((s, r) => s + Number(r.nominal), 0)
    setSaldo(totalMasuk - totalKeluar)

    // Ringkasan bulan ini
    const bulanIniIso = new Date().toISOString().slice(0, 7)
    setTotalMasukBulanIni(
      daftarMasuk.filter((r) => r.tanggal.startsWith(bulanIniIso)).reduce((s, r) => s + Number(r.nominal), 0)
    )
    setTotalKeluarBulanIni(
      daftarKeluar.filter((r) => r.tanggal.startsWith(bulanIniIso)).reduce((s, r) => s + Number(r.nominal), 0)
    )

    // Grafik 6 bulan terakhir
    const peta = {}
    daftarMasuk.forEach((r) => {
      const key = r.tanggal.slice(0, 7)
      if (!peta[key]) peta[key] = { masuk: 0, keluar: 0 }
      peta[key].masuk += Number(r.nominal)
    })
    daftarKeluar.forEach((r) => {
      const key = r.tanggal.slice(0, 7)
      if (!peta[key]) peta[key] = { masuk: 0, keluar: 0 }
      peta[key].keluar += Number(r.nominal)
    })
    const bulanUrut = Object.keys(peta).sort().slice(-6)
    setGrafikData(
      bulanUrut.map((key) => {
        const [, bulanAngka] = key.split('-')
        return {
          bulan: namaBulanSingkat[Number(bulanAngka) - 1],
          masuk: peta[key].masuk,
          keluar: peta[key].keluar,
        }
      })
    )

    // Peta nama keluarga buat transaksi terbaru
    const petaNama = {}
    daftarKeluarga.forEach((k) => { petaNama[k.id] = k.nama })

    const gabunganTransaksi = [
      ...daftarMasuk.map((r) => ({
        id: 'in-' + r.id,
        tanggal: r.tanggal,
        nama: petaNama[r.keluarga_id] || 'Keluarga',
        nominal: r.nominal,
        tipe: 'masuk',
      })),
      ...daftarKeluar.map((r) => ({
        id: 'out-' + r.id,
        tanggal: r.tanggal,
        nama: r.keterangan,
        nominal: r.nominal,
        tipe: 'keluar',
      })),
    ]
      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
      .slice(0, 5)

    setTransaksiTerbaru(gabunganTransaksi)

    // Pengingat: keluarga yang belum lunas
    setPengingatList(daftarKeluarga.filter((k) => k.status !== 'lunas').slice(0, 3))

    setAcaraTerdekat(daftarAcara)

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="dash">
        <Sidebar active="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <p style={{ color: '#8a8a92', fontSize: '13px' }}>Memuat data dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dash">
      <Sidebar active="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="welcome-banner">
          <h2>Selamat Datang, Admin!</h2>
          <p>Selamat datang di dashboard RIN Family Finance</p>
          <div className="wb-date">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <span className="wb-icon">💰</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card maroon">
            <div className="icon-badge">💰</div>
            <div className="label">Saldo Kas</div>
            <div className="value">{formatRupiah(saldo)}</div>
          </div>
          <div className="stat-card">
            <div className="icon-badge">👪</div>
            <div className="label">Total Keluarga</div>
            <div className="value">{totalKeluarga}</div>
          </div>
          <div className="stat-card green">
            <div className="icon-badge">✅</div>
            <div className="label">Sudah Bayar</div>
            <div className="value">{sudahBayar}</div>
          </div>
          <div className="stat-card red">
            <div className="icon-badge">⚠️</div>
            <div className="label">Belum Bayar</div>
            <div className="value">{belumBayar}</div>
          </div>
        </div>

        <div className="main-grid-2">
          <div className="panel">
            <h3>Grafik Pemasukan & Pengeluaran</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={grafikData} margin={{ top: 6, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 8" stroke="#ECECEC" vertical={false} />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#8a8a92' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#8a8a92' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v / 1000}rb`}
                  />
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                  <Line type="monotone" dataKey="masuk" stroke="#800020" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="keluar" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <h3>Ringkasan Bulan Ini</h3>
            <div className="ringkasan-row">
              <span>Total Pemasukan</span>
              <b className="green">{formatRupiah(totalMasukBulanIni)}</b>
            </div>
            <div className="ringkasan-row">
              <span>Total Pengeluaran</span>
              <b className="red">{formatRupiah(totalKeluarBulanIni)}</b>
            </div>
            <div className="ringkasan-total">{formatRupiah(totalMasukBulanIni - totalKeluarBulanIni)}</div>
            <p style={{ fontSize: '11px', color: '#8a8a92' }}>Saldo bersih bulan ini</p>
          </div>
        </div>

        <div className="main-grid-3">
          <div className="panel">
            <h3>Pengingat Pembayaran</h3>
            {pengingatList.length === 0 && (
              <p style={{ fontSize: '12px', color: '#8a8a92' }}>Semua keluarga sudah lunas 🎉</p>
            )}
            {pengingatList.map((k) => {
              const s = statusLabel(k.status)
              const inisial = k.nama.split(' ')[1] ? k.nama.split(' ')[1].slice(0, 2).toUpperCase() : 'KK'
              return (
                <div className="reminder-card" key={k.id}>
                  <div className="reminder-avatar">{inisial}</div>
                  <div className="reminder-info">
                    <div className="reminder-name">{k.nama}</div>
                    <div className="reminder-sub">Ketua: {k.ketua}</div>
                  </div>
                  <span className={`status-pill ${s.cls}`}>{s.text}</span>
                </div>
              )
            })}
          </div>

          <div className="panel">
            <h3>Transaksi Terbaru</h3>
            {transaksiTerbaru.length === 0 && (
              <p style={{ fontSize: '12px', color: '#8a8a92' }}>Belum ada transaksi.</p>
            )}
            {transaksiTerbaru.map((t) => (
              <div className="transaksi-row" key={t.id}>
                <div className={`transaksi-icon ${t.tipe === 'keluar' ? 'out' : ''}`}>
                  {t.tipe === 'masuk' ? '⬇' : '⬆'}
                </div>
                <div>
                  <div className="transaksi-name">{t.nama}</div>
                  <div className="transaksi-sub">{formatTanggal(t.tanggal)}</div>
                </div>
                <div className={`transaksi-amount ${t.tipe === 'masuk' ? 'in' : 'out'}`}>
                  {t.tipe === 'masuk' ? '+' : '-'} {formatRupiah(t.nominal)}
                </div>
              </div>
            ))}
          </div>

          <div className="panel">
            <h3>Jadwal Acara</h3>
            {acaraTerdekat.length === 0 && (
              <p style={{ fontSize: '12px', color: '#8a8a92' }}>Belum ada acara mendatang.</p>
            )}
            {acaraTerdekat.map((a) => {
              const tglObj = new Date(a.tanggal)
              return (
                <div className="acara-row" key={a.id}>
                  <div className="acara-date-box">
                    <span className="d">{tglObj.getDate()}</span>
                    <span className="m">{namaBulanSingkat[tglObj.getMonth()]}</span>
                  </div>
                  <div>
                    <div className="acara-name">{a.nama}</div>
                    <div className="acara-sub">{a.lokasi || '-'}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="panel">
          <h3>Aksi Cepat</h3>
          <div className="qa-grid-2">
            <Link to="/admin/kas-masuk/tambah" className="qa-tile" style={{ textDecoration: 'none' }}>
              <span className="qa-icon">💰</span>
              Tambah Pembayaran
            </Link>
            <Link to="/admin/kas-keluar/tambah" className="qa-tile alt" style={{ textDecoration: 'none' }}>
              <span className="qa-icon">💸</span>
              Tambah Pengeluaran
            </Link>
            <Link to="/admin/anggota/tambah" className="qa-tile" style={{ textDecoration: 'none' }}>
              <span className="qa-icon">👪</span>
              Tambah Anggota
            </Link>
            <Link to="/admin/acara/tambah" className="qa-tile alt" style={{ textDecoration: 'none' }}>
              <span className="qa-icon">📅</span>
              Tambah Acara
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
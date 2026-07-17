import { useState, useEffect, useMemo } from 'react'
import './admin.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import Toast from '../../components/Toast'
import { supabase } from '../../supabaseClient'

const namaBulan = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES']
const namaBulanPanjang = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function keyTanggal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function JadwalAcara() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dataAcara, setDataAcara] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [bulanAktif, setBulanAktif] = useState(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })
  const [tanggalDipilih, setTanggalDipilih] = useState(null) // 'YYYY-MM-DD'
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
      .from('acara')
      .select('*')
      .order('tanggal', { ascending: true })

    if (!error) setDataAcara(data)
    setLoading(false)
  }

  async function handleHapus(id) {
    const konfirmasi = window.confirm('Yakin ingin menghapus acara ini?')
    if (!konfirmasi) return

    const { error } = await supabase.from('acara').delete().eq('id', id)

    if (error) {
      tampilkanToast('Gagal menghapus acara', 'error')
      return
    }

    setDataAcara(dataAcara.filter((d) => d.id !== id))
    tampilkanToast('Acara berhasil dihapus')
  }

  // ---- Data acara dikelompokkan per tanggal (untuk kalender) ----
  const acaraPerTanggal = useMemo(() => {
    const map = {}
    dataAcara.forEach((a) => {
      const key = keyTanggal(new Date(a.tanggal))
      if (!map[key]) map[key] = []
      map[key].push(a)
    })
    return map
  }, [dataAcara])

  // ---- Susun sel-sel kalender bulan aktif ----
  const selKalender = useMemo(() => {
    const tahun = bulanAktif.getFullYear()
    const bulan = bulanAktif.getMonth()
    const offset = new Date(tahun, bulan, 1).getDay() // 0 = Minggu
    const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()

    const sel = []
    for (let i = 0; i < offset; i++) sel.push(null)
    for (let d = 1; d <= jumlahHari; d++) sel.push(new Date(tahun, bulan, d))
    return sel
  }, [bulanAktif])

  const hariIniKey = keyTanggal(new Date())

  function gantiBulan(delta) {
    setBulanAktif(new Date(bulanAktif.getFullYear(), bulanAktif.getMonth() + delta, 1))
    setTanggalDipilih(null)
  }

  function renderKartu(a) {
    const tgl = new Date(a.tanggal)
    return (
      <div className="acara-card" key={a.id}>
        <div className="acara-card-date">
          <span className="d">{tgl.getDate()}</span>
          <span className="m">{namaBulan[tgl.getMonth()]}</span>
        </div>
        <h3>{a.nama}</h3>
        {a.lokasi && <p>📍 {a.lokasi}</p>}
        {a.deskripsi && <p>{a.deskripsi}</p>}

        <div className="acara-card-actions">
          <button
            onClick={() => handleHapus(a.id)}
            style={{
              flex: 1, background: '#fdeaea', color: '#E5484D', border: 'none',
              borderRadius: '10px', padding: '9px', fontSize: '11.5px',
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            🗑️ Hapus
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dash">
      <Sidebar active="acara" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <style>{`
          .ja-cal-section {
            margin: 4px 0 24px 0;
          }
          .ja-cal-nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 14px;
          }
          .ja-cal-nav button {
            border: 1px solid #E7DCCB;
            background: #fff;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            font-size: 15px;
            cursor: pointer;
            color: #7B1E3B;
          }
          .ja-cal-nav button:hover { background: #F3EAD9; }
          .ja-cal-nav h3 {
            font-size: 16px;
            font-weight: 600;
            color: #5C1526;
            margin: 0;
          }
          .ja-cal-grid {
            display: grid;
            grid-template-columns: repeat(7, 68px);
            gap: 6px;
            background: #fff;
            border: 1px solid #E7DCCB;
            border-radius: 14px;
            padding: 16px;
            max-width: fit-content;
          }
          .ja-cal-dow {
            width: 68px;
            text-align: center;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 0.04em;
            color: #C9982F;
            text-transform: uppercase;
            padding-bottom: 6px;
          }
          .ja-cal-cell {
            position: relative;
            width: 68px;
            height: 40px;
            border-radius: 8px;
            border: 1px solid transparent;
            background: #FBF6EE;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 12px;
            color: #2A1B1E;
            transition: background 0.12s ease, border-color 0.12s ease;
          }
          .ja-cal-cell:hover { background: #F3EAD9; }
          .ja-cal-cell.kosong { background: transparent; cursor: default; }
          .ja-cal-cell.hari-ini { border-color: #C9982F; font-weight: 700; }
          .ja-cal-cell.dipilih { background: #7B1E3B; color: #fff; }
          .ja-cal-dot {
            position: absolute;
            bottom: 4px;
            display: flex;
            gap: 2px;
          }
          .ja-cal-dot span {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: #B23A5B;
          }
          .ja-cal-cell.dipilih .ja-cal-dot span { background: #fff; }
        `}</style>

        <div className="topbar">
          <div>
            <h2>Jadwal Acara</h2>
            <p>Kelola acara keluarga besar mendatang</p>
          </div>
          <Link to="/admin/acara/tambah" className="btn-add">＋ Tambah Acara</Link>
        </div>

        {loading && <p style={{ color: '#8a8a92', fontSize: '13px' }}>Memuat data...</p>}

        {!loading && (
          <div className="ja-cal-section">
            <div className="ja-cal-nav">
              <button onClick={() => gantiBulan(-1)}>‹</button>
              <h3>{namaBulanPanjang[bulanAktif.getMonth()]} {bulanAktif.getFullYear()}</h3>
              <button onClick={() => gantiBulan(1)}>›</button>
            </div>

            <div className="ja-cal-grid">
              {namaHari.map((h) => <div className="ja-cal-dow" key={h}>{h}</div>)}

              {selKalender.map((tgl, i) => {
                if (!tgl) return <div className="ja-cal-cell kosong" key={`kosong-${i}`} />
                const key = keyTanggal(tgl)
                const acaraHari = acaraPerTanggal[key] || []
                const isHariIni = key === hariIniKey
                const isDipilih = key === tanggalDipilih
                return (
                  <div
                    key={key}
                    className={`ja-cal-cell ${isHariIni ? 'hari-ini' : ''} ${isDipilih ? 'dipilih' : ''}`}
                    onClick={() => setTanggalDipilih(isDipilih ? null : key)}
                  >
                    {tgl.getDate()}
                    {acaraHari.length > 0 && (
                      <div className="ja-cal-dot">
                        {acaraHari.slice(0, 3).map((_, idx) => <span key={idx} />)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!loading && (
          <div className="acara-grid">
            {dataAcara.length === 0 && (
              <p style={{ color: '#8a8a92', fontSize: '13px' }}>
                Belum ada acara. Klik "Tambah Acara" untuk mulai menjadwalkan.
              </p>
            )}
            {dataAcara.map(renderKartu)}
          </div>
        )}
      </div>

      <Toast message={toast.message} type={toast.type} />
    </div>
  )
}

export default JadwalAcara
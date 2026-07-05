import { useState, useEffect } from 'react'
import './admin.css'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

const namaBulan = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function getJumlahHari(tahun, bulan) {
  return new Date(tahun, bulan + 1, 0).getDate()
}

function getHariPertama(tahun, bulan) {
  return new Date(tahun, bulan, 1).getDay()
}

function JadwalAcara() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sekarang = new Date()
  const [tahun, setTahun] = useState(sekarang.getFullYear())
  const [bulan, setBulan] = useState(sekarang.getMonth())
  const [daftarAcara, setDaftarAcara] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ambilData()
  }, [])

  async function ambilData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('acara')
      .select('*')
      .order('tanggal', { ascending: true })

    if (error) {
      console.error('Gagal ambil data acara:', error)
    } else {
      setDaftarAcara(data)
    }
    setLoading(false)
  }

  const jumlahHari = getJumlahHari(tahun, bulan)
  const hariPertama = getHariPertama(tahun, bulan)

  const selEvent = (tglISO) => daftarAcara.find((a) => a.tanggal === tglISO)

  const kotakKosong = Array.from({ length: hariPertama })
  const kotakHari = Array.from({ length: jumlahHari }, (_, i) => i + 1)

  function formatTanggalISO(tgl) {
    const b = String(bulan + 1).padStart(2, '0')
    const t = String(tgl).padStart(2, '0')
    return `${tahun}-${b}-${t}`
  }

  function bulanSebelumnya() {
    if (bulan === 0) {
      setBulan(11)
      setTahun(tahun - 1)
    } else {
      setBulan(bulan - 1)
    }
  }

  function bulanBerikutnya() {
    if (bulan === 11) {
      setBulan(0)
      setTahun(tahun + 1)
    } else {
      setBulan(bulan + 1)
    }
  }

  const bulanIso = `${tahun}-${String(bulan + 1).padStart(2, '0')}`
  const acaraBulanIni = daftarAcara
    .filter((a) => a.tanggal.startsWith(bulanIso))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))

  return (
    <div className="dash">
      <Sidebar active="acara" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Jadwal Acara</h2>
            <p>Kalender kegiatan keluarga besar</p>
          </div>
          <Link to="/admin/acara/tambah" className="btn-add">＋ Tambah Acara</Link>
        </div>

        {loading && <p style={{ color: '#8a8a92', fontSize: '13px' }}>Memuat data...</p>}

        {!loading && (
          <div className="main-grid-2">
            <div className="panel">
              <div className="cal-header">
                <button className="cal-nav" onClick={bulanSebelumnya}>‹</button>
                <h3 className="cal-title">{namaBulan[bulan]} {tahun}</h3>
                <button className="cal-nav" onClick={bulanBerikutnya}>›</button>
              </div>

              <div className="cal-grid cal-grid-head">
                {namaHari.map((h) => (
                  <div key={h} className="cal-day-label">{h}</div>
                ))}
              </div>

              <div className="cal-grid">
                {kotakKosong.map((_, i) => (
                  <div key={`kosong-${i}`} className="cal-cell cal-cell-empty"></div>
                ))}

                {kotakHari.map((tgl) => {
                  const iso = formatTanggalISO(tgl)
                  const acara = selEvent(iso)
                  const isHariIni =
                    tahun === sekarang.getFullYear() &&
                    bulan === sekarang.getMonth() &&
                    tgl === sekarang.getDate()

                  return (
                    <div
                      key={tgl}
                      className={`cal-cell ${acara ? 'has-event' : ''} ${isHariIni ? 'today' : ''}`}
                      title={acara ? acara.nama : ''}
                    >
                      <span className="cal-date-num">{tgl}</span>
                      {acara && <span className="cal-dot"></span>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="panel">
              <h3>Acara Bulan Ini</h3>

              {acaraBulanIni.length === 0 && (
                <p style={{ color: '#8a8a92', fontSize: '12.5px' }}>
                  Belum ada acara di bulan ini.
                </p>
              )}

              {acaraBulanIni.map((a) => {
                const tglObj = new Date(a.tanggal)
                const tglAngka = tglObj.getDate()
                const bulanSingkat = namaBulan[tglObj.getMonth()].slice(0, 3)

                return (
                  <div className="acara-row" key={a.id}>
                    <div className="acara-date-box">
                      <span className="d">{tglAngka}</span>
                      <span className="m">{bulanSingkat}</span>
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
        )}
      </div>
    </div>
  )
}

export default JadwalAcara
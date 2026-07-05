import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiLogOut, FiCreditCard, FiCheckCircle, FiClock, FiMapPin,
  FiTrendingUp,
} from 'react-icons/fi'
import { RiVipCrownFill } from 'react-icons/ri'
import './anggota.css'
import { supabase } from '../../supabaseClient'

const namaBulanSingkat = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function formatRupiah(angka) {
  return `Rp ${Number(angka).toLocaleString('id-ID')}`
}

function formatTanggal(tgl) {
  return new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
}

function DashboardAnggota() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [keluarga, setKeluarga] = useState(null)
  const [riwayat, setRiwayat] = useState([])
  const [acaraTerdekat, setAcaraTerdekat] = useState([])
  const [bulanTerpilih, setBulanTerpilih] = useState('Semua')

  useEffect(() => {
    ambilData()
  }, [])

  async function ambilData() {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      navigate('/')
      return
    }

    const { data: dataKeluarga } = await supabase
      .from('keluarga')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (!dataKeluarga) {
      setLoading(false)
      setKeluarga(null)
      return
    }

    setKeluarga(dataKeluarga)

    const { data: dataRiwayat } = await supabase
      .from('kas_masuk')
      .select('*')
      .eq('keluarga_id', dataKeluarga.id)
      .order('tanggal', { ascending: false })

    setRiwayat(dataRiwayat || [])

    const { data: dataAcara } = await supabase
      .from('acara')
      .select('*')
      .gte('tanggal', new Date().toISOString().slice(0, 10))
      .order('tanggal')
      .limit(2)

    setAcaraTerdekat(dataAcara || [])

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="ang-page">
        <div className="ang-wrap">
          <p style={{ textAlign: 'center', color: '#8a8a92', paddingTop: '60px' }}>Memuat data...</p>
        </div>
      </div>
    )
  }

  if (!keluarga) {
    return (
      <div className="ang-page">
        <div className="ang-wrap">
          <div className="ang-panel" style={{ textAlign: 'center' }}>
            <h3>Akun belum terhubung</h3>
            <p style={{ fontSize: '12.5px', color: '#8a8a92', marginBottom: '16px' }}>
              Akun kamu belum dihubungkan ke data keluarga manapun. Hubungi admin.
            </p>
            <button className="ang-logout" style={{ margin: '0 auto' }} onClick={handleLogout}>
              <FiLogOut />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const daftarBulanTersedia = [
    'Semua',
    ...Array.from(new Set(riwayat.map((r) => r.tanggal.slice(0, 7)))).sort().reverse(),
  ]

  const riwayatTampil =
    bulanTerpilih === 'Semua'
      ? riwayat
      : riwayat.filter((r) => r.tanggal.slice(0, 7) === bulanTerpilih)

  const totalKeseluruhan = riwayat.reduce((s, r) => s + Number(r.nominal), 0)
  const totalBulanTerpilih = riwayatTampil.reduce((s, r) => s + Number(r.nominal), 0)
  const kasTerakhir = riwayat.length > 0 ? riwayat[0].tanggal : null

  const inisial = keluarga.nama.split(' ')[1] ? keluarga.nama.split(' ')[1].slice(0, 2).toUpperCase() : 'KK'

  function labelBulan(key) {
    if (key === 'Semua') return 'Semua Bulan'
    const [tahun, bulan] = key.split('-')
    return `${namaBulanSingkat[Number(bulan) - 1]} ${tahun}`
  }

  return (
    <div className="ang-page">
      <div className="ang-blob ang-blob-1"></div>
      <div className="ang-blob ang-blob-2"></div>

      <div className="ang-wrap">
        <div className="ang-topbar">
          <div>
            <p className="ang-eyebrow">Selamat Datang Kembali</p>
            <h2>{keluarga.nama}</h2>
          </div>
          <button className="ang-logout" title="Keluar" onClick={handleLogout}>
            <FiLogOut />
          </button>
        </div>

        <motion.div className="ang-id-card" variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <div className="ang-id-pattern"></div>
          <RiVipCrownFill className="ang-id-crown" />

          <div className="ang-id-top">
            <div className="ang-id-avatar">{inisial}</div>
            <span className="ang-id-status">
              <FiCheckCircle /> {keluarga.status === 'lunas' ? 'Lunas' : keluarga.status === 'tunggak' ? 'Menunggak' : 'Jatuh Tempo'}
            </span>
          </div>

          <div className="ang-id-bottom">
            <span className="ang-id-label">Anggota Keluarga Besar</span>
            <h3>{keluarga.nama}</h3>
            <span className="ang-id-member">RIN Family Finance · Ketua: {keluarga.ketua}</span>
          </div>
        </motion.div>

        <div className="ang-stats">
          <motion.div className="ang-stat" variants={fadeUp} initial="hidden" animate="show" custom={1}>
            <div className="ang-stat-icon maroon"><FiCreditCard /></div>
            <div className="label">Total Pembayaran</div>
            <div className="value">{formatRupiah(totalKeseluruhan)}</div>
          </motion.div>

          <motion.div className="ang-stat" variants={fadeUp} initial="hidden" animate="show" custom={2}>
            <div className="ang-stat-icon green"><FiTrendingUp /></div>
            <div className="label">Status Kas</div>
            <div className="value green-text">
              {keluarga.status === 'lunas' ? 'Lunas' : keluarga.status === 'tunggak' ? 'Menunggak' : 'Jatuh Tempo'}
            </div>
          </motion.div>

          <motion.div className="ang-stat" variants={fadeUp} initial="hidden" animate="show" custom={3}>
            <div className="ang-stat-icon gold"><FiClock /></div>
            <div className="label">Kas Terakhir</div>
            <div className="value">{kasTerakhir ? formatTanggal(kasTerakhir) : 'Belum ada'}</div>
          </motion.div>
        </div>

        <motion.div className="ang-panel" variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <div className="ang-panel-head">
            <h3>Riwayat Pembayaran</h3>
            <select
              className="ang-bulan-select"
              value={bulanTerpilih}
              onChange={(e) => setBulanTerpilih(e.target.value)}
            >
              {daftarBulanTersedia.map((b) => (
                <option key={b} value={b}>{labelBulan(b)}</option>
              ))}
            </select>
          </div>

          {bulanTerpilih !== 'Semua' && riwayatTampil.length > 0 && (
            <div className="ang-total-bulan">
              Total {labelBulan(bulanTerpilih)}: <b>{formatRupiah(totalBulanTerpilih)}</b>
              <span className="ang-total-count">({riwayatTampil.length} transaksi)</span>
            </div>
          )}

          {riwayatTampil.length === 0 && (
            <p className="ang-empty">Belum ada pembayaran tercatat.</p>
          )}

          <div className="timeline">
            {riwayatTampil.map((r) => (
              <div className="timeline-item" key={r.id}>
                <div className="dot"><FiCheckCircle /></div>
                <div className="timeline-content">
                  <div className="t-title">Pembayaran Kas</div>
                  <div className="t-sub">{formatTanggal(r.tanggal)} · {formatRupiah(r.nominal)} · {r.metode}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="ang-panel" variants={fadeUp} initial="hidden" animate="show" custom={5}>
          <h3>Acara Terdekat</h3>
          {acaraTerdekat.length === 0 && (
            <p className="ang-empty">Belum ada acara mendatang.</p>
          )}
          <div className="ang-events">
            {acaraTerdekat.map((a) => {
              const tglObj = new Date(a.tanggal)
              return (
                <div className="ang-event-card" key={a.id}>
                  <div className="ang-event-date">
                    <span className="d">{tglObj.getDate()}</span>
                    <span className="m">{namaBulanSingkat[tglObj.getMonth()]}</span>
                  </div>
                  <div className="ang-event-info">
                    <span className="ang-event-name">{a.nama}</span>
                    <span className="ang-event-loc"><FiMapPin /> {a.lokasi || '-'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardAnggota
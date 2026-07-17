import { useState, useEffect } from 'react'
import './anggota.css'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const NAMA_BULAN_SINGKAT = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES']

function formatRupiah(angka) {
  return 'Rp' + Number(angka).toLocaleString('id-ID')
}

function DashboardAnggota() {
  const navigate = useNavigate()

  const [keluarga, setKeluarga] = useState(null)
  const [totalBayar, setTotalBayar] = useState(0)
  const [jumlahTransaksi, setJumlahTransaksi] = useState(0)
  const [kasTerakhir, setKasTerakhir] = useState(null)
  const [acaraTerdekat, setAcaraTerdekat] = useState([])
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)
  const [acaraDipilih, setAcaraDipilih] = useState(null)

  useEffect(() => {
    ambilData()
  }, [])

  async function ambilData() {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user.id

    const { data: profilData } = await supabase
      .from('profiles')
      .select('*, anggota_keluarga(*)')
      .eq('id', userId)
      .single()

    if (!profilData || !profilData.keluarga_id) {
      setLoading(false)
      return
    }

    setKeluarga(profilData.anggota_keluarga)

    const { data: kasMasuk } = await supabase
      .from('kas_masuk')
      .select('*')
      .eq('keluarga_id', profilData.keluarga_id)
      .order('tanggal', { ascending: false })

    const semuaKas = kasMasuk || []
    const total = semuaKas.reduce((sum, r) => sum + Number(r.nominal), 0)

    setTotalBayar(total)
    setJumlahTransaksi(semuaKas.length)
    setKasTerakhir(semuaKas.length > 0 ? semuaKas[0] : null)
    setRiwayat(semuaKas)

    const { data: acara } = await supabase
      .from('acara')
      .select('*')
      .gte('tanggal', new Date().toISOString().split('T')[0])
      .order('tanggal', { ascending: true })
      .limit(2)

    setAcaraTerdekat(acara || [])
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="ang-page">
        <p style={{ color: '#8a8a92', textAlign: 'center', paddingTop: '60px' }}>Memuat data...</p>
      </div>
    )
  }

  if (!keluarga) {
    return (
      <div className="ang-page">
        <p style={{ color: '#8a8a92', textAlign: 'center', paddingTop: '60px' }}>
          Akun kamu belum terhubung dengan data keluarga. Hubungi Admin.
        </p>
      </div>
    )
  }

  const sudahLunas = keluarga.status === 'lunas'
  const inisial = keluarga.nama.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="ang-page">
      <div className="ang-blob ang-blob-1"></div>
      <div className="ang-blob ang-blob-2"></div>

      <div className="ang-wrap">
        <div className="ang-topbar">
          <div>
            <div className="ang-eyebrow">Family Finance</div>
            <h2>Halo, {keluarga.nama} 👋</h2>
          </div>
          <button className="ang-logout" onClick={handleLogout} aria-label="Keluar">🚪</button>
        </div>

        <div className="ang-id-card">
          <div className="ang-id-pattern"></div>
          <div className="ang-id-crown">👑</div>
          <div className="ang-id-top">
            <div className="ang-id-avatar">{inisial}</div>
            <div className="ang-id-status">{sudahLunas ? '✅ Lunas' : '⚠️ Belum Lunas'}</div>
          </div>
          <div className="ang-id-bottom">
            <span className="ang-id-label">Kartu Keluarga</span>
            <h3>{keluarga.nama}</h3>
            <div className="ang-id-member">Ketua: {keluarga.ketua}</div>
          </div>
        </div>

        <div className={`ang-alert ${sudahLunas ? 'success' : 'warning'}`}>
          <div className="icon">{sudahLunas ? '✅' : '⚠️'}</div>
          <div>
            <div className="title">
              {sudahLunas ? 'Kas Bulan Ini Sudah Lunas' : 'Kas Bulan Ini Belum Dibayar'}
            </div>
            <div className="sub">
              {sudahLunas
                ? 'Terima kasih sudah membayar tepat waktu 🙏'
                : 'Segera lakukan pembayaran sebelum jatuh tempo'}
            </div>
          </div>
        </div>

        <div className="ang-stats">
          <div className="ang-stat">
            <div className="ang-stat-icon maroon">💳</div>
            <div className="label">Total Bayar</div>
            <div className="value">{formatRupiah(totalBayar)}</div>
          </div>
          <div className="ang-stat">
            <div className="ang-stat-icon gold">🗓️</div>
            <div className="label">Kas Terakhir</div>
            <div className="value">
              {kasTerakhir
                ? new Date(kasTerakhir.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                : '-'}
            </div>
          </div>
          <div className="ang-stat">
            <div className="ang-stat-icon green">🧾</div>
            <div className="label">Transaksi</div>
            <div className="value green-text">{jumlahTransaksi}x</div>
          </div>
        </div>

        <div className="ang-panel">
          <div className="ang-panel-head">
            <h3>Acara Terdekat</h3>
          </div>
          {acaraTerdekat.length === 0 ? (
            <p className="ang-empty">Belum ada acara mendatang.</p>
          ) : (
            <div className="ang-events">
              {acaraTerdekat.map((a) => {
                const tgl = new Date(a.tanggal)
                return (
                  <div
                    className="ang-event-card"
                    key={a.id}
                    onClick={() => setAcaraDipilih(a)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="ang-event-date">
                      <span className="d">{tgl.getDate()}</span>
                      <span className="m">{NAMA_BULAN_SINGKAT[tgl.getMonth()]}</span>
                    </div>
                    <div className="ang-event-info">
                      <div className="ang-event-name">{a.nama}</div>
                      <div className="ang-event-loc">📍 {a.lokasi || '-'}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="ang-panel">
          <div className="ang-panel-head">
            <h3>Riwayat Pembayaran</h3>
          </div>
          {riwayat.length === 0 ? (
            <p className="ang-empty">Belum ada riwayat pembayaran.</p>
          ) : (
            riwayat.map((r) => (
              <div className="timeline-item" key={r.id}>
                <div className="dot">💰</div>
                <div
                  className="timeline-content"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}
                >
                  <div>
                    <div className="t-title">{r.periode || 'Kas'}</div>
                    <div className="t-sub">{new Date(r.tanggal).toLocaleDateString('id-ID')} · {r.metode}</div>
                  </div>
                  <div style={{ color: '#1DAA61', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>
                    +{formatRupiah(r.nominal)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {acaraDipilih && (
        <div className="ang-modal-overlay" onClick={() => setAcaraDipilih(null)}>
          <div className="ang-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="ang-modal-close"
              onClick={() => setAcaraDipilih(null)}
              aria-label="Tutup"
            >
              ✕
            </button>

            <div className="ang-modal-date">
              <span className="d">{new Date(acaraDipilih.tanggal).getDate()}</span>
              <span className="m">{NAMA_BULAN_SINGKAT[new Date(acaraDipilih.tanggal).getMonth()]}</span>
            </div>

            <h3 className="ang-modal-title">{acaraDipilih.nama}</h3>

            <div className="ang-modal-row">
              <span className="ang-modal-icon">🗓️</span>
              <span>
                {new Date(acaraDipilih.tanggal).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="ang-modal-row">
              <span className="ang-modal-icon">📍</span>
              <span>{acaraDipilih.lokasi || 'Lokasi belum ditentukan'}</span>
            </div>

            {acaraDipilih.deskripsi && (
              <div className="ang-modal-desc">{acaraDipilih.deskripsi}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardAnggota
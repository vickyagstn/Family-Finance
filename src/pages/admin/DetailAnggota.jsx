import { useState, useEffect } from 'react'
import './admin.css'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'
import { useToast } from '../../components/ToastContext'
import { FiArrowLeft } from 'react-icons/fi'

function statusLabel(status) {
  if (status === 'lunas') return { text: 'Lunas', cls: 'lunas' }
  if (status === 'tunggak') return { text: 'Menunggak', cls: 'tunggak' }
  return { text: 'Jatuh Tempo', cls: 'jatuh' }
}

function formatTanggal(tgl) {
  return new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatRupiah(angka) {
  return `Rp ${Number(angka).toLocaleString('id-ID')}`
}

function linkWhatsApp(noHp, ketua, nama) {
  if (!noHp) return '#'
  const nomor = '62' + noHp.replace(/-/g, '').replace(/^0/, '')
  const pesan = `Halo ${ketua}, ini pengingat kas keluarga dari Family Finance untuk ${nama}.`
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`
}

function DetailAnggota() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [keluarga, setKeluarga] = useState(null)
  const [riwayat, setRiwayat] = useState([])

  useEffect(() => {
    ambilData()
  }, [id])

  async function ambilData() {
    setLoading(true)

    const { data: dataKeluarga, error: errorKeluarga } = await supabase
      .from('anggota_keluarga')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (errorKeluarga || !dataKeluarga) {
      showToast('Data keluarga tidak ditemukan', 'error')
      navigate('/admin/anggota')
      return
    }

    setKeluarga(dataKeluarga)

    const { data: dataRiwayat } = await supabase
      .from('kas_masuk')
      .select('*')
      .eq('keluarga_id', id)
      .order('tanggal', { ascending: false })

    setRiwayat(dataRiwayat || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="dash">
        <Sidebar active="anggota" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <p style={{ color: '#8a8a92', fontSize: '13px' }}>Memuat data...</p>
        </div>
      </div>
    )
  }

  const s = statusLabel(keluarga.status)
  const totalPembayaran = riwayat.reduce((sum, r) => sum + Number(r.nominal), 0)
  const kataKedua = keluarga.nama.split(' ')[1]
  const inisial = kataKedua ? kataKedua.slice(0, 2).toUpperCase() : 'KK'

  return (
    <div className="dash">
      <Sidebar active="anggota" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <Link to="/admin/anggota" className="back-link"><FiArrowLeft /> Kembali</Link>
            <h2 style={{ marginTop: '6px' }}>Detail Keluarga</h2>
            <p>Informasi lengkap dan riwayat pembayaran</p>
          </div>
          <a
            href={linkWhatsApp(keluarga.no_hp, keluarga.ketua, keluarga.nama)}
            target="_blank"
            rel="noreferrer"
            className="btn-add"
            style={{ background: 'linear-gradient(135deg, #1DAA61, #17914f)', textDecoration: 'none' }}
          >
            Kirim WhatsApp
          </a>
        </div>

        <div className="keluarga-card" style={{ marginBottom: '20px', maxWidth: '100%' }}>
          <div className="kc-top">
            <div className="kc-avatar" style={{ width: '58px', height: '58px', fontSize: '17px' }}>{inisial}</div>
            <span className={`status-pill ${s.cls}`}>{s.text}</span>
          </div>

          <h3 style={{ fontSize: '19px' }}>{keluarga.nama}</h3>
          <p className="kc-ketua">Ketua: {keluarga.ketua}</p>

          <div className="kc-info" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div><span>Jumlah Anggota</span><b>{keluarga.jumlah_anggota || '-'} orang</b></div>
            <div><span>No. HP</span><b>{keluarga.no_hp || '-'}</b></div>
            <div><span>Alamat</span><b>{keluarga.alamat || '-'}</b></div>
          </div>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '20px' }}>
          <div className="stat-card maroon">
            <div className="icon-badge">💰</div>
            <div className="label">Total Pembayaran</div>
            <div className="value">{formatRupiah(totalPembayaran)}</div>
          </div>
          <div className="stat-card">
            <div className="icon-badge">🧾</div>
            <div className="label">Jumlah Transaksi</div>
            <div className="value">{riwayat.length}</div>
          </div>
          <div className="stat-card green">
            <div className="icon-badge">🕒</div>
            <div className="label">Kas Terakhir</div>
            <div className="value" style={{ fontSize: '15px' }}>
              {riwayat.length > 0 ? formatTanggal(riwayat[0].tanggal) : 'Belum ada'}
            </div>
          </div>
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nominal</th>
                <th>Metode</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={4}>
                    <div className="empty-state compact">
                      <div className="empty-state-icon">🧾</div>
                      <h4>Belum ada riwayat pembayaran</h4>
                      <p>Transaksi kas masuk dari keluarga ini akan tampil di sini.</p>
                    </div>
                  </td>
                </tr>
              )}
              {riwayat.map((r) => (
                <tr key={r.id}>
                  <td>{formatTanggal(r.tanggal)}</td>
                  <td style={{ color: '#1DAA61', fontWeight: 600 }}>+ {formatRupiah(r.nominal)}</td>
                  <td>{r.metode}</td>
                  <td>{r.catatan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DetailAnggota
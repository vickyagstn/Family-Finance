import { Link } from 'react-router-dom'
import './anggota.css'

const riwayat = [
  { bulan: 'Kas Bulan Juni', tanggal: '12 Jun 2026 · Transfer', nominal: '+Rp200.000' },
  { bulan: 'Kas Bulan Mei', tanggal: '10 Mei 2026 · QRIS', nominal: '+Rp200.000' },
  { bulan: 'Kas Bulan April', tanggal: '8 Apr 2026 · Tunai', nominal: '+Rp200.000' },
  { bulan: 'Kas Bulan Maret', tanggal: '5 Mar 2026 · Transfer', nominal: '+Rp200.000' },
]

function KasAnggota() {
  return (
    <div className="ang-page">
      <div className="ang-banner">
        <div className="ang-deco">💰</div>
        <div className="ang-banner-top">
          <div>
            <h2>Riwayat Kas 💰</h2>
            <p>Semua pembayaran kas kamu</p>
          </div>
          <div className="ang-notif">🔔</div>
        </div>
      </div>

      <div className="ang-stats-row" style={{ margin: '50px 4px 18px' }}>
        <div className="ang-stat-wide">
          <div className="icon-box">💳</div>
          <div className="info">
            <div className="label">Total Pembayaran</div>
            <div className="value">Rp2,4 Jt</div>
          </div>
        </div>
      </div>

      <div className="ang-panel">
        <div className="ang-panel-head">
          <h3>Semua Riwayat</h3>
        </div>
        {riwayat.map((r, i) => (
          <div className="timeline-item" key={i}>
            <div className="dot"></div>
            <div>
              <div className="t-title">{r.bulan}</div>
              <div className="t-sub">{r.tanggal}</div>
            </div>
            <div className="t-amount">{r.nominal}</div>
          </div>
        ))}
      </div>

      <div className="ang-bottomnav">
        <Link to="/anggota" className="ang-nav-item"><span className="nav-ic">🏠</span>Home</Link>
        <Link to="/anggota/kas" className="ang-nav-item active"><span className="nav-ic">💰</span>Kas</Link>
        <Link to="/anggota/acara" className="ang-nav-item"><span className="nav-ic">📅</span>Acara</Link>
        <Link to="/anggota/profil" className="ang-nav-item"><span className="nav-ic">👤</span>Profil</Link>
      </div>
    </div>
  )
}

export default KasAnggota
import { Link } from 'react-router-dom'
import './anggota.css'

function ProfilAnggota() {
  return (
    <div className="ang-page">
      <div className="ang-banner">
        <div className="ang-deco">👤</div>
        <div className="ang-banner-top">
          <div>
            <h2>Profil Saya 👤</h2>
            <p>Informasi akun kamu</p>
          </div>
          <div className="ang-notif">🔔</div>
        </div>
      </div>

      <div className="ang-balance-card">
        <div className="ang-balance-avatar">KS</div>
        <div className="ang-balance-info">
          <h3>Keluarga Santoso</h3>
          <span className="status-pill lunas">Anggota</span>
        </div>
      </div>

      <div className="ang-panel" style={{ marginTop: '50px' }}>
        <div className="ang-panel-head">
          <h3>Informasi Akun</h3>
        </div>
        <div className="timeline-item">
          <div className="dot"></div>
          <div>
            <div className="t-title">Nama Ketua Keluarga</div>
            <div className="t-sub">Budi Santoso</div>
          </div>
        </div>
        <div className="timeline-item">
          <div className="dot"></div>
          <div>
            <div className="t-title">No. HP</div>
            <div className="t-sub">0812-3456-7890</div>
          </div>
        </div>
        <div className="timeline-item">
          <div className="dot"></div>
          <div>
            <div className="t-title">Alamat</div>
            <div className="t-sub">Jl. Melati No. 12</div>
          </div>
        </div>
      </div>

      <div className="ang-panel">
        <button
          onClick={() => alert('Fitur logout segera terhubung ke Supabase')}
          style={{
            width: '100%', padding: '13px', border: 'none', borderRadius: '14px',
            background: '#fdeaea', color: '#E5484D', fontFamily: 'inherit',
            fontWeight: 600, fontSize: '13px', cursor: 'pointer',
          }}
        >
          🚪 Keluar
        </button>
      </div>

      <div className="ang-bottomnav">
        <Link to="/anggota" className="ang-nav-item"><span className="nav-ic">🏠</span>Home</Link>
        <Link to="/anggota/kas" className="ang-nav-item"><span className="nav-ic">💰</span>Kas</Link>
        <Link to="/anggota/acara" className="ang-nav-item"><span className="nav-ic">📅</span>Acara</Link>
        <Link to="/anggota/profil" className="ang-nav-item active"><span className="nav-ic">👤</span>Profil</Link>
      </div>
    </div>
  )
}

export default ProfilAnggota
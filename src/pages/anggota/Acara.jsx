import { Link } from 'react-router-dom'
import './anggota.css'

const acara = [
  { tgl: '20', bln: 'AGU', nama: 'Halal Bihalal Keluarga Besar', lokasi: 'Rumah Pak Budi' },
  { tgl: '28', bln: 'AGU', nama: 'Arisan Bulanan', lokasi: 'Rumah Bu Siti' },
  { tgl: '10', bln: 'SEP', nama: 'BBQ Keluarga', lokasi: 'Rumah Pak Agus' },
]

function AcaraAnggota() {
  return (
    <div className="ang-page">
      <div className="ang-banner">
        <div className="ang-deco">📅</div>
        <div className="ang-banner-top">
          <div>
            <h2>Jadwal Acara 📅</h2>
            <p>Acara keluarga besar mendatang</p>
          </div>
          <div className="ang-notif">🔔</div>
        </div>
      </div>

      <div className="ang-panel" style={{ marginTop: '50px' }}>
        <div className="ang-panel-head">
          <h3>Semua Acara</h3>
        </div>
        {acara.map((a, i) => (
          <div className="ang-event-row" key={i}>
            <div className="ang-event-date"><span className="d">{a.tgl}</span><span className="m">{a.bln}</span></div>
            <div>
              <div className="ang-event-name">{a.nama}</div>
              <div className="ang-event-sub">📍 {a.lokasi}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ang-bottomnav">
        <Link to="/anggota" className="ang-nav-item"><span className="nav-ic">🏠</span>Home</Link>
        <Link to="/anggota/kas" className="ang-nav-item"><span className="nav-ic">💰</span>Kas</Link>
        <Link to="/anggota/acara" className="ang-nav-item active"><span className="nav-ic">📅</span>Acara</Link>
        <Link to="/anggota/profil" className="ang-nav-item"><span className="nav-ic">👤</span>Profil</Link>
      </div>
    </div>
  )
}

export default AcaraAnggota
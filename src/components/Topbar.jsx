function Topbar({ title, subtitle, onMenuClick }) {
  return (
    <div className="topbar-new">
      <div className="topbar-left">
        <span className="hamburger" onClick={onMenuClick}>☰</span>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        <input className="topbar-search" type="text" placeholder="Cari keluarga, transaksi, acara..." />
        <div className="topbar-profile">
          <div className="tp-avatar">AD</div>
          <div>
            <div className="tp-name">Admin</div>
            <div className="tp-role">Super Admin</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Topbar
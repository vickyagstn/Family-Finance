import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function formatRupiah(angka) {
  return `Rp${Number(angka).toLocaleString('id-ID')}`
}

function Sidebar({ active, isOpen, onClose }) {
  const navigate = useNavigate()
  const [saldo, setSaldo] = useState(null)
  const [loadingSaldo, setLoadingSaldo] = useState(true)

  useEffect(() => {
    ambilSaldo()
  }, [])

  async function ambilSaldo() {
    setLoadingSaldo(true)

    const { data: dataMasuk } = await supabase.from('kas_masuk').select('nominal')
    const { data: dataKeluar } = await supabase.from('kas_keluar').select('nominal')

    const totalMasuk = (dataMasuk || []).reduce((sum, r) => sum + Number(r.nominal), 0)
    const totalKeluar = (dataKeluar || []).reduce((sum, r) => sum + Number(r.nominal), 0)

    setSaldo(totalMasuk - totalKeluar)
    setLoadingSaldo(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const menu = [
    { key: 'dashboard', label: 'Dashboard', icon: '🏠', to: '/admin' },
    { key: 'anggota', label: 'Anggota Keluarga', icon: '👪', to: '/admin/anggota' },
    { key: 'kas-masuk', label: 'Kas Masuk', icon: '💰', to: '/admin/kas-masuk' },
    { key: 'kas-keluar', label: 'Kas Keluar', icon: '💸', to: '/admin/kas-keluar' },
    { key: 'pengingat', label: 'Pengingat', icon: '🔔', to: '/admin/pengingat' },
    { key: 'acara', label: 'Jadwal Acara', icon: '📅', to: '/admin/acara' },
    { key: 'laporan', label: 'Laporan', icon: '📊', to: '/admin/laporan' },
    { key: 'pengaturan', label: 'Pengaturan', icon: '⚙️', to: '/admin/pengaturan' },
  ]

  return (
    <>
      {isOpen && <div className="sd-overlay" onClick={onClose}></div>}

      <div className={`sidebar-dark ${isOpen ? 'open' : ''}`}>
        <div className="sd-brand-row">
        <div className="sd-brand">Family Finance</div>
          <span className="sd-close" onClick={onClose}>✕</span>
        </div>

        <div className="sd-menu">
          {menu.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`sd-item ${active === item.key ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sd-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="sd-saldo-card">
          <div className="sd-saldo-label">Saldo Kas</div>
          <div className="sd-saldo-value">
            {loadingSaldo ? 'Memuat...' : formatRupiah(saldo)}
          </div>
          {!loadingSaldo && (
            <div className="sd-saldo-tag">
              {saldo >= 0 ? '✔ Surplus' : '⚠ Minus'}
            </div>
          )}
        </div>

        <div className="sd-profile">
          <div className="sd-avatar">AD</div>
          <div>
            <div className="sd-profile-name">Admin</div>
            <div className="sd-profile-role">Super Admin</div>
          </div>
        </div>

        <div className="sd-logout" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          🚪 Keluar
        </div>
      </div>
    </>
  )
}

export default Sidebar
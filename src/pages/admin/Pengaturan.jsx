import { useState } from 'react'
import './admin.css'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

function Pengaturan() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const [nama, setNama] = useState('Admin')
  const [email, setEmail] = useState('admin@rinfamily.com')
  const [hp, setHp] = useState('0812-0000-0000')

  const [passLama, setPassLama] = useState('')
  const [passBaru, setPassBaru] = useState('')
  const [passKonfirmasi, setPassKonfirmasi] = useState('')

  function simpanProfil(e) {
    e.preventDefault()
    alert('Profil berhasil disimpan (masih data sementara, belum terhubung Supabase)')
  }

  function gantiPassword(e) {
    e.preventDefault()

    if (!passLama || !passBaru || !passKonfirmasi) {
      alert('Semua kolom password wajib diisi')
      return
    }

    if (passBaru !== passKonfirmasi) {
      alert('Konfirmasi password baru tidak cocok')
      return
    }

    alert('Password berhasil diganti (masih data sementara, belum terhubung Supabase)')
    setPassLama('')
    setPassBaru('')
    setPassKonfirmasi('')
  }

  function logout() {
    const yakin = window.confirm('Yakin ingin keluar dari akun?')
    if (yakin) {
      navigate('/')
    }
  }

  return (
    <div className="dash">
      <Sidebar active="pengaturan" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Pengaturan</h2>
            <p>Kelola profil dan keamanan akun admin</p>
          </div>
        </div>

        <div className="main-grid-2">
          <div className="panel">
            <h3>Edit Profil</h3>

            <div className="profile-photo-row">
              <div className="profile-photo">AD</div>
              <div>
                <button className="btn-cancel" style={{ padding: '9px 16px', fontSize: '12px' }} type="button">
                  Ganti Foto
                </button>
                <p className="profile-photo-hint">JPG atau PNG, maks 2MB</p>
              </div>
            </div>

            <form onSubmit={simpanProfil}>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>No. HP</label>
                <input
                  type="text"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">Simpan Perubahan</button>
              </div>
            </form>
          </div>

          <div>
            <div className="panel">
              <h3>Ganti Password</h3>

              <form onSubmit={gantiPassword}>
                <div className="form-group">
                  <label>Password Lama</label>
                  <input
                    type="password"
                    placeholder="Masukkan password lama"
                    value={passLama}
                    onChange={(e) => setPassLama(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Password Baru</label>
                  <input
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={passBaru}
                    onChange={(e) => setPassBaru(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    placeholder="Ulangi password baru"
                    value={passKonfirmasi}
                    onChange={(e) => setPassKonfirmasi(e.target.value)}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save">Ganti Password</button>
                </div>
              </form>
            </div>

            <div className="panel logout-panel">
              <h3>Keluar Akun</h3>
              <p className="logout-desc">
                Kamu akan keluar dari sesi admin dan diarahkan kembali ke halaman login.
              </p>
              <button className="btn-logout" onClick={logout}>
                Keluar dari Akun
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pengaturan
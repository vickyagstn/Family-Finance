import { useState } from 'react'
import './Login.css'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')

    if (!email || !password) {
      setError('Email dan password wajib diisi')
      return
    }

    setLoading(true)

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    const userId = data.user.id

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    setLoading(false)

    if (profileError || !profile) {
      setError('Profil tidak ditemukan, hubungi admin')
      return
    }

    if (profile.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/anggota')
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-deco">💰</div>
        <div className="login-left-content">
          <div className="login-badge-big">💰</div>
          <h1>Family <span>Finance</span></h1>
          <p>Kelola kas keluarga besar dengan mudah, transparan, dan aman — semua dalam satu aplikasi.</p>

          <div className="login-feature-list">
            <div className="login-feature-item">
              <span className="login-feature-icon">📊</span>
              Pantau kas masuk & keluar secara real-time
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">🔔</span>
              Pengingat pembayaran otomatis
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">🔒</span>
              Data keluarga aman dan privat
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Selamat Datang</h2>
            <p className="subtitle">Masuk untuk mengakses akun kamu</p>
          </div>

          <div className="field">
            <label>Email</label>
            <div className="field-wrap">
              <span className="field-icon">✉️</span>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="field-wrap">
              <span className="field-icon">🔒</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <div className="row-between">
            <label className="remember">
              <input type="checkbox" /> Ingat saya
            </label>
            <a href="#">Lupa Password?</a>
          </div>

          <button className="btn-primary" onClick={handleLogin} disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
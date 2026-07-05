import { useState } from 'react'
import './Login.css'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ingatSaya, setIngatSaya] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email dan password wajib diisi')
      return
    }

    setLoading(true)

    // 1. Login ke Supabase Auth
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('LOGIN RESULT:', data, loginError)

    if (loginError) {
      setLoading(false)
      setError('Email atau password salah')
      return
    }

    const userId = data.user.id
    console.log('USER ID YANG LOGIN:', userId)

    // 2. Cek apakah ini akun Admin
    const { data: dataAdmin, error: errorAdmin } = await supabase
      .from('profil_admin')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    console.log('HASIL CEK PROFIL_ADMIN:', dataAdmin, errorAdmin)

    if (dataAdmin) {
      setLoading(false)
      navigate('/admin')
      return
    }

    // 3. Kalau bukan admin, cek apakah ini akun Anggota
    const { data: dataKeluarga, error: errorKeluarga } = await supabase
      .from('keluarga')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    console.log('HASIL CEK KELUARGA:', dataKeluarga, errorKeluarga)

    setLoading(false)

    if (dataKeluarga) {
      navigate('/anggota')
      return
    }

    // 4. Kalau dua-duanya gak ketemu, akun belum terhubung ke data manapun
    setError('Akun ini belum dihubungkan ke data admin atau keluarga. Hubungi pengurus.')
    await supabase.auth.signOut()
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>RIN Family Finance</h1>
        <p>Kelola kas keluarga dengan mudah, transparan, dan aman.</p>

        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <div className="row-between">
            <label className="remember">
              <input
                type="checkbox"
                checked={ingatSaya}
                onChange={(e) => setIngatSaya(e.target.checked)}
              /> Ingat saya
            </label>
            <a href="#">Lupa Password?</a>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
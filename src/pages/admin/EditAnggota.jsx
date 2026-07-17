import { useState, useEffect } from 'react'
import './admin.css'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'
import { useToast } from '../../components/ToastContext'

function EditAnggota() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [menyimpan, setMenyimpan] = useState(false)

  const [nama, setNama] = useState('')
  const [ketua, setKetua] = useState('')
  const [jumlahAnggota, setJumlahAnggota] = useState('')
  const [noHp, setNoHp] = useState('')
  const [alamat, setAlamat] = useState('')
  const [status, setStatus] = useState('jatuh')

  useEffect(() => {
    ambilData()
  }, [id])

  async function ambilData() {
    setLoading(true)
    const { data, error } = await supabase.from('anggota_keluarga').select('*').eq('id', id).maybeSingle()

    if (error || !data) {
      showToast('Data keluarga tidak ditemukan', 'error')
      navigate('/admin/anggota')
      return
    }

    setNama(data.nama || '')
    setKetua(data.ketua || '')
    setJumlahAnggota(data.jumlah_anggota || '')
    setNoHp(data.no_hp || '')
    setAlamat(data.alamat || '')
    setStatus(data.status || 'jatuh')
    setLoading(false)
  }

  async function simpan(e) {
    e.preventDefault()

    if (!nama || !ketua) {
      showToast('Nama keluarga dan nama ketua wajib diisi', 'warning')
      return
    }

    setMenyimpan(true)

    const { error } = await supabase
      .from('anggota_keluarga')
      .update({
        nama,
        ketua,
        jumlah_anggota: jumlahAnggota ? Number(jumlahAnggota) : 1,
        no_hp: noHp || null,
        alamat: alamat || null,
        status,
      })
      .eq('id', id)

    setMenyimpan(false)

    if (error) {
      showToast('Gagal menyimpan: ' + error.message, 'error')
      return
    }

    showToast('Perubahan berhasil disimpan', 'success')
    navigate('/admin/anggota')
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

  return (
    <div className="dash">
      <Sidebar active="anggota" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Edit Anggota</h2>
            <p>Perbarui data keluarga</p>
          </div>
        </div>

        <form className="form-card" onSubmit={simpan}>
          <div className="form-group">
            <label>Nama Keluarga</label>
            <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Nama Ketua Keluarga</label>
            <input type="text" value={ketua} onChange={(e) => setKetua(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Jumlah Anggota</label>
            <input
              type="number"
              value={jumlahAnggota}
              onChange={(e) => setJumlahAnggota(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>No. HP / WhatsApp</label>
            <input type="text" value={noHp} onChange={(e) => setNoHp(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Alamat</label>
            <input type="text" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Status Pembayaran</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="lunas">Lunas</option>
              <option value="jatuh">Jatuh Tempo</option>
              <option value="tunggak">Menunggak</option>
            </select>
          </div>

          <div className="form-actions">
            <Link to="/admin/anggota" className="btn-cancel">Batal</Link>
            <button type="submit" className="btn-save" disabled={menyimpan}>
              {menyimpan ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditAnggota
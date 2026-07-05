import { useState } from 'react'
import './admin.css'
import { useNavigate, Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

function TambahAnggota() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menyimpan, setMenyimpan] = useState(false)

  const [nama, setNama] = useState('')
  const [ketua, setKetua] = useState('')
  const [jumlahAnggota, setJumlahAnggota] = useState('')
  const [noHp, setNoHp] = useState('')
  const [alamat, setAlamat] = useState('')

  async function simpan(e) {
    e.preventDefault()

    if (!nama || !ketua) {
      alert('Nama keluarga dan nama ketua wajib diisi')
      return
    }

    setMenyimpan(true)

    const { error } = await supabase.from('keluarga').insert({
      nama,
      ketua,
      jumlah_anggota: jumlahAnggota ? Number(jumlahAnggota) : 1,
      no_hp: noHp || null,
      alamat: alamat || null,
      status: 'jatuh',
    })

    setMenyimpan(false)

    if (error) {
      alert('Gagal menyimpan: ' + error.message)
      return
    }

    navigate('/admin/anggota')
  }

  return (
    <div className="dash">
      <Sidebar active="anggota" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Tambah Anggota</h2>
            <p>Daftarkan keluarga baru ke sistem</p>
          </div>
        </div>

        <form className="form-card" onSubmit={simpan}>
          <div className="form-group">
            <label>Nama Keluarga</label>
            <input
              type="text"
              placeholder="Contoh: Keluarga Santoso"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Nama Ketua Keluarga</label>
            <input
              type="text"
              placeholder="Contoh: Budi Santoso"
              value={ketua}
              onChange={(e) => setKetua(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Jumlah Anggota</label>
            <input
              type="number"
              placeholder="Contoh: 4"
              value={jumlahAnggota}
              onChange={(e) => setJumlahAnggota(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>No. HP / WhatsApp</label>
            <input
              type="text"
              placeholder="Contoh: 0812-3456-7890"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Alamat</label>
            <input
              type="text"
              placeholder="Contoh: Jl. Melati No. 12"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <Link to="/admin/anggota" className="btn-cancel">Batal</Link>
            <button type="submit" className="btn-save" disabled={menyimpan}>
              {menyimpan ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TambahAnggota
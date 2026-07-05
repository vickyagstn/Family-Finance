import { useState, useEffect } from 'react'
import './admin.css'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'
import { useToast } from '../../components/ToastContext'

function statusLabel(status) {
  if (status === 'lunas') return { text: 'Lunas', cls: 'lunas' }
  if (status === 'tunggak') return { text: 'Menunggak', cls: 'tunggak' }
  return { text: 'Jatuh Tempo', cls: 'jatuh' }
}

function linkWhatsApp(k) {
  if (!k.no_hp) return '#'
  const nomor = '62' + k.no_hp.replace(/-/g, '').replace(/^0/, '')
  const pesan = `Halo ${k.ketua}, ini pengingat kas keluarga dari RIN Family Finance.`
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`
}

function AnggotaKeluarga() {
  const { showToast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState('semua')
  const [search, setSearch] = useState('')
  const [dataKeluarga, setDataKeluarga] = useState([])
  const [loading, setLoading] = useState(true)
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(null)

  useEffect(() => {
    ambilData()
  }, [])

  async function ambilData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('keluarga')
      .select('*')
      .order('nama', { ascending: true })

    if (error) {
      showToast('Gagal mengambil data: ' + error.message, 'error')
    } else {
      setDataKeluarga(data)
    }
    setLoading(false)
  }

  async function konfirmasiHapusSekarang() {
    const { id, nama } = konfirmasiHapus
    setKonfirmasiHapus(null)

    const { error } = await supabase.from('keluarga').delete().eq('id', id)

    if (error) {
      showToast('Gagal menghapus: ' + error.message, 'error')
    } else {
      setDataKeluarga((prev) => prev.filter((k) => k.id !== id))
      showToast(`"${nama}" berhasil dihapus`, 'success')
    }
  }

  const filterList = [
    { key: 'semua', label: 'Semua' },
    { key: 'lunas', label: 'Lunas' },
    { key: 'jatuh', label: 'Belum Bayar' },
    { key: 'tunggak', label: 'Menunggak' },
  ]

  const dataTampil = dataKeluarga.filter((k) => {
    const cocokFilter = filter === 'semua' || k.status === filter
    const cocokSearch = k.nama.toLowerCase().includes(search.toLowerCase())
    return cocokFilter && cocokSearch
  })

  return (
    <div className="dash">
      <Sidebar active="anggota" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Anggota Keluarga</h2>
            <p>Kelola data seluruh keluarga besar</p>
          </div>
          <Link to="/admin/anggota/tambah" className="btn-add">＋ Tambah Anggota</Link>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Cari nama keluarga..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filter-group">
            {filterList.map((f) => (
              <button
                key={f.key}
                className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p style={{ color: '#8a8a92', fontSize: '13px' }}>Memuat data...</p>}

        {!loading && (
          <div className="keluarga-grid">
            {dataTampil.length === 0 && (
              <p style={{ color: '#8a8a92', fontSize: '13px', gridColumn: '1 / -1' }}>
                Tidak ada keluarga yang cocok.
              </p>
            )}

            {dataTampil.map((k) => {
              const s = statusLabel(k.status)
              const kataKedua = k.nama.split(' ')[1]
              const inisial = kataKedua ? kataKedua.slice(0, 2).toUpperCase() : 'KK'

              return (
                <div className="keluarga-card" key={k.id}>
                  <div className="kc-top">
                    <div className="kc-avatar">{inisial}</div>
                    <span className={`status-pill ${s.cls}`}>{s.text}</span>
                  </div>

                  <h3>{k.nama}</h3>
                  <p className="kc-ketua">Ketua: {k.ketua}</p>

                  <div className="kc-info">
                    <div><span>Jumlah Anggota</span><b>{k.jumlah_anggota || '-'} orang</b></div>
                    <div><span>No. HP</span><b>{k.no_hp || '-'}</b></div>
                    <div><span>Alamat</span><b>{k.alamat || '-'}</b></div>
                  </div>

                  <div className="kc-actions">
                    <Link
                      to={`/admin/anggota/${k.id}`}
                      className="ac-btn"
                      style={{ textDecoration: 'none', textAlign: 'center' }}
                    >
                      Detail
                    </Link>
                    <Link
                      to={`/admin/anggota/edit/${k.id}`}
                      className="ac-btn"
                      style={{ textDecoration: 'none', textAlign: 'center' }}
                    >
                      Edit
                    </Link>
                    <a
                      href={linkWhatsApp(k)}
                      target="_blank"
                      rel="noreferrer"
                      className="ac-btn wa"
                      style={{ textDecoration: 'none', textAlign: 'center' }}
                    >
                      WhatsApp
                    </a>
                    <button
                      className="ac-btn"
                      style={{ color: '#E5484D', borderColor: '#fbdada', background: '#fdeaea' }}
                      onClick={() => setKonfirmasiHapus({ id: k.id, nama: k.nama })}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {konfirmasiHapus && (
        <div className="modal-overlay" onClick={() => setKonfirmasiHapus(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#E5484D' }}>Hapus Keluarga?</h3>
            <p className="modal-sub">
              Kamu yakin mau hapus <b>{konfirmasiHapus.nama}</b>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setKonfirmasiHapus(null)}>Batal</button>
              <button
                className="btn-save"
                style={{ background: 'linear-gradient(135deg, #E5484D, #c93940)' }}
                onClick={konfirmasiHapusSekarang}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnggotaKeluarga
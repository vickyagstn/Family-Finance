import { useState, useEffect } from 'react'
import './admin.css'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

const filterList = [
  { key: 'semua', label: 'Semua' },
  { key: 'jatuh', label: 'Jatuh Tempo' },
  { key: 'tunggak', label: 'Menunggak' },
  { key: 'lunas', label: 'Lunas' },
]

function statusLabel(status) {
  if (status === 'tunggak') return { text: 'Menunggak', cls: 'tunggak' }
  if (status === 'lunas') return { text: 'Lunas', cls: 'lunas' }
  return { text: 'Jatuh Tempo', cls: 'jatuh' }
}

function buatPesanDefault(k) {
  return `Halo ${k.ketua}, ini pengingat dari Family Finance.\n\nMohon segera melakukan pembayaran kas keluarga ${k.nama}. Terima kasih 🙏`
}

function linkWhatsApp(noHp, pesan) {
  if (!noHp) return '#'
  const nomor = '62' + noHp.replace(/-/g, '').replace(/^0/, '')
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`
}

function Pengingat() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dataKeluarga, setDataKeluarga] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('semua')
  const [keluargaTerpilih, setKeluargaTerpilih] = useState(null)
  const [pesan, setPesan] = useState('')

  useEffect(() => {
    ambilData()
  }, [])

  async function ambilData() {
    setLoading(true)
    const { data, error } = await supabase.from('anggota_keluarga').select('*').order('nama')
    if (error) {
      console.error('Gagal ambil data keluarga:', error)
    } else {
      setDataKeluarga(data)
    }
    setLoading(false)
  }

  const dataTampil = dataKeluarga.filter((k) => {
    if (filter === 'semua') return k.status !== 'lunas'
    return k.status === filter
  })

  function bukaEditPesan(k) {
    setKeluargaTerpilih(k)
    setPesan(buatPesanDefault(k))
  }

  function tutupModal() {
    setKeluargaTerpilih(null)
    setPesan('')
  }

  function kirimWhatsApp() {
    window.open(linkWhatsApp(keluargaTerpilih.no_hp, pesan), '_blank')
    tutupModal()
  }

  async function tandaiLunas(id) {
    const { error } = await supabase.from('anggota_keluarga').update({ status: 'lunas' }).eq('id', id)
    if (error) {
      alert('Gagal update status: ' + error.message)
      return
    }
    setDataKeluarga((prev) => prev.map((k) => (k.id === id ? { ...k, status: 'lunas' } : k)))
  }

  async function tandaiBelumBayar(id) {
    const { error } = await supabase.from('anggota_keluarga').update({ status: 'jatuh' }).eq('id', id)
    if (error) {
      alert('Gagal update status: ' + error.message)
      return
    }
    setDataKeluarga((prev) => prev.map((k) => (k.id === id ? { ...k, status: 'jatuh' } : k)))
  }

  return (
    <div className="dash">
      <Sidebar active="pengingat" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Pengingat Pembayaran</h2>
            <p>Kirim pengingat kas ke keluarga yang belum bayar</p>
          </div>
        </div>

        <div className="toolbar">
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
          <div className="panel">
            {dataTampil.length === 0 && (
              <div className="empty-state compact">
                <div className="empty-state-icon">🔔</div>
                <h4>Tidak ada keluarga di kategori ini</h4>
                <p>Coba pilih kategori lain, atau semua keluarga di sini sudah lunas.</p>
              </div>
            )}

            {dataTampil.map((k) => {
              const s = statusLabel(k.status)
              const kataKedua = k.nama.split(' ')[1]
              const inisial = kataKedua ? kataKedua.slice(0, 2).toUpperCase() : 'KK'
              const sudahLunas = k.status === 'lunas'

              return (
                <div className="reminder-card" key={k.id}>
                  <div className="reminder-avatar">{inisial}</div>
                  <div className="reminder-info">
                    <div className="reminder-name">{k.nama}</div>
                    <div className="reminder-sub">Ketua: {k.ketua}</div>
                  </div>
                  <span className={`status-pill ${s.cls}`}>{s.text}</span>

                  <label className="lunas-toggle">
                    <input
                      type="checkbox"
                      checked={sudahLunas}
                      onChange={() =>
                        sudahLunas ? tandaiBelumBayar(k.id) : tandaiLunas(k.id)
                      }
                    />
                    <span>Lunas</span>
                  </label>

                  {!sudahLunas && (
                    <button className="btn-wa-small" onClick={() => bukaEditPesan(k)}>
                      Kirim WhatsApp
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {keluargaTerpilih && (
        <div className="modal-overlay" onClick={tutupModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Kirim Pengingat ke {keluargaTerpilih.nama}</h3>
            <p className="modal-sub">Edit teks pesan sebelum dikirim ke WhatsApp</p>

            <textarea
              className="modal-textarea"
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              rows={7}
            />

            <div className="form-actions">
              <button className="btn-cancel" onClick={tutupModal}>Batal</button>
              <button className="btn-save" onClick={kirimWhatsApp}>Kirim via WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pengingat
import { useState, useEffect } from 'react'
import './admin.css'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

function formatTanggal(tgl) {
  return new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatRupiah(angka) {
  return `Rp ${Number(angka).toLocaleString('id-ID')}`
}

// ubah "2026-06-29T00:00:00" -> "2026-06-29" (format yang dipakai <input type="date">)
function toInputDate(tgl) {
  if (!tgl) return ''
  return new Date(tgl).toISOString().split('T')[0]
}

const METODE_OPTIONS = ['Tunai', 'Transfer Bank', 'QRIS', 'Lainnya']

function KasMasuk() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dataKasMasuk, setDataKasMasuk] = useState([])
  const [loading, setLoading] = useState(true)

  // ==== state untuk modal edit ====
  const [editRow, setEditRow] = useState(null) // null = modal tertutup
  const [editTanggal, setEditTanggal] = useState('')
  const [editNominal, setEditNominal] = useState('')
  const [editMetode, setEditMetode] = useState('')
  const [menyimpanEdit, setMenyimpanEdit] = useState(false)

  // ==== state untuk proses hapus ====
  const [menghapusId, setMenghapusId] = useState(null)

  useEffect(() => {
    ambilData()
  }, [])

  async function ambilData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('kas_masuk')
      .select('*, keluarga(nama)')
      .order('tanggal', { ascending: false })

    if (error) {
      console.error('Gagal ambil data kas masuk:', error)
    } else {
      setDataKasMasuk(data)
    }
    setLoading(false)
  }

  const dataTampil = dataKasMasuk.filter((row) => {
    const nama = row.keluarga?.nama || ''
    return nama.toLowerCase().includes(search.toLowerCase())
  })

  const totalNominal = dataTampil.reduce((sum, row) => sum + Number(row.nominal), 0)

  // ==== BUKA MODAL EDIT, isi form dengan data baris yang dipilih ====
  function bukaEdit(row) {
    setEditRow(row)
    setEditTanggal(toInputDate(row.tanggal))
    setEditNominal(row.nominal)
    setEditMetode(row.metode || 'Tunai')
  }

  function tutupEdit() {
    setEditRow(null)
  }

  // ==== SIMPAN PERUBAHAN EDIT ====
  async function simpanEdit(e) {
    e.preventDefault()

    if (!editTanggal || !editNominal) {
      alert('Tanggal dan nominal wajib diisi')
      return
    }

    setMenyimpanEdit(true)

    const { error } = await supabase
      .from('kas_masuk')
      .update({
        tanggal: editTanggal,
        nominal: Number(editNominal),
        metode: editMetode,
      })
      .eq('id', editRow.id)

    setMenyimpanEdit(false)

    if (error) {
      alert('Gagal menyimpan perubahan: ' + error.message)
      return
    }

    setEditRow(null)
    ambilData() // refresh tabel
  }

  // ==== HAPUS BARIS ====
  async function hapusBaris(row) {
    const namaKeluarga = row.keluarga?.nama || 'transaksi ini'
    const konfirmasi = window.confirm(
      `Yakin mau hapus transaksi ${namaKeluarga} sebesar ${formatRupiah(row.nominal)}?\nTindakan ini tidak bisa dibatalkan.`
    )
    if (!konfirmasi) return

    setMenghapusId(row.id)

    const { error } = await supabase.from('kas_masuk').delete().eq('id', row.id)

    setMenghapusId(null)

    if (error) {
      alert('Gagal menghapus data: ' + error.message)
      return
    }

    ambilData() // refresh tabel
  }

  return (
    <div className="dash">
      <Sidebar active="kas-masuk" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Kas Masuk</h2>
            <p>Daftar seluruh pemasukan kas keluarga</p>
          </div>
          <Link to="/admin/kas-masuk/tambah" className="btn-add">＋ Tambah Pembayaran</Link>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Cari nama keluarga..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '20px' }}>
          <div className="stat-card maroon">
            <div className="icon-badge">💰</div>
            <div className="label">Total Kas Masuk</div>
            <div className="value">{formatRupiah(totalNominal)}</div>
          </div>
          <div className="stat-card green">
            <div className="icon-badge">🧾</div>
            <div className="label">Jumlah Transaksi</div>
            <div className="value">{dataTampil.length}</div>
          </div>
        </div>

        {loading && <p style={{ color: '#8a8a92', fontSize: '13px' }}>Memuat data...</p>}

        {!loading && (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nama Keluarga</th>
                  <th>Nominal</th>
                  <th>Metode Pembayaran</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dataTampil.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan={5}>Belum ada transaksi kas masuk.</td>
                  </tr>
                )}

                {dataTampil.map((row) => (
                  <tr key={row.id}>
                    <td>{formatTanggal(row.tanggal)}</td>
                    <td>{row.keluarga?.nama || '(keluarga dihapus)'}</td>
                    <td style={{ color: '#1DAA61', fontWeight: 600 }}>+ {formatRupiah(row.nominal)}</td>
                    <td>{row.metode}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => bukaEdit(row)}
                          title="Edit transaksi"
                          style={{
                            border: 'none', background: '#FFF4D6', color: '#B8860B',
                            borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '13px',
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => hapusBaris(row)}
                          disabled={menghapusId === row.id}
                          title="Hapus transaksi"
                          style={{
                            border: 'none', background: '#FDE2E2', color: '#E5484D',
                            borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '13px',
                          }}
                        >
                          {menghapusId === row.id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==== MODAL EDIT ==== */}
      {editRow && (
        <div
          onClick={tutupEdit}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="form-card"
            style={{ width: '100%', maxWidth: '420px', margin: '16px' }}
          >
            <h3 style={{ marginTop: 0 }}>Edit Transaksi — {editRow.keluarga?.nama || ''}</h3>

            <form onSubmit={simpanEdit}>
              <div className="form-group">
                <label>Tanggal</label>
                <input
                  type="date"
                  value={editTanggal}
                  onChange={(e) => setEditTanggal(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Nominal</label>
                <input
                  type="number"
                  placeholder="Contoh: 150000"
                  value={editNominal}
                  onChange={(e) => setEditNominal(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Metode Pembayaran</label>
                <select value={editMetode} onChange={(e) => setEditMetode(e.target.value)}>
                  {METODE_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={tutupEdit}>
                  Batal
                </button>
                <button type="submit" className="btn-save" disabled={menyimpanEdit}>
                  {menyimpanEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default KasMasuk
import { useState, useRef, useEffect } from 'react'
import './admin.css'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { supabase } from '../../supabaseClient'
import { generateInsight } from '../../utils/insightLaporan'

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const NAMA_BULAN_SINGKAT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

function formatRupiah(angka) {
  return 'Rp' + (angka || 0).toLocaleString('id-ID')
}

// "2026-06-18" -> "18 Jun 2026"
function formatTanggalSingkat(tanggalIso) {
  if (!tanggalIso) return '-'
  const d = new Date(tanggalIso)
  return `${d.getDate()} ${NAMA_BULAN_SINGKAT[d.getMonth()]} ${d.getFullYear()}`
}

// "2026-06-18" -> "Juni 2026"  (dipakai sebagai key pengelompokan per bulan)
function keyBulan(tanggalIso) {
  const d = new Date(tanggalIso)
  return `${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`
}

function Laporan() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [periode, setPeriode] = useState('Semua')
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const [kasMasuk, setKasMasuk] = useState([])
  const [kasKeluar, setKasKeluar] = useState([])

  const [analisis, setAnalisis] = useState(null)
  const [sedangGenerate, setSedangGenerate] = useState(false)

  const laporanRef = useRef(null)

  useEffect(() => {
    ambilData()
  }, [])

  async function ambilData() {
    setLoading(true)
    setErrorMsg('')

    const [resMasuk, resKeluar] = await Promise.all([
      supabase.from('kas_masuk').select('*').order('tanggal', { ascending: true }),
      supabase.from('kas_keluar').select('*').order('tanggal', { ascending: true }),
    ])

    if (resMasuk.error) setErrorMsg('Gagal memuat kas masuk: ' + resMasuk.error.message)
    if (resKeluar.error) setErrorMsg((prev) => prev + ' | Gagal memuat kas keluar: ' + resKeluar.error.message)

    setKasMasuk(resMasuk.data || [])
    setKasKeluar(resKeluar.data || [])
    setLoading(false)
  }

  // ==== OLAH DATA: kelompokkan kas_masuk & kas_keluar per bulan ====
  const dataPemasukanBulanan = (() => {
    const map = {}

    kasMasuk.forEach((d) => {
      const bulan = keyBulan(d.tanggal)
      if (!map[bulan]) map[bulan] = { bulan, total: 0, jumlahTransaksi: 0, keluar: 0 }
      map[bulan].total += Number(d.nominal) || 0
      map[bulan].jumlahTransaksi += 1
    })

    kasKeluar.forEach((d) => {
      const bulan = keyBulan(d.tanggal)
      if (!map[bulan]) map[bulan] = { bulan, total: 0, jumlahTransaksi: 0, keluar: 0 }
      map[bulan].keluar += Number(d.nominal) || 0
    })

    // urutkan berdasarkan tanggal asli (bukan alfabet)
    return Object.values(map).sort((a, b) => {
      const [bA, tA] = a.bulan.split(' ')
      const [bB, tB] = b.bulan.split(' ')
      const dA = new Date(`${NAMA_BULAN.indexOf(bA) + 1}/1/${tA}`)
      const dB = new Date(`${NAMA_BULAN.indexOf(bB) + 1}/1/${tB}`)
      return dA - dB
    })
  })()

  // ==== OLAH DATA: rincian pengeluaran per baris (untuk tabel) ====
  const dataPengeluaran = kasKeluar
    .slice()
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)) // terbaru dulu
    .map((d) => ({
      bulan: keyBulan(d.tanggal),
      tanggal: formatTanggalSingkat(d.tanggal),
      keterangan: d.keterangan,
      kategori: d.kategori,
      nominal: Number(d.nominal) || 0,
    }))

  const pemasukanTampil =
    periode === 'Semua' ? dataPemasukanBulanan : dataPemasukanBulanan.filter((d) => d.bulan === periode)

  const pengeluaranTampil =
    periode === 'Semua' ? dataPengeluaran : dataPengeluaran.filter((d) => d.bulan === periode)

  const totalMasuk = pemasukanTampil.reduce((sum, d) => sum + d.total, 0)
  const totalKeluar =
    periode === 'Semua'
      ? pemasukanTampil.reduce((sum, d) => sum + d.keluar, 0)
      : pengeluaranTampil.reduce((sum, d) => sum + d.nominal, 0)
  const saldoBersih = totalMasuk - totalKeluar

  async function exportPDF() {
    const elemen = laporanRef.current
    const canvas = await html2canvas(elemen, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const lebarPdf = 210
    const tinggiPdf = (canvas.height * lebarPdf) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, lebarPdf, tinggiPdf)
    pdf.save(`Laporan-RIN-Family-Finance-${periode}.pdf`)
  }

  function exportExcel() {
    const sheetPemasukan = XLSX.utils.json_to_sheet(
      pemasukanTampil.map((d) => ({
        Bulan: d.bulan,
        'Total Pemasukan': d.total,
        'Jumlah Transaksi': d.jumlahTransaksi,
      }))
    )
    const sheetPengeluaran = XLSX.utils.json_to_sheet(
      pengeluaranTampil.map((d) => ({
        Tanggal: d.tanggal,
        Keterangan: d.keterangan,
        Kategori: d.kategori,
        Nominal: d.nominal,
      }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheetPemasukan, 'Pemasukan')
    XLSX.utils.book_append_sheet(workbook, sheetPengeluaran, 'Pengeluaran')
    XLSX.writeFile(workbook, `Laporan-RIN-Family-Finance-${periode}.xlsx`)
  }

  // ==== ANALISIS OTOMATIS (rule-based, gratis, tanpa API key) ====
  function handleGenerateAnalisis() {
    if (dataPemasukanBulanan.length === 0) {
      alert('Belum ada data yang cukup untuk dianalisis.')
      return
    }

    setSedangGenerate(true)

    // ambil 2 bulan terakhir (data sudah terurut kronologis menaik)
    const bulanIniData = dataPemasukanBulanan[dataPemasukanBulanan.length - 1]
    const bulanLaluData =
      dataPemasukanBulanan.length > 1
        ? dataPemasukanBulanan[dataPemasukanBulanan.length - 2]
        : { total: 0, keluar: 0 }

    const transaksiBulanIni = dataPengeluaran
      .filter((d) => d.bulan === bulanIniData.bulan)
      .map((d) => ({ kategori: d.kategori, jumlah: d.nominal }))

    // beri jeda sedikit biar terasa "memproses" (opsional, murni UX)
    setTimeout(() => {
      const hasil = generateInsight({
        masukBulanIni: bulanIniData.total,
        keluarBulanIni: bulanIniData.keluar,
        masukBulanLalu: bulanLaluData.total,
        keluarBulanLalu: bulanLaluData.keluar,
        transaksiBulanIni,
      })

      setAnalisis({ ...hasil, bulan: bulanIniData.bulan })
      setSedangGenerate(false)
    }, 600)
  }

  return (
    <div className="dash">
      <Sidebar active="laporan" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Laporan Keuangan</h2>
            <p>Rincian pemasukan dan pengeluaran kas keluarga</p>
          </div>
          <div className="laporan-export">
            <select
              className="filter-btn"
              style={{ background: '#fff', border: '1.5px solid #ecebee', color: '#444' }}
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
            >
              <option value="Semua">Semua Bulan</option>
              {dataPemasukanBulanan.map((d) => (
                <option key={d.bulan} value={d.bulan}>{d.bulan}</option>
              ))}
            </select>
            <button className="export-btn pdf" onClick={exportPDF}>📄 Export PDF</button>
            <button className="export-btn excel" onClick={exportExcel}>📊 Export Excel</button>
          </div>
        </div>

        {errorMsg && (
          <div className="panel" style={{ borderLeft: '4px solid #E5484D' }}>
            <p style={{ color: '#E5484D', margin: 0 }}>{errorMsg}</p>
          </div>
        )}

        {loading ? (
          <div className="panel">
            <p>Memuat data laporan...</p>
          </div>
        ) : (
          <>
            {/* GRAFIK */}
            <div className="panel">
              <h3>Tren Pemasukan vs Pengeluaran</h3>
              {dataPemasukanBulanan.length === 0 ? (
                <p style={{ color: '#888' }}>Belum ada data untuk ditampilkan.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={pemasukanTampil.length > 0 ? pemasukanTampil : dataPemasukanBulanan}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e8ea" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => formatRupiah(v)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="total" name="Pemasukan" fill="#800020" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="keluar" name="Pengeluaran" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ANALISIS OTOMATIS */}
            <div className="panel" style={{ border: '1px dashed #D4AF37' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0 }}>🐯 Analisis Otomatis</h3>
                <button
                  className="export-btn pdf"
                  onClick={handleGenerateAnalisis}
                  disabled={sedangGenerate}
                >
                  {sedangGenerate ? '⏳ Menganalisis...' : '✨ Generate Analisis'}
                </button>
              </div>

              {!analisis && !sedangGenerate && (
                <p style={{ color: '#888', marginTop: '12px', marginBottom: 0 }}>
                  Klik "Generate Analisis" untuk mendapatkan ringkasan otomatis kondisi kas keluarga.
                </p>
              )}

              {analisis && (
                <div style={{ marginTop: '14px' }}>
                  <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '10px' }}>
                    {analisis.ringkasan} <span style={{ fontWeight: 400, color: '#888', fontSize: '13px' }}>({analisis.bulan})</span>
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {analisis.poin.map((p, i) => (
                      <li key={i} style={{ fontSize: '14px', lineHeight: '1.5' }}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* AREA YANG DI-EXPORT KE PDF */}
            <div ref={laporanRef} style={{ background: '#F8F9FA', padding: '4px' }}>
              <div className="laporan-summary-3">
                <div className="stat-card maroon">
                  <div className="icon-badge">💰</div>
                  <div className="label">Total Pemasukan</div>
                  <div className="value">{formatRupiah(totalMasuk)}</div>
                </div>
                <div className="stat-card red">
                  <div className="icon-badge">💸</div>
                  <div className="label">Total Pengeluaran</div>
                  <div className="value">{formatRupiah(totalKeluar)}</div>
                </div>
                <div className="stat-card green">
                  <div className="icon-badge">✅</div>
                  <div className="label">Saldo Bersih</div>
                  <div className="value">{formatRupiah(saldoBersih)}</div>
                </div>
              </div>

              <div className="panel">
                <h3>Pemasukan per Bulan</h3>
                <div className="table-card" style={{ boxShadow: 'none', border: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Bulan</th>
                        <th>Jumlah Transaksi</th>
                        <th>Total Pemasukan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pemasukanTampil.length === 0 && (
                        <tr className="empty-row"><td colSpan="3">Tidak ada data.</td></tr>
                      )}
                      {pemasukanTampil.map((d) => (
                        <tr key={d.bulan}>
                          <td>{d.bulan}</td>
                          <td>{d.jumlahTransaksi} kali</td>
                          <td style={{ color: '#1DAA61', fontWeight: 700 }}>{formatRupiah(d.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel">
                <h3>Rincian Pengeluaran</h3>
                <div className="table-card" style={{ boxShadow: 'none', border: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Keterangan</th>
                        <th>Kategori</th>
                        <th>Nominal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pengeluaranTampil.length === 0 && (
                        <tr className="empty-row"><td colSpan="4">Tidak ada data pengeluaran.</td></tr>
                      )}
                      {pengeluaranTampil.map((d, i) => (
                        <tr key={i}>
                          <td>{d.tanggal}</td>
                          <td>{d.keterangan}</td>
                          <td><span className="status-pill jatuh">{d.kategori}</span></td>
                          <td style={{ color: '#E5484D', fontWeight: 700 }}>{formatRupiah(d.nominal)}</td>
                        </tr>
                      ))}
                      {pengeluaranTampil.length > 0 && (
                        <tr>
                          <td colSpan="3" style={{ fontWeight: 700, textAlign: 'right' }}>Total Pengeluaran</td>
                          <td style={{ color: '#E5484D', fontWeight: 700 }}>{formatRupiah(totalKeluar)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Laporan
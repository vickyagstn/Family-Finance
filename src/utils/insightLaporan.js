// src/utils/insightLaporan.js
// ==========================================================
// INSIGHT LAPORAN OTOMATIS — 100% GRATIS, TANPA API KEY
// Analisis naik/turun dibanding bulan lalu + kategori pengeluaran terbesar
// ==========================================================

function formatRupiah(angka) {
    const num = typeof angka === "number" ? angka : parseInt(angka, 10) || 0;
    return "Rp" + num.toLocaleString("id-ID");
  }
  
  function persenPerubahan(sekarang, lalu) {
    if (!lalu || lalu === 0) return sekarang > 0 ? 100 : 0;
    return Math.round(((sekarang - lalu) / lalu) * 100);
  }
  
  /**
   * Mencari kategori dengan total pengeluaran terbesar.
   * @param {Array<{kategori: string, jumlah: number}>} transaksi
   * @returns {{kategori: string, total: number} | null}
   */
  function kategoriTerbesar(transaksi) {
    if (!transaksi || transaksi.length === 0) return null;
  
    const totals = {};
    transaksi.forEach((t) => {
      const kat = t.kategori || "Lainnya";
      totals[kat] = (totals[kat] || 0) + (t.jumlah || 0);
    });
  
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return null;
  
    return { kategori: sorted[0][0], total: sorted[0][1] };
  }
  
  /**
   * Generate insight laporan kas otomatis, membandingkan bulan ini vs bulan lalu.
   *
   * @param {Object} params
   * @param {number} params.masukBulanIni
   * @param {number} params.keluarBulanIni
   * @param {number} params.masukBulanLalu
   * @param {number} params.keluarBulanLalu
   * @param {Array<{kategori: string, jumlah: number}>} params.transaksiBulanIni
   * @returns {{ ringkasan: string, poin: string[] }}
   */
  export function generateInsight({
    masukBulanIni = 0,
    keluarBulanIni = 0,
    masukBulanLalu = 0,
    keluarBulanLalu = 0,
    transaksiBulanIni = [],
  }) {
    const poin = [];
  
    // --- Analisis pemasukan ---
    const persenMasuk = persenPerubahan(masukBulanIni, masukBulanLalu);
    if (persenMasuk > 0) {
      poin.push(
        `📈 Pemasukan naik ${persenMasuk}% dibanding bulan lalu (${formatRupiah(
          masukBulanLalu
        )} → ${formatRupiah(masukBulanIni)}).`
      );
    } else if (persenMasuk < 0) {
      poin.push(
        `📉 Pemasukan turun ${Math.abs(
          persenMasuk
        )}% dibanding bulan lalu (${formatRupiah(
          masukBulanLalu
        )} → ${formatRupiah(masukBulanIni)}).`
      );
    } else {
      poin.push("➖ Pemasukan relatif stabil dibanding bulan lalu.");
    }
  
    // --- Analisis pengeluaran ---
    const persenKeluar = persenPerubahan(keluarBulanIni, keluarBulanLalu);
    if (persenKeluar > 0) {
      poin.push(
        `⚠️ Pengeluaran naik ${persenKeluar}% dibanding bulan lalu (${formatRupiah(
          keluarBulanLalu
        )} → ${formatRupiah(keluarBulanIni)}). Perlu dicek lagi rinciannya.`
      );
    } else if (persenKeluar < 0) {
      poin.push(
        `✅ Pengeluaran berhasil ditekan turun ${Math.abs(
          persenKeluar
        )}% dibanding bulan lalu.`
      );
    } else {
      poin.push("➖ Pengeluaran relatif stabil dibanding bulan lalu.");
    }
  
    // --- Kategori terbesar ---
    const terbesar = kategoriTerbesar(transaksiBulanIni);
    if (terbesar) {
      poin.push(
        `🏷️ Kategori pengeluaran terbesar bulan ini: *${
          terbesar.kategori
        }* (${formatRupiah(terbesar.total)}).`
      );
    }
  
    // --- Saldo bersih ---
    const saldoBersih = masukBulanIni - keluarBulanIni;
    if (saldoBersih >= 0) {
      poin.push(`💰 Saldo bersih bulan ini positif: ${formatRupiah(saldoBersih)}.`);
    } else {
      poin.push(
        `🔴 Saldo bersih bulan ini minus: ${formatRupiah(
          Math.abs(saldoBersih)
        )}. Pengeluaran melebihi pemasukan.`
      );
    }
  
    const ringkasan =
      saldoBersih >= 0
        ? "Kondisi kas keluarga bulan ini sehat."
        : "Kondisi kas keluarga bulan ini perlu perhatian.";
  
    return { ringkasan, poin };
  }
  
  export default generateInsight;
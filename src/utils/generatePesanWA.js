// src/utils/generatePesanWA.js
// ==========================================================
// GENERATE PESAN WA — 100% GRATIS, TANPA API KEY
// Bikin variasi kalimat pengingat pembayaran, bisa di-generate ulang
// ==========================================================

const TEMPLATE_SOPAN = [
    (nama, jumlah, tempo) =>
      `Assalamu'alaikum/Salam sejahtera Bapak/Ibu ${nama} 🙏\n\nMohon izin mengingatkan untuk pembayaran iuran kas keluarga sebesar *Rp${jumlah}* dengan batas waktu *${tempo}*.\n\nTerima kasih atas perhatian dan kerjasamanya 🙏`,
  
    (nama, jumlah, tempo) =>
      `Halo Bapak/Ibu ${nama},\n\nSekadar mengingatkan bahwa iuran kas keluarga sebesar *Rp${jumlah}* jatuh tempo pada *${tempo}*. Mohon dapat diselesaikan sebelum tanggal tersebut ya. Terima kasih 🙏`,
  
    (nama, jumlah, tempo) =>
      `Selamat pagi/siang Bapak/Ibu ${nama} 😊\n\nInfo pembayaran kas keluarga:\n💰 Nominal: Rp${jumlah}\n📅 Batas waktu: ${tempo}\n\nMohon konfirmasi setelah transfer ya. Terima kasih!`,
  ];
  
  const TEMPLATE_SANTAI = [
    (nama, jumlah, tempo) =>
      `Halo kak ${nama} 👋\nGaskeun bayar kas keluarga yuk, nominalnya Rp${jumlah}, batas sampai ${tempo} ya. Makasih sebelumnyaa 🙌`,
  
    (nama, jumlah, tempo) =>
      `Woy ${nama}! Jangan lupa kas keluarga Rp${jumlah} ya, deadline ${tempo}. Buruan sebelum lupa hehe 😄`,
  ];
  
  const TEMPLATE_TEGAS = [
    (nama, jumlah, tempo) =>
      `Kepada Bapak/Ibu ${nama},\n\nKami informasikan bahwa iuran kas keluarga sebesar Rp${jumlah} telah melewati/mendekati batas waktu pembayaran (${tempo}). Mohon segera diselesaikan agar tidak mengganggu administrasi kas keluarga. Terima kasih atas pengertiannya.`,
  ];
  
  const SEMUA_TEMPLATE = {
    sopan: TEMPLATE_SOPAN,
    santai: TEMPLATE_SANTAI,
    tegas: TEMPLATE_TEGAS,
  };
  
  function formatRupiah(angka) {
    const num = typeof angka === "number" ? angka : parseInt(angka, 10) || 0;
    return num.toLocaleString("id-ID");
  }
  
  /**
   * Generate pesan WA pengingat pembayaran secara acak (bisa di-generate ulang).
   * @param {Object} params
   * @param {string} params.nama - nama keluarga/anggota
   * @param {number|string} params.jumlah - nominal tagihan
   * @param {string} params.tempo - tanggal jatuh tempo (contoh: "10 Juli 2026")
   * @param {"sopan"|"santai"|"tegas"} [params.gaya="sopan"] - gaya bahasa pesan
   * @returns {string} teks pesan siap kirim WA
   */
  export function generatePesanWA({ nama, jumlah, tempo, gaya = "sopan" }) {
    const templates = SEMUA_TEMPLATE[gaya] || SEMUA_TEMPLATE.sopan;
    const pilihan = templates[Math.floor(Math.random() * templates.length)];
    const jumlahFormatted = formatRupiah(jumlah);
  
    return pilihan(nama, jumlahFormatted, tempo);
  }
  
  /**
   * Bikin link WhatsApp langsung (wa.me) dari nomor + pesan.
   * @param {string} nomorHp - format 08xxx atau 62xxx
   * @param {string} pesan
   * @returns {string} url wa.me siap diklik
   */
  export function buatLinkWA(nomorHp, pesan) {
    let nomor = nomorHp.replace(/\D/g, ""); // hapus karakter selain angka
    if (nomor.startsWith("0")) nomor = "62" + nomor.slice(1);
    return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
  }
  
  export default generatePesanWA;
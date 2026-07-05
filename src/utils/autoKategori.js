// src/utils/autoKategori.js
// ==========================================================
// AUTO-KATEGORI PENGELUARAN — 100% GRATIS, TANPA API KEY
// Disesuaikan dengan kategori yang sudah ada di aplikasi:
// Acara, Konsumsi, Sosial, Operasional, Lainnya
// ==========================================================

const KATEGORI_RULES = [
    {
      kategori: "Acara",
      keywords: [
        "dekorasi", "dokumentasi", "foto", "video", "sound system",
        "souvenir", "banner", "spanduk", "undangan", "acara",
        "sewa tenda", "tenda", "panggung", "mc", "hiburan",
      ],
    },
    {
      kategori: "Konsumsi",
      keywords: [
        "makan", "snack", "catering", "nasi", "kue", "minum",
        "konsumsi", "jajan", "buah", "kopi", "prasmanan", "gorengan",
      ],
    },
    {
      kategori: "Sosial",
      keywords: [
        "santunan", "duka", "melayat", "sumbangan", "bantuan sosial",
        "musibah", "takziah", "sosial", "jenguk", "donasi",
      ],
    },
    {
      kategori: "Operasional",
      keywords: [
        "listrik", "pln", "air", "pdam", "wifi", "internet", "token",
        "pulsa", "kuota", "print", "fotocopy", "materai", "administrasi",
        "atk", "alat tulis", "amplop", "transport", "bensin", "ongkos",
        "parkir", "tol", "sewa gedung", "gedung", "aula", "sewa tempat",
        "kebersihan", "operasional",
      ],
    },
  ];
  
  /**
   * Menebak kategori pengeluaran berdasarkan teks keterangan.
   * @param {string} keterangan - teks bebas dari input user
   * @returns {string} nama kategori (default: "Lainnya" jika tidak cocok)
   */
  export function tebakKategori(keterangan) {
    if (!keterangan || typeof keterangan !== "string") return "Lainnya";
  
    const teks = keterangan.toLowerCase();
  
    for (const rule of KATEGORI_RULES) {
      const cocok = rule.keywords.some((kw) => teks.includes(kw));
      if (cocok) return rule.kategori;
    }
  
    return "Lainnya";
  }
  
  export default tebakKategori;
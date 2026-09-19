import { IEEE_COLORS, SPLN_COLORS, SPLN_STATUS_COLORS } from "./constants";

// --- FUNGSI PEMBERSIH TEKS ---
export const cleanMarkdown = (text: string) => {
  if (!text) return "";
  return text
    .replace(/[#*]/g, "") // Hapus karakter # dan *
    .replace(/\n\s*\n/g, "\n") // Hapus baris kosong berlebih
    .trim();
};

// Fungsi untuk menghitung TDCG (Total Dissolved Combustible Gas) - tanpa CO2
export const calculateTDCG = (data: any) => {
  return Math.round(
    (parseFloat(data.h2) || 0) +
      (parseFloat(data.ch4) || 0) +
      (parseFloat(data.c2h2) || 0) +
      (parseFloat(data.c2h4) || 0) +
      (parseFloat(data.c2h6) || 0) +
      (parseFloat(data.co) || 0),
  );
};

// Fungsi untuk menentukan kondisi IEEE berdasarkan TDCG
export const getIEEEKondisi = (tdcg: number) => {
  if (tdcg <= 720) {
    return { kondisi: 1, text: "Normal", color: IEEE_COLORS.kondisi1 };
  } else if (tdcg <= 1920) {
    return { kondisi: 2, text: "Waspada", color: IEEE_COLORS.kondisi2 };
  } else {
    return { kondisi: 3, text: "Bahaya", color: IEEE_COLORS.kondisi3 };
  }
};

// Fungsi untuk parse kondisi IEEE dari status_ieee yang sudah dianalisis oleh AI
export const parseIEEEStatusFromAI = (statusIeee: string, tdcg: number) => {
  if (!statusIeee) {
    return getIEEEKondisi(tdcg);
  }

  const status = statusIeee.toUpperCase();

  // Cek kondisi 3 (Bahaya/Kritis)
  if (
    status.includes("KRITIS") ||
    status.includes("COND 3") ||
    status.includes("CONDITION 3") ||
    status.includes("BAHAYA")
  ) {
    return { kondisi: 3, text: "Bahaya", color: IEEE_COLORS.kondisi3 };
  }

  // Cek kondisi 2 (Waspada)
  if (
    status.includes("WASPADA") ||
    status.includes("COND 2") ||
    status.includes("CONDITION 2") ||
    status.includes("CAUTION")
  ) {
    return { kondisi: 2, text: "Waspada", color: IEEE_COLORS.kondisi2 };
  }

  // Cek kondisi 1 (Normal)
  if (
    status.includes("NORMAL") ||
    status.includes("COND 1") ||
    status.includes("CONDITION 1")
  ) {
    return { kondisi: 1, text: "Normal", color: IEEE_COLORS.kondisi1 };
  }

  // Fallback ke perhitungan TDCG jika tidak terdeteksi
  return getIEEEKondisi(tdcg);
};

// Fungsi untuk menentukan kondisi SPLN berdasarkan TDCG
export const getSPLNKondisi = (tdcg: number) => {
  if (tdcg <= 720) {
    return { kondisi: 1, text: "Normal", color: SPLN_COLORS.kondisi1 };
  } else if (tdcg <= 1920) {
    return { kondisi: 2, text: "Waspada", color: SPLN_COLORS.kondisi2 };
  } else if (tdcg <= 4630) {
    return { kondisi: 3, text: "Peringatan", color: SPLN_COLORS.kondisi3 };
  } else {
    return { kondisi: 4, text: "Bahaya", color: SPLN_COLORS.kondisi4 };
  }
};

// Fungsi untuk mendapatkan status SPLN per gas
export const getSPLNGasStatus = (gas: string, value: string | number) => {
  const v = parseFloat(value as string) || 0;
  const limits: Record<
    string,
    { veryGood: number; good: number; fair: number; poor: number }
  > = {
    h2: { veryGood: 30, good: 99, fair: 699, poor: 1800 },
    ch4: { veryGood: 121, good: 400, fair: 1200, poor: 1500 },
    c2h2: { veryGood: 0, good: 1, fair: 10, poor: 35 },
    c2h4: { veryGood: 20, good: 50, fair: 100, poor: 200 },
    c2h6: { veryGood: 65, good: 100, fair: 200, poor: 500 },
    co: { veryGood: 350, good: 570, fair: 2500, poor: 5000 },
    co2: { veryGood: 2500, good: 4000, fair: 10000, poor: 17500 },
  };

  const l = limits[gas];
  if (!l) return { status: "N/A", color: [128, 128, 128] };

  if (v <= l.veryGood)
    return { status: "Very Good", color: SPLN_STATUS_COLORS.veryGood };
  if (v <= l.good) return { status: "Good", color: SPLN_STATUS_COLORS.good };
  if (v <= l.fair) return { status: "Fair", color: SPLN_STATUS_COLORS.fair };
  if (v <= l.poor) return { status: "Poor", color: SPLN_STATUS_COLORS.poor };
  return { status: "Critical", color: SPLN_STATUS_COLORS.critical };
};

// Fungsi untuk generate kesimpulan otomatis berdasarkan data DGA
export const generateAutoKesimpulan = (data: any) => {
  const tdcg = calculateTDCG(data);
  const kondisi = getIEEEKondisi(tdcg);

  let kesimpulan = `Berdasarkan hasil pengujian Dissolved Gas Analysis (DGA) pada transformator ${data.nama_trafo || "-"} di ${data.lokasi_gi || "-"} tanggal ${data.tanggal_sampling || "-"}, berikut adalah kesimpulan dan rekomendasi:\n\n`;

  // Rekomendasi berdasarkan kondisi
  if (kondisi.kondisi === 1) {
    kesimpulan += `Kondisi transformator dalam keadaan NORMAL. Tidak ditemukan indikasi gangguan yang signifikan. Rekomendasi tindak lanjut:\n\n`;
    kesimpulan += `• Lanjutkan monitoring rutin sesuai jadwal pemeliharaan\n`;
    kesimpulan += `• Interval pengujian DGA berikutnya: 12 bulan\n`;
    kesimpulan += `• Pertahankan kondisi operasi transformator seperti saat ini\n`;
  } else if (kondisi.kondisi === 2) {
    kesimpulan += `Kondisi transformator PERLU PERHATIAN. Terdeteksi adanya indikasi gangguan yang memerlukan monitoring lebih ketat. Rekomendasi tindak lanjut:\n\n`;
    kesimpulan += `• Periksa dan evaluasi beban operasi transformator\n`;
    kesimpulan += `• Persingkat interval pengujian DGA menjadi 3-6 bulan\n`;
    kesimpulan += `• Monitor trend kenaikan gas terlarut secara berkala\n`;
    kesimpulan += `• Lakukan inspeksi visual pada komponen transformator\n`;
  } else {
    kesimpulan += `Kondisi transformator dalam status KRITIS! Terdeteksi gangguan aktif yang memerlukan penanganan segera. \nRekomendasi tindak lanjut:\n\n`;
    kesimpulan += `• SEGERA lakukan inspeksi menyeluruh pada transformator\n`;
    kesimpulan += `• Pertimbangkan untuk menurunkan beban operasi atau mengeluarkan dari operasi\n`;
    kesimpulan += `• Koordinasi dengan tim maintenance untuk tindakan korektif segera\n`;
    kesimpulan += `• Lakukan pengujian tambahan (Furfural, Power Factor, dll)\n`;
    kesimpulan += `• Interval pengujian DGA: 1-3 bulan atau lebih sering\n`;
  }

  kesimpulan += `\n\nCatatan: Rekomendasi ini dihasilkan secara otomatis berdasarkan standar IEEE C57.104-2019. Untuk analisis lebih mendalam dan rekomendasi spesifik, silakan konsultasikan dengan VOLTY AI Assistant.`;

  return kesimpulan;
};

// Titik sumbu gas Duval Pentagon 1 (H2, C2H6, CH4, C2H4, C2H2) + centroid.
// Dipakai bersama oleh detectDuvalZone (di sini), drawDuvalPentagon.ts (render PDF),
// dan components/DuvalPentagon.tsx (render UI) supaya rumusnya satu sumber saja.
export const computeDuvalPentagonCentroid = (gasData: {
  h2: number;
  ch4: number;
  c2h6: number;
  c2h4: number;
  c2h2: number;
}) => {
  const { h2, ch4, c2h6, c2h4, c2h2 } = gasData;
  const total = h2 + ch4 + c2h6 + c2h4 + c2h2;

  if (total === 0) return null;

  const rad = (deg: number) => (deg * Math.PI) / 180;

  const pH2 = (h2 / total) * 100;
  const pC2H6 = (c2h6 / total) * 100;
  const pCH4 = (ch4 / total) * 100;
  const pC2H4 = (c2h4 / total) * 100;
  const pC2H2 = (c2h2 / total) * 100;

  const k = 0.4;
  const points = [
    { x: 0, y: pH2 * k },
    { x: pC2H6 * k * Math.cos(rad(162)), y: pC2H6 * k * Math.sin(rad(162)) },
    { x: pCH4 * k * Math.cos(rad(234)), y: pCH4 * k * Math.sin(rad(234)) },
    { x: pC2H4 * k * Math.cos(rad(306)), y: pC2H4 * k * Math.sin(rad(306)) },
    { x: pC2H2 * k * Math.cos(rad(18)), y: pC2H2 * k * Math.sin(rad(18)) },
  ];

  let Cx = 0,
    Cy = 0;
  points.forEach((p) => {
    Cx += p.x;
    Cy += p.y;
  });

  return { points, Cx, Cy };
};

// Fungsi untuk mendeteksi zona Duval Pentagon dari titik
export const detectDuvalZone = (gasData: {
  h2: number;
  ch4: number;
  c2h6: number;
  c2h4: number;
  c2h2: number;
}) => {
  const centroid = computeDuvalPentagonCentroid(gasData);
  if (!centroid) return null;
  const { Cx, Cy } = centroid;

  // Deteksi zona berdasarkan posisi centroid
  // Ini adalah aproksimasi sederhana berdasarkan koordinat zona

  // PD zone (tengah atas kecil)
  if (Cy > 24.5 && Cy < 33 && Math.abs(Cx) < 1) return "PD";

  // S zone (kiri atas)
  if (Cx < 0 && Cy > 1.5) return "S";

  // D1 zone (kanan atas)
  if (Cx > 0 && Cy > 1.5) return "D1";

  // D2 zone (kanan tengah)
  if (Cx > 0 && Cy > -3 && Cy <= 1.5) return "D2";

  // T3 zone (bawah kanan)
  if (Cx > -6 && Cy <= -3 && Cx > 0) return "T3";

  // T2 zone (bawah tengah kiri)
  if (Cx <= 0 && Cy < -4 && Cx > -22.5) return "T2";

  // T1 zone (kiri)
  if (Cx < 0 && Cy <= 1.5 && Cy > -4) return "T1";

  // Default to closest approximation
  if (Cy > 0) {
    return Cx > 0 ? "D1" : "S";
  } else {
    if (Cx > 5) return "T3";
    if (Cx < -5) return "T1";
    return "T2";
  }
};

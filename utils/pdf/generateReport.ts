// @ts-nocheck
// jspdf-autotable's TS types demand strict [r,g,b] tuples for every color,
// while this file passes plain number[] pulled from shared color constants.
// Isolating the suppression to this file (vs. the old 1900-line monolith)
// keeps calculations.ts / constants.ts / drawDuvalPentagon.ts / drawTrendingChartPage.ts
// fully type-checked.
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { IEEE_COLORS, SPLN_COLORS, SPLN_STATUS_COLORS, IEEE_LIMITS } from "./constants";
import {
  cleanMarkdown,
  calculateTDCG,
  parseIEEEStatusFromAI,
  getSPLNKondisi,
  getSPLNGasStatus,
  generateAutoKesimpulan,
  detectDuvalZone,
} from "./calculations";
import { drawDuvalPentagon } from "./drawDuvalPentagon";
import { drawTrendingChartPage } from "./drawTrendingChartPage";

// Fungsi utama untuk generate PDF sesuai template
export const generatePDFFromTemplate = (
  data: any,
  options: any = { saveFile: true },
) => {
  try {
    console.log("Generating PDF for:", data);
    // Set ukuran kertas A4 secara eksplisit
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Hitung TDCG
    const tdcgValue = calculateTDCG(data);

    // Gunakan status_ieee dari hasil AI jika ada, kalau tidak fallback ke perhitungan TDCG
    const ieeeKondisi = parseIEEEStatusFromAI(data.status_ieee, tdcgValue);
    const splnKondisi = getSPLNKondisi(tdcgValue);

    // Gas data untuk pentagon
    const gasData = {
      h2: parseFloat(data.h2) || 0,
      ch4: parseFloat(data.ch4) || 0,
      c2h6: parseFloat(data.c2h6) || 0,
      c2h4: parseFloat(data.c2h4) || 0,
      c2h2: parseFloat(data.c2h2) || 0,
    };

    // Deteksi zona Duval
    const detectedZone = detectDuvalZone(gasData);

    let currentY = 15;

    // ============================================
    // HALAMAN 1: LAPORAN HASIL UJI DGA
    // ============================================

    // Header Judul
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("LAPORAN HASIL UJI DGA", 14, currentY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("(Dissolved Gas Analysis)", 80, currentY);

    currentY += 10;

    // ============================================
    // IDENTITAS TRANSFORMATOR & DATA SAMPLING (side by side)
    // ============================================

    // Judul Identitas Transformator (Kiri)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Identitas Transformator", 14, currentY);

    // Judul Data Sampling (Kanan)
    doc.text("Data Sampling", 120, currentY);

    currentY += 5;

    // Data Identitas Transformator (Kiri)
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const leftLabels = [
      { label: "Gardu Induk", value: data.lokasi_gi || "-" },
      { label: "Trafo", value: data.nama_trafo || "-" },
      { label: "Merk Trafo", value: data.merk_trafo || "-" },
      { label: "No. Seri Trafo", value: data.serial_number || "-" },
      { label: "Tahun", value: data.tahun_pembuatan || "-" },
      { label: "Volt", value: data.level_tegangan || "-" },
    ];

    const rightLabels = [
      { label: "Tanggal Tes", value: data.tanggal_sampling || "-" },
      { label: "Petugas", value: data.diambil_oleh || "-" },
    ];

    // Gambar data kiri
    leftLabels.forEach((item, index) => {
      const y = currentY + index * 5;
      doc.setTextColor(0, 0, 0);
      doc.text(item.label, 14, y);
      doc.text(":", 48, y);
      doc.text(String(item.value), 52, y);
    });

    // Gambar data kanan
    rightLabels.forEach((item, index) => {
      const y = currentY + index * 5;
      doc.setTextColor(0, 0, 0);
      doc.text(item.label, 120, y);
      doc.text(":", 150, y);
      doc.text(String(item.value), 154, y);
    });

    currentY += 45;

    // ============================================
    // DUA TABEL SIDE BY SIDE: IEEE (KIRI) & SPLN (KANAN)
    // ============================================

    const tableStartY = currentY;
    const tableWidth = 88;
    const leftTableX = 14;
    const rightTableX = 108;

    // ----- TABEL IEEE (KIRI) -----
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 139); // Dark blue
    doc.text("Standar (IEEE C57.104-2019)", leftTableX, currentY);

    // ----- TABEL SPLN (KANAN) -----
    doc.setTextColor(139, 0, 0); // Dark red
    doc.text("Standar (SPLN T5.004-4: 2016)", rightTableX, currentY);

    currentY += 3;

    // IEEE Table data dengan warna berdasarkan batas
    const getIEEEValueColor = (gas: string, value: any) => {
      const v = parseFloat(value) || 0;
      const limit = IEEE_LIMITS[gas];
      if (v >= limit) return [220, 50, 50]; // Merah jika melebihi
      return [0, 128, 0]; // Hijau jika di bawah
    };

    const ieeeTableBody = [
      [
        "Hidrogen (H2)",
        {
          content: String(data.h2 || 0),
          styles: { textColor: getIEEEValueColor("h2", data.h2) },
        },
        "100 ppm",
      ],
      [
        "Metana (CH4)",
        {
          content: String(data.ch4 || 0),
          styles: { textColor: getIEEEValueColor("ch4", data.ch4) },
        },
        "120 ppm",
      ],
      [
        "Asetilena (C2H2)",
        {
          content: String(data.c2h2 || 0),
          styles: { textColor: getIEEEValueColor("c2h2", data.c2h2) },
        },
        "1 ppm",
      ],
      [
        "Etilen (C2H4)",
        {
          content: String(data.c2h4 || 0),
          styles: { textColor: getIEEEValueColor("c2h4", data.c2h4) },
        },
        "50 ppm",
      ],
      [
        "Etana (C2H6)",
        {
          content: String(data.c2h6 || 0),
          styles: { textColor: getIEEEValueColor("c2h6", data.c2h6) },
        },
        "65 ppm",
      ],
      [
        "Karbon Monoksida (CO)",
        {
          content: String(data.co || 0),
          styles: { textColor: getIEEEValueColor("co", data.co) },
        },
        "350 ppm",
      ],
      [
        "Karbon Dioksida (CO2)",
        {
          content: String(data.co2 || 0),
          styles: { textColor: getIEEEValueColor("co2", data.co2) },
        },
        "2500 ppm",
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [["PARAMETER UJI", "HASIL\n(ppm)", "Batas\nAtas"]],
      body: ieeeTableBody,
      theme: "grid",
      headStyles: {
        fillColor: [0, 100, 150],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        fontSize: 8,
        cellPadding: 1.5,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 1.5,
      },
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 20, halign: "center", textColor: [220, 50, 50] },
      },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      tableWidth: tableWidth - 6,
      margin: { left: leftTableX },
    });

    // Tambah TDCG dan Kondisi Status untuk IEEE
    let ieeeTableEndY = (doc as any).lastAutoTable.finalY;

    autoTable(doc, {
      startY: ieeeTableEndY,
      body: [
        [
          { content: "HASIL TDCG", styles: { fontStyle: "bold" } },
          {
            content: String(tdcgValue),
            colSpan: 2,
            styles: {
              halign: "center",
              textColor: ieeeKondisi.color,
              fontStyle: "bold",
            },
          },
        ],
        [
          { content: "KONDISI STATUS", styles: { fontStyle: "bold" } },
          {
            content: `Kondisi ${ieeeKondisi.kondisi}`,
            styles: {
              halign: "center",
              textColor: ieeeKondisi.color,
              fontStyle: "bold",
            },
          },
          {
            content: ieeeKondisi.text,
            styles: {
              halign: "center",
              textColor: ieeeKondisi.color,
              fontStyle: "bold",
            },
          },
        ],
      ],
      theme: "grid",
      bodyStyles: {
        fontSize: 8,
        cellPadding: 1.5,
      },
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 20, halign: "center" },
      },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      tableWidth: tableWidth - 6,
      margin: { left: leftTableX },
    });

    // SPLN Table data dengan warna status
    const splnTableBody = [
      [
        "Hidrogen (H2)",
        { content: String(data.h2 || 0), styles: { textColor: [0, 0, 0] } },
        {
          content: getSPLNGasStatus("h2", data.h2).status,
          styles: { textColor: getSPLNGasStatus("h2", data.h2).color },
        },
      ],
      [
        "Metana (CH4)",
        { content: String(data.ch4 || 0), styles: { textColor: [0, 0, 0] } },
        {
          content: getSPLNGasStatus("ch4", data.ch4).status,
          styles: { textColor: getSPLNGasStatus("ch4", data.ch4).color },
        },
      ],
      [
        "Asetilena (C2H2)",
        { content: String(data.c2h2 || 0), styles: { textColor: [0, 0, 0] } },
        {
          content: getSPLNGasStatus("c2h2", data.c2h2).status,
          styles: { textColor: getSPLNGasStatus("c2h2", data.c2h2).color },
        },
      ],
      [
        "Etilen (C2H4)",
        { content: String(data.c2h4 || 0), styles: { textColor: [0, 0, 0] } },
        {
          content: getSPLNGasStatus("c2h4", data.c2h4).status,
          styles: { textColor: getSPLNGasStatus("c2h4", data.c2h4).color },
        },
      ],
      [
        "Etana (C2H6)",
        { content: String(data.c2h6 || 0), styles: { textColor: [0, 0, 0] } },
        {
          content: getSPLNGasStatus("c2h6", data.c2h6).status,
          styles: { textColor: getSPLNGasStatus("c2h6", data.c2h6).color },
        },
      ],
      [
        "Karbon Monoksida (CO)",
        { content: String(data.co || 0), styles: { textColor: [0, 0, 0] } },
        {
          content: getSPLNGasStatus("co", data.co).status,
          styles: { textColor: getSPLNGasStatus("co", data.co).color },
        },
      ],
      [
        "Karbon Dioksida (CO2)",
        { content: String(data.co2 || 0), styles: { textColor: [0, 0, 0] } },
        {
          content: getSPLNGasStatus("co2", data.co2).status,
          styles: { textColor: getSPLNGasStatus("co2", data.co2).color },
        },
      ],
    ];

    autoTable(doc, {
      startY: tableStartY + 3,
      head: [["PARAMETER UJI", "HASIL\n(ppm)", "Status"]],
      body: splnTableBody,
      theme: "grid",
      headStyles: {
        fillColor: [139, 69, 19],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        fontSize: 8,
        cellPadding: 1.5,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 1.5,
      },
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 22, halign: "center" },
      },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      tableWidth: tableWidth - 6,
      margin: { left: rightTableX },
    });

    // Tambah TDCG dan Kondisi Status untuk SPLN
    let splnTableEndY = (doc as any).lastAutoTable.finalY;

    autoTable(doc, {
      startY: splnTableEndY,
      body: [
        [
          {
            content: String(tdcgValue),
            colSpan: 3,
            styles: {
              halign: "center",
              textColor: splnKondisi.color,
              fontStyle: "bold",
            },
          },
        ],
        [
          {
            content: `Kondisi ${splnKondisi.kondisi} - ${splnKondisi.text}`,
            colSpan: 3,
            styles: {
              halign: "center",
              textColor: splnKondisi.color,
              fontStyle: "bold",
            },
          },
        ],
      ],
      theme: "grid",
      bodyStyles: {
        fontSize: 8,
        cellPadding: 1.5,
      },
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 22, halign: "center" },
      },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      tableWidth: tableWidth - 6,
      margin: { left: rightTableX },
    });

    currentY = Math.max((doc as any).lastAutoTable.finalY, ieeeTableEndY + 20) + 8;

    // ============================================
    // KONDISI STATUS IEEE (KIRI) & KONDISI STATUS SPLN (KANAN ATAS)
    // ============================================

    const kondisiStartY = currentY;

    // ----- KONDISI STATUS IEEE (KIRI) -----
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 139);
    doc.text("Kondisi Status (IEEE C57.104-2019)", leftTableX, currentY);

    currentY += 6;

    // Kondisi 1 - Normal (Hijau)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("- Kondisi 1 :", leftTableX, currentY);
    doc.setTextColor(
      IEEE_COLORS.kondisi1[0],
      IEEE_COLORS.kondisi1[1],
      IEEE_COLORS.kondisi1[2],
    );
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Normal. Lanjut monitoring.", leftTableX + 22, currentY);

    currentY += 6;

    // Kondisi 2 - Waspada (Kuning tua)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("- Kondisi 2 :", leftTableX, currentY);
    doc.setTextColor(
      IEEE_COLORS.kondisi2[0],
      IEEE_COLORS.kondisi2[1],
      IEEE_COLORS.kondisi2[2],
    );
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Waspada. Cek beban & interval uji.", leftTableX + 22, currentY);

    currentY += 6;

    // Kondisi 3 - Bahaya (Merah darah)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("- Kondisi 3 :", leftTableX, currentY);
    doc.setTextColor(
      IEEE_COLORS.kondisi3[0],
      IEEE_COLORS.kondisi3[1],
      IEEE_COLORS.kondisi3[2],
    );
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Bahaya. Indikasi kerusakan aktif.", leftTableX + 22, currentY);

    // ----- KONDISI STATUS SPLN (KANAN ATAS) -----
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 0, 0);
    doc.text(
      "Kondisi Status (SPLN T5.004-4: 2016)",
      rightTableX,
      kondisiStartY,
    );

    // Tabel kondisi SPLN
    const splnKondisiTableY = kondisiStartY + 3;

    autoTable(doc, {
      startY: splnKondisiTableY,
      head: [["Status", "Limit TDCG", "Tindakan"]],
      body: [
        [
          { content: "Kondisi 1", styles: { textColor: [0, 0, 0] } },
          { content: "<= 720", styles: { textColor: [139, 0, 0] } },
          {
            content: "Normal",
            styles: { textColor: SPLN_COLORS.kondisi1, fontStyle: "bold" },
          },
        ],
        [
          { content: "Kondisi 2", styles: { textColor: [0, 0, 0] } },
          { content: "<=1920", styles: { textColor: [139, 0, 0] } },
          {
            content: "Waspada",
            styles: { textColor: SPLN_COLORS.kondisi2, fontStyle: "bold" },
          },
        ],
        [
          { content: "Kondisi 3", styles: { textColor: [0, 0, 0] } },
          { content: "<=4630", styles: { textColor: [139, 0, 0] } },
          {
            content: "Peringatan",
            styles: { textColor: SPLN_COLORS.kondisi3, fontStyle: "bold" },
          },
        ],
        [
          { content: "Kondisi 4", styles: { textColor: [0, 0, 0] } },
          { content: ">=4631", styles: { textColor: [139, 0, 0] } },
          {
            content: "Bahaya",
            styles: { textColor: SPLN_COLORS.kondisi4, fontStyle: "bold" },
          },
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: 2,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 22, halign: "center" },
        2: { cellWidth: 22, halign: "center" },
      },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.15,
      },
      tableWidth: 76,
      margin: { left: rightTableX },
    });

    currentY = Math.max(currentY + 14, (doc as any).lastAutoTable.finalY + 24);

    // ============================================
    // KODE DIAGNOSA (KIRI) & DUVAL PENTAGON (KANAN)
    // ============================================

    const diagStartY = currentY;

    // ----- KODE DIAGNOSA (KIRI) -----
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Duval Pentagon - Kode Diagnosa:", leftTableX, currentY);

    currentY += 5;

    // Daftar kode diagnosa dengan highlight berdasarkan zona terdeteksi
    const faultTypes = [
      { code: "PD", desc: "Partial Discharge (Peluasan Parsial)" },
      { code: "D1", desc: "Discharge Low Energy (Percikan kecil)" },
      { code: "D2", desc: "Discharge High Energy (Arcing kuat)" },
      { code: "S", desc: "Stray Gassing (Stray Gassing)" },
      { code: "T1", desc: "Thermal Fault < 300°C" },
      { code: "T2", desc: "Thermal Fault 300°C - 700°C" },
      { code: "T3", desc: "Thermal Fault > 700°C" },
    ];

    faultTypes.forEach((fault, index) => {
      const y = currentY + index * 5;
      const isDetected = detectedZone === fault.code;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`${fault.code}:`, leftTableX, y);

      if (isDetected) {
        // Highlight dengan warna merah jika terdeteksi
        doc.setTextColor(220, 50, 50);
        doc.setFont("helvetica", "bold");
      } else {
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "normal");
      }
      doc.text(fault.desc, leftTableX + 10, y);
    });

    // ----- DUVAL PENTAGON (KANAN) -----
    const pentagonCenterX = 155;
    const pentagonCenterY = diagStartY + 22;
    const pentagonSize = 48;

    // Gambar Duval Pentagon
    drawDuvalPentagon(
      doc,
      pentagonCenterX,
      pentagonCenterY,
      pentagonSize,
      gasData,
    );

    // Footer halaman 1
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Generated: ${new Date().toLocaleString("id-ID")} | SMARTTRAFO - PLN UPT Manado`,
      105,
      287,
      { align: "center" },
    );

    // ============================================
    // HALAMAN 2: KESIMPULAN ANALISIS AI
    // ============================================
    doc.addPage();

    currentY = 15;

    // Header halaman 2
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Standar: IEEE C57.104-2019", 14, currentY);

    currentY += 10;

    // Judul Kesimpulan
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 139, 139);
    doc.text("Kesimpulan Analisis DGA berdasarkan AI", 14, currentY);

    currentY += 6;

    // Info Transformator
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const infoLabels = [
      { label: "Gardu Induk", value: data.lokasi_gi || "-" },
      { label: "Trafo", value: data.nama_trafo || "-" },
      { label: "Tanggal Pengujian", value: data.tanggal_sampling || "-" },
    ];

    infoLabels.forEach((item, index) => {
      const y = currentY + index * 5;
      doc.setTextColor(0, 139, 139);
      doc.text(item.label, 14, y);
      doc.setTextColor(0, 0, 0);
      doc.text(":", 55, y);
      doc.text(String(item.value), 60, y);
    });

    currentY += 20;

    // Tentukan apakah ada hasil AI
    const hasAIResult =
      data.hasil_ai &&
      data.hasil_ai.trim() !== "" &&
      data.hasil_ai !== "AI sedang menganalisis...";

    // Debug
    console.log("PDF Page 2 - hasil_ai:", data.hasil_ai);
    console.log("PDF Page 2 - hasAIResult:", hasAIResult);

    // Tabel Kesimpulan dengan CLEAN MARKDOWN
    const kesimpulanContent = hasAIResult
      ? cleanMarkdown(data.hasil_ai) // <-- MENGGUNAKAN CLEAN MARKDOWN
      : generateAutoKesimpulan(data);

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          {
            content: "KESIMPULAN & REKOMENDASI by VOLTY AI",
            styles: { halign: "left" },
          },
        ],
      ],
      body: [[kesimpulanContent]],
      theme: "grid",
      headStyles: {
        fillColor: [0, 139, 139],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 6,
        textColor: [50, 50, 50],
        lineHeight: 1.5,
      },
      columnStyles: {
        0: { cellWidth: 175 },
      },
      styles: {
        cellPadding: 4,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        overflow: "linebreak",
      },
      tableWidth: 175,
      margin: { left: 14 },
    });

    // Footer halaman 2
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text(
      hasAIResult
        ? "Analisis dihasilkan oleh VOLTY AI Assistant - PLN UPT Manado"
        : "Rekomendasi otomatis berdasarkan IEEE C57.104-2019",
      105,
      285,
      { align: "center" },
    );
    doc.text(`Generated: ${new Date().toLocaleString("id-ID")}`, 105, 290, {
      align: "center",
    });

    // ============================================
    // HALAMAN 3: PANDUAN STANDAR
    // ============================================
    doc.addPage();

    currentY = 15;

    // Header halaman 3
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("PANDUAN STANDAR", 14, currentY);

    currentY += 10;

    // ----- STANDAR IEEE C57.104-2019 -----
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Standar: IEEE Std C57.104-2019", 14, currentY);

    currentY += 5;

    const ieeeGuideData = [
      [
        { content: "Hidrogen (H2)", styles: { textColor: [0, 139, 139] } },
        { content: "100 ppm", styles: { textColor: [220, 50, 50] } },
        "Partial Discharge / Stray Gassing",
      ],
      [
        { content: "Metana (CH4)", styles: { textColor: [0, 139, 139] } },
        { content: "120 ppm", styles: { textColor: [220, 50, 50] } },
        "Overheating Minyak",
      ],
      [
        { content: "Asetilen (C2H2)", styles: { textColor: [0, 139, 139] } },
        { content: "1 ppm", styles: { textColor: [220, 50, 50] } },
        "Arcing (Busur Api) - SANGAT KRITIS",
      ],
      [
        { content: "Etilen (C2H4)", styles: { textColor: [0, 139, 139] } },
        { content: "50 ppm", styles: { textColor: [220, 50, 50] } },
        "Overheating Suhu Tinggi (>700°C)",
      ],
      [
        { content: "Etana (C2H6)", styles: { textColor: [0, 139, 139] } },
        { content: "65 ppm", styles: { textColor: [220, 50, 50] } },
        "Overheating Suhu Menengah",
      ],
      [
        {
          content: "Karbon Monoksida (CO)",
          styles: { textColor: [0, 139, 139] },
        },
        { content: "350 ppm", styles: { textColor: [220, 50, 50] } },
        "Degradasi Kertas Isolasi",
      ],
      [
        {
          content: "Karbon Dioksida (CO2)",
          styles: { textColor: [0, 139, 139] },
        },
        { content: "2500 ppm", styles: { textColor: [220, 50, 50] } },
        "Penuaan Kertas / Oksidasi",
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [["Gas", "Limit (ppm)", "Indikasi"]],
      body: ieeeGuideData,
      theme: "grid",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 90 },
      },
      styles: {
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      tableWidth: 170,
      margin: { left: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // ----- STANDAR SPLN T5.004-4: 2016 -----
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Standar: SPLN T5.004-4: 2016", 14, currentY);

    currentY += 5;

    // Helper function to create colored limit rows
    const createSPLNLimitRows = (gasName: string, limits: string[][]) => {
      // limits format: [[limit, status], ...]
      // status: "Very Good", "Good", "Fair", "Poor", "Critical"
      const statusColors: Record<string, number[]> = {
        "Very Good": SPLN_STATUS_COLORS.veryGood,
        Good: SPLN_STATUS_COLORS.good,
        Fair: SPLN_STATUS_COLORS.fair,
        Poor: SPLN_STATUS_COLORS.poor,
        Critical: SPLN_STATUS_COLORS.critical,
      };

      return limits.map((item, index) => {
        const isFirst = index === 0;
        return [
          {
            content: isFirst ? gasName : "",
            styles: {
              textColor: [0, 139, 139],
              fontStyle: isFirst ? "bold" : "normal",
            },
          },
          {
            content: `${item[0]} = ${item[1]}`,
            styles: { textColor: statusColors[item[1]] },
          },
        ];
      });
    };

    // Data SPLN dengan limit terpisah
    const splnDataLeft = [
      {
        gas: "Hidrogen (H2)",
        limits: [
          ["<30", "Very Good"],
          ["<=99", "Good"],
          ["<=699", "Fair"],
          ["<=1800", "Poor"],
          [">1800", "Critical"],
        ],
      },
      {
        gas: "Metana (CH4)",
        limits: [
          ["<121", "Very Good"],
          ["<=400", "Good"],
          ["<=1200", "Fair"],
          ["<=1500", "Poor"],
          [">1500", "Critical"],
        ],
      },
      {
        gas: "Asetilena (C2H2)",
        limits: [
          ["=0", "Very Good"],
          ["<=1", "Good"],
          ["<=10", "Fair"],
          ["<=35", "Poor"],
          [">35", "Critical"],
        ],
      },
    ];

    const splnDataRight = [
      {
        gas: "Etana (C2H6)",
        limits: [
          ["<65", "Very Good"],
          ["<=100", "Good"],
          ["<=200", "Fair"],
          ["<=500", "Poor"],
          [">500", "Critical"],
        ],
      },
      {
        gas: "Karbon Monoksida (CO)",
        limits: [
          ["<=350", "Very Good"],
          ["<=570", "Good"],
          ["<=2500", "Fair"],
          ["<=5000", "Poor"],
          [">5000", "Critical"],
        ],
      },
      {
        gas: "Karbon Dioksida (CO2)",
        limits: [
          ["<=2500", "Very Good"],
          ["<=4000", "Good"],
          ["<=10000", "Fair"],
          ["<=17500", "Poor"],
          [">17500", "Critical"],
        ],
      },
    ];

    // Build table body for left table
    const leftTableBody: any[] = [];
    splnDataLeft.forEach((item) => {
      const rows = createSPLNLimitRows(item.gas, item.limits);
      leftTableBody.push(...rows);
    });

    // Build table body for right table
    const rightTableBody: any[] = [];
    splnDataRight.forEach((item) => {
      const rows = createSPLNLimitRows(item.gas, item.limits);
      rightTableBody.push(...rows);
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Senyawa", "Limit"]],
      body: leftTableBody,
      theme: "grid",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 1.5,
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 45 },
      },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.15,
      },
      tableWidth: 80,
      margin: { left: 14 },
    });

    autoTable(doc, {
      startY: currentY,
      head: [["Senyawa", "Limit"]],
      body: rightTableBody,
      theme: "grid",
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 1.5,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 50 },
      },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.15,
      },
      tableWidth: 90,
      margin: { left: 105 },
    });

    // Footer halaman 3
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Generated: ${new Date().toLocaleString("id-ID")} | SMARTTRAFO - PLN UPT Manado`,
      105,
      287,
      { align: "center" },
    );

    // ============================================
    // HALAMAN TERAKHIR: TRENDING CHART (jika ada data)
    // ============================================
    if (options.trendingData && options.trendingData.length > 0) {
      drawTrendingChartPage(
        doc,
        options.trendingData,
        data.lokasi_gi || "-",
        data.nama_trafo || "-",
      );
    }

    // ============================================
    // SAVE PDF atau RETURN BLOB
    // ============================================

    if (options.saveFile === false) {
      // Kembalikan blob untuk batch download
      return doc.output("blob");
    }

    const _gi = (data.lokasi_gi || "GI")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    const _trafo = (data.nama_trafo || "TD")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    const filename = `Laporan_DGA_${_gi}_${_trafo}.pdf`;
    doc.save(filename);

    console.log("PDF berhasil di-generate!", filename);
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    if (options.saveFile === false) {
      throw error;
    }
    alert("Gagal membuat PDF: " + error.message);
  }
};

// Export fungsi legacy untuk backward compatibility
export const generatePDF = (data: any, result: any) => {
  const combinedData = {
    ...data,
    status_ieee: result?.ieee_status || data.status_ieee,
    status_ai: result?.ai_status || data.status_ai,
    diagnosis: result?.diagnosis || data.diagnosis,
    tdcg: data.tdcg || 0,
  };
  generatePDFFromTemplate(combinedData);
};

// Fungsi untuk generate PDF sebagai blob (untuk ZIP download)
// Menggunakan template yang sama persis dengan generatePDFFromTemplate
export const generatePDFBlob = (data: any, trendingData: any) => {
  // Gunakan generatePDFFromTemplate dengan opsi saveFile: false untuk mendapatkan blob
  return generatePDFFromTemplate(data, {
    saveFile: false,
    trendingData: trendingData || [],
  });
};

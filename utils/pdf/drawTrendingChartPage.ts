import autoTable from "jspdf-autotable";
import { getIEEEKondisi } from "./calculations";

// ============================================
// HELPER: GAMBAR HALAMAN TRENDING CHART
// pada doc yang sudah ada (dipanggil dari generatePDFFromTemplate)
// ============================================
export const drawTrendingChartPage = (
  doc: any,
  trendingData: any[],
  gi: string,
  trafo: string,
) => {
  if (!trendingData || trendingData.length === 0) return;

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const GAS_SERIES = [
    { key: "TDCG", color: [16, 185, 129], label: "TDCG" },
    { key: "H2", color: [59, 130, 246], label: "H2" },
    { key: "CH4", color: [234, 179, 8], label: "CH4" },
    { key: "C2H6", color: [168, 85, 247], label: "C2H6" },
    { key: "C2H4", color: [249, 115, 22], label: "C2H4" },
    { key: "C2H2", color: [239, 68, 68], label: "C2H2" },
    { key: "CO", color: [100, 116, 139], label: "CO" },
    { key: "CO2", color: [6, 182, 212], label: "CO2" },
  ];

  doc.addPage();
  let y = 15;

  // ── Judul ──────────────────────────────────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("ANALISIS TRENDING GAS TERLARUT (DGA)", PAGE_W / 2, y, {
    align: "center",
  });
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Gardu Induk : ${gi}     |     Trafo : ${trafo}`, PAGE_W / 2, y, {
    align: "center",
  });
  y += 5;
  doc.text(
    `Jumlah Data Historis : ${trendingData.length} record     |     Dicetak : ${new Date().toLocaleString("id-ID")}`,
    PAGE_W / 2,
    y,
    { align: "center" },
  );
  y += 4;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;

  // ── Area Grafik ────────────────────────────────────────────────────────────
  const CHART_X = MARGIN + 12;
  const CHART_Y = y;
  const CHART_W = CONTENT_W - 14;
  const CHART_H = 115;

  // Hitung max nilai untuk skala Y
  let maxVal = 0;
  trendingData.forEach((d) => {
    GAS_SERIES.forEach((g) => {
      const v = Number(d[g.key] || 0);
      if (v > maxVal) maxVal = v;
    });
  });
  if (maxVal === 0) maxVal = 100;
  maxVal = Math.ceil((maxVal * 1.1) / 100) * 100 || 100;

  // Latar grafik
  doc.setFillColor(250, 250, 252);
  doc.rect(CHART_X, CHART_Y, CHART_W, CHART_H, "F");

  // Grid horizontal
  const GRID_LINES = 5;
  doc.setDrawColor(225, 228, 235);
  doc.setLineWidth(0.2);
  for (let i = 0; i <= GRID_LINES; i++) {
    const gy = CHART_Y + CHART_H - (i / GRID_LINES) * CHART_H;
    doc.line(CHART_X, gy, CHART_X + CHART_W, gy);
    const yVal = Math.round((i / GRID_LINES) * maxVal);
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.text(String(yVal), CHART_X - 2, gy + 1.5, { align: "right" });
  }

  // Border grafik
  doc.setDrawColor(180, 180, 200);
  doc.setLineWidth(0.4);
  doc.rect(CHART_X, CHART_Y, CHART_W, CHART_H);

  // Label sumbu Y
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text("ppm", CHART_X - 10, CHART_Y + CHART_H / 2, { angle: 90 });

  const n = trendingData.length;
  const mapX = (i: number) =>
    CHART_X + (n <= 1 ? CHART_W / 2 : (i / (n - 1)) * CHART_W);
  const mapY = (v: number) =>
    CHART_Y + CHART_H - (Math.min(v, maxVal) / maxVal) * CHART_H;

  // Gambar tiap seri gas
  GAS_SERIES.forEach((gas) => {
    doc.setDrawColor(...gas.color);
    doc.setLineWidth(gas.key === "C2H2" ? 0.7 : gas.key === "TDCG" ? 0.8 : 0.5);
    for (let i = 0; i < n - 1; i++) {
      doc.line(
        mapX(i),
        mapY(Number(trendingData[i][gas.key] || 0)),
        mapX(i + 1),
        mapY(Number(trendingData[i + 1][gas.key] || 0)),
      );
    }
    doc.setFillColor(...gas.color);
    trendingData.forEach((d, i) => {
      doc.circle(mapX(i), mapY(Number(d[gas.key] || 0)), 0.7, "F");
    });
  });

  // Label sumbu X (maks 8 label)
  const maxXLabels = Math.min(n, 8);
  const step = n <= 1 ? 1 : Math.ceil((n - 1) / (maxXLabels - 1));
  doc.setFontSize(6);
  doc.setTextColor(80, 80, 80);
  for (let i = 0; i < n; i += step) {
    doc.text(trendingData[i].dateLabel || "", mapX(i), CHART_Y + CHART_H + 3, {
      angle: -40,
      align: "right",
    });
  }
  if (n > 1 && (n - 1) % step !== 0) {
    doc.text(
      trendingData[n - 1].dateLabel || "",
      mapX(n - 1),
      CHART_Y + CHART_H + 3,
      { angle: -40, align: "right" },
    );
  }

  y = CHART_Y + CHART_H + 22;

  // ── Legenda ────────────────────────────────────────────────────────────────
  doc.setFontSize(7);
  const legendCols = 4;
  const legendColW = CONTENT_W / legendCols;
  GAS_SERIES.forEach((gas, idx) => {
    const col = idx % legendCols;
    const row = Math.floor(idx / legendCols);
    const lx = MARGIN + col * legendColW;
    const ly = y + row * 6;
    doc.setFillColor(...gas.color);
    doc.rect(lx, ly - 2.5, 5, 3, "F");
    doc.setTextColor(40, 40, 40);
    doc.text(gas.label, lx + 6.5, ly);
  });
  y += Math.ceil(GAS_SERIES.length / legendCols) * 6 + 5;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 4;

  // ── Data Riwayat UJI DGA – Detail ─────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("DATA RIWAYAT UJI DGA – DETAIL", PAGE_W / 2, y, {
    align: "center",
  });
  y += 5;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(
    `${gi}  |  ${trafo}  |  ${trendingData.length} record`,
    PAGE_W / 2,
    y,
    { align: "center" },
  );
  y += 4;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 3;

  const detailHead = [
    [
      "No",
      "Tanggal Sampling",
      "H2",
      "CH4",
      "C2H6",
      "C2H4",
      "C2H2",
      "CO",
      "CO2",
      "TDCG",
    ],
  ];
  const detailBody = trendingData.map((d, idx) => {
    const tdcg =
      d.TDCG ??
      Number(d.h2 || 0) +
        Number(d.ch4 || 0) +
        Number(d.c2h6 || 0) +
        Number(d.c2h4 || 0) +
        Number(d.c2h2 || 0) +
        Number(d.co || 0);
    const tdcgKondisi = getIEEEKondisi(tdcg);
    return [
      String(idx + 1),
      d.dateLabel || d.tanggal_sampling || "-",
      d.H2 ?? d.h2 ?? 0,
      d.CH4 ?? d.ch4 ?? 0,
      d.C2H6 ?? d.c2h6 ?? 0,
      d.C2H4 ?? d.c2h4 ?? 0,
      d.C2H2 ?? d.c2h2 ?? 0,
      d.CO ?? d.co ?? 0,
      d.CO2 ?? d.co2 ?? 0,
      {
        content: String(Math.round(tdcg)),
        styles: { textColor: tdcgKondisi.color, fontStyle: "bold" },
      },
    ];
  });

  autoTable(doc, {
    startY: y,
    head: detailHead,
    body: detailBody,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7,
      halign: "center",
    },
    bodyStyles: { fontSize: 6.5, cellPadding: 1.5, halign: "center" },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 38, halign: "left" },
      2: { cellWidth: 14 },
      3: { cellWidth: 14 },
      4: { cellWidth: 14 },
      5: { cellWidth: 14 },
      6: { cellWidth: 14 },
      7: { cellWidth: 14 },
      8: { cellWidth: 14 },
      9: { cellWidth: 16 },
    },
    styles: {
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      overflow: "linebreak",
    },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    margin: { left: MARGIN, right: MARGIN },
    didDrawPage: () => {
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "italic");
      doc.text(
        `Generated: ${new Date().toLocaleString("id-ID")} | SMARTTRAFO - PLN UPT Manado`,
        PAGE_W / 2,
        PAGE_H - 8,
        { align: "center" },
      );
    },
  });
};

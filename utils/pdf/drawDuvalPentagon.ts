import { computeDuvalPentagonCentroid } from "./calculations";

// Fungsi untuk menggambar Duval Pentagon dengan warna zona
export const drawDuvalPentagon = (
  doc: any,
  centerX: number,
  centerY: number,
  size: number,
  gasData: any,
) => {
  const { h2, ch4, c2h6, c2h4, c2h2 } = gasData;
  const total = h2 + ch4 + c2h6 + c2h4 + c2h2;

  if (total === 0) return;

  const scale = size / 90;

  const toX = (x: number) => centerX + x * scale;
  const toY = (y: number) => centerY - y * scale;

  // Warna zona
  const colors: Record<string, number[]> = {
    PD: [200, 162, 240],
    D1: [120, 180, 250],
    D2: [250, 140, 140],
    T3: [250, 170, 100],
    T2: [250, 220, 80],
    T1: [250, 235, 140],
    S: [120, 230, 160],
  };

  // Helper untuk menggambar polygon dengan outline
  const drawZone = (
    points: number[][],
    color: number[],
    strokeColor: number[] = [80, 80, 80],
    strokeWidth = 0.1,
  ) => {
    if (points.length < 3) return;

    // Konversi semua points
    const coords = points.map((p) => [toX(p[0]), toY(p[1])]);

    // Set fill color
    doc.setFillColor(color[0], color[1], color[2]);

    // Gambar polygon dengan triangulation
    for (let i = 1; i < coords.length - 1; i++) {
      doc.triangle(
        coords[0][0],
        coords[0][1],
        coords[i][0],
        coords[i][1],
        coords[i + 1][0],
        coords[i + 1][1],
        "F",
      );
    }

    // Gambar outline untuk setiap zona agar terlihat jelas batasnya
    doc.setDrawColor(strokeColor[0], strokeColor[1], strokeColor[2]);
    doc.setLineWidth(strokeWidth);
    for (let i = 0; i < coords.length; i++) {
      const next = (i + 1) % coords.length;
      doc.line(coords[i][0], coords[i][1], coords[next][0], coords[next][1]);
    }
  };

  // Gambar zona TANPA overlap - setiap zona terpisah dengan jelas

  // T2 - Kuning (segitiga bawah tengah)
  drawZone(
    [
      [-6, -4],
      [1, -32.4],
      [-22.5, -32.4],
    ],
    colors.T2,
    [70, 70, 70],
    0.15,
  );

  // T3 - Orange (bawah kanan)
  drawZone(
    [
      [0, -3],
      [24.3, -30],
      [23.5, -32.4],
      [1, -32.4],
      [-6, -4],
    ],
    colors.T3,
    [70, 70, 70],
    0.15,
  );

  // T1 - Kuning muda (kiri besar) - DIPERBAIKI tanpa overlap dengan T2/T3
  drawZone(
    [
      [-35, 3.1],
      [-23.5, -32.4],
      [-22.5, -32.4],
      [-6, -4],
      [0, -3],
      [0, 1.5],
    ],
    colors.T1,
    [70, 70, 70],
    0.15,
  );

  // D2 - Merah (kanan tengah ke bawah)
  drawZone(
    [
      [4, 16],
      [32, -6.1],
      [24.3, -30],
      [0, -3],
      [0, 1.5],
    ],
    colors.D2,
    [70, 70, 70],
    0.15,
  );

  // D1 - Biru (kanan atas ke tengah) - tanpa overlap dengan S
  drawZone(
    [
      [1, 24.5],
      [1, 33],
      [0, 40],
      [38, 12],
      [32, -6.1],
      [4, 16],
      [0, 1.5],
    ],
    colors.D1,
    [70, 70, 70],
    0.15,
  );

  // S - Hijau (kiri atas ke atas) - tanpa overlap dengan D1
  drawZone(
    [
      [0, 1.5],
      [-35, 3.1],
      [-38, 12.4],
      [0, 40],
      [0, 33],
      [-1, 33],
      [-1, 24.5],
      [0, 24.5],
    ],
    colors.S,
    [70, 70, 70],
    0.15,
  );

  // PD - Ungu (kotak kecil di tengah atas) - paling depan
  drawZone(
    [
      [-1, 24.5],
      [-1, 33],
      [1, 33],
      [1, 24.5],
    ],
    colors.PD,
    [60, 60, 60],
    0.2,
  );

  // Gambar outline pentagon (5 sudut)
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.4);
  const pentagonPoints = [
    { x: 0, y: 40 }, // H2 (atas)
    { x: 38, y: 12 }, // C2H2 (kanan atas)
    { x: 24, y: -32 }, // C2H4 (kanan bawah)
    { x: -24, y: -32 }, // CH4 (kiri bawah)
    { x: -38, y: 12 }, // C2H6 (kiri atas)
  ];
  for (let i = 0; i < 5; i++) {
    const next = (i + 1) % 5;
    doc.line(
      toX(pentagonPoints[i].x),
      toY(pentagonPoints[i].y),
      toX(pentagonPoints[next].x),
      toY(pentagonPoints[next].y),
    );
  }

  // Gambar garis dari pusat ke setiap sudut
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.2);
  pentagonPoints.forEach((p) => {
    doc.line(centerX, centerY, toX(p.x), toY(p.y));
  });

  // Label gas di setiap sudut
  doc.setFontSize(6);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("H2", toX(0) - 3, toY(40) - 2);
  doc.text("C2H2", toX(38) + 1, toY(12) + 1);
  doc.text("C2H4", toX(24) + 1, toY(-32) + 4);
  doc.text("CH4", toX(-24) - 9, toY(-32) + 4);
  doc.text("C2H6", toX(-38) - 11, toY(12) + 1);

  // Label zona di dalam pentagon
  doc.setFontSize(5);
  doc.setTextColor(50, 50, 50);
  doc.text("PD", toX(2), toY(28));
  doc.text("S", toX(-18), toY(18));
  doc.text("D1", toX(15), toY(15));
  doc.text("D2", toX(12), toY(-8));
  doc.text("T3", toX(5), toY(-22));
  doc.text("T2", toX(-10), toY(-22));
  doc.text("T1", toX(-18), toY(-8));

  // Hitung posisi titik diagnosis (rumus sama dengan React component & detectDuvalZone)
  const centroid = computeDuvalPentagonCentroid({ h2, ch4, c2h6, c2h4, c2h2 });
  if (!centroid) return;
  const { Cx, Cy } = centroid;

  const dotX = toX(Cx);
  const dotY = toY(Cy);

  // Gambar titik diagnosis (merah)
  doc.setFillColor(255, 0, 0);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.circle(dotX, dotY, 2, "FD");
};

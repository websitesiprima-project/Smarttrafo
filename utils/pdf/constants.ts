// Warna IEEE C57.104-2019
export const IEEE_COLORS = {
  kondisi1: [0, 128, 0], // Hijau biasa
  kondisi2: [204, 153, 0], // Kuning tua
  kondisi3: [178, 34, 34], // Merah darah
};

// Warna SPLN T5.004-4:2016
export const SPLN_COLORS = {
  kondisi1: [0, 128, 0], // Hijau
  kondisi2: [255, 140, 0], // Orange
  kondisi3: [255, 64, 30], // Merah muda (pink)
  kondisi4: [128, 0, 0], // Merah maroon/tua
};

// Warna status SPLN untuk tabel Panduan
export const SPLN_STATUS_COLORS = {
  veryGood: [144, 238, 144], // Hijau muda (light green)
  good: [34, 139, 34], // Hijau tua (forest green)
  fair: [255, 140, 0], // Orange
  poor: [255, 105, 180], // Merah muda (pink)
  critical: [139, 0, 0], // Merah tua (dark red)
};

// Batas IEEE C57.104-2019
export const IEEE_LIMITS: Record<string, number> = {
  h2: 100,
  ch4: 120,
  c2h2: 1,
  c2h4: 50,
  c2h6: 65,
  co: 350,
  co2: 2500,
};

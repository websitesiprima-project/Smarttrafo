// Tipe & helper murni untuk fitur Import Excel (components/ExcelImportModal.tsx).
// Dipisah dari komponennya karena tidak bergantung pada state/props React.

export interface ExcelRow {
  _rowNum: number;
  _isValid?: boolean;
  _isExample?: boolean;
  lokasi_gi?: string;
  nama_trafo?: string;
  tanggal_sampling?: string;
  diambil_oleh?: string;
  no_dokumen?: string;
  merk_trafo?: string;
  serial_number?: string;
  level_tegangan?: string;
  mva?: string | number;
  tahun_pembuatan?: string | number;
  suhu_sampel?: number;
  co?: number;
  co2?: number;
  h2?: number;
  ch4?: number;
  c2h6?: number;
  c2h4?: number;
  c2h2?: number;
  [key: string]: any;
}

export interface ValidationError {
  row: number;
  gi: string;
  trafo: string;
  type: string;
  message: string;
  error?: string;
}

// Mapping kolom Excel ke field API
export const COLUMN_MAPPING: Record<string, string> = {
  "Gardu Induk": "lokasi_gi",
  "Unit Trafo": "nama_trafo",
  "Tanggal Uji": "tanggal_sampling",
  Petugas: "diambil_oleh",
  CO: "co",
  CO2: "co2",
  H2: "h2",
  CH4: "ch4",
  C2H6: "c2h6",
  C2H4: "c2h4",
  C2H2: "c2h2",
};

export const REQUIRED_COLUMNS = [
  "Gardu Induk",
  "Unit Trafo",
  "Tanggal Uji",
  "CO",
  "CO2",
  "H2",
  "CH4",
  "C2H6",
  "C2H4",
  "C2H2",
];

// Parse berbagai format tanggal (termasuk Excel serial number)
export const parseDate = (dateValue: string | number | Date): string => {
  // Helper to format date as YYYY-MM-DD
  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  // Get today's date as fallback
  const today = new Date();
  const todayStr = formatDate(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );

  if (!dateValue) return todayStr;

  if (typeof dateValue === "number") {
    // Excel serial to JS Date (base date: Dec 30, 1899)
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(
      excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000,
    );
    return formatDate(
      jsDate.getFullYear(),
      jsDate.getMonth() + 1,
      jsDate.getDate(),
    );
  }

  if (dateValue instanceof Date) {
    // Add 1 day to fix timezone offset issue with xlsx
    const adjusted = new Date(dateValue.getTime() + 24 * 60 * 60 * 1000);
    return formatDate(
      adjusted.getFullYear(),
      adjusted.getMonth() + 1,
      adjusted.getDate(),
    );
  }

  const str = String(dateValue).trim();

  const months: Record<string, number> = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };

  // Try: "Month DD, YYYY" or "Month DD YYYY"
  const match1 = str.match(/^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/i);
  if (match1) {
    const month = months[match1[1].toLowerCase()];
    if (month)
      return formatDate(parseInt(match1[3]), month, parseInt(match1[2]));
  }

  // Try: "DD Month YYYY"
  const match1b = str.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/i);
  if (match1b) {
    const month = months[match1b[2].toLowerCase()];
    if (month)
      return formatDate(parseInt(match1b[3]), month, parseInt(match1b[1]));
  }

  // Try: "DD/MM/YYYY" atau "DD-MM-YYYY"
  const match2 = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match2)
    return formatDate(
      parseInt(match2[3]),
      parseInt(match2[2]),
      parseInt(match2[1]),
    );

  // Try: "YYYY-MM-DD"
  const match3 = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match3)
    return formatDate(
      parseInt(match3[1]),
      parseInt(match3[2]),
      parseInt(match3[3]),
    );

  // Try: "MM/DD/YYYY" (format US)
  const match4 = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match4) {
    const first = parseInt(match4[1]);
    const second = parseInt(match4[2]);
    if (first <= 12) return formatDate(parseInt(match4[3]), first, second);
  }

  return todayStr;
};

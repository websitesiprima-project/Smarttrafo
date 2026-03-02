"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileCheck,
  AlertTriangle,
  Download,
  XCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabaseClient";

const API_URL = "http://127.0.0.1:8000";

// ============================================================================
// INTERFACES (KAMUS TYPE SCRIPT)
// ============================================================================
interface ExcelImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
  isDarkMode?: boolean;
  userRole?: string;
  userUnit?: string;
}

interface ExcelRow {
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

interface ValidationError {
  row: number;
  gi: string;
  trafo: string;
  type: string;
  message: string;
  error?: string;
}

// Mapping kolom Excel ke field API
const COLUMN_MAPPING: Record<string, string> = {
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

const REQUIRED_COLUMNS = [
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
const parseDate = (dateValue: string | number | Date): string => {
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

export default function ExcelImportModal({
  onClose,
  onSuccess,
  isDarkMode = false,
  userRole,
  userUnit,
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ExcelRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState({
    success: 0,
    failed: 0,
    errors: [] as ValidationError[],
  });
  const [stage, setStage] = useState<
    "upload" | "preview" | "processing" | "done"
  >("upload");
  const [dragOver, setDragOver] = useState(false);
  const [inputKey, setInputKey] = useState(Date.now());

  const [masterAssets, setMasterAssets] = useState<any[]>([]);
  const [ultgHierarchy, setUltgHierarchy] = useState<Record<string, any[]>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Fetch master assets and ULTG hierarchy on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await (
          supabase.from("assets_trafo") as any
        ).select("*");
        if (error) throw error;
        if (data) setMasterAssets(data);

        const hierarchyRes = await fetch(`${API_URL}/master/hierarchy`);
        const hierarchyData = await hierarchyRes.json();
        if (hierarchyData) setUltgHierarchy(hierarchyData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const theme = {
    bg: isDarkMode ? "bg-slate-800" : "bg-white",
    text: isDarkMode ? "text-white" : "text-gray-900",
    subText: isDarkMode ? "text-slate-400" : "text-gray-500",
    border: isDarkMode ? "border-slate-700" : "border-gray-200",
    cardBg: isDarkMode ? "bg-slate-900" : "bg-gray-50",
    hoverBg: isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-100",
  };

  // Function to download Excel template
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const headers = [
      "Gardu Induk",
      "Unit Trafo",
      "Tanggal Uji",
      "Petugas",
      "CO",
      "CO2",
      "H2",
      "CH4",
      "C2H6",
      "C2H4",
      "C2H2",
      "",
    ];
    const exampleRow = [
      "Ex: GI Teling",
      "Ex: TD #1",
      "Ex: 18/11/2025",
      "Ex: Ivan",
      "121",
      "122",
      "123",
      "124",
      "125",
      "126",
      "127",
      "<- hapus baris ini sebelum diisi",
    ];

    const templateData: any[] = [headers, exampleRow];
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    ws["!cols"] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 25 },
    ];

    const headerStyle = {
      fill: { fgColor: { rgb: "DAEEF3" } },
      font: { bold: true },
    };
    const headerCells = [
      "A1",
      "B1",
      "C1",
      "D1",
      "E1",
      "F1",
      "G1",
      "H1",
      "I1",
      "J1",
      "K1",
    ];
    headerCells.forEach((cellRef) => {
      if (ws[cellRef]) ws[cellRef].s = headerStyle;
    });

    XLSX.utils.book_append_sheet(wb, ws, "Data DGA");
    XLSX.writeFile(wb, "Template_Import_DGA.xlsx");
  };

  const handleFileSelect = useCallback(
    (selectedFile: File | undefined | null) => {
      if (!selectedFile) return;

      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];

      if (
        !validTypes.includes(selectedFile.type) &&
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        setErrors(["File harus berformat Excel (.xlsx atau .xls)"]);
        setInputKey(Date.now());
        return;
      }

      setFile(selectedFile);
      setErrors([]);
      setValidationErrors([]);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (!e.target?.result) throw new Error("Gagal membaca isi file");

          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array", cellDates: false });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Define standard type for rows from xlsx
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(
            worksheet,
            { defval: 0 },
          );

          if (jsonData.length === 0) {
            setErrors(["File Excel kosong atau tidak memiliki data."]);
            setInputKey(Date.now());
            return;
          }

          const headers = Object.keys(jsonData[0]);
          const missingColumns = REQUIRED_COLUMNS.filter(
            (col) =>
              !headers.some(
                (h) => h.toLowerCase().trim() === col.toLowerCase(),
              ),
          );

          if (missingColumns.length > 0) {
            setErrors([`Kolom tidak ditemukan: ${missingColumns.join(", ")}`]);
            setInputKey(Date.now());
            return;
          }

          const valErrors: ValidationError[] = [];
          const transformed: ExcelRow[] = jsonData.map((row, idx) => {
            const newRow: ExcelRow = { _rowNum: idx + 2 };

            Object.entries(COLUMN_MAPPING).forEach(([excelCol, apiField]) => {
              const matchedKey = Object.keys(row).find(
                (k) => k.toLowerCase().trim() === excelCol.toLowerCase(),
              );

              if (matchedKey) {
                let value = row[matchedKey];
                if (apiField === "tanggal_sampling") {
                  value = parseDate(value);
                } else if (
                  ["co", "co2", "h2", "ch4", "c2h6", "c2h4", "c2h2"].includes(
                    apiField,
                  )
                ) {
                  value = parseFloat(value) || 0;
                }
                newRow[apiField] = value;
              }
            });

            const inputGI = String(newRow.lokasi_gi || "").trim();
            const inputTrafo = String(newRow.nama_trafo || "").trim();

            if (
              inputGI.toLowerCase().startsWith("ex:") ||
              inputTrafo.toLowerCase().startsWith("ex:")
            ) {
              newRow._isExample = true;
              return newRow;
            }

            const normalizeGI = (gi: string) => {
              const normalized = gi.toLowerCase().trim();
              if (normalized.startsWith("gi "))
                return normalized.substring(3).trim();
              return normalized;
            };

            let matchedAsset = null;
            const inputGINormalized = normalizeGI(inputGI);
            const inputTrafoLower = inputTrafo.toLowerCase();

            for (const asset of masterAssets) {
              const dbGINormalized = normalizeGI(asset.lokasi_gi);
              const dbTrafoLower = asset.nama_trafo.toLowerCase();

              const giMatches =
                asset.lokasi_gi.toLowerCase() === inputGI.toLowerCase() ||
                dbGINormalized === inputGINormalized;
              const trafoMatches = dbTrafoLower === inputTrafoLower;

              if (giMatches && trafoMatches) {
                matchedAsset = asset;
                break;
              }
            }

            if (matchedAsset) {
              newRow.lokasi_gi = matchedAsset.lokasi_gi;
              newRow.nama_trafo = matchedAsset.nama_trafo;
              newRow.merk_trafo = matchedAsset.merk || "";
              newRow.serial_number = matchedAsset.serial_number || "";
              newRow.level_tegangan = matchedAsset.level_tegangan || "";
              newRow.tahun_pembuatan = matchedAsset.tahun_pembuatan || "";
              newRow._isValid = true;
            } else {
              const giExists = masterAssets.some((asset) => {
                const dbGINormalized = normalizeGI(asset.lokasi_gi);
                return (
                  asset.lokasi_gi.toLowerCase() === inputGI.toLowerCase() ||
                  dbGINormalized === inputGINormalized
                );
              });

              if (!giExists) {
                valErrors.push({
                  row: idx + 2,
                  gi: inputGI,
                  trafo: inputTrafo,
                  type: "gi_not_found",
                  message: `Gardu Induk "${inputGI}" tidak terdaftar`,
                });
              } else {
                valErrors.push({
                  row: idx + 2,
                  gi: inputGI,
                  trafo: inputTrafo,
                  type: "trafo_not_found",
                  message: `Unit Trafo "${inputTrafo}" di ${inputGI} tidak terdaftar`,
                });
              }
              newRow._isValid = false;
            }

            newRow.no_dokumen = "-";
            if (!newRow.merk_trafo) newRow.merk_trafo = "";
            if (!newRow.serial_number) newRow.serial_number = "";
            if (!newRow.level_tegangan) newRow.level_tegangan = "";
            newRow.mva = "";
            if (!newRow.tahun_pembuatan) newRow.tahun_pembuatan = "";
            newRow.suhu_sampel = 0;

            return newRow;
          });

          const validData = transformed.filter((row) => !row._isExample);

          if (userRole !== "super_admin" && userUnit) {
            const allowedGIs = (ultgHierarchy[userUnit] || []).map(
              (gi) => gi.name,
            );
            const ultgErrors: ValidationError[] = [];

            validData.forEach((row) => {
              if (!row._isValid) return;

              const rowGI = (row.lokasi_gi || "").trim();
              const isAllowed = allowedGIs.some(
                (allowed: string) =>
                  rowGI.toLowerCase().includes(allowed.toLowerCase()) ||
                  allowed.toLowerCase().includes(rowGI.toLowerCase()),
              );

              if (!isAllowed) {
                ultgErrors.push({
                  row: row._rowNum,
                  gi: rowGI,
                  trafo: row.nama_trafo || "",
                  type: "ultg_unauthorized",
                  message: `GI "${rowGI}" bukan bagian dari ULTG ${userUnit}.`,
                });
              }
            });

            if (ultgErrors.length > 0) valErrors.push(...ultgErrors);
          }

          if (valErrors.length > 0) {
            setValidationErrors(valErrors);
            setShowValidationModal(true);
            setInputKey(Date.now());
            return;
          }

          setParsedData(validData);
          setStage("preview");
        } catch (err) {
          console.error("Parse error:", err);
          setErrors(["Gagal membaca file Excel. Pastikan format file benar."]);
          setInputKey(Date.now());
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    },
    [masterAssets, ultgHierarchy, userRole, userUnit],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const startImport = async () => {
    setStage("processing");
    setIsProcessing(true);
    setProgress({ current: 0, total: parsedData.length });
    setResults({ success: 0, failed: 0, errors: [] });

    let success = 0;
    let failed = 0;
    const importErrors: ValidationError[] = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < parsedData.length; i += BATCH_SIZE) {
      const batch = parsedData.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async (row) => {
        try {
          const payload = { ...row, skip_ai: true };
          delete (payload as any)._rowNum;
          delete (payload as any)._isValid;
          delete (payload as any)._isExample;

          const res = await fetch(`${API_URL}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            return { success: true, row };
          } else {
            const errData = await res.json();
            throw new Error(errData.msg || "Gagal simpan");
          }
        } catch (err) {
          return { success: false, row, err };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach((res) => {
        if (res.success) {
          success++;
        } else {
          failed++;
          importErrors.push({
            row: res.row._rowNum || 0,
            gi: res.row.lokasi_gi || "-",
            trafo: res.row.nama_trafo || "-",
            type: "import_failed",
            message: (res.err as Error).message,
          });
        }
      });

      setProgress({
        current: Math.min(i + BATCH_SIZE, parsedData.length),
        total: parsedData.length,
      });
    }

    setResults({ success, failed, errors: importErrors });
    setStage("done");
    setIsProcessing(false);
  };

  const handleClose = () => {
    if (stage === "done" && results.success > 0) {
      onSuccess();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-4xl rounded-2xl shadow-2xl ${theme.bg} max-h-[90vh] flex flex-col`}
      >
        <div
          className={`flex items-center justify-between p-5 border-b ${theme.border}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <FileSpreadsheet className="text-green-500" size={24} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${theme.text}`}>
                Import Data Excel
              </h2>
              <p className={`text-xs ${theme.subText}`}>
                {stage === "upload" && "Upload file Excel dengan data DGA"}
                {stage === "preview" &&
                  `${parsedData.length} data siap diimport`}
                {stage === "processing" &&
                  `Memproses ${progress.current}/${progress.total}...`}
                {stage === "done" &&
                  `Selesai: ${results.success} berhasil, ${results.failed} gagal`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className={`p-2 rounded-full transition ${theme.hoverBg} ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <X size={20} className={theme.subText} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {stage === "upload" && (
            <div className="space-y-6">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragOver ? "border-green-500 bg-green-500/5" : `${theme.border} ${theme.cardBg}`}`}
              >
                <Upload
                  className={`mx-auto mb-4 ${dragOver ? "text-green-500" : theme.subText}`}
                  size={48}
                />
                <p className={`font-medium mb-2 ${theme.text}`}>
                  Drag & drop file Excel di sini
                </p>
                <p className={`text-sm mb-4 ${theme.subText}`}>atau</p>
                <label className="inline-block px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium cursor-pointer transition">
                  Pilih File
                  <input
                    key={inputKey}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
                <p className={`text-xs mt-4 ${theme.subText}`}>
                  Format: .xlsx atau .xls
                </p>

                {errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    {errors.map((err, i) => (
                      <p
                        key={i}
                        className="text-sm text-red-500 flex items-center justify-center gap-2"
                      >
                        <AlertCircle size={16} /> {err}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div
                className={`rounded-xl border overflow-hidden ${theme.border}`}
              >
                <div
                  className={`px-4 py-3 border-b ${theme.border} ${isDarkMode ? "bg-slate-900" : "bg-gray-100"} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
                >
                  <div>
                    <h3
                      className={`font-bold text-sm flex items-center gap-2 ${theme.text}`}
                    >
                      <FileSpreadsheet size={16} className="text-green-500" />{" "}
                      Contoh Format Template Excel
                    </h3>
                    <p className={`text-xs mt-1 ${theme.subText}`}>
                      Pastikan file Excel Anda memiliki kolom dengan nama persis
                      seperti di bawah ini
                    </p>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-xs flex items-center gap-2 transition whitespace-nowrap"
                  >
                    <Download size={14} /> Download Template
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead
                      className={isDarkMode ? "bg-slate-800" : "bg-gray-50"}
                    >
                      <tr>
                        <th
                          className={`px-3 py-2 text-left font-bold border-r ${theme.border} ${theme.text}`}
                        >
                          Gardu Induk
                        </th>
                        <th
                          className={`px-3 py-2 text-left font-bold border-r ${theme.border} ${theme.text}`}
                        >
                          Unit Trafo
                        </th>
                        <th
                          className={`px-3 py-2 text-left font-bold border-r ${theme.border} ${theme.text}`}
                        >
                          Tanggal Uji
                        </th>
                        <th
                          className={`px-3 py-2 text-left font-bold border-r ${theme.border} ${theme.text}`}
                        >
                          Petugas
                        </th>
                        <th
                          className={`px-3 py-2 text-center font-bold border-r ${theme.border} text-blue-500`}
                        >
                          CO
                        </th>
                        <th
                          className={`px-3 py-2 text-center font-bold border-r ${theme.border} text-blue-500`}
                        >
                          CO2
                        </th>
                        <th
                          className={`px-3 py-2 text-center font-bold border-r ${theme.border} text-green-500`}
                        >
                          H2
                        </th>
                        <th
                          className={`px-3 py-2 text-center font-bold border-r ${theme.border} text-green-500`}
                        >
                          CH4
                        </th>
                        <th
                          className={`px-3 py-2 text-center font-bold border-r ${theme.border} text-orange-500`}
                        >
                          C2H6
                        </th>
                        <th
                          className={`px-3 py-2 text-center font-bold border-r ${theme.border} text-orange-500`}
                        >
                          C2H4
                        </th>
                        <th
                          className={`px-3 py-2 text-center font-bold text-red-500`}
                        >
                          C2H2
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme.border}`}>
                      <tr className={theme.hoverBg}>
                        <td
                          className={`px-3 py-2 border-r ${theme.border} ${theme.text}`}
                        >
                          GI Teling
                        </td>
                        <td
                          className={`px-3 py-2 border-r ${theme.border} ${theme.text}`}
                        >
                          TD #1
                        </td>
                        <td
                          className={`px-3 py-2 border-r ${theme.border} ${theme.subText}`}
                        >
                          2025-11-18
                        </td>
                        <td
                          className={`px-3 py-2 border-r ${theme.border} ${theme.subText}`}
                        >
                          M Ifan
                        </td>
                        <td
                          className={`px-3 py-2 text-center border-r ${theme.border} font-mono ${theme.text}`}
                        >
                          199
                        </td>
                        <td
                          className={`px-3 py-2 text-center border-r ${theme.border} font-mono ${theme.text}`}
                        >
                          631
                        </td>
                        <td
                          className={`px-3 py-2 text-center border-r ${theme.border} font-mono ${theme.text}`}
                        >
                          0
                        </td>
                        <td
                          className={`px-3 py-2 text-center border-r ${theme.border} font-mono ${theme.text}`}
                        >
                          5
                        </td>
                        <td
                          className={`px-3 py-2 text-center border-r ${theme.border} font-mono ${theme.text}`}
                        >
                          2
                        </td>
                        <td
                          className={`px-3 py-2 text-center border-r ${theme.border} font-mono ${theme.text}`}
                        >
                          4
                        </td>
                        <td
                          className={`px-3 py-2 text-center font-mono ${theme.text}`}
                        >
                          0
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {stage === "preview" && (
            <div className="space-y-4">
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${isDarkMode ? "bg-green-500/10" : "bg-green-50"}`}
              >
                <FileCheck className="text-green-500" size={20} />
                <span className={`text-sm font-medium ${theme.text}`}>
                  {file?.name} - {parsedData.length} baris data
                </span>
              </div>
              <div
                className={`rounded-xl border overflow-hidden ${theme.border}`}
              >
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-sm">
                    <thead
                      className={`sticky top-0 ${isDarkMode ? "bg-slate-900" : "bg-gray-100"}`}
                    >
                      <tr>
                        <th
                          className={`px-3 py-2 text-left font-bold ${theme.text}`}
                        >
                          #
                        </th>
                        <th
                          className={`px-3 py-2 text-left font-bold ${theme.text}`}
                        >
                          Gardu Induk
                        </th>
                        <th
                          className={`px-3 py-2 text-left font-bold ${theme.text}`}
                        >
                          Unit Trafo
                        </th>
                        <th
                          className={`px-3 py-2 text-left font-bold ${theme.text}`}
                        >
                          Tanggal
                        </th>
                        <th
                          className={`px-3 py-2 text-left font-bold ${theme.text}`}
                        >
                          Petugas
                        </th>
                        <th
                          className={`px-3 py-2 text-right font-bold ${theme.text}`}
                        >
                          CO
                        </th>
                        <th
                          className={`px-3 py-2 text-right font-bold ${theme.text}`}
                        >
                          H2
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme.border}`}>
                      {parsedData.map((row, idx) => (
                        <tr key={idx} className={theme.hoverBg}>
                          <td className={`px-3 py-2 ${theme.subText}`}>
                            {idx + 1}
                          </td>
                          <td className={`px-3 py-2 font-medium ${theme.text}`}>
                            {row.lokasi_gi}
                          </td>
                          <td className={`px-3 py-2 ${theme.text}`}>
                            {row.nama_trafo}
                          </td>
                          <td className={`px-3 py-2 ${theme.subText}`}>
                            {row.tanggal_sampling}
                          </td>
                          <td className={`px-3 py-2 ${theme.subText}`}>
                            {row.diambil_oleh || "-"}
                          </td>
                          <td
                            className={`px-3 py-2 text-right font-mono ${theme.text}`}
                          >
                            {row.co}
                          </td>
                          <td
                            className={`px-3 py-2 text-right font-mono ${theme.text}`}
                          >
                            {row.h2}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {stage === "processing" && (
            <div className="text-center py-10">
              <Loader2
                className="mx-auto mb-4 animate-spin text-green-500"
                size={48}
              />
              <p className={`font-bold text-lg mb-2 ${theme.text}`}>
                Memproses Data...
              </p>
              <p className={`text-sm mb-6 ${theme.subText}`}>
                {progress.current} dari {progress.total} data
              </p>
              <div
                className={`w-full max-w-md mx-auto h-3 rounded-full overflow-hidden ${theme.cardBg}`}
              >
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {stage === "done" && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <CheckCircle
                  className="mx-auto mb-4 text-green-500"
                  size={56}
                />
                <p className={`font-bold text-xl mb-2 ${theme.text}`}>
                  Import Selesai!
                </p>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-3xl font-black text-green-500">
                      {results.success}
                    </p>
                    <p className={`text-xs ${theme.subText}`}>Berhasil</p>
                  </div>
                  {results.failed > 0 && (
                    <div className="text-center">
                      <p className="text-3xl font-black text-red-500">
                        {results.failed}
                      </p>
                      <p className={`text-xs ${theme.subText}`}>Gagal</p>
                    </div>
                  )}
                </div>
              </div>
              {results.errors.length > 0 && (
                <div className={`rounded-xl border p-4 ${theme.border}`}>
                  <p className={`font-bold text-sm mb-3 ${theme.text}`}>
                    Detail Error:
                  </p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {results.errors.map((err, i) => (
                      <div
                        key={i}
                        className={`text-xs p-2 rounded ${isDarkMode ? "bg-red-500/10" : "bg-red-50"}`}
                      >
                        <span className="text-red-500 font-medium">
                          Baris {err.row}:
                        </span>{" "}
                        <span className={theme.subText}>
                          {err.gi} - {err.trafo}
                        </span>{" "}
                        <span className="text-red-400">({err.error})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`p-5 border-t ${theme.border} flex justify-end gap-3`}>
          {stage === "upload" && (
            <button
              onClick={onClose}
              className={`px-5 py-2.5 rounded-lg font-medium transition ${isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
            >
              Batal
            </button>
          )}
          {stage === "preview" && (
            <>
              <button
                onClick={() => {
                  setStage("upload");
                  setFile(null);
                  setParsedData([]);
                }}
                className={`px-5 py-2.5 rounded-lg font-medium transition ${isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              >
                Ganti File
              </button>
              <button
                onClick={startImport}
                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition flex items-center gap-2"
              >
                <Upload size={18} /> Mulai Import ({parsedData.length} data)
              </button>
            </>
          )}
          {stage === "done" && (
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition"
            >
              Selesai
            </button>
          )}
        </div>
      </div>

      {showValidationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60] p-4">
          <div
            className={`${theme.bg} rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden border ${theme.border}`}
          >
            <div className="bg-linear-to-r from-red-500 to-orange-500 p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <XCircle className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Data Tidak Valid
                  </h3>
                  <p className="text-white/80 text-sm">
                    Ditemukan {validationErrors.length} data yang tidak
                    terdaftar
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 max-h-[50vh] overflow-y-auto">
              <div
                className={`p-4 rounded-xl mb-4 ${isDarkMode ? "bg-orange-500/10 border border-orange-500/30" : "bg-orange-50 border border-orange-200"}`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="text-orange-500 mt-0.5 shrink-0"
                    size={20}
                  />
                  <div>
                    <p
                      className={`font-semibold ${isDarkMode ? "text-orange-400" : "text-orange-700"}`}
                    >
                      Data tidak dapat diproses
                    </p>
                    <p
                      className={`text-sm mt-1 ${isDarkMode ? "text-orange-300/80" : "text-orange-600"}`}
                    >
                      Silahkan perbaiki data yang ditandai atau hubungi admin
                      UPT Manado
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {validationErrors.map((err, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${isDarkMode ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"}`}
                      >
                        Baris {err.row}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${err.type === "gi_not_found" ? (isDarkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600") : err.type === "ultg_unauthorized" ? (isDarkMode ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600") : isDarkMode ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"}`}
                      >
                        {err.type === "gi_not_found"
                          ? "GI tidak terdaftar"
                          : err.type === "ultg_unauthorized"
                            ? "Akses Ditolak"
                            : "Trafo tidak terdaftar"}
                      </span>
                    </div>
                    <div
                      className={`text-sm ${theme.text} ${err.type === "ultg_unauthorized" ? "font-semibold" : ""}`}
                    >
                      {err.type === "ultg_unauthorized" ? (
                        <div>
                          <p className="text-red-500 font-bold mb-1">
                            ⛔ {err.message}
                          </p>
                          <p className="text-xs opacity-70">
                            <span className="font-medium">GI:</span> {err.gi} •{" "}
                            <span className="font-medium">Trafo:</span>{" "}
                            {err.trafo}
                          </p>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">GI:</span> {err.gi} •{" "}
                          <span className="font-medium">Trafo:</span>{" "}
                          {err.trafo}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-5 border-t ${theme.border} flex gap-3`}>
              <button
                onClick={() => {
                  setShowValidationModal(false);
                  setValidationErrors([]);
                  setFile(null);
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition ${isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              >
                Tutup & Perbaiki File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

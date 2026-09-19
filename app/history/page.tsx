"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Trash2,
  Search,
  Calendar,
  MapPin,
  AlertTriangle,
  Info,
  X,
  Loader2,
  Filter,
  Download,
  CheckSquare,
  Square,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";
import { generatePDFFromTemplate, generatePDFBlob } from "@/utils/PDFGenerator";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { supabase } from "@/lib/supabaseClient";
import ExcelImportModal from "@/components/ExcelImportModal"; // Pastikan path ini benar di project Anda
import DetailEditModal from "@/components/history/DetailEditModal";
import DeleteConfirmModal from "@/components/history/DeleteConfirmModal";

// ============================================================================
// INTERFACES
// ============================================================================
interface HistoryRecord {
  id: string | number;
  lokasi_gi: string;
  nama_trafo: string;
  merk_trafo?: string;
  serial_number?: string;
  tahun_pembuatan?: string | number;
  level_tegangan?: string;
  diambil_oleh?: string;
  tanggal_sampling: string;
  status_ieee: string;
  tdcg: string | number;
  h2?: string | number;
  ch4?: string | number;
  c2h6?: string | number;
  c2h4?: string | number;
  c2h2?: string | number;
  co?: string | number;
  co2?: string | number;
  [key: string]: any;
}

interface DeleteTarget {
  type: "single" | "batch" | "all";
  id?: string | number;
  item?: HistoryRecord;
  count?: number;
}

import { useAppContext } from "@/app/AppContext";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const {
    liveData: historyData = [],
    isDarkMode = false,
    fetchHistory,
    loadingHistory,
    userRole,
    userUnit,
    unitMapping = {},
  } = useAppContext();

  const router = useRouter();

  const onNavigateToGuide = (tab: string) => {
    // Navigate to guide page, perhaps with a query param if supported in the future
    router.push("/guide");
  };

  const onDeleteAll = async () => {
    try {
      if (userRole === "super_admin") {
        await supabase.from("riwayat_uji").delete().neq("id", 0);
        await fetchHistory();
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  // State Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortTdcg, setSortTdcg] = useState("default");

  // State Item & Action
  const [selectedItem, setSelectedItem] = useState<HistoryRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // State Batch
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);

  // State Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<HistoryRecord>>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [masterAssets, setMasterAssets] = useState<any[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State Import Excel
  const [showImportModal, setShowImportModal] = useState(false);

  const isSuperAdmin = userRole === "super_admin";

  // --- HELPER: Bangun data trending untuk satu item ---
  const buildTrendingData = (item: HistoryRecord | null) => {
    if (!item || !historyData || historyData.length === 0) return [];
    const labelTracker: Record<string, number> = {};
    return [...historyData]
      .filter(
        (h) =>
          h.lokasi_gi === item.lokasi_gi && h.nama_trafo === item.nama_trafo,
      )
      .sort((a, b) => {
        const da = new Date(a.tanggal_sampling).getTime();
        const db = new Date(b.tanggal_sampling).getTime();
        return da !== db ? da - db : (Number(a.id) || 0) - (Number(b.id) || 0);
      })
      .map((d) => {
        let baseLabel = new Date(d.tanggal_sampling).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
        if (labelTracker[baseLabel]) {
          labelTracker[baseLabel] += 1;
          baseLabel = `${baseLabel} (${labelTracker[baseLabel]})`;
        } else {
          labelTracker[baseLabel] = 1;
        }
        const tdcgCalc =
          Number(d.h2 || 0) +
          Number(d.ch4 || 0) +
          Number(d.c2h6 || 0) +
          Number(d.c2h4 || 0) +
          Number(d.c2h2 || 0) +
          Number(d.co || 0);
        return {
          ...d,
          dateLabel: baseLabel,
          H2: Number(d.h2 || 0),
          CH4: Number(d.ch4 || 0),
          C2H6: Number(d.c2h6 || 0),
          C2H4: Number(d.c2h4 || 0),
          C2H2: Number(d.c2h2 || 0),
          CO: Number(d.co || 0),
          CO2: Number(d.co2 || 0),
          TDCG: d.tdcg ? Number(d.tdcg) : tdcgCalc,
        };
      });
  };

  // --- FETCH MASTER ASSETS ---
  useEffect(() => {
    const fetchAssets = async () => {
      const { data } = await (supabase.from("assets_trafo") as any).select("*");
      if (data) setMasterAssets(data);
    };
    fetchAssets();
  }, []);

  // --- PROSES DATA GI DARI MAPPING (UNTUK FILTER & EDIT) ---
  const allGIs = useMemo(() => {
    let list: string[] = [];
    if (!unitMapping || Object.keys(unitMapping).length === 0) return [];

    Object.values(unitMapping).forEach((giList) => {
      if (Array.isArray(giList)) {
        giList.forEach((gi) => {
          const name = typeof gi === "string" ? gi : gi.name;
          if (name) list.push(name);
        });
      }
    });
    return list.sort();
  }, [unitMapping]);

  const availableTrafosForEdit = useMemo(() => {
    if (!editFormData.lokasi_gi) return [];
    return masterAssets
      .filter((a) => a.lokasi_gi === editFormData.lokasi_gi)
      .map((a) => a.nama_trafo)
      .sort((a, b) => {
        const aNum = parseInt(a.match(/\d+/)?.[0] || "0");
        const bNum = parseInt(b.match(/\d+/)?.[0] || "0");
        return aNum - bNum;
      });
  }, [editFormData.lokasi_gi, masterAssets]);

  // --- EDIT LOGIC ---
  const openEditModal = (item: HistoryRecord) => {
    setSelectedItem(item);
    setEditFormData({
      id: item.id,
      lokasi_gi: item.lokasi_gi,
      nama_trafo: item.nama_trafo,
      merk_trafo: item.merk_trafo,
      serial_number: item.serial_number,
      tahun_pembuatan: item.tahun_pembuatan,
      level_tegangan: item.level_tegangan,
      diambil_oleh: item.diambil_oleh,
      tanggal_sampling: item.tanggal_sampling,
    });
    setIsEditing(true);
  };

  const handleEditChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "lokasi_gi") {
      setEditFormData((prev) => ({
        ...prev,
        lokasi_gi: value,
        nama_trafo: "",
      }));
    } else if (name === "nama_trafo") {
      const asset = masterAssets.find(
        (a) => a.lokasi_gi === editFormData.lokasi_gi && a.nama_trafo === value,
      );
      setEditFormData((prev) => ({
        ...prev,
        nama_trafo: value,
        merk_trafo: asset?.merk || prev.merk_trafo,
        serial_number: asset?.serial_number || prev.serial_number,
        tahun_pembuatan: asset?.tahun_pembuatan || prev.tahun_pembuatan,
        level_tegangan: asset?.level_tegangan || prev.level_tegangan,
      }));
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveEdit = async () => {
    if (!editFormData.id) return;
    setIsSavingEdit(true);
    try {
      const { error } = await (supabase.from("riwayat_uji") as any)
        .update(editFormData)
        .eq("id", editFormData.id);
      if (error) throw error;
      toast.success("Data berhasil diperbarui!");
      fetchHistory();
      setIsEditing(false);
      setSelectedItem(null);
    } catch (e) {
      toast.error("Gagal update: " + (e as Error).message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // --- HITUNG TOTAL DATA BERDASARKAN ULTG ---
  const totalDataForUnit = useMemo(() => {
    if (isSuperAdmin || !userUnit) return historyData.length;

    const targetUnit = (userUnit || "")
      .toLowerCase()
      .replace(/ultg/g, "")
      .trim();
    const foundKey = Object.keys(unitMapping).find((key) => {
      const cleanKey = key.toLowerCase().replace(/ultg/g, "").trim();
      return cleanKey.includes(targetUnit) || targetUnit.includes(cleanKey);
    });

    const allowedGIs =
      foundKey && Array.isArray(unitMapping[foundKey])
        ? unitMapping[foundKey].map((g) => (typeof g === "string" ? g : g.name))
        : [];

    const unitData = historyData.filter((item) => {
      const itemGI = (item.lokasi_gi || "").trim();
      return allowedGIs.some(
        (allowed) =>
          itemGI.toLowerCase().includes(allowed.toLowerCase()) ||
          allowed.toLowerCase().includes(itemGI.toLowerCase()),
      );
    });

    return unitData.length;
  }, [historyData, userUnit, unitMapping, isSuperAdmin]);

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    let baseData = historyData;

    if (!isSuperAdmin && userUnit) {
      const targetUnit = (userUnit || "")
        .toLowerCase()
        .replace(/ultg/g, "")
        .trim();
      const foundKey = Object.keys(unitMapping).find((key) => {
        const cleanKey = key.toLowerCase().replace(/ultg/g, "").trim();
        return cleanKey.includes(targetUnit) || targetUnit.includes(cleanKey);
      });

      const allowedGIs =
        foundKey && Array.isArray(unitMapping[foundKey])
          ? unitMapping[foundKey].map((g) =>
              typeof g === "string" ? g : g.name,
            )
          : [];

      baseData = historyData.filter((item) => {
        const itemGI = (item.lokasi_gi || "").trim();
        return allowedGIs.some(
          (allowed) =>
            itemGI.toLowerCase().includes(allowed.toLowerCase()) ||
            allowed.toLowerCase().includes(itemGI.toLowerCase()),
        );
      });
    }

    let result = baseData.filter((item) => {
      const term = searchTerm.toLowerCase();
      const matchText =
        (item.nama_trafo || "").toLowerCase().includes(term) ||
        (item.lokasi_gi || "").toLowerCase().includes(term);
      const itemYear = item.tanggal_sampling
        ? item.tanggal_sampling.split("-")[0]
        : "";
      const matchYear = selectedYear === "All" || itemYear === selectedYear;

      let matchStatus = true;
      if (selectedStatus !== "All") {
        const status = (item.status_ieee || "").toLowerCase();
        if (selectedStatus === "1")
          matchStatus =
            status.includes("kondisi 1") || status.includes("normal");
        else if (selectedStatus === "2")
          matchStatus =
            status.includes("kondisi 2") || status.includes("waspada");
        else if (selectedStatus === "3")
          matchStatus =
            status.includes("kondisi 3") ||
            status.includes("bahaya") ||
            status.includes("kritis");
      }

      return matchText && matchYear && matchStatus;
    });

    if (sortTdcg === "highest")
      result = result.sort((a, b) => Number(b.tdcg || 0) - Number(a.tdcg || 0));
    else if (sortTdcg === "lowest")
      result = result.sort((a, b) => Number(a.tdcg || 0) - Number(b.tdcg || 0));
    else result = result.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

    return result;
  }, [
    historyData,
    searchTerm,
    selectedYear,
    selectedStatus,
    sortTdcg,
    userRole,
    userUnit,
    unitMapping,
  ]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedYear, selectedStatus, sortTdcg, itemsPerPage]);

  const availableYears = useMemo(() => {
    const years = new Set(
      historyData.map((i) => i.tanggal_sampling?.split("-")[0]).filter(Boolean),
    );
    ["2023", "2024", "2025", "2026"].forEach((y) => years.add(y));
    return Array.from(years).sort().reverse();
  }, [historyData]);

  // --- HANDLERS ---
  const handleDelete = async (id: string | number) => {
    const item = historyData.find((d) => d.id === id);
    setDeleteTarget({ type: "single", id, item });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === "single" && deleteTarget.id) {
        await (supabase.from("riwayat_uji") as any)
          .delete()
          .eq("id", deleteTarget.id);
        toast.success("Data berhasil dihapus");
      } else if (deleteTarget.type === "batch") {
        let count = 0;
        for (const id of selectedIds) {
          await (supabase.from("riwayat_uji") as any).delete().eq("id", id);
          count++;
        }
        toast.success(`${count} data berhasil dihapus`);
        setSelectedIds([]);
        setSelectionMode(false);
      } else if (deleteTarget.type === "all") {
        await onDeleteAll();
        toast.success("Semua data berhasil dihapus");
      }
      fetchHistory();
    } catch (e) {
      toast.error("Gagal menghapus: " + (e as Error).message);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setDeleteConfirmText("");
    }
  };

  const handleClearAll = async () => {
    if (historyData.length === 0) return toast("Data kosong.");
    setDeleteTarget({ type: "all", count: historyData.length });
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedIds([]);
  };

  const toggleSelectItem = (id: string | number) => {
    if (selectedIds.includes(id))
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length) setSelectedIds([]);
    else setSelectedIds(filteredData.map((item) => item.id));
  };

  const handleBatchDownload = async () => {
    if (selectedIds.length === 0) return toast("Pilih minimal 1 data.");
    toast(`Memproses ${selectedIds.length} data...`);
    const zip = new JSZip();
    let successCount = 0;

    for (let i = 0; i < selectedIds.length; i++) {
      const id = selectedIds[i];
      const item = historyData.find((d) => d.id === id);
      if (!item) continue;

      try {
        const pdfBlob: any = await Promise.race([
          generatePDFBlob(item, buildTrendingData(item)),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 10000),
          ),
        ]);

        if (pdfBlob) {
          const _gi = (item.lokasi_gi || "GI")
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_]/g, "");
          const _trafo = (item.nama_trafo || "TD")
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_]/g, "");
          zip.file(`Laporan_DGA_${_gi}_${_trafo}.pdf`, pdfBlob);
          successCount++;
        }
        if (i < selectedIds.length - 1)
          await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        console.error(error);
      }
    }

    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `DGA_Reports_Batch.zip`);
      toast.success(`${successCount} file berhasil diunduh.`);
    } catch (error) {
      toast.error("Gagal membuat ZIP.");
    }
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return toast("Pilih minimal 1 data.");
    setDeleteTarget({ type: "batch", count: selectedIds.length });
    setShowDeleteModal(true);
  };

  const thClass = `px-6 py-4 text-left text-xs font-bold uppercase ${isDarkMode ? "bg-slate-800 text-slate-400" : "bg-gray-100 text-gray-600"}`;
  const tdClass = `px-6 py-4 border-b ${isDarkMode ? "border-slate-700" : "border-gray-100"}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* HEADER & FILTER */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2
              className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-[#146C94]"}`}
            >
              Riwayat Arsip Data Pengujian {userUnit ? `(${userUnit})` : ""}
            </h2>
            <p
              className={`text-sm mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Total: {filteredData.length} / {totalDataForUnit} Data
            </p>
          </div>
        </div>

        {/* FILTER SECTION */}
        <div
          className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-gray-50 border-gray-200"}`}
        >
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1 md:flex-none md:w-40">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm font-medium outline-none cursor-pointer ${isDarkMode ? "bg-slate-900 border-slate-600 text-white" : "bg-white border-gray-300"}`}
              >
                <option value="All">Semua Tahun</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative flex-1 md:flex-none md:w-40">
              <ArrowUpDown
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={sortTdcg}
                onChange={(e) => setSortTdcg(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm font-medium outline-none cursor-pointer ${isDarkMode ? "bg-slate-900 border-slate-600 text-white" : "bg-white border-gray-300"}`}
              >
                <option value="default">Urutkan TDCG</option>
                <option value="highest">TDCG Tertinggi</option>
                <option value="lowest">TDCG Terendah</option>
              </select>
            </div>
            <div className="relative flex-1 md:flex-none md:w-40">
              <AlertTriangle
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm font-medium outline-none cursor-pointer ${isDarkMode ? "bg-slate-900 border-slate-600 text-white" : "bg-white border-gray-300"}`}
              >
                <option value="All">Semua Status</option>
                <option value="1">Normal</option>
                <option value="2">Waspada</option>
                <option value="3">Kritis</option>
              </select>
            </div>
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Cari GI atau Trafo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none ${isDarkMode ? "bg-slate-900 border-slate-600 text-white" : "bg-white border-gray-300"}`}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {!selectionMode ? (
              <>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <FileSpreadsheet size={16} /> <span>Import Excel</span>
                </button>
                <button
                  onClick={toggleSelectionMode}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <CheckSquare size={16} /> <span>Seleksi Batch</span>
                </button>
                {userRole === "super_admin" && (
                  <button
                    onClick={handleClearAll}
                    disabled={isDeleting || historyData.length === 0}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {isDeleting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}{" "}
                    <span>Hapus Semua</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleBatchDownload}
                  disabled={selectedIds.length === 0}
                  className="px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Download size={16} /> Download ({selectedIds.length})
                </button>
                <button
                  onClick={handleBatchDelete}
                  disabled={selectedIds.length === 0 || isDeleting}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
                >
                  {isDeleting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Trash2 size={16} />
                  )}{" "}
                  <span>Hapus ({selectedIds.length})</span>
                </button>
                <button
                  onClick={toggleSelectionMode}
                  className="px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <X size={16} /> <span>Batal</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div
        className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-gray-200"}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {selectionMode && (
                  <th
                    className={`text-center ${thClass}`}
                    style={{ width: "50px" }}
                  >
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center justify-center w-full"
                      aria-label="Pilih Semua"
                      title="Pilih Semua"
                    >
                      {selectedIds.length === filteredData.length &&
                      filteredData.length > 0 ? (
                        <CheckSquare size={18} className="text-blue-500" />
                      ) : (
                        <Square size={18} className="text-gray-400" />
                      )}
                    </button>
                  </th>
                )}
                <th className={thClass}>Tanggal</th>
                <th className={thClass}>Identitas</th>
                <th className={thClass}>
                  Status{" "}
                  <span
                    onClick={() =>
                      onNavigateToGuide && onNavigateToGuide("ieee")
                    }
                    className="text-[#17A2B8] cursor-pointer hover:underline hover:text-[#146C94] transition-colors"
                    title="Klik untuk melihat panduan"
                  >
                    (IEEE C57.104)
                  </span>
                </th>
                <th className={`text-center ${thClass}`}>TDCG</th>
                {!selectionMode && (
                  <th className={`text-center ${thClass}`}>Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loadingHistory && historyData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => selectionMode && toggleSelectItem(item.id)}
                    className={`${isDarkMode ? "hover:bg-slate-800" : "hover:bg-gray-50"} ${selectionMode && selectedIds.includes(item.id as string) ? (isDarkMode ? "bg-blue-900/20" : "bg-blue-50") : ""} ${selectionMode ? "cursor-pointer" : ""}`}
                  >
                    {selectionMode && (
                      <td className={`text-center ${tdClass}`}>
                        <div className="flex items-center justify-center w-full">
                          {selectedIds.includes(item.id as string) ? (
                            <CheckSquare size={18} className="text-blue-500" />
                          ) : (
                            <Square size={18} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                    )}
                    <td className={tdClass}>
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Calendar size={14} className="text-[#146C94]" />{" "}
                        {item.tanggal_sampling}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        #
                        {filteredData.length -
                          ((currentPage - 1) * itemsPerPage + index)}
                      </div>
                    </td>
                    <td className={tdClass}>
                      <div
                        className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-800"}`}
                      >
                        {item.nama_trafo}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin size={12} /> {item.lokasi_gi}
                      </div>
                    </td>
                    <td className={tdClass}>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${item.status_ieee.includes("Normal") ? "bg-green-100 text-green-700" : item.status_ieee.includes("Waspada") ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}
                      >
                        {item.status_ieee}
                      </span>
                    </td>
                    <td className={`text-center font-bold ${tdClass}`}>
                      {Math.round(Number(item.tdcg))}
                    </td>
                    {!selectionMode && (
                      <td className={`text-center ${tdClass}`}>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-orange-500 bg-orange-50 rounded hover:bg-orange-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-2 text-blue-500 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                            title="Info"
                          >
                            <Info size={16} />
                          </button>
                          <button
                            onClick={() =>
                              generatePDFFromTemplate(item, {
                                trendingData: buildTrendingData(item),
                              } as any)
                            }
                            className="p-2 text-green-500 bg-green-50 rounded hover:bg-green-100 transition-colors"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-500 bg-red-50 rounded hover:bg-red-100 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {filteredData.length > 0 && (
        <div
          className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
            >
              Baris per halaman:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className={`text-xs p-1 rounded border outline-none ${isDarkMode ? "bg-slate-900 border-slate-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <span
            className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
          >
            Halaman <strong>{currentPage}</strong> dari{" "}
            <strong>{totalPages}</strong>
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={`p-2 rounded hover:bg-gray-500/10 disabled:opacity-30 ${isDarkMode ? "text-white" : "text-gray-800"}`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`p-2 rounded hover:bg-gray-500/10 disabled:opacity-30 ${isDarkMode ? "text-white" : "text-gray-800"}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL / EDIT */}
      {selectedItem && (
        <DetailEditModal
          isDarkMode={isDarkMode}
          selectedItem={selectedItem}
          isEditing={isEditing}
          editFormData={editFormData}
          isSavingEdit={isSavingEdit}
          allGIs={allGIs}
          availableTrafosForEdit={availableTrafosForEdit}
          onClose={() => {
            setSelectedItem(null);
            setIsEditing(false);
          }}
          onEditChange={handleEditChange}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => setIsEditing(false)}
          onStartEdit={openEditModal}
          onDownloadPdf={(item) =>
            generatePDFFromTemplate(item, {
              trendingData: buildTrendingData(item),
            } as any)
          }
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <DeleteConfirmModal
          isDarkMode={isDarkMode}
          deleteTarget={deleteTarget}
          deleteConfirmText={deleteConfirmText}
          isDeleting={isDeleting}
          userRole={userRole}
          userUnit={userUnit}
          onChangeConfirmText={setDeleteConfirmText}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
            setDeleteConfirmText("");
          }}
          onConfirm={confirmDelete}
        />
      )}

      {/* MODAL IMPORT EXCEL */}
      {showImportModal && (
        <ExcelImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            fetchHistory();
            setShowImportModal(false);
          }}
          isDarkMode={isDarkMode}
          userRole={userRole || undefined}
          userUnit={userUnit || undefined}
        />
      )}
    </div>
  );
}

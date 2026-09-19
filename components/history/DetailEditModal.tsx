"use client";

import React from "react";
import {
  X,
  Edit2,
  Zap,
  Save,
  Loader2,
  AlertTriangle,
  Download,
} from "lucide-react";
import DuvalPentagon from "@/components/DuvalPentagon";

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
  [key: string]: any;
}

interface DetailEditModalProps {
  isDarkMode: boolean;
  selectedItem: HistoryRecord;
  isEditing: boolean;
  editFormData: Partial<HistoryRecord>;
  isSavingEdit: boolean;
  allGIs: string[];
  availableTrafosForEdit: string[];
  onClose: () => void;
  onEditChange: (e: any) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: (item: HistoryRecord) => void;
  onDownloadPdf: (item: HistoryRecord) => void;
}

export default function DetailEditModal({
  isDarkMode,
  selectedItem,
  isEditing,
  editFormData,
  isSavingEdit,
  allGIs,
  availableTrafosForEdit,
  onClose,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onDownloadPdf,
}: DetailEditModalProps) {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
      >
        <div
          className={`flex justify-between items-center p-6 border-b ${isDarkMode ? "border-slate-700" : "border-gray-100"}`}
        >
          <div>
            <h3
              className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
            >
              {isEditing ? (
                <>
                  <Edit2 className="text-orange-500" /> Edit Identitas Aset
                </>
              ) : (
                <>
                  <Zap className="text-yellow-500" /> Detail Pengujian
                </>
              )}
            </h3>
            <p className="text-sm opacity-60">
              {selectedItem.nama_trafo} - {selectedItem.lokasi_gi}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-500/20 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Lokasi GI
                  </label>
                  <select
                    name="lokasi_gi"
                    value={editFormData.lokasi_gi || ""}
                    onChange={onEditChange}
                    className={`w-full p-2 rounded border ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-gray-50 border-gray-200"}`}
                  >
                    <option value="">-- Pilih GI --</option>
                    {allGIs.map((gi, i) => (
                      <option key={i} value={gi}>
                        {gi}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Nama Trafo
                  </label>
                  <select
                    name="nama_trafo"
                    value={editFormData.nama_trafo || ""}
                    onChange={onEditChange}
                    disabled={!editFormData.lokasi_gi}
                    className={`w-full p-2 rounded border ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-gray-50 border-gray-200"}`}
                  >
                    <option value="">-- Pilih Trafo --</option>
                    {availableTrafosForEdit.map((t, i) => (
                      <option key={i} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Merk
                  </label>
                  <input
                    name="merk_trafo"
                    value={editFormData.merk_trafo || ""}
                    onChange={onEditChange}
                    className={`w-full p-2 rounded border ${isDarkMode ? "bg-slate-700 border-slate-600" : "bg-gray-50 border-gray-200"}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">
                    S/N
                  </label>
                  <input
                    name="serial_number"
                    value={editFormData.serial_number || ""}
                    onChange={onEditChange}
                    className={`w-full p-2 rounded border ${isDarkMode ? "bg-slate-700 border-slate-600" : "bg-gray-50 border-gray-200"}`}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Tahun
                  </label>
                  <input
                    type="number"
                    name="tahun_pembuatan"
                    value={editFormData.tahun_pembuatan || ""}
                    onChange={onEditChange}
                    className={`w-full p-2 rounded border ${isDarkMode ? "bg-slate-700 border-slate-600" : "bg-gray-50 border-gray-200"}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Tegangan
                  </label>
                  <input
                    name="level_tegangan"
                    value={editFormData.level_tegangan || ""}
                    onChange={onEditChange}
                    className={`w-full p-2 rounded border ${isDarkMode ? "bg-slate-700 border-slate-600" : "bg-gray-50 border-gray-200"}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Petugas
                  </label>
                  <input
                    name="diambil_oleh"
                    value={editFormData.diambil_oleh || ""}
                    onChange={onEditChange}
                    className={`w-full p-2 rounded border ${isDarkMode ? "bg-slate-700 border-slate-600" : "bg-gray-50 border-gray-200"}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">
                    Tanggal Sampling
                  </label>
                  <input
                    type="date"
                    name="tanggal_sampling"
                    value={editFormData.tanggal_sampling || ""}
                    onChange={onEditChange}
                    className={`w-full p-2 rounded border ${isDarkMode ? "bg-slate-700 border-slate-600" : "bg-gray-50 border-gray-200"}`}
                  />
                </div>
              </div>
              <div className="md:col-span-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-yellow-700 dark:text-yellow-500">
                    Perhatian
                  </p>
                  <p className="text-xs text-yellow-600/80">
                    Data hasil pengujian gas (H2, CH4, dll) dan diagnosa AI{" "}
                    <strong>tidak dapat diubah</strong>. Jika ada kesalahan
                    input gas, silakan hapus data ini dan input ulang.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div
                  className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-700 border-slate-600" : "bg-blue-50 border-blue-200"}`}
                >
                  <p className="text-xs font-bold opacity-60 uppercase">
                    Total Gas (TDCG)
                  </p>
                  <p className="text-3xl font-black">
                    {Math.round(Number(selectedItem.tdcg)) || 0}{" "}
                    <span className="text-sm font-normal">ppm</span>
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-700 border-slate-600" : "bg-blue-50 border-blue-200"}`}
                >
                  <p className="text-xs font-bold opacity-60 uppercase">
                    Status IEEE
                  </p>
                  <p
                    className={`text-xl font-bold ${selectedItem.status_ieee?.includes("Normal") ? "text-green-500" : "text-red-500"}`}
                  >
                    {selectedItem.status_ieee}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-3 h-fit">
                  {["h2", "ch4", "c2h2", "c2h4", "c2h6", "co", "co2"].map(
                    (gas) => (
                      <div
                        key={gas}
                        className={`p-3 rounded border text-center ${isDarkMode ? "border-slate-600 bg-slate-700" : "border-gray-200"}`}
                      >
                        <p className="text-xs uppercase opacity-60 font-bold">
                          {gas}
                        </p>
                        <p className="text-lg font-mono font-bold">
                          {selectedItem[gas]}
                        </p>
                      </div>
                    ),
                  )}
                </div>
                <div
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center ${isDarkMode ? "bg-slate-700/50 border-slate-600" : "bg-gray-50"}`}
                >
                  <p className="text-xs font-bold mb-4 uppercase tracking-widest opacity-60">
                    Duval Pentagon
                  </p>
                  <div className="transform scale-100">
                    <DuvalPentagon
                      h2={Number(selectedItem.h2)}
                      ch4={Number(selectedItem.ch4)}
                      c2h6={Number(selectedItem.c2h6)}
                      c2h4={Number(selectedItem.c2h4)}
                      c2h2={Number(selectedItem.c2h2)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div
          className={`p-4 border-t flex justify-end gap-3 ${isDarkMode ? "border-slate-700 bg-slate-900" : "border-gray-100 bg-gray-50"}`}
        >
          {isEditing ? (
            <>
              <button
                onClick={onCancelEdit}
                className="px-4 py-2 border rounded-lg font-bold text-sm hover:bg-gray-500/10"
              >
                Batal
              </button>
              <button
                onClick={onSaveEdit}
                disabled={isSavingEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex gap-2 items-center"
              >
                {isSavingEdit ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}{" "}
                Simpan Perubahan
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onStartEdit(selectedItem)}
                className="px-4 py-2 border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg font-bold text-sm flex gap-2 items-center"
              >
                <Edit2 size={16} /> Edit Identitas
              </button>
              <button
                onClick={() => onDownloadPdf(selectedItem)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm flex gap-2 items-center"
              >
                <Download size={16} /> PDF
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg font-bold text-sm hover:bg-gray-500/10"
              >
                Tutup
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

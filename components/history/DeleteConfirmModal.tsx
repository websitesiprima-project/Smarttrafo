"use client";

import React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteTarget {
  type: "single" | "batch" | "all";
  id?: string | number;
  item?: any;
  count?: number;
}

interface DeleteConfirmModalProps {
  isDarkMode: boolean;
  deleteTarget: DeleteTarget | null;
  deleteConfirmText: string;
  isDeleting: boolean;
  userRole: string | null;
  userUnit: string | null;
  onChangeConfirmText: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isDarkMode,
  deleteTarget,
  deleteConfirmText,
  isDeleting,
  userRole,
  userUnit,
  onChangeConfirmText,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
      >
        <div className="bg-red-600 p-6 text-white text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
            <AlertTriangle size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold">
            {deleteTarget?.type === "single" && "Konfirmasi Hapus Data"}
            {deleteTarget?.type === "batch" &&
              "Konfirmasi Hapus Data Terpilih"}
            {deleteTarget?.type === "all" && "Konfirmasi Hapus SEMUA Data"}
          </h3>
          <p className="text-sm opacity-80 mt-1">
            {deleteTarget?.type === "single" &&
              "Anda akan menghapus 1 data pengujian"}
            {deleteTarget?.type === "batch" &&
              `Anda akan menghapus ${deleteTarget.count} data terpilih`}
            {deleteTarget?.type === "all" &&
              `Anda akan menghapus SEMUA data pengujian (${deleteTarget?.count || 0} data)`}
          </p>
        </div>
        <div className="p-6">
          {deleteTarget?.type === "single" && deleteTarget.item && (
            <div
              className={`p-4 rounded-lg mb-4 ${isDarkMode ? "bg-slate-700" : "bg-gray-100"}`}
            >
              <p
                className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}
              >
                {deleteTarget.item.nama_trafo}
              </p>
              <p
                className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
              >
                {deleteTarget.item.lokasi_gi} • {deleteTarget.item.tanggal_sampling}
              </p>
              <p
                className={`text-xs mt-1 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}
              >
                ID: #{deleteTarget.item.id}
              </p>
            </div>
          )}
          <div
            className={`p-4 rounded-lg border-2 border-dashed mb-4 ${isDarkMode ? "border-red-800 bg-red-900/20" : "border-red-200 bg-red-50"}`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p
                  className={`text-sm font-bold ${isDarkMode ? "text-red-400" : "text-red-700"}`}
                >
                  Peringatan!
                </p>
                <p
                  className={`text-xs ${isDarkMode ? "text-red-300/80" : "text-red-600/80"}`}
                >
                  Tindakan ini tidak dapat dibatalkan. Data yang dihapus tidak
                  bisa dikembalikan.
                </p>
              </div>
            </div>
          </div>
          {((deleteTarget?.type === "batch" &&
            userRole !== "super_admin" &&
            userUnit) ||
            deleteTarget?.type === "all") && (
            <div className="mb-4">
              <label
                className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
              >
                Ketik{" "}
                <span className="text-red-500 font-mono bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">
                  {deleteTarget?.type === "all"
                    ? "HAPUS SEMUANYA"
                    : `HAPUS ULTG ${userUnit?.toUpperCase()}`}
                </span>{" "}
                untuk konfirmasi:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => onChangeConfirmText(e.target.value)}
                placeholder="Ketik konfirmasi di sini..."
                className={`w-full px-4 py-3 rounded-lg border-2 text-center font-mono text-sm uppercase tracking-wide outline-none transition-all ${isDarkMode ? "bg-slate-900 border-slate-600 text-white" : "border-gray-300 bg-white"}`}
              />
            </div>
          )}
        </div>
        <div
          className={`p-4 border-t flex gap-3 ${isDarkMode ? "border-slate-700 bg-slate-900" : "border-gray-100 bg-gray-50"}`}
        >
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all ${isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={
              isDeleting ||
              (deleteTarget?.type === "all" &&
                deleteConfirmText.trim().toUpperCase() !== "HAPUS SEMUANYA") ||
              (deleteTarget?.type === "batch" &&
                userRole !== "super_admin" &&
                !!userUnit &&
                deleteConfirmText.trim().toUpperCase() !==
                  `HAPUS ULTG ${userUnit.toUpperCase()}`)
            }
            className="flex-1 px-4 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Trash2 size={16} />
            )}{" "}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

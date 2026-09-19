"use client";

import React from "react";
import {
  AlertTriangle,
  XCircle,
  CheckCircle,
  MapPin,
  Loader2,
  Trash2,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  unit_ultg?: string;
  [key: string]: any;
}

interface DeleteUserModalProps {
  isDarkMode: boolean;
  userToDelete: UserProfile;
  deleteConfirmText: string;
  setDeleteConfirmText: (v: string) => void;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({
  isDarkMode,
  userToDelete,
  deleteConfirmText,
  setDeleteConfirmText,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  const expectedText = `HAPUS ${(userToDelete.unit_ultg || userToDelete.email || "USER").toUpperCase()}`;
  const isTextValid = deleteConfirmText === expectedText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-2xl overflow-hidden shadow-2xl ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
      >
        {/* Header dengan ikon peringatan */}
        <div className="bg-linear-to-r from-red-600 to-red-700 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={36} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">
            Konfirmasi Hapus User
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Info User */}
          <div
            className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${userToDelete.role === "super_admin" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}
              >
                {userToDelete.email ? userToDelete.email[0].toUpperCase() : "U"}
              </div>
              <div>
                <p className="font-bold">{userToDelete.email}</p>
                <p className="text-sm opacity-60 flex items-center gap-1">
                  <MapPin size={12} /> {userToDelete.unit_ultg || "Tidak ada ULTG"}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          {userToDelete.unit_ultg && userToDelete.unit_ultg !== "Kantor Induk" && (
            <div
              className={`p-4 rounded-xl border-2 border-dashed ${isDarkMode ? "bg-red-900/20 border-red-500/50 text-red-300" : "bg-red-50 border-red-300 text-red-700"}`}
            >
              <div className="flex gap-3">
                <XCircle size={24} className="text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold mb-1">Peringatan Penting!</p>
                  <p>
                    Jika Anda hapus user dengan ULTG{" "}
                    <b className="text-red-500">"{userToDelete.unit_ultg}"</b>,
                    maka <b>SELURUH Gardu Induk (GI)</b> yang terdaftar di
                    bawah ULTG ini akan <b>ikut terhapus secara permanen</b>,
                    termasuk <b>pin lokasi di peta dashboard</b>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Input */}
          <div>
            <label className="block text-xs font-bold uppercase opacity-70 mb-2">
              Ketik "<span className="text-red-500">{expectedText}</span>"
              untuk konfirmasi (huruf besar semua)
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={expectedText}
              className={`w-full p-3 rounded-lg border-2 outline-none transition text-center font-semibold text-lg tracking-wide ${
                isTextValid
                  ? "border-green-500 focus:ring-2 focus:ring-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-500"
                  : deleteConfirmText.length > 0
                    ? "border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                    : `focus:ring-2 focus:ring-blue-500 ${isDarkMode ? "bg-slate-900 border-slate-600" : "bg-slate-50 border-gray-300"}`
              }`}
              style={{ textTransform: "none" }}
            />
            {deleteConfirmText.length > 0 && (
              <p
                className={`text-xs mt-2 font-medium flex items-center gap-1 ${
                  isTextValid
                    ? "text-green-900 dark:text-green-500"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isTextValid ? (
                  <>
                    <CheckCircle size={12} className="shrink-0" /> Teks valid, tombol hapus aktif
                  </>
                ) : (
                  <>
                    <XCircle size={12} className="shrink-0" /> Teks tidak sesuai, pastikan huruf besar semua
                  </>
                )}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className={`flex-1 py-3 rounded-xl font-bold transition ${isDarkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-200 hover:bg-slate-300"}`}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!isTextValid || isDeleting}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition flex justify-center items-center gap-2 ${
                isTextValid && !isDeleting
                  ? "bg-linear-to-r from-red-600 to-red-700 hover:shadow-lg hover:shadow-red-500/30"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isDeleting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Trash2 size={18} />
              )}
              Hapus Permanen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

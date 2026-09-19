"use client";

import React from "react";
import {
  Edit3,
  Mail,
  Box,
  AlertTriangle,
  Lock,
  XCircle,
  CheckCircle,
  Loader2,
  Save,
} from "lucide-react";
import PasswordInput from "./PasswordInput";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  unit_ultg?: string;
  [key: string]: any;
}

interface EditUserFormData {
  email: string;
  role: string;
  unitName: string;
  password: string;
  confirmPassword: string;
}

interface EditUserModalProps {
  isDarkMode: boolean;
  userToEdit: UserProfile;
  editFormData: EditUserFormData;
  setEditFormData: (data: EditUserFormData) => void;
  showEditPassword: boolean;
  setShowEditPassword: (v: boolean) => void;
  showEditConfirmPassword: boolean;
  setShowEditConfirmPassword: (v: boolean) => void;
  isUpdating: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function EditUserModal({
  isDarkMode,
  userToEdit,
  editFormData,
  setEditFormData,
  showEditPassword,
  setShowEditPassword,
  showEditConfirmPassword,
  setShowEditConfirmPassword,
  isUpdating,
  onClose,
  onSubmit,
}: EditUserModalProps) {
  const passwordMismatch = Boolean(
    editFormData.password &&
      editFormData.password !== editFormData.confirmPassword,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-[#146C94] to-[#0F5678] p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit3 size={36} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Edit Data User</h3>
          <p className="text-white/70 text-sm mt-1">{userToEdit.email}</p>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase opacity-70 mb-1">
              Email Korporat
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                className={`w-full pl-10 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-[#146C94] ${isDarkMode ? "bg-slate-900 border-slate-600" : "bg-slate-50 border-gray-200"}`}
                placeholder="manager@pln.co.id"
              />
            </div>
            <p className="text-[11px] opacity-50 mt-1 flex items-center gap-1">
              <AlertTriangle size={11} className="shrink-0" /> Hanya domain @pln.co.id
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-bold uppercase opacity-70 mb-1">
              Role Akses
            </label>
            <select
              value={editFormData.role}
              onChange={(e) =>
                setEditFormData({ ...editFormData, role: e.target.value })
              }
              className={`w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-[#146C94] ${isDarkMode ? "bg-slate-900 border-slate-600" : "bg-slate-50 border-gray-200"}`}
            >
              <option value="admin_unit">Admin Unit (Manager ULTG)</option>
              <option value="super_admin">Super Admin (Pusat)</option>
            </select>
          </div>

          {/* Unit ULTG */}
          <div>
            <label className="block text-xs font-bold uppercase opacity-70 mb-1">
              Nama Unit ULTG
            </label>
            <div className="relative">
              <Box className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="text"
                value={
                  editFormData.role === "super_admin"
                    ? "Kantor Induk"
                    : editFormData.unitName
                }
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    unitName: e.target.value,
                  })
                }
                disabled={editFormData.role === "super_admin"}
                className={`w-full pl-10 p-3 rounded-lg border outline-none font-bold ${
                  editFormData.role === "super_admin"
                    ? "opacity-50 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-[#146C94]"
                } ${isDarkMode ? "bg-slate-900 border-slate-600" : "bg-slate-50 border-gray-200"}`}
                placeholder="Contoh: Lopana"
              />
            </div>
            {/* Warning jika nama ULTG berubah */}
            {editFormData.role !== "super_admin" &&
              editFormData.unitName &&
              userToEdit?.unit_ultg &&
              editFormData.unitName !== userToEdit.unit_ultg && (
                <div
                  className={`mt-2 p-2 rounded-lg text-xs flex items-start gap-2 ${isDarkMode ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700"}`}
                >
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Mengubah nama ULTG akan otomatis memperbarui:{" "}
                    <b>Manajemen Unit</b>, <b>Kelola Aset</b>, dan{" "}
                    <b>semua user</b> dengan ULTG "{userToEdit.unit_ultg}".
                  </span>
                </div>
              )}
          </div>

          {/* Divider */}
          <div
            className={`border-t ${isDarkMode ? "border-slate-700" : "border-slate-200"} pt-4`}
          >
            <p
              className={`text-xs font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}
            >
              <Lock size={14} /> Ganti Password (Opsional)
            </p>

            {/* New Password */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase opacity-70 mb-1">
                Password Baru
              </label>
              <PasswordInput
                value={editFormData.password}
                onChange={(v) =>
                  setEditFormData({ ...editFormData, password: v })
                }
                show={showEditPassword}
                onToggleShow={() => setShowEditPassword(!showEditPassword)}
                isDarkMode={isDarkMode}
                minLength={6}
                placeholder="Kosongkan jika tidak ingin diubah"
              />
              {editFormData.password && editFormData.password.length < 6 && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <AlertTriangle size={11} className="shrink-0" /> Minimal 6 karakter
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase opacity-70 mb-1">
                Konfirmasi Password Baru
              </label>
              <PasswordInput
                value={editFormData.confirmPassword}
                onChange={(v) =>
                  setEditFormData({ ...editFormData, confirmPassword: v })
                }
                show={showEditConfirmPassword}
                onToggleShow={() =>
                  setShowEditConfirmPassword(!showEditConfirmPassword)
                }
                isDarkMode={isDarkMode}
                minLength={6}
                disabled={!editFormData.password}
                placeholder="Ulangi password baru"
              />
              {editFormData.password &&
                editFormData.confirmPassword &&
                editFormData.password !== editFormData.confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <XCircle size={12} /> Password tidak cocok
                  </p>
                )}
              {editFormData.password &&
                editFormData.confirmPassword &&
                editFormData.password === editFormData.confirmPassword && (
                  <p className="text-[11px] text-green-500 mt-1 flex items-center gap-1">
                    <CheckCircle size={12} className="shrink-0" /> Password cocok
                  </p>
                )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className={`flex-1 py-3 rounded-xl font-bold transition ${isDarkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-200 hover:bg-slate-300"}`}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isUpdating || passwordMismatch}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition flex justify-center items-center gap-2 ${
                isUpdating || passwordMismatch
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-[#146C94] to-[#0F5678] hover:shadow-lg hover:shadow-[#146C94]/30"
              }`}
            >
              {isUpdating ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

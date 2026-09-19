"use client";

import React from "react";
import {
  Shield,
  Mail,
  Zap,
  Box,
  Loader2,
  Save,
  AlertTriangle,
} from "lucide-react";
import PasswordInput from "./PasswordInput";

interface CreateUserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  unitName: string;
}

interface CreateUserModalProps {
  isDarkMode: boolean;
  formData: CreateUserFormData;
  setFormData: (data: CreateUserFormData) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CreateUserModal({
  isDarkMode,
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  submitting,
  onClose,
  onSubmit,
}: CreateUserModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
      >
        <div
          className={`md:hidden p-4 border-b ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}
        >
          <h3 className="font-bold">Registrasi User & Unit</h3>
        </div>

        <form onSubmit={onSubmit} className="flex-1 flex flex-col md:flex-row">
          {/* KOLOM KIRI: INFO AKUN */}
          <div
            className={`flex-1 p-8 border-r ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}
          >
            <h3 className="text-lg font-bold text-[#146C94] mb-6 flex items-center gap-2">
              <Shield size={20} /> Data Kredensial
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase opacity-70 mb-1">
                  Email Korporat
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full pl-10 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-[#146C94] ${isDarkMode ? "bg-slate-900 border-slate-600" : "bg-slate-50 border-gray-200"}`}
                    placeholder="manager@pln.co.id"
                  />
                </div>
                <p className="text-[13px] font-bold opacity-50 mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} className="shrink-0" /> Hanya email dengan domain <b>@pln.co.id</b> yang diterima
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase opacity-70 mb-1">
                  Password
                </label>
                <PasswordInput
                  value={formData.password}
                  onChange={(v) => setFormData({ ...formData, password: v })}
                  show={showPassword}
                  onToggleShow={() => setShowPassword(!showPassword)}
                  isDarkMode={isDarkMode}
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
                <p className="text-[13px] font-bold opacity-50 mt-1">
                  Minimal 6 karakter
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase opacity-70 mb-1">
                  Konfirmasi Password
                </label>
                <PasswordInput
                  value={formData.confirmPassword}
                  onChange={(v) =>
                    setFormData({ ...formData, confirmPassword: v })
                  }
                  show={showConfirmPassword}
                  onToggleShow={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  isDarkMode={isDarkMode}
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-[13px] font-bold text-red-500 mt-1 flex items-center gap-1">
                      <AlertTriangle size={12} className="shrink-0" /> Password tidak cocok
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase opacity-70 mb-1">
                  Role Akses
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className={`w-full p-3 rounded-lg border outline-none ${isDarkMode ? "bg-slate-900 border-slate-600" : "bg-slate-50 border-gray-200"}`}
                >
                  <option value="admin_unit">Admin Unit (Manager ULTG)</option>
                  <option value="super_admin">Super Admin (Pusat)</option>
                </select>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: INFO UNIT */}
          <div
            className={`flex-1 p-8 relative overflow-hidden ${isDarkMode ? "bg-slate-800" : "bg-slate-50"}`}
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Zap size={180} />
            </div>

            <h3 className="text-lg font-bold text-[#F1C40F] mb-6 flex items-center gap-2 relative z-10">
              <Box size={20} /> Data Unit / Wilayah
            </h3>

            <div className="space-y-5 relative z-10">
              <div
                className={`p-4 rounded-lg text-xs leading-relaxed border ${isDarkMode ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-200" : "bg-yellow-50 border-yellow-200 text-yellow-700"}`}
              >
                Info: Jika Anda memilih role <b>Admin Unit</b>, sistem akan
                otomatis membuat <b>Kelompok Unit Baru</b> di Peta Aset sesuai
                nama di bawah ini.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase opacity-70 mb-1">
                  Nama Unit ULTG
                </label>
                <div className="relative">
                  <Box className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input
                    type="text"
                    name="unitName"
                    value={formData.unitName}
                    onChange={(e) =>
                      setFormData({ ...formData, unitName: e.target.value })
                    }
                    disabled={formData.role === "super_admin"}
                    className={`w-full pl-10 p-3 rounded-lg border outline-none font-bold placeholder-opacity-50 ${
                      formData.role === "super_admin"
                        ? "opacity-50 cursor-not-allowed"
                        : "focus:border-[#F1C40F] focus:ring-1 focus:ring-[#F1C40F]"
                    } ${isDarkMode ? "bg-slate-900 border-slate-600 text-white" : "bg-white border-gray-200"}`}
                    placeholder="CONTOH: Lopana"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-3 relative z-10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-bold bg-gray-500/10 hover:bg-gray-500/20 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-linear-to-r from-[#146C94] to-[#0F5678] hover:shadow-lg hover:shadow-[#146C94]/30 transition flex justify-center items-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Simpan User & Unit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

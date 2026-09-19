"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, MapPin, Edit3 } from "lucide-react";
import toast from "react-hot-toast";
import { supabase, authHeaders } from "@/lib/supabaseClient";
import CreateUserModal from "@/components/user-management/CreateUserModal";
import DeleteUserModal from "@/components/user-management/DeleteUserModal";
import EditUserModal from "@/components/user-management/EditUserModal";

// URL API Backend
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ============================================================================
// INTERFACES (KAMUS TYPE SCRIPT)
// ============================================================================
interface UserProfile {
  id: string;
  email: string;
  role: string;
  unit_ultg?: string;
  [key: string]: any;
}

import { useAppContext } from "@/app/AppContext";

export default function UserManagementPage() {
  const { session, isDarkMode } = useAppContext();
  // Tambahkan type UserProfile[] agar bukan never[]
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit User Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
  const [editFormData, setEditFormData] = useState({
    email: "",
    role: "",
    unitName: "",
    password: "",
    confirmPassword: "",
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin_unit",
    unitName: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Tambahkan ( ... as any) untuk memberitahu TypeScript agar mengabaikan validasi skema di sini
      const { data, error } = await (supabase
        .from("profiles")
        .select("*")
        .order("email", { ascending: true }) as any);

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      toast.error("Gagal memuat user: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { email, password, confirmPassword, role, unitName } = formData;

    // Validasi Email harus @pln.co.id
    if (!email.endsWith("@pln.co.id")) {
      toast.error("Email harus menggunakan domain @pln.co.id!");
      setSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password dan Konfirmasi Password tidak cocok!");
      setSubmitting(false);
      return;
    }

    if (role === "admin_unit" && !unitName.trim()) {
      toast.error("Nama Unit wajib diisi untuk Admin Unit!");
      setSubmitting(false);
      return;
    }

    try {
      // A. Buat User via Backend API (TIDAK mengirim email verifikasi)
      const requesterEmail = session?.user?.email;
      if (!requesterEmail) {
        throw new Error("Sesi habis. Refresh halaman.");
      }

      const res = await fetch(`${API_URL}/admin/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(session),
        },
        body: JSON.stringify({
          email: email,
          password: password,
          role: role,
          unit_ultg: role === "super_admin" ? "Kantor Induk" : unitName,
        }),
      });

      const data = await res.json();

      if (data.status !== "Sukses") {
        throw new Error(data.msg || "Gagal membuat user");
      }

      // B. Buat Master ULTG jika Admin Unit (via Backend API)
      if (role === "admin_unit") {
        try {
          await fetch(`${API_URL}/admin/master/add-ultg`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders(session),
            },
            body: JSON.stringify({
              nama_ultg: unitName,
            }),
          });
          // Ignore jika ULTG sudah ada
        } catch (e) {
          console.log("ULTG sudah ada atau gagal dibuat:", e);
        }
      }

      toast.success(data.msg || `User ${email} berhasil dibuat!`);
      setShowModal(false);
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin_unit",
        unitName: "",
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
      fetchUsers();
    } catch (error) {
      toast.error("Gagal: " + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to open delete confirmation modal
  const openDeleteModal = (user: UserProfile) => {
    setUserToDelete(user);
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  // Function to close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteConfirmText("");
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const requesterEmail = session?.user?.email;
    if (!requesterEmail) {
      toast.error("Sesi habis. Refresh halaman.");
      return;
    }

    setIsDeleting(true);
    const toastId = toast.loading("Menghapus user dan data terkait...");
    try {
      const res = await fetch(
        `${API_URL}/admin/delete-user/${userToDelete.id}?unit_ultg=${encodeURIComponent(userToDelete.unit_ultg || "")}`,
        { method: "DELETE", headers: authHeaders(session) },
      );

      const data = await res.json();
      if (data.status !== "Sukses") throw new Error(data.msg);

      toast.success(data.msg || "User dan data terkait berhasil dihapus", {
        id: toastId,
      });
      closeDeleteModal();
      fetchUsers();
    } catch (err) {
      toast.error((err as Error).message, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to open edit user modal
  const openEditModal = (user: UserProfile) => {
    setUserToEdit(user);
    setEditFormData({
      email: user.email || "",
      role: user.role || "admin_unit",
      unitName: user.unit_ultg || "",
      password: "",
      confirmPassword: "",
    });
    setShowEditPassword(false);
    setShowEditConfirmPassword(false);
    setShowEditModal(true);
  };

  // Function to close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setUserToEdit(null);
    setEditFormData({
      email: "",
      role: "",
      unitName: "",
      password: "",
      confirmPassword: "",
    });
    setShowEditPassword(false);
    setShowEditConfirmPassword(false);
  };

  // Function to handle edit user submit
  const handleEditUser = async () => {
    if (!userToEdit) return;

    const requesterEmail = session?.user?.email;
    if (!requesterEmail) {
      toast.error("Sesi habis. Refresh halaman.");
      return;
    }

    // Validasi email domain
    if (editFormData.email && !editFormData.email.endsWith("@pln.co.id")) {
      toast.error("Email harus menggunakan domain @pln.co.id!");
      return;
    }

    // Validasi password jika diisi
    if (editFormData.password) {
      if (editFormData.password.length < 6) {
        toast.error("Password minimal 6 karakter!");
        return;
      }
      if (editFormData.password !== editFormData.confirmPassword) {
        toast.error("Password dan Konfirmasi Password tidak cocok!");
        return;
      }
    }

    // Validasi unit untuk admin_unit
    if (editFormData.role === "admin_unit" && !editFormData.unitName.trim()) {
      toast.error("Nama Unit wajib diisi untuk Admin Unit!");
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading("Mengupdate data user...");

    try {
      const res = await fetch(`${API_URL}/admin/update-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(session),
        },
        body: JSON.stringify({
          target_id: userToEdit.id,
          new_email:
            editFormData.email !== userToEdit.email ? editFormData.email : "",
          new_role:
            editFormData.role !== userToEdit.role ? editFormData.role : "",
          new_unit_ultg:
            editFormData.role === "super_admin"
              ? "Kantor Induk"
              : editFormData.unitName !== userToEdit.unit_ultg
                ? editFormData.unitName
                : "",
          new_password: editFormData.password || "",
        }),
      });

      const data = await res.json();
      if (data.status !== "Sukses") throw new Error(data.msg);

      toast.success(data.msg || "User berhasil diupdate!", { id: toastId });
      closeEditModal();
      fetchUsers();
    } catch (err) {
      toast.error((err as Error).message, { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const currentUserEmail = session?.user?.email;

  return (
    <div
      className={`p-6 min-h-screen ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-[#146C94]" /> Manajemen Pengguna & Wilayah
          </h1>
          <p className="text-sm opacity-60">
            Pembuatan akun Admin Unit akan otomatis membuat wilayah kerja (ULTG)
            baru.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#146C94] hover:bg-[#0F5678] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg hover:shadow-[#146C94]/20"
        >
          <UserPlus size={18} /> Tambah User & Unit
        </button>
      </div>

      <div
        className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead
              className={`uppercase font-bold tracking-wider ${isDarkMode ? "bg-slate-900/50 text-slate-400" : "bg-slate-50 text-slate-500"}`}
            >
              <tr>
                <th className="px-6 py-4">Email / Akun</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Unit / Wilayah</th>
                <th className="px-6 py-4">ID System</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-500/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center opacity-50">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center opacity-50">
                    Belum ada user lain.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-500/5 transition">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.role === "super_admin" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}
                        >
                          {user.email ? user.email[0].toUpperCase() : "U"}
                        </div>
                        {user.email || "No Email"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          user.role === "super_admin"
                            ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                            : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        }`}
                      >
                        {user.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <MapPin size={14} className="opacity-50" />
                      <span className="font-semibold">
                        {user.unit_ultg || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs opacity-50">
                      {user.id ? user.id.slice(0, 8) : "???"}...
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.email !== currentUserEmail && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                            title="Edit User"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                            title="Hapus User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRASI GABUNGAN */}
      {showModal && (
        <CreateUserModal
          isDarkMode={isDarkMode}
          formData={formData}
          setFormData={setFormData}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          submitting={submitting}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateComplete}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && userToDelete && (
        <DeleteUserModal
          isDarkMode={isDarkMode}
          userToDelete={userToDelete}
          deleteConfirmText={deleteConfirmText}
          setDeleteConfirmText={setDeleteConfirmText}
          isDeleting={isDeleting}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteUser}
        />
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && userToEdit && (
        <EditUserModal
          isDarkMode={isDarkMode}
          userToEdit={userToEdit}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          showEditPassword={showEditPassword}
          setShowEditPassword={setShowEditPassword}
          showEditConfirmPassword={showEditConfirmPassword}
          setShowEditConfirmPassword={setShowEditConfirmPassword}
          isUpdating={isUpdating}
          onClose={closeEditModal}
          onSubmit={handleEditUser}
        />
      )}
    </div>
  );
}

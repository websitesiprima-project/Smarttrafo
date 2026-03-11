"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Thermometer,
  FlaskConical,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import DuvalPentagon from "@/components/DuvalPentagon";
import { supabase } from "@/lib/supabaseClient";

// --- FUNGSI PEMBERSIH TEKS (Utility) ---
const cleanMarkdown = (text: string) => {
  if (!text) return "";
  return text
    .replace(/[#*]/g, "") // Hapus karakter # dan *
    .replace(/\n\s*\n/g, "\n") // Hapus baris kosong berlebih
    .trim();
};

// ============================================================================
// INTERFACES (KAMUS TYPE SCRIPT)
// ============================================================================
interface TrafoAsset {
  nama_trafo: string;
  merk?: string;
  serial_number?: string;
  tahun_pembuatan?: string | number;
  level_tegangan?: string;
  [key: string]: any;
}

interface FormDataState {
  lokasi_gi: string;
  nama_trafo: string;
  merk_trafo: string;
  serial_number: string;
  tahun_pembuatan: string | number;
  level_tegangan: string;
  diambil_oleh: string;
  tanggal_sampling: string;
  co: number | string;
  co2: number | string;
  h2: number | string;
  ch4: number | string;
  c2h6: number | string;
  c2h4: number | string;
  c2h2: number | string;
  [key: string]: any;
}

interface ResultState {
  ieee_status: string;
  tdcg_value: number;
  rogers_diagnosis?: string;
  key_gas?: string;
  paper_health?: { status: string };
  volty_chat?: string;
}

import { useAppContext } from "@/app/AppContext";
import toast from "react-hot-toast";

export default function InputFormPage() {
  const {
    isDarkMode,
    userRole,
    userUnit,
    unitMapping = {},
    API_URL,
    fetchHistory,
    session,
  } = useAppContext();

  const [formData, setFormData] = useState<FormDataState>({
    lokasi_gi: "",
    nama_trafo: "",
    merk_trafo: "",
    serial_number: "",
    tahun_pembuatan: "",
    level_tegangan: "",
    diambil_oleh: "",
    tanggal_sampling: new Date().toISOString().split("T")[0],
    no_dokumen: "-",
    mva: "",
    jenis_minyak: "",
    suhu_sampel: 0,
    co: 0,
    co2: 0,
    h2: 0,
    ch4: 0,
    c2h6: 0,
    c2h4: 0,
    c2h2: 0,
  });
  const [result, setResult] = useState<ResultState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const findUnitByGI = (giName: string) => {
    const search = (giName || "").toUpperCase();
    for (const [unit, list] of Object.entries(unitMapping)) {
      if (Array.isArray(list)) {
        if (
          list.some((g) => {
            const gName = (typeof g === "string" ? g : g.name).toUpperCase();
            return search.includes(gName.replace("GI ", ""));
          })
        )
          return unit;
      }
    }
    return userUnit || "Lainnya";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!formData.lokasi_gi || !formData.nama_trafo)
      return toast.error("Harap isi Lokasi GI & Nama Trafo!");

    if (userRole !== "super_admin" && userUnit) {
      const allowedGIs = unitMapping[userUnit] || [];
      const inputGI = (formData.lokasi_gi || "").trim().toLowerCase();
      const isAllowed = allowedGIs.some((gi: any) => {
        const giName = (typeof gi === "string" ? gi : gi.name).toLowerCase();
        return inputGI.includes(giName) || giName.includes(inputGI);
      });
      if (!isAllowed && Object.keys(unitMapping).length > 0) {
        return toast.error(
          `⛔ Akses Ditolak: GI "${formData.lokasi_gi}" bukan bagian dari ULTG ${userUnit}.`,
        );
      }
    }

    setIsLoading(true);
    try {
      const payload = { ...formData, skip_db_save: true };
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal terhubung ke AI Service");
      const resultData = await res.json();
      setResult(resultData);

      const { jenis_minyak, key_gas, ...cleanFormData } = formData;
      let finalOwner = userUnit ? userUnit : findUnitByGI(formData.lokasi_gi);

      const dataToSave = {
        ...cleanFormData,
        tdcg: resultData.tdcg_value || 0,
        status_ieee: resultData.ieee_status || "Normal",
        diagnosa: resultData.rogers_diagnosis || "-",
        hasil_ai: resultData.volty_chat || resultData.hasil_ai || "-",
        diambil_oleh: formData.diambil_oleh,
        email_user: session?.user?.email,
        ultg_pemilik: finalOwner,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("riwayat_uji").insert([dataToSave]);
      if (error) throw error;
      toast.success(`Data berhasil disimpan untuk ${finalOwner}`);
      await fetchHistory();
    } catch (err: any) {
      toast.error("Gagal menyimpan: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const [dynamicGIs, setDynamicGIs] = useState<string[]>([]);
  const [dynamicTrafos, setDynamicTrafos] = useState<TrafoAsset[]>([]);

  const isSuperAdmin = userRole === "super_admin";

  // --- 1. LOGIKA PENCARIAN GI ---
  useEffect(() => {
    let availableGIs: string[] = [];

    if (!unitMapping || Object.keys(unitMapping).length === 0) return;

    if (isSuperAdmin) {
      // Super Admin: Ambil Semua
      Object.values(unitMapping).forEach((giList) => {
        if (Array.isArray(giList)) {
          giList.forEach((gi) => {
            const name = typeof gi === "string" ? gi : gi.name;
            if (name) availableGIs.push(name);
          });
        }
      });
    } else {
      // Admin Unit: Cari yang cocok
      const targetUnit = (userUnit || "")
        .toLowerCase()
        .replace(/ultg/g, "")
        .trim();

      const foundKey = Object.keys(unitMapping).find((key) => {
        const cleanKey = key.toLowerCase().replace(/ultg/g, "").trim();
        return cleanKey.includes(targetUnit) || targetUnit.includes(cleanKey);
      });

      const unitGis = foundKey ? unitMapping[foundKey] : [];

      if (Array.isArray(unitGis)) {
        availableGIs = unitGis.map((gi) =>
          typeof gi === "string" ? gi : gi.name,
        );
      }
    }

    setDynamicGIs(availableGIs.sort());
  }, [unitMapping, userRole, userUnit, isSuperAdmin]);

  // --- 2. FETCH TRAFOS ---
  useEffect(() => {
    const fetchTrafos = async () => {
      if (formData.lokasi_gi) {
        const { data } = await (supabase.from("assets_trafo") as any)
          .select("*")
          .eq("lokasi_gi", formData.lokasi_gi);

        if (data) setDynamicTrafos(data);
      } else {
        setDynamicTrafos([]);
      }
    };
    fetchTrafos();
  }, [formData.lokasi_gi]);

  // --- 3. AUTOFILL ---
  useEffect(() => {
    if (typeof setFormData !== "function") return;
    if (formData.lokasi_gi && formData.nama_trafo) {
      const selectedTrafo = dynamicTrafos.find(
        (t) => t.nama_trafo === formData.nama_trafo,
      );
      if (selectedTrafo) {
        setFormData((prev: any) => ({
          ...prev,
          merk_trafo: selectedTrafo.merk || "",
          serial_number: selectedTrafo.serial_number || "",
          tahun_pembuatan: selectedTrafo.tahun_pembuatan || "",
          level_tegangan: selectedTrafo.level_tegangan || "",
        }));
      }
    }
  }, [formData.lokasi_gi, formData.nama_trafo, dynamicTrafos, setFormData]);

  const sortTrafos = (trafos: TrafoAsset[]) => {
    return [...trafos].sort((a, b) => {
      const aName = a.nama_trafo || "";
      const bName = b.nama_trafo || "";
      const aMatch = aName.match(/^([A-Z]+)\s*#?(\d+)$/i);
      const bMatch = bName.match(/^([A-Z]+)\s*#?(\d+)$/i);
      if (!aMatch || !bMatch) return aName.localeCompare(bName);
      return parseInt(aMatch[2], 10) - parseInt(bMatch[2], 10);
    });
  };

  const theme = {
    bg: isDarkMode ? "bg-[#0b1120]" : "bg-slate-50/50",
    card: isDarkMode
      ? "bg-slate-900/80 backdrop-blur-xl border-slate-800 shadow-2xl"
      : "bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-xl",
    input: isDarkMode
      ? "bg-slate-800/50 border-slate-700/50 text-slate-100 focus:border-[#1B7A8F] focus:ring-1 focus:ring-[#1B7A8F]"
      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-[#1B7A8F] focus:ring-1 focus:ring-[#1B7A8F]",
    readOnly: isDarkMode
      ? "bg-slate-800/20 text-slate-500 border-transparent shadow-inner"
      : "bg-slate-100 text-slate-500 border-transparent shadow-inner",
    text: isDarkMode ? "text-slate-100" : "text-slate-800",
    subText: isDarkMode ? "text-slate-400" : "text-slate-500",
    label: isDarkMode ? "text-slate-400" : "text-slate-600",
    divider: isDarkMode ? "border-slate-800" : "border-slate-100",
  };

  const labelClass = `block text-xs font-semibold tracking-wide mb-2 ${theme.label}`;
  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 ${theme.input}`;
  const readOnlyClass = `w-full px-4 py-3 rounded-xl border text-sm outline-none cursor-not-allowed ${theme.readOnly}`;

  const gasTableData = [
    { name: "Karbon Monoksida", rumus: "CO", value: formData.co },
    { name: "Karbon Dioksida", rumus: "CO2", value: formData.co2 },
    { name: "Hidrogen", rumus: "H2", value: formData.h2 },
    { name: "Metana", rumus: "CH4", value: formData.ch4 },
    { name: "Etana", rumus: "C2H6", value: formData.c2h6 },
    { name: "Etilen", rumus: "C2H4", value: formData.c2h4 },
    { name: "Asetilen", rumus: "C2H2", value: formData.c2h2 },
  ];

  return (
    <div
      className={`min-h-screen pb-20 ${theme.bg} transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2
              className={`text-3xl md:text-4xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-800"}`}
            >
              Formulir Uji DGA
            </h2>
            <p
              className={`text-sm md:text-base font-medium mt-1.5 ${theme.subText}`}
            >
              Evaluasi Kondisi Transformator Berbasis AI (IEEE C57.104 & IEC
              60599)
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          <div className={`lg:col-span-7 rounded-2xl p-6 border ${theme.card}`}>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-dashed border-gray-500/30">
                <FileText className="text-[#1B7A8F]" size={18} />
                <h3 className={`font-bold text-base uppercase ${theme.text}`}>
                  Identitas Aset
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Gardu Induk</label>
                    <select
                      name="lokasi_gi"
                      value={formData.lokasi_gi}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      <option value="">- Pilih GI -</option>
                      {dynamicGIs.length === 0 ? (
                        <option disabled>Tidak ada GI ditemukan</option>
                      ) : (
                        dynamicGIs.map((giName, idx) => (
                          <option key={idx} value={giName}>
                            {giName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Unit Trafo</label>
                    <select
                      name="nama_trafo"
                      value={formData.nama_trafo}
                      onChange={handleChange}
                      className={inputClass}
                      disabled={!formData.lokasi_gi}
                      required
                    >
                      <option value="">- Pilih Trafo -</option>
                      {dynamicTrafos.length === 0 && (
                        <option disabled>Belum ada aset terdaftar</option>
                      )}
                      {sortTrafos(dynamicTrafos).map((t, idx) => (
                        <option key={idx} value={t.nama_trafo}>
                          {t.nama_trafo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Merk</label>
                  <input
                    value={formData.merk_trafo}
                    readOnly
                    className={readOnlyClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>S/N</label>
                  <input
                    value={formData.serial_number}
                    readOnly
                    className={readOnlyClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tahun</label>
                  <input
                    value={formData.tahun_pembuatan}
                    readOnly
                    className={readOnlyClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tegangan</label>
                  <input
                    value={formData.level_tegangan}
                    readOnly
                    className={readOnlyClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-dashed border-gray-500/30">
                <Thermometer className="text-orange-500" size={18} />
                <h3 className={`font-bold text-base uppercase ${theme.text}`}>
                  Data Sampling
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Tanggal Uji</label>
                  <input
                    type="date"
                    name="tanggal_sampling"
                    value={formData.tanggal_sampling}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Petugas</label>
                  <input
                    type="text"
                    name="diambil_oleh"
                    value={formData.diambil_oleh}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Nama Petugas"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`lg:col-span-5 flex flex-col h-full`}>
            <div className={`flex-1 rounded-2xl p-6 border mb-4 ${theme.card}`}>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-dashed border-gray-500/30">
                <FlaskConical className="text-green-500" size={18} />
                <h3 className={`font-bold text-base uppercase ${theme.text}`}>
                  Konsentrasi Gas (ppm)
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-x-4 gap-y-6 mt-6">
                {["co", "co2", "h2", "ch4", "c2h6", "c2h4", "c2h2"].map(
                  (gas) => (
                    <div key={gas} className="relative group">
                      <label
                        className={`absolute left-3 top-[-10px] px-1 text-xs font-bold uppercase tracking-wider bg-transparent backdrop-blur-sm ${isDarkMode ? "text-slate-400 group-focus-within:text-[#1B7A8F]" : "text-slate-500 group-focus-within:text-[#1B7A8F]"} z-10 transition-colors`}
                      >
                        {gas}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name={gas}
                        value={formData[gas] === 0 ? "" : formData[gas]}
                        onChange={handleChange}
                        className={`w-full px-4 py-3.5 rounded-xl border font-mono text-base font-semibold outline-none transition-all duration-300 ${isDarkMode ? "bg-slate-800/50 border-slate-700/50 text-slate-100 focus:border-[#1B7A8F] focus:ring-1 focus:ring-[#1B7A8F] focus:bg-slate-800" : "bg-white border-slate-300 text-slate-800 focus:border-[#1B7A8F] focus:ring-1 focus:ring-[#1B7A8F] shadow-sm"}`}
                        placeholder="0.0"
                      />
                      <span
                        className={`absolute right-4 top-3.5 text-xs font-medium ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}
                      >
                        PPM
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden py-4 bg-linear-to-r from-[#1B7A8F] to-[#155d6d] hover:to-[#1B7A8F] text-white rounded-xl font-bold text-lg shadow-xl shadow-[#1B7A8F]/20 flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="absolute inset-0 w-full h-full bg-white/10 -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
              {isLoading ? (
                <span className="animate-pulse flex items-center gap-2">
                  Sedang Menganalisis...
                </span>
              ) : (
                <>
                  <Activity size={22} className="" /> ANALISA DATA DGA
                </>
              )}
            </button>
          </div>
        </form>

        {result && (
          <div className="animate-in slide-in-from-bottom-10 fade-in duration-500 space-y-6">
            <div
              className={`rounded-2xl border p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden transition-all duration-300 ${result.ieee_status.includes("Normal") ? "bg-linear-to-r from-emerald-500/10 to-emerald-500/5 border-emerald-500/20" : result.ieee_status.includes("KRITIS") ? "bg-linear-to-r from-rose-500/10 to-rose-500/5 border-rose-500/20" : "bg-linear-to-r from-amber-500/10 to-amber-500/5 border-amber-500/20"}`}
            >
              <div className="flex items-center gap-5 z-10 w-full md:w-auto">
                <div
                  className={`p-4 rounded-2xl shadow-inner ${result.ieee_status.includes("Normal") ? "bg-emerald-500 text-white" : result.ieee_status.includes("KRITIS") ? "bg-rose-500 text-white" : "bg-amber-500 text-white"}`}
                >
                  {result.ieee_status.includes("Normal") ? (
                    <CheckCircle size={36} className="drop-shadow-md" />
                  ) : (
                    <AlertTriangle size={36} className="drop-shadow-md" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-widest opacity-70 mb-1 ${theme.subText}`}
                  >
                    Kesimpulan IEEE C57.104
                  </p>
                  <h3
                    className={`text-3xl font-black tracking-tight ${result.ieee_status.includes("Normal") ? "text-emerald-600 dark:text-emerald-400" : result.ieee_status.includes("KRITIS") ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}
                  >
                    {result.ieee_status}
                  </h3>
                </div>
              </div>
              <div className="text-left md:text-right z-10 w-full md:w-auto p-4 md:p-0 bg-white/40 dark:bg-black/20 rounded-xl md:bg-transparent md:dark:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
                <p
                  className={`text-xs font-bold uppercase tracking-widest opacity-70 mb-1 ${theme.subText}`}
                >
                  TDCG Level
                </p>
                <p
                  className={`text-3xl font-mono font-bold tracking-tight ${theme.text}`}
                >
                  {result.tdcg_value?.toFixed(0)}{" "}
                  <span className="text-base font-sans font-semibold opacity-60">
                    PPM
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div
                className={`lg:col-span-4 rounded-2xl border flex flex-col ${theme.card}`}
              >
                <div
                  className={`p-5 border-b ${theme.divider} flex justify-between items-center bg-transparent`}
                >
                  <h4
                    className={`font-bold text-sm uppercase tracking-wider ${theme.text}`}
                  >
                    Data Gas Dominan
                  </h4>
                  <Info size={18} className={theme.subText} />
                </div>
                <div className="p-0 flex-1 overflow-hidden">
                  <table className="w-full text-sm h-full">
                    <tbody className={`divide-y ${theme.divider}`}>
                      {gasTableData.map((row, i) => (
                        <tr
                          key={i}
                          className={
                            isDarkMode
                              ? "hover:bg-slate-800/50 transition-colors"
                              : "hover:bg-slate-50 transition-colors"
                          }
                        >
                          <td
                            className={`px-5 py-3.5 font-medium ${theme.subText}`}
                          >
                            {row.name} ({row.rumus})
                          </td>
                          <td
                            className={`px-5 py-3.5 text-right font-mono font-bold text-base ${theme.text}`}
                          >
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div
                className={`lg:col-span-8 rounded-2xl border p-4 flex flex-col items-center justify-center relative min-h-[400px] shadow-sm ${theme.card}`}
              >
                <h4
                  className={`absolute top-5 left-5 font-bold text-sm uppercase tracking-wider ${theme.text}`}
                >
                  Visualisasi Duval Pentagon
                </h4>
                <div className="w-full h-full flex items-center justify-center p-4">
                  <div className="w-full max-w-[450px] aspect-square">
                    <br />
                    <DuvalPentagon
                      h2={Number(formData.h2)}
                      ch4={Number(formData.ch4)}
                      c2h6={Number(formData.c2h6)}
                      c2h4={Number(formData.c2h4)}
                      c2h2={Number(formData.c2h2)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`rounded-2xl border p-6 space-y-6 ${theme.card}`}>
                <div className="flex items-center gap-2 pb-2 border-b border-gray-500/20">
                  <Activity className="text-blue-500" size={20} />
                  <h4 className={`font-bold text-lg ${theme.text}`}>
                    Diagnosis Teknis
                  </h4>
                </div>
                <div className="space-y-4">
                  <div
                    className={`p-3 rounded-lg border-l-4 ${isDarkMode ? "bg-slate-900 border-purple-500" : "bg-purple-50 border-purple-500"}`}
                  >
                    <p className="text-xs uppercase font-bold text-purple-600 mb-1">
                      Metode Rogers Ratio
                    </p>
                    <p className={`font-bold text-lg ${theme.text}`}>
                      {result.rogers_diagnosis}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-3 rounded-lg border ${isDarkMode ? "bg-slate-900 border-slate-700" : "bg-gray-50 border-gray-200"}`}
                    >
                      <p className="text-xs text-gray-500 mb-1">
                        Key Gas Dominan
                      </p>
                      <p className={`font-bold ${theme.text}`}>
                        {result.key_gas}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg border ${result.paper_health?.status.includes("Fault") ? "bg-red-50 border-red-200" : isDarkMode ? "bg-slate-900 border-slate-700" : "bg-gray-50 border-gray-200"}`}
                    >
                      <p className="text-xs text-gray-500 mb-1">
                        Isolasi Kertas (CO2/CO)
                      </p>
                      <p
                        className={`font-bold ${result.paper_health?.status.includes("Fault") ? "text-red-600" : theme.text}`}
                      >
                        {result.paper_health ? result.paper_health.status : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KOLOM ANALISIS AI (VOLTY CHAT) */}
              <div
                className={`rounded-2xl border p-6 relative overflow-hidden ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-linear-to-br from-white to-blue-50 border-blue-100 shadow-sm"}`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
                <div className="flex items-center gap-2 pb-4 border-b border-blue-500/20 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                    <Info size={18} />
                  </div>
                  <h4 className={`font-bold text-lg text-blue-600`}>
                    Volty AI Analysis
                  </h4>
                </div>
                <div
                  className={`prose prose-sm max-w-none font-medium leading-relaxed whitespace-pre-line ${isDarkMode ? "prose-invert text-gray-300" : "text-gray-700"}`}
                >
                  {result.volty_chat
                    ? cleanMarkdown(result.volty_chat)
                    : "Tidak ada analisis tambahan."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

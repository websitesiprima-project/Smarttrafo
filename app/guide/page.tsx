"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Info,
  FileText,
  Activity,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  GitMerge,
} from "lucide-react";

// ============================================================================
// INTERFACES (KAMUS TYPE SCRIPT)
import { useAppContext } from "@/app/AppContext";

interface FAQItemProps {
  question: string;
  answer: string;
  isDarkMode?: boolean;
}

const GuidePage = ({ initialTab = "ieee" }: { initialTab?: string }) => {
  const { isDarkMode } = useAppContext();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update tab saat dinavigasi dari halaman lain dengan prop berbeda
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // --- DATA 1: Limit IEEE C57.104 ---
  const ieeeLimits = [
    {
      gas: "Hidrogen (H2)",
      limit: "100 ppm",
      desc: "Partial Discharge / Stray Gassing",
    },
    { gas: "Metana (CH4)", limit: "120 ppm", desc: "Overheating Minyak" },
    {
      gas: "Asetilen (C2H2)",
      limit: "1 ppm",
      desc: "Arcing (Busur Api) - SANGAT KRITIS",
    },
    {
      gas: "Etilen (C2H4)",
      limit: "50 ppm",
      desc: "Overheating Suhu Tinggi (>700°C)",
    },
    { gas: "Etana (C2H6)", limit: "65 ppm", desc: "Overheating Suhu Menengah" },
    {
      gas: "Karbon Monoksida (CO)",
      limit: "350 ppm",
      desc: "Degradasi Kertas Isolasi",
    },
    {
      gas: "Karbon Dioksida (CO2)",
      limit: "2500 ppm",
      desc: "Penuaan Kertas / Oksidasi",
    },
  ];

  // --- DATA 2: Rogers Ratio ---
  const rogersData = [
    {
      case: "0",
      r2: "< 0.1",
      r1: "0.1 - 1.0",
      r5: "< 1.0",
      diag: "Normal",
      color: "text-emerald-500",
    },
    {
      case: "1",
      r2: "< 0.1",
      r1: "< 0.1",
      r5: "< 1.0",
      diag: "Partial Discharge (PD)",
      color: "text-yellow-500",
    },
    {
      case: "2",
      r2: "0.1 - 3.0",
      r1: "0.1 - 1.0",
      r5: "> 3.0",
      diag: "Arcing (Energi Tinggi)",
      color: "text-orange-500",
    },
    {
      case: "3",
      r2: "< 0.1",
      r1: "0.1 - 1.0",
      r5: "1.0 - 3.0",
      diag: "Thermal < 700°C",
      color: "text-red-500",
    },
    {
      case: "4",
      r2: "< 0.1",
      r1: "> 1.0",
      r5: "1.0 - 3.0",
      diag: "Thermal > 700°C",
      color: "text-rose-600",
    },
  ];

  // --- DATA 3: FAQ ---
  const faqs = [
    {
      q: "Apa itu DGA (Dissolved Gas Analysis)?",
      a: "DGA adalah metode analisis kondisi trafo dengan mengukur konsentrasi gas yang terlarut dalam minyak isolasi. Gas-gas ini terbentuk akibat stress termal atau elektrik.",
    },
    {
      q: "Mengapa C2H2 (Asetilen) sangat berbahaya?",
      a: "Asetilen hanya terbentuk pada suhu ekstrem (>700°C) akibat busur api listrik (Arcing). Kehadirannya, walau sedikit, menandakan adanya masalah serius yang bisa menyebabkan ledakan.",
    },
    {
      q: "Bagaimana cara kerja AI di aplikasi ini?",
      a: "Aplikasi menggunakan algoritma Random Forest yang telah dilatih dengan data historis trafo untuk mengenali pola kombinasi gas yang kompleks, melengkapi metode rasio manual.",
    },
    {
      q: "Apa itu Duval Pentagon?",
      a: "Metode visualisasi grafis untuk menentukan jenis kesalahan (Fault) berdasarkan proporsi 5 jenis gas hidrokarbon. Ini adalah standar internasional (IEC 60599).",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <header className="mb-8 border-b border-slate-500/20 pb-6 px-2">
        <h2
          className={`text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3 ${isDarkMode ? "text-white" : "text-[#1B7A8F]"}`}
        >
          <BookOpen className="text-[#17A2B8] shrink-0" size={32} />
          Pusat Panduan & Standar
        </h2>
        <p className="opacity-70 text-sm md:text-base">
          Referensi teknis interpretasi DGA berdasarkan standar internasional
          dan lokal.
        </p>
      </header>

      {/* --- NAVIGASI TAB --- */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 px-2 scrollbar-hide snap-x">
        <button
          onClick={() => setActiveTab("ieee")}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border snap-start ${
            activeTab === "ieee"
              ? "bg-[#1B7A8F] text-white border-[#1B7A8F] shadow-lg scale-105"
              : isDarkMode
                ? "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          IEEE C57.104
        </button>

        <button
          onClick={() => setActiveTab("rogers")}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border snap-start ${
            activeTab === "rogers"
              ? "bg-purple-600 text-white border-purple-600 shadow-lg scale-105"
              : isDarkMode
                ? "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Rogers Ratio
        </button>

        <button
          onClick={() => setActiveTab("iec")}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border snap-start ${
            activeTab === "iec"
              ? "bg-[#17A2B8] text-white border-[#17A2B8] shadow-lg scale-105"
              : isDarkMode
                ? "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          IEC 60599 (Duval)
        </button>

        <button
          onClick={() => setActiveTab("spln")}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border snap-start ${
            activeTab === "spln"
              ? "bg-[#FFD700] text-gray-900 border-[#FFD700] shadow-lg scale-105"
              : isDarkMode
                ? "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          SPLN T5.004
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2">
        {/* --- KONTEN UTAMA (KIRI - 2/3 Layar) --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB CONTENT: IEEE */}
          {activeTab === "ieee" && (
            <div
              className={`p-5 md:p-6 rounded-2xl border animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-[#FFFFFF] border-slate-200 shadow-sm"}`}
            >
              <div className="flex items-center gap-4 mb-6 border-b border-slate-500/20 pb-4">
                <div className="p-3 bg-[#1B7A8F]/10 rounded-xl shrink-0">
                  <FileText className="text-[#1B7A8F]" size={28} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold">
                    IEEE Std C57.104™-2019
                  </h3>
                  <p className="text-xs md:text-sm opacity-70 mt-1">
                    Guide for the Interpretation of Gases Generated in Mineral
                    Oil-Immersed Transformers
                  </p>
                </div>
              </div>

              <h4 className="font-bold text-[#17A2B8] mb-3 text-sm md:text-base">
                Batas Limit Gas (90th Percentile)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-500/20">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead
                    className={`${isDarkMode ? "bg-slate-800/80" : "bg-slate-50"}`}
                  >
                    <tr>
                      <th className="px-4 py-3 font-semibold">Gas</th>
                      <th className="px-4 py-3 font-semibold">Limit (ppm)</th>
                      <th className="px-4 py-3 font-semibold">Indikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-500/10">
                    {ieeeLimits.map((item, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-100"}`}
                      >
                        <td className="px-4 py-3 font-bold text-[#17A2B8]">
                          {item.gas}
                        </td>
                        <td className="px-4 py-3 font-mono text-rose-500 font-bold">
                          {item.limit}
                        </td>
                        <td className="px-4 py-3 opacity-80 text-xs md:text-sm">
                          {item.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT: ROGERS RATIO */}
          {activeTab === "rogers" && (
            <div
              className={`p-5 md:p-6 rounded-2xl border animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-[#FFFFFF] border-slate-200 shadow-sm"}`}
            >
              <div className="flex items-center gap-4 mb-6 border-b border-slate-500/20 pb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl shrink-0">
                  <GitMerge className="text-purple-500" size={28} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold">
                    Rogers Ratio Method
                  </h3>
                  <p className="text-xs md:text-sm opacity-70 mt-1">
                    IEC 60599 / IEEE C57.104 (Ratio Based Diagnosis)
                  </p>
                </div>
              </div>

              <p className="text-sm opacity-80 text-justify mb-6 leading-relaxed">
                Metode ini membandingkan <strong>rasio antar gas</strong> untuk
                menentukan jenis kesalahan. Efektif untuk membedakan antara
                gangguan termal (panas) dan elektris (busur api).
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-500/20">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead
                    className={`${isDarkMode ? "bg-slate-800/80" : "bg-slate-50"}`}
                  >
                    <tr>
                      <th className="px-4 py-3 font-semibold text-center">
                        Kasus
                      </th>
                      <th className="px-4 py-3 font-semibold">
                        R2 (C2H2/C2H4)
                      </th>
                      <th className="px-4 py-3 font-semibold">R1 (CH4/H2)</th>
                      <th className="px-4 py-3 font-semibold">
                        R5 (C2H4/C2H6)
                      </th>
                      <th className="px-4 py-3 font-semibold">Diagnosis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-500/10">
                    {rogersData.map((item, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-100"}`}
                      >
                        <td className="px-4 py-3 font-mono font-bold text-center bg-slate-500/5">
                          {item.case}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs md:text-sm">
                          {item.r2}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs md:text-sm">
                          {item.r1}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs md:text-sm">
                          {item.r5}
                        </td>
                        <td
                          className={`px-4 py-3 font-bold text-xs md:text-sm ${item.color}`}
                        >
                          {item.diag}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] opacity-60 mt-4 mx-1 italic">
                * Jika rasio tidak sesuai dengan tabel di atas, maka diagnosis
                dianggap tidak spesifik.
              </p>
            </div>
          )}

          {/* TAB CONTENT: IEC */}
          {activeTab === "iec" && (
            <div
              className={`p-5 md:p-6 rounded-2xl border animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-[#FFFFFF] border-slate-200 shadow-sm"}`}
            >
              <div className="flex items-center gap-4 mb-6 border-b border-slate-500/20 pb-4">
                <div className="p-3 bg-[#17A2B8]/10 rounded-xl shrink-0">
                  <Activity className="text-[#17A2B8]" size={28} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold">
                    IEC 60599 (Duval Method)
                  </h3>
                  <p className="text-xs md:text-sm opacity-70 mt-1">
                    Guidance on the interpretation of dissolved and free gases
                    analysis
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-sm opacity-80 text-justify leading-relaxed">
                  Standar ini menggunakan <strong>Rasio Gas</strong> dan
                  visualisasi grafis (Segitiga/Pentagon) untuk menentukan jenis
                  gangguan secara spesifik.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className={`p-5 rounded-xl border ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                  >
                    <h4 className="font-bold text-[#17A2B8] mb-3 border-b border-slate-500/20 pb-2">
                      Kode Diagnosa (Fault Types)
                    </h4>
                    <ul className="text-xs md:text-sm space-y-2.5 opacity-80">
                      <li>
                        <strong className="text-[#17A2B8]">PD:</strong> Partial
                        Discharge (Peluaan Parsial)
                      </li>
                      <li>
                        <strong className="text-[#17A2B8]">D1:</strong>{" "}
                        Discharge Low Energy (Percikan kecil)
                      </li>
                      <li>
                        <strong className="text-[#17A2B8]">D2:</strong>{" "}
                        Discharge High Energy (Arcing kuat)
                      </li>
                      <li>
                        <strong className="text-amber-500">T1:</strong> Thermal
                        Fault &lt; 300°C
                      </li>
                      <li>
                        <strong className="text-orange-500">T2:</strong> Thermal
                        Fault 300°C - 700°C
                      </li>
                      <li>
                        <strong className="text-rose-500">T3:</strong> Thermal
                        Fault &gt; 700°C
                      </li>
                      <li>
                        <strong className="text-slate-400">S:</strong> Stray
                        Gassing
                      </li>
                    </ul>
                  </div>
                  <div
                    className={`p-5 rounded-xl border ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                  >
                    <h4 className="font-bold text-[#17A2B8] mb-3 border-b border-slate-500/20 pb-2">
                      Rasio Utama
                    </h4>
                    <ul className="text-sm space-y-3 opacity-80 font-mono bg-slate-500/5 p-3 rounded-lg">
                      <li className="flex items-center gap-2">
                        <span className="text-[#17A2B8]">1.</span> C2H2 / C2H4
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#17A2B8]">2.</span> CH4 / H2
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[#17A2B8]">3.</span> C2H4 / C2H6
                      </li>
                    </ul>
                    <p className="text-[11px] opacity-60 mt-4 italic leading-relaxed">
                      *Aplikasi ini mengonversi rasio tersebut secara otomatis
                      ke dalam bentuk visualisasi Duval Pentagon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: SPLN */}
          {activeTab === "spln" && (
            <div
              className={`p-5 md:p-6 rounded-2xl border animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-[#FFFFFF] border-slate-200 shadow-sm"}`}
            >
              <div className="flex items-center gap-4 mb-6 border-b border-slate-500/20 pb-4">
                <div className="p-3 bg-[#FFD700]/10 rounded-xl shrink-0">
                  <AlertTriangle className="text-[#FFD700]" size={28} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold">
                    SPLN T5.004-4: 2016
                  </h3>
                  <p className="text-xs md:text-sm opacity-70 mt-1">
                    Pedoman Pemeliharaan Trafo Tenaga (PT PLN Persero)
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div
                  className={`p-4 md:p-5 rounded-xl border-l-4 border-l-[#FFD700] ${isDarkMode ? "bg-amber-500/5 border-slate-700" : "bg-amber-50 border-amber-200"}`}
                >
                  <p className="text-sm md:text-base text-justify opacity-90 leading-relaxed">
                    PLN menggunakan metode{" "}
                    <strong>TDCG (Total Dissolved Combustible Gas)</strong>{" "}
                    sebagai indikator utama untuk menentukan kelayakan dan
                    status kondisi operasi unit transformator tenaga.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[#FFD700] mb-3 text-sm md:text-base">
                    Klasifikasi Kondisi TDCG
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-500/20">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead
                        className={`text-xs uppercase ${isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}
                      >
                        <tr>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">
                            Limit TDCG
                          </th>
                          <th className="px-4 py-3 font-semibold">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-500/10">
                        <tr
                          className={`transition-colors ${isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"}`}
                        >
                          <td className="px-4 py-3.5 font-bold text-emerald-500">
                            Kondisi 1
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs md:text-sm">
                            &le; 720 ppm
                          </td>
                          <td className="px-4 py-3.5 opacity-90 text-xs md:text-sm">
                            Operasi Normal
                          </td>
                        </tr>
                        <tr
                          className={`transition-colors ${isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"}`}
                        >
                          <td className="px-4 py-3.5 font-bold text-amber-500">
                            Kondisi 2
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs md:text-sm">
                            721 - 1920 ppm
                          </td>
                          <td className="px-4 py-3.5 opacity-90 text-xs md:text-sm">
                            Waspada (Uji Rutin Diperketat)
                          </td>
                        </tr>
                        <tr
                          className={`transition-colors ${isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"}`}
                        >
                          <td className="px-4 py-3.5 font-bold text-orange-500">
                            Kondisi 3
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs md:text-sm">
                            1921 - 4630 ppm
                          </td>
                          <td className="px-4 py-3.5 opacity-90 text-xs md:text-sm">
                            Peringatan (Uji Lanjut)
                          </td>
                        </tr>
                        <tr
                          className={`transition-colors ${isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"}`}
                        >
                          <td className="px-4 py-3.5 font-bold text-rose-500">
                            Kondisi 4
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs md:text-sm">
                            &gt; 4630 ppm
                          </td>
                          <td className="px-4 py-3.5 opacity-90 text-xs md:text-sm font-bold">
                            Bahaya (Trip / Off)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: FAQ (Always Visible under content) */}
          <div
            className={`p-5 md:p-6 rounded-2xl border shadow-sm mt-6 ${isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200"}`}
          >
            <h3 className="font-bold mb-5 flex items-center gap-2 text-[#1B7A8F] text-lg">
              <HelpCircle size={22} /> Pertanyaan Umum (FAQ)
            </h3>

            <div className="space-y-3 mt-4">
              {faqs.map((faq, i) => (
                <FAQItem
                  key={i}
                  question={faq.q}
                  answer={faq.a}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </div>
        </div>

        {/* --- SIDEBAR KANAN (Info Pendukung - 1/3 Layar) --- */}
        <div className="space-y-6">
          {/* Status Card (Legenda Warna) - STICKY */}
          <div
            className={`p-5 md:p-6 rounded-2xl border shadow-sm sticky top-24 z-10 ${isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200"}`}
          >
            <h3 className="font-bold mb-5 flex items-center gap-2 text-[#1B7A8F] text-lg">
              <CheckCircle size={22} /> Legenda Status
            </h3>
            <ul className="space-y-5 text-sm">
              <li className="flex gap-3.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="w-3 h-3 mt-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0"></span>
                <div>
                  <strong className="text-emerald-500 block mb-0.5">
                    Kondisi 1
                  </strong>
                  <span className="opacity-70 text-[13px] leading-tight block">
                    Normal. Lanjutkan jadwal pemeliharaan rutin.
                  </span>
                </div>
              </li>
              <li className="flex gap-3.5 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                <span className="w-3 h-3 mt-1 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)] shrink-0"></span>
                <div>
                  <strong className="text-yellow-500 block mb-0.5">
                    Kondisi 2
                  </strong>
                  <span className="opacity-70 text-[13px] leading-tight block">
                    Waspada. Evaluasi beban & tingkatkan frekuensi uji.
                  </span>
                </div>
              </li>
              <li className="flex gap-3.5 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <span className="w-3 h-3 mt-1 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)] animate-pulse shrink-0"></span>
                <div>
                  <strong className="text-rose-600 block mb-0.5">
                    Kondisi 3 / 4
                  </strong>
                  <span className="opacity-70 text-[13px] leading-tight block">
                    Kritis. Terdapat indikasi kerusakan aktif atau dekomposisi
                    kertas.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Kamus Gas Mini */}
          <div
            className={`p-5 md:p-6 rounded-2xl border shadow-sm ${isDarkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200"}`}
          >
            <h3 className="font-bold mb-4 flex items-center gap-2 text-[#1B7A8F] text-lg">
              <Info size={22} /> Kamus Gas Residu
            </h3>
            <div className="space-y-3 text-[13px]">
              <div
                className={`p-3 border rounded-xl ${isDarkMode ? "border-slate-600 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}
              >
                <strong className="text-[#17A2B8] block mb-1">
                  H2 (Hidrogen)
                </strong>
                <span className="opacity-80">
                  Terbentuk utama dari fenomena Partial Discharge / Corona.
                </span>
              </div>
              <div
                className={`p-3 border rounded-xl ${isDarkMode ? "border-rose-900/30 bg-rose-500/10" : "border-rose-200 bg-rose-50"}`}
              >
                <strong className="text-rose-500 block mb-1">
                  C2H2 (Asetilen)
                </strong>
                <span className="opacity-80 font-medium">
                  Busur Api (Arcing). Paling bahaya dan mengindikasikan suhu
                  sangat ekstrem.
                </span>
              </div>
              <div
                className={`p-3 border rounded-xl ${isDarkMode ? "border-pink-900/30 bg-pink-500/5" : "border-pink-200 bg-pink-50"}`}
              >
                <strong className="text-pink-500 block mb-1">
                  CO & CO2 (Karbon)
                </strong>
                <span className="opacity-80">
                  Indikator kerusakan selulosa (Isolasi Kertas Gosong).
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen Kecil untuk FAQ Item
const FAQItem = ({ question, answer, isDarkMode }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-300 ${isDarkMode ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"} ${isOpen ? "shadow-md" : ""}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 text-left text-[13px] md:text-sm font-bold flex justify-between items-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none"
      >
        <span className="pr-4">{question}</span>
        <div
          className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        >
          <ChevronDown
            size={18}
            className={isDarkMode ? "text-slate-400" : "text-slate-500"}
          />
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
      >
        <div
          className={`px-5 pb-4 text-xs md:text-[13px] leading-relaxed opacity-80 ${isDarkMode ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}
        >
          {answer}
        </div>
      </div>
    </div>
  );
};

export default GuidePage;

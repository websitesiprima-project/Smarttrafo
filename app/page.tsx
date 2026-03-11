"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Database,
  ShieldCheck,
  Map as MapIcon,
  Activity,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

// --- KONFIGURASI GAMBAR ---
const HERO_IMAGE_SOURCE =
  "https://images.unsplash.com/photo-1548337138-e87d889cc369?q=80&w=2070&auto=format&fit=crop";
const LAB_IMAGE_SOURCE =
  "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?q=80&w=2070&auto=format&fit=crop";
const LOGO_SMART = "/assets/Logo_SMART.jpg";

// --- LOGO TECH STACK (SVG CDN untuk Kualitas HD) ---
const LOGO_NEXTJS =
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg";
const LOGO_TAILWIND =
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg";
const LOGO_SUPABASE =
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg";
const LOGO_POSTGRES =
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg";
const LOGO_PYTHON =
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg"; // ADDED
const LOGO_FASTAPI =
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg"; // ADDED

export default function LandingPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pln-smart-trafo-darkmode");
    if (saved) setIsDarkMode(JSON.parse(saved));
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("pln-smart-trafo-darkmode", JSON.stringify(newTheme));
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const onStart = () => router.push("/login");
  const onGuide = () => router.push("/login");

  const primaryColor = "text-[#1B7A8F]";
  const bgPrimary = "bg-[#1B7A8F]";
  const btnGreen =
    "bg-linear-to-r from-[#1B7A8F] to-[#156b7d] hover:from-[#156b7d] hover:to-[#0f4d5a]";

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 overflow-hidden ${isDarkMode ? "bg-[#0f172a] text-white" : "bg-slate-50 text-slate-800"}`}
    >
      {/* CSS KHUSUS UNTUK ANIMASI MARQUEE SEAMLESS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-track {
          display: flex;
          width: 100%;
          overflow: hidden;
        }
        .animate-marquee-content {
          display: flex;
          flex-shrink: 0;
          min-width: 100%;
          justify-content: space-around;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee-track:hover .animate-marquee-content {
          animation-play-state: paused;
        }
      `,
        }}
      />

      {/* NAVBAR */}
      <nav
        className={`container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center z-50 sticky top-0 backdrop-blur-md border-b ${isDarkMode ? "bg-[#0f172a]/80 border-slate-800" : "bg-white/80 border-slate-200"}`}
      >
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer"
          onClick={() => window.scrollTo(0, 0)}
        >
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/2/20/Logo_PLN.svg"
            alt="Logo PLN"
            width={80}
            height={40}
            className="w-12 h-6 sm:w-16 sm:h-8 object-contain"
            priority
          />
          <div className="h-6 sm:h-8 w-px bg-gray-300 mx-1 opacity-50"></div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* PERBAIKAN LOGO SMART: Dibungkus container putih ala "App Icon" Apple/Modern */}
            <div className="bg-white p-1 sm:p-1.5 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden">
              <Image
                src={LOGO_SMART}
                alt="Logo SMART"
                width={40}
                height={40}
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                // Hapus mix-blend-multiply agar warna asli logonya keluar dan tajam
              />
            </div>
            <h1
              className={`text-base sm:text-xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-[#1B7A8F]"}`}
            >
              PLN <span className="text-[#F1C40F]">SMART</span>
            </h1>
          </div>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Link
            href="#"
            className="hover:text-[#1B7A8F] dark:hover:text-[#F1C40F] transition-colors"
          >
            Beranda
          </Link>
          <a
            href="#features"
            className="hover:text-[#1B7A8F] dark:hover:text-[#F1C40F] transition-colors"
          >
            Fitur
          </a>
          <a
            href="#tech"
            className="hover:text-[#1B7A8F] dark:hover:text-[#F1C40F] transition-colors"
          >
            Teknologi
          </a>
          <a
            href="#about"
            className="hover:text-[#1B7A8F] dark:hover:text-[#F1C40F] transition-colors"
          >
            Tentang
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onStart}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-white font-bold text-xs sm:text-sm ${btnGreen}`}
          >
            Login <span className="hidden sm:inline">Sekarang</span>
          </button>
          <div className="scale-90 flex items-center justify-center -mt-5">
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* EFEK GLOWING BACKGROUND (Subtle Blobs) */}
        <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-[#1B7A8F]/20 rounded-full filter blur-[100px] opacity-60 pointer-events-none dark:bg-[#1B7A8F]/10"></div>
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-[#F1C40F]/15 rounded-full filter blur-[100px] opacity-60 pointer-events-none dark:bg-[#F1C40F]/10"></div>

        {/* HERO SECTION */}
        <section className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 flex flex-col-reverse md:flex-row items-center gap-10 lg:gap-16 z-10">
          <div className="flex-1 space-y-5 lg:space-y-7 animate-in slide-in-from-left-10 duration-700">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100/50 text-[#1B7A8F] font-semibold text-xs sm:text-sm border border-blue-200 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700 backdrop-blur-sm mb-2">
              ✨ Sistem Berbasis Machine Learning
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.15]">
              Transformasi Digital <br />
              {/* GRADIENT TEXT */}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-[#1B7A8F] to-[#2ecc71] drop-shadow-sm">
                Monitoring Aset Transmisi
              </span>
            </h2>
            <p
              className={`text-sm sm:text-base lg:text-lg leading-relaxed max-w-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
            >
              Platform monitoring kesehatan transformator menggunakan{" "}
              <strong>Artificial Intelligence</strong> dan Standar{" "}
              <strong>IEEE C57.104</strong> untuk analisis DGA yang akurat,
              terpusat, dan <em>real-time</em>.
            </p>
            <div className="flex gap-4 pt-4">
              <button
                onClick={onStart}
                className={`px-6 py-3 lg:px-8 lg:py-4 rounded-xl text-white font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all ${btnGreen}`}
              >
                Mulai Analisis
              </button>
              <button
                onClick={onGuide}
                className={`px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-bold text-sm sm:text-base shadow-sm border transition-all hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
              >
                Lihat Panduan
              </button>
            </div>
          </div>

          {/* HERO IMAGE DENGAN FLOATING BADGES */}
          <div className="flex-1 w-full relative animate-in slide-in-from-right-10 duration-1000">
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[480px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 z-10">
              <Image
                src={HERO_IMAGE_SOURCE}
                alt="Digital Dashboard"
                fill
                className="object-cover transition-transform duration-1000 hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent pointer-events-none"></div>
            </div>

            {/* Floating Badge 1 - Kiri Bawah */}
            <div
              className={`absolute -bottom-6 -left-4 sm:-left-8 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 z-20 animate-bounce ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"} [animation-duration:3s]`}
            >
              <div className="bg-green-100 text-green-600 p-2.5 rounded-full">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-bold">
                  Akurasi AI DGA
                </p>
                <p
                  className={`font-extrabold text-sm sm:text-base ${isDarkMode ? "text-white" : "text-slate-800"}`}
                >
                  Tingkat Presisi Tinggi
                </p>
              </div>
            </div>

            {/* Floating Badge 2 - Kanan Atas */}
            <div
              className={`absolute top-8 -right-4 sm:-right-8 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 z-20 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}
            >
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              <p
                className={`font-bold text-xs sm:text-sm ${isDarkMode ? "text-white" : "text-slate-800"}`}
              >
                Live Data Sync
              </p>
            </div>
          </div>
        </section>
        {/* TECH STACK MARQUEE (100% Seamless Infinite Loop) */}
        <section
          id="tech"
          className={`relative py-12 border-y ${isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-100"}`}
        >
          <div className="container mx-auto px-4 text-center mb-8">
            <p className="text-sm font-bold tracking-widest uppercase text-slate-400">
              Dibangun dengan Ekosistem Teknologi Modern
            </p>
          </div>

          <div className="relative w-full">
            {/* Gradient Masking untuk efek pudar di pinggir (Kiri & Kanan) */}
            <div
              className={`absolute left-0 top-0 w-16 sm:w-32 h-full z-10 pointer-events-none bg-linear-to-r ${isDarkMode ? "from-[#0f172a] to-transparent" : "from-slate-50 to-transparent"}`}
            ></div>
            <div
              className={`absolute right-0 top-0 w-16 sm:w-32 h-full z-10 pointer-events-none bg-linear-to-l ${isDarkMode ? "from-[#0f172a] to-transparent" : "from-slate-50 to-transparent"}`}
            ></div>

            {/* Kontainer Utama Marquee */}
            <div className="animate-marquee-track">
              {/* Diulang 3 kali agar cukup menutupi layar monitor lebar */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-marquee-content gap-12 sm:gap-20 pr-12 sm:pr-20"
                  aria-hidden={i > 0 ? "true" : "false"}
                >
                  <Image
                    src={LOGO_NEXTJS}
                    alt="Next.js"
                    width={50}
                    height={50}
                    className={`h-10 sm:h-12 w-auto object-contain ${isDarkMode && "filter invert opacity-80"}`}
                  />
                  {/* ADDED: Python */}
                  <Image
                    src={LOGO_PYTHON}
                    alt="Python"
                    width={50}
                    height={50}
                    className="h-10 sm:h-12 w-auto object-contain opacity-80"
                  />
                  {/* ADDED: FastAPI */}
                  <Image
                    src={LOGO_FASTAPI}
                    alt="FastAPI"
                    width={140}
                    height={60}
                    className="h-8 sm:h-10 w-auto object-contain opacity-80"
                  />
                  <Image
                    src={LOGO_TAILWIND}
                    alt="Tailwind"
                    width={280}
                    height={60}
                    className="h-8 sm:h-10 w-auto object-contain opacity-80"
                  />
                  <div className="flex items-center gap-2 opacity-80">
                    <Image
                      src={LOGO_SUPABASE}
                      alt="Supabase"
                      width={40}
                      height={40}
                      className="h-8 sm:h-10 w-auto object-contain"
                    />
                    <span className="font-bold text-[#3ECF8E] text-lg">
                      Supabase
                    </span>
                  </div>
                  <Image
                    src={LOGO_POSTGRES}
                    alt="Postgres"
                    width={50}
                    height={50}
                    className="h-10 sm:h-12 w-auto object-contain opacity-80"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FITUR SECTION (Glassmorphism Cards) */}
        <section
          id="features"
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center z-10 relative"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4">
            Sentralisasi Data &{" "}
            <span className={primaryColor}>Manajemen Aset</span>
          </h2>
          <p
            className={`text-sm sm:text-base max-w-2xl mx-auto mb-12 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
          >
            Kelola seluruh aset transmisi dalam satu sistem terintegrasi.
            Ucapkan selamat tinggal pada file manual yang terpencar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left">
            {/* Card 1 */}
            <div
              className={`group relative p-8 rounded-3xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(27,122,143,0.3)] overflow-hidden ${isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-white border-slate-200 shadow-lg"}`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#1B7A8F] to-[#2ecc71] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 mb-6 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <MapIcon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Pemetaan WebGIS</h3>
              <p
                className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Visualisasi lokasi Gardu Induk interaktif (ULTG Lopana,
                Sawangan, Kotamobagu, Gorontalo) terintegrasi koordinat real.
              </p>
            </div>

            {/* Card 2 */}
            <div
              className={`group relative p-8 rounded-3xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(27,122,143,0.3)] overflow-hidden ${isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-white border-slate-200 shadow-lg"}`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#F1C40F] to-[#f39c12] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 mb-6 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Activity size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Prediktif</h3>
              <p
                className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Algoritma cerdas yang memprediksi kesehatan trafo menggunakan
                klasifikasi gas Duval Pentagon & IEEE secara otomatis.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className={`group relative p-8 rounded-3xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(27,122,143,0.3)] overflow-hidden ${isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-white border-slate-200 shadow-lg"}`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-500 to-[#1B7A8F] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 mb-6 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Database size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Database Relasional</h3>
              <p
                className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Keamanan data terpusat menggunakan PostgreSQL (Supabase) dengan
                pembagian hak akses (Super Admin, Manager, Viewer).
              </p>
            </div>
          </div>
        </section>

        {/* TENTANG KAMI */}
        <section
          id="about"
          className={`py-16 lg:py-24 ${isDarkMode ? "bg-slate-900/40" : "bg-slate-100/50"}`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div className="relative h-[300px] sm:h-[400px] lg:h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={LAB_IMAGE_SOURCE}
                alt="Proses Uji Laboratorium"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#1B7A8F]/20 mix-blend-multiply"></div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight">
                Transformasi Pengujian DGA <br />
                <span className={primaryColor}>Dari Lab ke Digital</span>
              </h2>
              <p
                className={`text-base lg:text-lg leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Mengonversi data hasil uji laboratorium menjadi wawasan{" "}
                <em>real-time</em> untuk pemeliharaan aset yang lebih proaktif.
                Platform ini adalah wujud nyata dedikasi kami untuk memadukan
                ketelitian prosedur standar dengan kecepatan eksekusi digital.
              </p>
              <ul
                className={`space-y-4 font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
              >
                <li className="flex items-center gap-3">
                  <Zap className="text-[#F1C40F]" size={20} /> Monitoring
                  Berkala
                </li>
                <li className="flex items-center gap-3">
                  <Zap className="text-[#F1C40F]" size={20} /> Ekspor Laporan
                  Otomatis (PDF/Excel)
                </li>
                <li className="flex items-center gap-3">
                  <Zap className="text-[#F1C40F]" size={20} /> Peringatan Dini
                  Status Kritis
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        className={`py-12 border-t ${isDarkMode ? "bg-[#0f172a] border-slate-800" : "bg-[#1B7A8F] text-white border-none"}`}
      >
        {/* Perbaikan grid: 4 kolom rapi untuk layar besar */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Kolom 1: Identitas */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-[#F1C40F]" size={24} fill="currentColor" />
              <h2 className="text-xl font-extrabold text-white">PLN SMART</h2>
            </div>
            <p className="text-sm opacity-80 max-w-xs leading-relaxed text-slate-200">
              Sistem Manajemen Aset & Analisis DGA Terintegrasi untuk PLN UPT
              Manado.
            </p>
          </div>

          {/* Kolom 2: Navigasi */}
          <div>
            <h4 className="font-bold text-white mb-4">Navigasi Utama</h4>
            <ul className="space-y-3 text-sm opacity-80 text-slate-200">
              <li>
                <Link
                  href="#"
                  className="hover:text-[#F1C40F] transition-colors"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-[#F1C40F] transition-colors"
                >
                  Fitur Unggulan
                </a>
              </li>
              <li>
                <button
                  onClick={onGuide}
                  className="hover:text-[#F1C40F] transition-colors"
                >
                  Buku Panduan
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak PLN */}
          <div>
            <h4 className="font-bold text-white mb-4">Informasi Kontak</h4>
            <ul className="space-y-2 text-sm opacity-80 leading-relaxed text-slate-200">
              <li className="font-semibold text-white">
                PT. PLN (PERSERO) UPT MANADO
              </li>
              <li>
                Jl. Tompakwa No.1, Bumi Nyiur, Kec. Wanea, Kota Manado, Sulawesi
                Utara
              </li>
            </ul>
          </div>

          {/* Kolom 4: Tribute Pengembang */}
          <div>
            <h4 className="font-bold text-white mb-4">Tim Pengembang</h4>
            <div className="space-y-3 text-sm opacity-80 text-slate-200">
              <ul className="space-y-1">
                <li className="font-semibold text-[#F1C40F] drop-shadow-sm">
                  Jeremia Paduli
                </li>
                <li className="font-semibold text-[#F1C40F] drop-shadow-sm">
                  Jonathan Kaligis
                </li>
              </ul>
              <div className="pt-3 border-t border-white/20">
                <p className="text-xs italic leading-relaxed">
                  Mahasiswa Kerja Praktek <br />
                  Teknik Informatika <br />
                  Universitas Sam Ratulangi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/10 text-center text-xs opacity-60 text-white">
          &copy; 2026 Kerja Praktek Teknik Informatika UNSRAT - PT PLN (Persero)
          UPT Manado. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

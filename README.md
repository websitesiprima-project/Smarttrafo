<div align="center">
  <img src="public/assets/Logo_SMART.jpg" alt="Logo SMART TRAFO" width="120" />
  
  # ⚡ PLN SMART TRAFO
  **Sistem Manajemen Aset & Analisis DGA Terintegrasi**

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Groq_AI-F56565?style=for-the-badge&logo=groq&logoColor=white" alt="Groq AI" />
  </p>

  <p>
    Transformasi digital pemeliharaan transformator PLN UPT Manado. Memadukan keandalan <b>Standar IEEE C57.104</b> dengan ketajaman <b>Artificial Intelligence</b> untuk analisis <i>Dissolved Gas Analysis</i> (DGA) yang akurat, cepat, dan <i>real-time</i>.
  </p>
</div>

---

## 🚀 The Big Leap: Dari Vite ke Next.js (App Router)

Aplikasi ini baru saja mengalami perombakan arsitektur besar-besaran! Kami beralih dari **Vite (React SPA)** menuju **Next.js (App Router)** untuk menghadirkan performa tingkat _Enterprise_:

- **⚡ Server-Side Rendering (SSR):** Waktu muat awal (First Contentful Paint) sangat cepat, tidak ada lagi _blank screen_ saat aplikasi memuat data.
- **🛡️ Keamanan & Enkapsulasi:** Kredensial database (Supabase) dan kunci API AI tersimpan aman di environment server.
- **🗂️ Smart Routing:** Menggunakan fitur _Layouts_ dan _Suspense_ bawaan Next.js untuk transisi halaman yang mulus layaknya aplikasi _native_, memisahkan logika publik dan _Auth-Guard_ admin dengan sempurna.
- **🎨 Tailwind CSS v4:** Menggunakan _engine_ styling terbaru yang jauh lebih cepat, dikombinasikan dengan efek UI "Antigravity".

---

## ✨ Fitur Unggulan

- **🧠 VOLTY AI Assistant (Agent MD):** Asisten virtual spesialis trafo bertenaga LLM Groq (Llama 3.3). Dibekali dengan _Strict Guardrails_—Volty akan menolak keras menjawab pertanyaan di luar teknis trafo (seperti skor bola atau politik!).
- **📊 Analisis DGA Multi-Metode:** \* Standar IEEE C57.104-2019
  - Standar SPLN T5.004-4:2016
  - Duval Pentagon 1 (Presisi kalkulasi _Centroid_ x,y)
  - Rogers Ratio & Key Gas
- **🤖 Prediksi Machine Learning:** Menggunakan model _Random Forest_ (via `joblib`) untuk mendeteksi anomali pada minyak isolasi.
- **🗺️ Pemetaan Geospasial Dinamis:** Visualisasi sebaran aset trafo menggunakan integrasi Leaflet JS.
- **🔐 Role-Based Access Control (RBAC):** Hierarki keamanan ketat (Super Admin, Manager Unit, Viewer) terintegrasi langsung dengan Supabase Auth & Row Level Security (RLS).

---

## 🛠️ Ekosistem Teknologi

### 🎨 Frontend (Client)

- **Framework:** Next.js (React 18/19)
- **Bahasa:** TypeScript (Strict Typing)
- **Styling:** Tailwind CSS v4 & Framer Motion (Animasi UI)
- **Visualisasi Data:** Recharts & Leaflet
- **State & Notifikasi:** React Context API & Sonner

### ⚙️ Backend (AI & Logic)

- **Framework:** FastAPI (Python)
- **AI Service:** Groq API (Prompt Engineering / Agentic Workflow)
- **Machine Learning:** Scikit-Learn, NumPy, Joblib

### 🗄️ Database & Auth

- **BaaS:** Supabase
- **Database:** PostgreSQL (dengan fitur Realtime Subscriptions)
- **Autentikasi:** Supabase Auth (JWT)

---

## 🏗️ Cara Instalasi & Menjalankan (Local Development)

Proyek ini terbagi menjadi dua bagian: **Frontend** (Next.js) dan **Backend** (FastAPI).

### 1. Persiapan Backend (Python)

```bash
# Masuk ke folder backend
cd backend

# Buat & aktifkan virtual environment
python -m venv venv
source venv/bin/activate  # Untuk Windows: venv\Scripts\activate

# Install dependensi
pip install fastapi uvicorn groq supabase python-dotenv joblib numpy

# Jalankan server FastAPI (Port 8000)
uvicorn main:app --reload --port 8000
```

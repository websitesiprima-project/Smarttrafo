"use client";

import React from "react";

// ============================================================================
// INTERFACE (KAMUS TYPE SCRIPT)
// ============================================================================
interface DuvalPentagonProps {
  h2: number | string;
  ch4: number | string;
  c2h6: number | string;
  c2h4: number | string;
  c2h2: number | string;
}

const DuvalPentagon = ({ h2, ch4, c2h6, c2h4, c2h2 }: DuvalPentagonProps) => {
  // Konversi ke Number untuk memastikan keamanan perhitungan
  const vH2 = Number(h2 || 0);
  const vCH4 = Number(ch4 || 0);
  const vC2H6 = Number(c2h6 || 0);
  const vC2H4 = Number(c2h4 || 0);
  const vC2H2 = Number(c2h2 || 0);

  const total = vH2 + vCH4 + vC2H6 + vC2H4 + vC2H2;

  if (total === 0)
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-500 border border-dashed border-slate-700 rounded-xl">
        Masukkan data gas untuk melihat Pentagon
      </div>
    );

  // Perhitungan Persentase
  const pH2 = (vH2 / total) * 100;
  const pC2H6 = (vC2H6 / total) * 100;
  const pCH4 = (vCH4 / total) * 100;
  const pC2H4 = (vC2H4 / total) * 100;
  const pC2H2 = (vC2H2 / total) * 100;

  // Fungsi konversi derajat ke radian dengan tipe data number
  const rad = (deg: number) => (deg * Math.PI) / 180;

  // Titik Sumbu Gas (Scale approx 0.4 relative to 100%)
  const k = 0.4;
  const points = [
    { x: 0, y: pH2 * k }, // H2 (Top)
    { x: pC2H6 * k * Math.cos(rad(162)), y: pC2H6 * k * Math.sin(rad(162)) }, // C2H6
    { x: pCH4 * k * Math.cos(rad(234)), y: pCH4 * k * Math.sin(rad(234)) }, // CH4
    { x: pC2H4 * k * Math.cos(rad(306)), y: pC2H4 * k * Math.sin(rad(306)) }, // C2H4
    { x: pC2H2 * k * Math.cos(rad(18)), y: pC2H2 * k * Math.sin(rad(18)) }, // C2H2
  ];

  // Hitung Centroid Sederhana (Average Position)
  let Cx = 0;
  let Cy = 0;
  points.forEach((p) => {
    Cx += p.x;
    Cy += p.y;
  });

  // SVG Paths untuk Zona Duval Pentagon 1 (Approximation Coordinates)
  const zones = {
    PD: "M 0 33 L -1 33 L -1 24.5 L 0 24.5 Z",
    D1: "M 0 40 L 38 12 L 32 -6.1 L 4 16 L 0 1.5 L 0 40 Z",
    D2: "M 4 16 L 32 -6.1 L 24.3 -30 L 0 -3 L 0 1.5 Z",
    T3: "M 0 -3 L 24.3 -30 L 23.5 -32.4 L 1 -32.4 L -6 -4 Z",
    T2: "M -6 -4 L 1 -32.4 L -22.5 -32.4 Z",
    T1: "M -6 -4 L -22.5 -32.4 L -23.5 -32.4 L -35 3.1 L 0 1.5 L 0 -3 Z",
    S: "M 0 1.5 L -35 3.1 L -38 12.4 L 0 40 L 0 33 L -1 33 L -1 24.5 L 0 24.5 Z",
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-slate-700 w-full shadow-inner">
      <h3 className="text-slate-400 text-[10px] font-bold mb-4 uppercase tracking-[0.2em]">
        Visualisasi Duval Pentagon 1
      </h3>
      <svg viewBox="-45 -45 90 90" className="w-full h-64 overflow-visible">
        <g transform="scale(1, -1)">
          {/* Zona Warna dengan Transparansi */}
          <path
            d={zones.PD}
            fill="#d8b4fe"
            fillOpacity="0.5"
            stroke="white"
            strokeWidth="0.1"
          />{" "}
          {/* PD - Ungu */}
          <path
            d={zones.D1}
            fill="#93c5fd"
            fillOpacity="0.5"
            stroke="white"
            strokeWidth="0.1"
          />{" "}
          {/* D1 - Biru */}
          <path
            d={zones.D2}
            fill="#fca5a5"
            fillOpacity="0.5"
            stroke="white"
            strokeWidth="0.1"
          />{" "}
          {/* D2 - Merah */}
          <path
            d={zones.T3}
            fill="#fdba74"
            fillOpacity="0.5"
            stroke="white"
            strokeWidth="0.1"
          />{" "}
          {/* T3 - Orange */}
          <path
            d={zones.T2}
            fill="#fde047"
            fillOpacity="0.5"
            stroke="white"
            strokeWidth="0.1"
          />{" "}
          {/* T2 - Kuning */}
          <path
            d={zones.T1}
            fill="#fef08a"
            fillOpacity="0.5"
            stroke="white"
            strokeWidth="0.1"
          />{" "}
          {/* T1 - Kuning Muda */}
          <path
            d={zones.S}
            fill="#86efac"
            fillOpacity="0.5"
            stroke="white"
            strokeWidth="0.1"
          />{" "}
          {/* S - Hijau */}
          {/* Label Nama Zona */}
          <g
            transform="scale(1, -1)"
            className="text-[3px] font-black fill-slate-400 pointer-events-none"
          >
            <text x="-2" y="-28">
              PD
            </text>
            <text x="15" y="-20">
              D1
            </text>
            <text x="10" y="5">
              D2
            </text>
            <text x="5" y="20">
              T3
            </text>
            <text x="-10" y="20">
              T2
            </text>
            <text x="-15" y="10">
              T1
            </text>
            <text x="-15" y="-15">
              S
            </text>
          </g>
          {/* Sumbu dan Label Gas */}
          {[
            { angle: 90, label: "H2", x: -2, y: -42 },
            { angle: 162, label: "C2H6", x: -45, y: -12 },
            { angle: 234, label: "CH4", x: -30, y: 38 },
            { angle: 306, label: "C2H4", x: 20, y: 38 },
            { angle: 18, label: "C2H2", x: 42, y: -12 },
          ].map((axis, i) => (
            <React.Fragment key={i}>
              <line
                x1="0"
                y1="0"
                x2={40 * Math.cos(rad(axis.angle))}
                y2={40 * Math.sin(rad(axis.angle))}
                stroke="white"
                strokeWidth="0.2"
                strokeDasharray="1,1"
                opacity="0.3"
              />
              <text
                x={axis.x}
                y={axis.y}
                transform="scale(1, -1)"
                fontSize="4"
                fill="white"
                fontWeight="bold" // <-- Gunakan fontWeight sebagai gantinya
              >
                {axis.label}
              </text>
            </React.Fragment>
          ))}
          {/* Titik Hasil DGA (Centroid) */}
          <circle
            cx={Cx}
            cy={Cy}
            r="2"
            fill="#ef4444"
            stroke="white"
            strokeWidth="0.5"
            className="animate-pulse shadow-lg"
          />
        </g>
      </svg>

      <div className="mt-4 flex items-center gap-4 border-t border-slate-700/50 pt-4 w-full justify-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse"></span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Titik Diagnosis
          </span>
        </div>
      </div>
    </div>
  );
};

export default DuvalPentagon;

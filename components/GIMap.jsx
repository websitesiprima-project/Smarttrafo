import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Zap } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

// Pastikan jalur data sudah benar
import { allGIs, trafoDatabase, getGIHealthStatus } from "../data/assetData";

/**
 * Fungsi membuat Icon Custom menggunakan DivIcon
 * Keuntungan: Tidak akan hilang saat build karena tidak memanggil file .png
 */
const createIcon = (status) => {
  let color = "#22c55e"; // Hijau (Normal)
  let glow = "rgba(34, 197, 94, 0.4)";

  if (status === "Waspada" || status === "Cond 2") {
    color = "#eab308"; // Kuning
    glow = "rgba(234, 179, 8, 0.4)";
  } else if (status === "Kritis" || status === "Cond 3") {
    color = "#ef4444"; // Merah
    glow = "rgba(239, 68, 68, 0.4)";
  }

  const iconMarkup = renderToStaticMarkup(
    <div style={{ position: "relative", width: "32px", height: "32px" }}>
      {/* Efek Denyut (Glow/Pulse) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: glow,
          borderRadius: "50%",
          animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        }}
      />
      {/* Lingkaran Icon Utama */}
      <div
        style={{
          position: "relative",
          backgroundColor: "white",
          border: `3px solid ${color}`,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          zIndex: 10,
        }}
      >
        <Zap size={16} color={color} fill={color} />
      </div>
    </div>,
  );

  return L.divIcon({
    html: iconMarkup,
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16], // Supaya titik koordinat tepat di tengah lingkaran
    popupAnchor: [0, -20],
  });
};

const GIMap = ({ center = [0.8, 124.0], zoom = 8 }) => {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Cek apakah data allGIs tersedia sebelum mapping */}
        {allGIs && allGIs.length > 0
          ? allGIs.map((gi, index) => {
              // Validasi data koordinat agar tidak menyebabkan crash
              if (!gi.lat || !gi.lng) return null;

              const trafos = trafoDatabase[gi.name] || [];
              const giStatus = gi.status || getGIHealthStatus(gi.name);

              return (
                <Marker
                  key={`gi-marker-${index}`}
                  position={[parseFloat(gi.lat), parseFloat(gi.lng)]}
                  icon={createIcon(giStatus)}
                >
                  <Popup>
                    <div className="text-center p-1 w-48">
                      <h3 className="font-bold text-sm text-gray-800 mt-1 mb-1">
                        {gi.name}
                      </h3>
                      <span
                        className={`inline-block px-2 py-0.5 mb-3 rounded text-[10px] font-bold 
                        ${
                          giStatus === "Kritis" || giStatus === "Critical"
                            ? "bg-red-100 text-red-700"
                            : giStatus === "Waspada" || giStatus === "Warning"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        Status GI:{" "}
                        {giStatus === "Critical"
                          ? "Kritis"
                          : giStatus === "Warning"
                            ? "Waspada"
                            : "Normal"}
                      </span>

                      <div className="text-left space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {trafos.length > 0 ? (
                          trafos.map((t, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-50 border border-slate-200 shadow-sm rounded p-1.5 flex justify-between items-center"
                            >
                              <div>
                                <span className="font-semibold text-xs text-slate-700 block">
                                  {t.name}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {t.merk} {t.volt && `- ${t.volt}`}
                                </span>
                              </div>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                  t.status === "Kritis"
                                    ? "bg-red-100 text-red-700"
                                    : t.status === "Waspada"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                }`}
                              >
                                {t.status}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-gray-500 text-center py-2 italic cursor-default">
                            Belum ada data trafo
                          </p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })
          : console.warn("Data GI tidak ditemukan atau kosong")}
      </MapContainer>
    </div>
  );
};

export default GIMap;

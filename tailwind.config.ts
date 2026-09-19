import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Diturunkan dari warna asli logo PLN (#28A8E0), digelapkan agar
        // teks/tombol tetap AA-contrast. Satu sumber kebenaran -- jangan
        // hardcode hex baru di komponen, pakai token ini.
        brand: {
          DEFAULT: "#146C94",
          dark: "#0F5678",
          vivid: "#28A8E0",
        },
        gold: "#F1C40F",
      },
    },
  },
  plugins: [],
};

export default config;

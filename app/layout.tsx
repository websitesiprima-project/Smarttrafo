import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./AppContext";
import ClientLayout from "./ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SMARTTRAFO",
  description:
    "SMARTTRAFO — Sistem Manajemen Aset & Analisis DGA Terintegrasi PLN UPT Manado.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className={inter.variable}>
      <AppProvider>
        <ClientLayout>{children}</ClientLayout>
      </AppProvider>
    </html>
  );
}

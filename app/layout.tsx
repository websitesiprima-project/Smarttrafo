import "./globals.css";
import { AppProvider } from "./AppContext";
import ClientLayout from "./ClientLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <AppProvider>
        <ClientLayout>{children}</ClientLayout>
      </AppProvider>
    </html>
  );
}

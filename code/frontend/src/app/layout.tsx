import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./legacy.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import QuickLoginModal from "@/components/QuickLoginModal";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Hệ thống Đặt vé xem phim - Trang chủ",
  description: "Trang web đặt vé xem phim trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${roboto.className} bg-[#0a0a0a] min-h-screen flex flex-col antialiased transition-colors duration-300`}>
        <ThemeProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <ThemeToggle />
          <QuickLoginModal />
        </ThemeProvider>
      </body>
    </html>
  );
}

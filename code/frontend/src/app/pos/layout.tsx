'use client';
import { Roboto } from "next/font/google";
import "../globals.css";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
});

export default function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-gray-100 ${roboto.className}`}>
      {children}
    </div>
  );
}

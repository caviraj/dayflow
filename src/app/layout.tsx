import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dayflow — Every workday, perfectly aligned.",
  description:
    "Modern HR Management System with real-time attendance, leave tracking, payroll, and intelligent workforce analytics.",
  keywords: ["HR", "attendance", "payroll", "leave management", "workforce"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* Inter font via preconnect for zero layout shift */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#06010f] text-slate-100 relative overflow-x-hidden">
        {/* Ambient Background Orbs — HR Violet */}
        <div
          className="fixed top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none z-0 animate-orb-float"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-0 animate-orb-drift"
          style={{
            background: "radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "3s",
          }}
        />
        <div
          className="fixed top-[40%] right-[20%] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Dot Grid Overlay */}
        <div className="fixed inset-0 bg-dot-grid pointer-events-none z-0" />

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-full">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}

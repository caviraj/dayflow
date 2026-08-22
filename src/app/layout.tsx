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
  description: "Modern HR Management System with real-time attendance, leave tracking, and payroll.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden bg-grid-pattern">
        {/* Ambient Light Orbs */}
        <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none z-0" />
        <div className="fixed top-[30%] right-[15%] w-[350px] h-[350px] rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col min-h-full">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}


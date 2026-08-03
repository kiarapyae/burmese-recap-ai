import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script'; // <--- Next.js Script import လုပ်ထားရန်
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Burmese Movie Recap AI",
  description: "Generate Burmese Movie Recap Scripts and Voiceovers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Adsterra Anti-Adblock Popunder Script */}
        <script src="https://yearlybeak.com/af/1c/5f/af1c5fe918fa9867f62485bbf41dcd13.js"></script>

      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
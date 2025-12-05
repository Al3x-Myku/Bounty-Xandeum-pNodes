import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xandeum pNode Explorer | Analytics Dashboard",
  description: "Real-time analytics and monitoring for Xandeum pNode storage network. Track node status, storage capacity, uptime, and performance metrics.",
  keywords: ["Xandeum", "pNode", "Solana", "Storage", "Analytics", "Dashboard", "Blockchain"],
  authors: [{ name: "Xandeum Explorer" }],
  openGraph: {
    title: "Xandeum pNode Explorer",
    description: "Real-time analytics for the Xandeum storage network",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

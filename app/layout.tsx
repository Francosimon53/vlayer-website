import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "vlayer - HIPAA Compliance Scanning for Healthcare Apps",
  description: "Open source CLI tool that scans your codebase for HIPAA compliance issues. Detect PHI exposure, encryption gaps, and compliance violations automatically.",
  keywords: ["HIPAA", "compliance", "healthcare", "security", "PHI", "scanner", "CLI"],
  authors: [{ name: "vlayer" }],
  openGraph: {
    title: "vlayer - HIPAA Compliance Scanning for Healthcare Apps",
    description: "Open source CLI tool that scans your codebase for HIPAA compliance issues.",
    type: "website",
    url: "https://vlayer.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "vlayer - HIPAA Compliance Scanning",
    description: "Open source CLI tool for HIPAA compliance scanning.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

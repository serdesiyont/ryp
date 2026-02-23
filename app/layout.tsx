import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://rate-your-professor.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Rate My Professors",
  description: "Find and rate professors at your university",
  keywords: ["rate my professors", "rate your professor"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    siteName: "Rate My Professors",
    title: "Rate My Professors",
    description: "Find and rate professors at your university",
    type: "website",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
// 1. Import the new Providers component
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ENIGMA",
  description: "Created by Team ENIGMA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* 2. Wrap your application's {children} with <Providers> */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

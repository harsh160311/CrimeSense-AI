import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "CrimeSense AI - Intelligence Platform",
  description: "AI-powered crime intelligence and prediction platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--bg-primary)]">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

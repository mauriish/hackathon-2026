import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prevención Mayor",
  description:
    "Herramienta educativa para revisar mensajes sospechosos y aprender a protegerte.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

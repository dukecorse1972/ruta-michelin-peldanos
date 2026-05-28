import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La ruta Michelin de Peldaños",
  description:
    "Mapa fan para seguir, plato a plato, la aventura de Peldaños visitando todos los estrella Michelin de España.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

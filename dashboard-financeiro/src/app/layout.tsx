import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PrevisionFinance – Dashboard Financeiro",
    template: "%s | PrevisionFinance",
  },
  description:
    "Gerencie suas finanças pessoais com inteligência artificial, relatórios avançados e controle de parcelamentos.",
  manifest: "/manifest.json",
  applicationName: "PrevisionFinance",
  keywords: ["finanças", "controle financeiro", "orçamento", "despesas", "receitas", "relatórios"],
  authors: [{ name: "PrevisionFinance" }],
  // PWA / iOS
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PrevisionFinance",
    startupImage: [
      {
        url: "/android-chrome-512x512.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  // Open Graph (para compartilhamento e stores)
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "PrevisionFinance",
    title: "PrevisionFinance – Dashboard Financeiro",
    description: "Gerencie suas finanças pessoais com IA e relatórios avançados.",
  },
  // Ícones (Next.js injeta automaticamente no <head>)
  icons: {
    icon: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/android-chrome-192x192.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "mask-icon", url: "/android-chrome-192x192.png" },
    ],
  },
  // Robots
  robots: {
    index: false, // App privado — não indexar
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Suporte a notch/Dynamic Island
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata, Viewport } from "next";
import { Fraunces, Lexend } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { LanguageProvider } from "@/lib/language";
import { AuthProvider } from "@/lib/auth";
import { PlacesProvider } from "@/lib/places-context";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import Navbar from "@/components/Navbar";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "YakJak — Ekoturisme Komunitas Aceh",
  description:
    "Temukan hidden gems Aceh dengan rute terverifikasi, peta offline, pemandu lokal, dan aturan adat yang dihormati.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "YakJak — Ekoturisme Komunitas Aceh",
    description:
      "Rute terverifikasi, peta offline, penyedia lokal, dan aturan adat untuk ekoturisme Aceh.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "YakJak — hidden gems, dampak nyata.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YakJak — Ekoturisme Komunitas Aceh",
    description:
      "Rute terverifikasi, peta offline, penyedia lokal, dan aturan adat untuk ekoturisme Aceh.",
    images: ["/og.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YakJak",
  },
  icons: {
    icon: "/icons/Icon-192.png",
    apple: "/icons/Icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#14532D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body
        className={`${lexend.variable} ${fraunces.variable} flex min-h-full flex-col bg-yak-bg font-sans text-yak-cream antialiased`}
        style={{
          fontFamily: "var(--font-lexend), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <LanguageProvider>
          <AuthProvider>
            <PlacesProvider>
              <ServiceWorkerRegister />
              <Navbar />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-16">
                {children}
              </main>
              <footer className="hidden border-t border-[#E5DDCB] bg-[#F3EEE2] md:block">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-xs text-[#5B6B5F] sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-sm font-black tracking-[0.18em] text-[#17251C]">
                      YAKJAK.ID
                    </span>
                    <p className="mt-1 max-w-md">
                      Platform ekoturisme komunitas Aceh. Rute terverifikasi,
                      peta offline, dan manfaat yang tinggal di gampong.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 font-bold">
                    <Link href="/" className="hover:text-[#1B6B3A]">
                      Jelajah
                    </Link>
                    <Link href="/providers" className="hover:text-[#1B6B3A]">
                      Lokal
                    </Link>
                    <Link href="/trips" className="hover:text-[#1B6B3A]">
                      Perjalanan
                    </Link>
                    <span>© 2026 YakJak</span>
                  </div>
                </div>
              </footer>
            </PlacesProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

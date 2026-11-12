import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language";
import { AuthProvider } from "@/lib/auth";
import { PlacesProvider } from "@/lib/places-context";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import Navbar from "@/components/Navbar";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "YAKJAK.ID — Discover Hidden Natural Gems",
  description:
    "YakJak is a curation platform for hidden natural destinations: routes, difficulty, travel time estimates, and trek maps.",
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
  themeColor: "#2F7D4F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${lexend.variable} flex min-h-full flex-col bg-[#F4F1E8] font-sans text-[#1F2A21] antialiased`}
        style={{ fontFamily: "var(--font-lexend), ui-sans-serif, system-ui, sans-serif" }}
      >
        <LanguageProvider>
          <AuthProvider>
            <PlacesProvider>
            <ServiceWorkerRegister />
            <Navbar />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-12">
              {children}
            </main>
            <footer className="hidden border-t border-[#D9D2BD] bg-[#F1EBDA] md:block">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-[#5D6F61]">
                <span className="font-extrabold tracking-widest">YAKJAK.ID</span>
                <span>© 2026 YakJak — Explore responsibly.</span>
              </div>
            </footer>
            </PlacesProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

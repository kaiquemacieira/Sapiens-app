import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/components/theme/ThemeProvider";
import LocaleProvider from "@/components/i18n/LocaleProvider";
import ProgressProvider from "@/components/gamification/ProgressProvider";
import OfflineProvider from "@/components/offline/OfflineProvider";
import OfflineBadge from "@/components/offline/OfflineBadge";
import ToastViewport from "@/components/ui/ToastViewport";
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
  title: "SAPIENS — Explore the Universe",
  description:
    "Interactive planetarium connecting the sky to scientific literature. Explore any region of the sky and discover the knowledge humanity has produced about it.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SAPIENS",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000008" },
    { media: "(prefers-color-scheme: light)", color: "#f0f4f8" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>
          <LocaleProvider>
            <OfflineProvider>
              <ProgressProvider>
                {children}
                <OfflineBadge />
                <ToastViewport />
              </ProgressProvider>
            </OfflineProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Aref_Ruqaa, Readex_Pro } from "next/font/google";
import { ar } from "@/content/ar";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { CartProvider } from "@/components/commerce/CartProvider";
import "./globals.css";

const readex = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-readex",
  display: "swap",
  adjustFontFallback: true,
});

const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: ["700"],
  variable: "--font-aref",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${ar.brand.nameAr} | ${ar.brand.nameEn} — ${ar.brand.tagline}`,
    template: `%s | ${ar.brand.nameAr}`,
  },
  description:
    "أصول — بيت سعودي للمكمّلات والعناية بالشعر يشتغل بمعايير صيدلية: مكوّنات مسمّاة، تراكيز مكتوبة على العلبة، شهادة تحليل عند الطلب، وضمان تجربة ٣٠ يوم. العلم قبل الوعد.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${readex.variable} ${arefRuqaa.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://api.osool.shop" />
        <link rel="dns-prefetch" href="https://api.osool.shop" />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <AnnouncementBar />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppFab />
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        <CartProvider />
      </body>
    </html>
  );
}

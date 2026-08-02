import type { Metadata } from "next";
import { Aref_Ruqaa, Readex_Pro } from "next/font/google";
import { ar } from "@/content/ar";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { CartProvider } from "@/components/commerce/CartProvider";
import "./globals.css";

const readex = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
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
    "منظومة عناية بالفروة والجذور للنساء والرجال في السعودية — ثلاث أسباب، مكوّنات مسمّاة، دفع عند الاستلام، وضمان تجربة ٣٠ يوم.",
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
      <body className="flex min-h-full flex-col font-sans">
        <AnnouncementBar />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppFab />
        <CartProvider />
      </body>
    </html>
  );
}

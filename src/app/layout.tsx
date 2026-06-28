import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLocale, getDictionary, dirOf, DEFAULT_LOCALE } from "@/lib/i18n";
import { getEnabledLocales } from "@/lib/settings";
import { I18nProvider } from "@/components/I18nProvider";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"], // cyrillic so Russian renders in the loaded webfont
});

export const metadata: Metadata = {
  title: "منصة التوظيف الشاملة | وظيفتك القادمة هنا",
  description: "اكتشف أفضل الفرص الوظيفية في الشرق الأوسط. منصة التوظيف الأولى للشركات والباحثين عن عمل بخوارزميات مطابقة ذكية.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requested = await getLocale();
  const enabled = await getEnabledLocales();
  // If the admin disabled the cookie's language, fall back to the default.
  const locale = enabled.includes(requested) ? requested : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return (
    <html lang={locale} dir={dirOf(locale)}>
      <body className={`${cairo.variable} ${inter.variable}`}>
        <I18nProvider locale={locale} dict={dict}>
          <Navbar />
          {children}
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}

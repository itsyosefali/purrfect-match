import type { Metadata } from "next";
import { Geist, Noto_Sans_Arabic } from "next/font/google";
import { AppShell } from "@/components/layout/AppNav";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Purrfect Match — Cat Adoption",
  description: "Find your perfect cat companion. Browse, adopt, and rehome cats with verified owners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${notoArabic.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

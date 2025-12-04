import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NavigationProgress } from "@/components/layout/NavigationProgress";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap", // Prevent FOUT (Flash of Unstyled Text)
  preload: true,
});

export const metadata: Metadata = {
  title: "Adamson University Store",
  description: "Official store for Adamson University merchandise.",
};

import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <AuthProvider>
        <CartProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

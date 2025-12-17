import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { StoreLayoutWrapper } from "@/components/storefront/StoreLayoutWrapper";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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
import { WishlistProvider } from "@/lib/wishlist-context";
import { AuthProvider } from "@/lib/auth-context";
import { CategoriesProvider } from "@/lib/categories-context";
import { getNavbarCategories } from "@/lib/products";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch categories for navbar on the server side
  const categories = await getNavbarCategories();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <AuthProvider>
            <CategoriesProvider categories={categories}>
              <CartProvider>
                <WishlistProvider>
                  <StoreLayoutWrapper>
                    {children}
                  </StoreLayoutWrapper>
                  <Toaster />
                </WishlistProvider>
              </CartProvider>
            </CategoriesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

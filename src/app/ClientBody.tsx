"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CompareProvider } from "@/lib/compare-context";
import { I18nProvider } from "@/lib/i18n";
import { ChatWidget } from "@/components/ChatWidget";

export function ClientBody({ children }: { children: ReactNode }) {
  return (
    <body className="antialiased bg-white" suppressHydrationWarning>
      <I18nProvider>
        <AuthProvider>
          <WishlistProvider>
            <CompareProvider>
              <CartProvider>
                {children}
                <ChatWidget />
              </CartProvider>
            </CompareProvider>
          </WishlistProvider>
        </AuthProvider>
      </I18nProvider>
    </body>
  );
}

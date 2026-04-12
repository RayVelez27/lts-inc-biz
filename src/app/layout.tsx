import type { Metadata } from "next";
import "./globals.css";
import { ClientBody } from "./ClientBody";

export const metadata: Metadata = {
  title: "LT's Business | Custom Business Apparel & Promotional Products | Maine",
  description: "LT's Business outfits your team with high-quality apparel customized with your logo. Premium embroidery, screen printing, and promotional products crafted in Maine.",
  keywords: "custom business apparel, logo embroidery, promotional products, Maine, corporate gifts, team uniforms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <ClientBody>{children}</ClientBody>
    </html>
  );
}

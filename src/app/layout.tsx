import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { CartProvider } from "@/lib/CartContext";
import { AuthProvider } from "@/lib/AuthContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "1998ACCESSORIES - Toko Aksesoris Online Terpercaya",
  description: "Temukan koleksi aksesoris terlengkap dengan kualitas terbaik. Kalung, gelang, cincin, dan anting dengan desain modern dan elegan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

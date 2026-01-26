import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CPS Material Deportivo - Distribuidor de Material Deportivo en España",
  description: "Control Play Sports distribuye material deportivo para colegios, clubes deportivos, ayuntamientos, instalaciones deportivas, piscinas y gimnasios en toda España.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <CartProvider>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}

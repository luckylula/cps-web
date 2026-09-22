import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin pedidos | CPS",
  robots: { index: false, follow: false },
};

export default function AdminPedidosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

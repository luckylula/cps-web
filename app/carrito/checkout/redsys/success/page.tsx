"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const order = searchParams.get("order");
  const [status, setStatus] = useState<"checking" | "ok" | "pending">("checking");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!order) {
      setStatus("ok");
      return;
    }
    const check = async () => {
      const res = await fetch(`/api/orders/status?redsysOrderId=${order}`);
      const data = await res.json();
      if (data.orderNumber) setOrderNumber(data.orderNumber);
      setStatus(data.status === "CONFIRMED" ? "ok" : "pending");
    };
    check();
    const t = setInterval(check, 2000);
    return () => clearInterval(t);
  }, [order]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago recibido</h1>
        {orderNumber && status === "ok" && (
          <p className="text-gray-700 font-medium mb-2">Pedido: {orderNumber}</p>
        )}
        <p className="text-gray-600 mb-6">
          {status === "checking" && "Comprobando el pago..."}
          {status === "pending" && "Estamos confirmando tu pago. Esta página se actualizará automáticamente."}
          {status === "ok" && "Tu pedido ha sido procesado correctamente. Recibirás un email de confirmación."}
        </p>
        <Link
          href="/"
          className="inline-block bg-[#003366] hover:bg-[#004080] text-white font-semibold py-2.5 px-6 rounded transition-colors"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

export default function RedsysSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

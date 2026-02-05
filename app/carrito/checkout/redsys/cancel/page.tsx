"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function CancelContent() {
  const searchParams = useSearchParams();
  const order = searchParams.get("order");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago cancelado</h1>
        <p className="text-gray-600 mb-6">
          El pago no se ha completado. Si fue un error, puedes volver al carrito e intentar de nuevo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/carrito"
            className="inline-block bg-[#003366] hover:bg-[#004080] text-white font-semibold py-2.5 px-6 rounded transition-colors"
          >
            Volver al carrito
          </Link>
          <Link
            href="/"
            className="inline-block border border-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded hover:bg-gray-50 transition-colors"
          >
            Ir a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RedsysCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>}>
      <CancelContent />
    </Suspense>
  );
}

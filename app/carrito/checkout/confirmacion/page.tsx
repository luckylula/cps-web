"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

function ConfirmacionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const method = searchParams.get("method") || "transferencia";
  const { clearCart } = useCart();
  const clearedRef = useRef(false);

  useEffect(() => {
    if (clearedRef.current) return;
    clearedRef.current = true;
    clearCart();
  }, [clearCart]);

  const isValEscolar = method === "val_escolar";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pedido registrado
        </h1>
        {orderNumber && (
          <p className="text-gray-800 font-medium mb-4">
            Número de pedido: <span className="font-semibold">{orderNumber}</span>
          </p>
        )}

        {isValEscolar ? (
          <div className="mb-6 space-y-3 text-left rounded-lg border border-[#c5d6bf] bg-[#eef4ec] p-4">
            <div className="flex justify-center">
              <img
                src="/pagos/val-escolar.png"
                alt="Val Escolar"
                className="h-16 w-auto max-w-[220px] object-contain"
              />
            </div>
            <p className="text-sm text-gray-800 text-center font-medium">VAL ESCOLAR</p>
            <p className="text-sm text-gray-700">
              Hemos recibido tu pedido. Nos pondremos en contacto para tramitarlo
              mediante la plataforma centro VAL ESCOLAR.
            </p>
            <p className="text-sm text-gray-700">
              Recuerda que necesitamos el código de centro en el apartado de
              observaciones. Si no lo indicaste, puedes responder al email de
              confirmación con ese código.
            </p>
          </div>
        ) : (
          <div className="mb-6 space-y-3 text-left rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-gray-900">Transferencia bancaria</p>
            <p className="text-sm text-gray-700">
              Hemos registrado tu pedido. Realiza la transferencia e incluye el
              número de pedido en el concepto.
            </p>
            <div className="text-sm text-gray-800 space-y-1">
              <p>
                <span className="text-gray-600">Titular:</span> Control Play Services S.L.
              </p>
              <p>
                <span className="text-gray-600">IBAN:</span>{" "}
                <span className="font-mono font-semibold">ES82 0182 3419 7502 0182 1344</span>
              </p>
              <p>
                <span className="text-gray-600">Banco:</span> BBVA
              </p>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-6">
          Te hemos enviado una copia del pedido por email. Si no lo recibes en
          unos minutos, revisa la bandeja de spam o correo no deseado.
        </p>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-block bg-black hover:bg-gray-900 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
        >
          Volver a la tienda
        </button>
      </div>
    </div>
  );
}

export default function ConfirmacionPedidoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
          Cargando...
        </div>
      }
    >
      <ConfirmacionContent />
    </Suspense>
  );
}

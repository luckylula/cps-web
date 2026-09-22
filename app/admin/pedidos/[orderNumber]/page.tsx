"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  adminAuthHeaders,
  clearAdminToken,
  getAdminToken,
} from "@/app/lib/adminClientAuth";

type OrderItem = {
  id: string;
  productName: string;
  productSlug: string;
  quantity: number;
  price: number;
  subtotal: number;
  proveedor: string | null;
  refProveedor: string | null;
  color: string | null;
  talla: string | null;
};

type OrderDetail = {
  orderNumber: string;
  status: string;
  total: number;
  shippingCost: number | null;
  discountAmount: number | null;
  couponCode: string | null;
  paymentMethod: string | null;
  email: string;
  telefono: string;
  nombre: string | null;
  apellidos: string | null;
  nombreCompleto: string | null;
  nombreCentro: string | null;
  nifCif: string | null;
  direccionCompleta: string | null;
  direccion: string | null;
  piso: string | null;
  codigoPostal: string | null;
  ciudad: string | null;
  provincia: string | null;
  observaciones: string | null;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "PROCESSING", label: "En preparación" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Anulado" },
];

const PAYMENT_LABELS: Record<string, string> = {
  val_escolar: "Val Escolar",
  transferencia: "Transferencia",
  redsys: "Tarjeta (Redsys)",
};

export default function AdminPedidoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = decodeURIComponent(String(params.orderNumber || ""));

  const [token, setToken] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [statusDraft, setStatusDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(
    async (authToken: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/admin/orders/${encodeURIComponent(orderNumber)}`,
          { headers: adminAuthHeaders(authToken) }
        );
        if (res.status === 401) {
          clearAdminToken();
          router.replace("/admin/pedidos");
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "No se pudo cargar el pedido");
        }
        const data = await res.json();
        setOrder(data.order);
        setStatusDraft(data.order.status);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    },
    [orderNumber, router]
  );

  useEffect(() => {
    const t = getAdminToken();
    if (!t) {
      router.replace("/admin/pedidos");
      return;
    }
    setToken(t);
    void load(t);
  }, [load, router]);

  async function saveStatus() {
    if (!token || !order) return;
    if (statusDraft === order.status) return;

    if (statusDraft === "CANCELLED") {
      const ok = window.confirm(
        `¿Anular el pedido ${order.orderNumber}?\n\nSe repondrá el stock de las líneas y no se podrá reabrir desde el panel.`
      );
      if (!ok) {
        setStatusDraft(order.status);
        return;
      }
    }

    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderNumber)}`,
        {
          method: "PATCH",
          headers: adminAuthHeaders(token),
          body: JSON.stringify({ status: statusDraft }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No se pudo actualizar");
      }
      setOrder(data.order);
      setStatusDraft(data.order.status);
      setMessage(
        data.stockRestored
          ? "Pedido anulado y stock repuesto."
          : "Estado actualizado."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
      setStatusDraft(order.status);
    } finally {
      setSaving(false);
    }
  }

  async function deleteOrder() {
    if (!token || !order || order.status !== "CANCELLED") return;

    const ok = window.confirm(
      `¿Eliminar definitivamente el pedido ${order.orderNumber}?\n\nDesaparecerá del listado y no se podrá recuperar. El stock no se modifica (ya se repuso al anular).`
    );
    if (!ok) return;

    setDeleting(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderNumber)}`,
        {
          method: "DELETE",
          headers: adminAuthHeaders(token),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No se pudo eliminar");
      }
      router.replace("/admin/pedidos");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-600">
        Cargando pedido…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-3 px-4">
        <p className="text-gray-700">{error || "Pedido no encontrado"}</p>
        <Link href="/admin/pedidos" className="text-sm underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  const name =
    `${order.nombre || ""} ${order.apellidos || ""}`.trim() ||
    order.nombreCompleto ||
    "—";

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/admin/pedidos"
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              ← Pedidos
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 mt-1">
              {order.orderNumber}
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString("es-ES")}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-green-800 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {message}
          </p>
        )}

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Estado</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              disabled={order.status === "CANCELLED" || saving}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={saveStatus}
              disabled={
                saving ||
                statusDraft === order.status ||
                order.status === "CANCELLED"
              }
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-40"
            >
              {saving ? "Guardando…" : "Guardar estado"}
            </button>
          </div>
          {order.status === "CANCELLED" && (
            <p className="text-xs text-gray-500 mt-2">
              Este pedido está anulado; no se puede reabrir desde el panel.
            </p>
          )}
        </section>

        {order.status === "CANCELLED" && (
          <section className="bg-white border border-red-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-1">Eliminar pedido</h2>
            <p className="text-sm text-gray-600 mb-3">
              Solo disponible en pedidos anulados. Lo quita del listado de forma
              definitiva (útil para pruebas).
            </p>
            <button
              type="button"
              onClick={deleteOrder}
              disabled={deleting}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-40"
            >
              {deleting ? "Eliminando…" : "Eliminar definitivamente"}
            </button>
          </section>
        )}

        <section className="bg-white border border-gray-200 rounded-xl p-5 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <h2 className="font-semibold text-gray-900 mb-2">Cliente</h2>
            <p className="text-gray-900">{name}</p>
            <p className="text-gray-600">{order.email}</p>
            <p className="text-gray-600">{order.telefono}</p>
            {order.nombreCentro && (
              <p className="text-gray-600 mt-1">Centro: {order.nombreCentro}</p>
            )}
            {order.nifCif && (
              <p className="text-gray-600">NIF/CIF: {order.nifCif}</p>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 mb-2">Pago y envío</h2>
            <p className="text-gray-700">
              Método:{" "}
              {PAYMENT_LABELS[order.paymentMethod || ""] ||
                order.paymentMethod ||
                "—"}
            </p>
            <p className="text-gray-700 mt-2">
              {order.direccionCompleta ||
                [
                  order.direccion,
                  order.piso,
                  order.codigoPostal,
                  order.ciudad,
                  order.provincia,
                ]
                  .filter(Boolean)
                  .join(", ") ||
                "—"}
            </p>
            {order.observaciones && (
              <p className="text-gray-700 mt-2">
                <span className="font-medium">Observaciones:</span>{" "}
                {order.observaciones}
              </p>
            )}
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-900">
            Líneas
          </div>
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="px-5 py-3 flex justify-between gap-4 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-xs text-gray-500">
                    {[
                      item.proveedor,
                      item.refProveedor ? `Ref ${item.refProveedor}` : null,
                      item.color,
                      item.talla,
                    ]
                      .filter(Boolean)
                      .join(" · ") || item.productSlug}
                  </p>
                  <p className="text-gray-600 mt-0.5">
                    {item.quantity} × {item.price.toFixed(2)} €
                  </p>
                </div>
                <p className="font-medium tabular-nums whitespace-nowrap">
                  {item.subtotal.toFixed(2)} €
                </p>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-gray-200 text-sm space-y-1">
            {order.couponCode && (
              <div className="flex justify-between text-gray-600">
                <span>Cupón ({order.couponCode})</span>
                <span>
                  −{(order.discountAmount || 0).toFixed(2)} €
                </span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span>
                {order.shippingCost && order.shippingCost > 0
                  ? `${order.shippingCost.toFixed(2)} €`
                  : "Gratis"}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 text-base pt-1">
              <span>Total</span>
              <span>{order.total.toFixed(2)} €</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

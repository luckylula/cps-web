"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  adminAuthHeaders,
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from "@/app/lib/adminClientAuth";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  paymentMethod: string | null;
  email: string;
  nombre: string | null;
  apellidos: string | null;
  nombreCompleto: string | null;
  nombreCentro: string | null;
  createdAt: string;
  itemCount: number;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PROCESSING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Anulado",
};

const PAYMENT_LABELS: Record<string, string> = {
  val_escolar: "Val Escolar",
  transferencia: "Transferencia",
  redsys: "Tarjeta",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function customerName(o: OrderRow) {
  if (o.nombre || o.apellidos) {
    return `${o.nombre || ""} ${o.apellidos || ""}`.trim();
  }
  return o.nombreCompleto || "—";
}

export default function AdminPedidosPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");

  useEffect(() => {
    setToken(getAdminToken());
  }, []);

  const loadOrders = useCallback(async (authToken: string, st: string, query: string) => {
    setLoading(true);
    setListError("");
    try {
      const params = new URLSearchParams();
      if (st && st !== "ALL") params.set("status", st);
      if (query.trim()) params.set("q", query.trim());
      params.set("take", "100");

      const res = await fetch(`/api/admin/orders?${params}`, {
        headers: adminAuthHeaders(authToken),
      });

      if (res.status === 401) {
        clearAdminToken();
        setToken(null);
        setLoginError("Token incorrecto o no autorizado.");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudieron cargar los pedidos");
      }

      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      void loadOrders(token, "ALL", "");
    }
  }, [token, loadOrders]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const value = password.trim();
    if (!value) {
      setLoginError("Introduce la contraseña de administración.");
      return;
    }

    const res = await fetch("/api/admin/orders?take=1", {
      headers: adminAuthHeaders(value),
    });

    if (!res.ok) {
      setLoginError(
        "Contraseña incorrecta. Usa ADMIN_PANEL_PASSWORD de .env.local."
      );
      return;
    }

    setAdminToken(value);
    setToken(value);
    setPassword("");
  }

  function handleLogout() {
    clearAdminToken();
    setToken(null);
    setOrders([]);
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-8 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Administración de pedidos
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Introduce la contraseña del panel (`ADMIN_PANEL_PASSWORD` en
            `.env.local`). Es distinta del token de la API de productos.
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-black"
            autoComplete="current-password"
            placeholder="Contraseña del panel"
          />
          {loginError && (
            <p className="text-sm text-red-600 mb-3">{loginError}</p>
          )}
          <button
            type="submit"
            className="w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-900"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Pedidos</h1>
            <p className="text-sm text-gray-500">{total} pedidos</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nº, email, nombre, teléfono…"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="ALL">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => token && loadOrders(token, statusFilter, q)}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900"
          >
            Buscar
          </button>
        </div>

        {listError && (
          <p className="text-sm text-red-600 mb-4">{listError}</p>
        )}
        {loading && (
          <p className="text-sm text-gray-500 mb-4">Cargando…</p>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Pedido</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Pago</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No hay pedidos con esos filtros.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/pedidos/${encodeURIComponent(o.orderNumber)}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                        <div className="text-xs text-gray-500">
                          {o.itemCount} línea{o.itemCount === 1 ? "" : "s"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {customerName(o)}
                        </div>
                        <div className="text-xs text-gray-500">{o.email}</div>
                        {o.nombreCentro && (
                          <div className="text-xs text-gray-500">
                            {o.nombreCentro}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {PAYMENT_LABELS[o.paymentMethod || ""] ||
                          o.paymentMethod ||
                          "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            o.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : o.status === "DELIVERED"
                                ? "bg-green-100 text-green-800"
                                : o.status === "SHIPPED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {o.total.toFixed(2)} €
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

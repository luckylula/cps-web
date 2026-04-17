"use client";

import { FormEvent, useMemo, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ProductMatch = {
  id: number;
  name: string;
  slug: string;
  price: number | null;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola, soy el asistente de CP Material Deportivo. Te ayudo a encontrar productos, precios y preparar un presupuesto.",
    },
  ]);
  const [products, setProducts] = useState<ProductMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  const historyForApi = useMemo(
    () => messages.filter((m) => m.role === "user" || m.role === "assistant").slice(-10),
    [messages],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setError(null);
    setIsLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: historyForApi,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "No se pudo procesar tu consulta.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.response || "Sin respuesta." }]);
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado.";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ahora mismo no puedo responder correctamente. Intenta de nuevo en unos segundos, por favor.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#f4a261] text-2xl shadow-lg hover:brightness-95"
        aria-label="Abrir chat"
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 z-[70] h-[70vh] w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl md:right-5">
          <div className="flex items-center justify-between bg-[#1a1a2e] px-4 py-3 text-white">
            <h3 className="text-sm font-semibold">Asistente CP Material Deportivo</h3>
            <button type="button" onClick={() => setIsOpen(false)} className="text-sm opacity-80 hover:opacity-100">
              Cerrar
            </button>
          </div>

          <div className="h-[calc(70vh-150px)] space-y-3 overflow-y-auto bg-gray-50 p-3">
            {messages.map((message, idx) => (
              <div
                key={`${message.role}-${idx}`}
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-[#f4a261] text-black"
                    : "mr-auto bg-white text-gray-800 shadow-sm"
                }`}
              >
                {message.content}
              </div>
            ))}

            {isLoading && (
              <div className="mr-auto max-w-[90%] rounded-lg bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
                Escribiendo...
              </div>
            )}

            {products.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Productos sugeridos</p>
                <ul className="space-y-1">
                  {products.map((p) => (
                    <li key={p.id} className="text-sm text-gray-700">
                      <a href={`/articulos/${p.slug}`} className="hover:underline">
                        {p.name}
                      </a>{" "}
                      - {p.price != null ? `${p.price} EUR` : "Consultar precio"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-3">
            {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu consulta..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#f4a261]"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-md bg-[#f4a261] px-3 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

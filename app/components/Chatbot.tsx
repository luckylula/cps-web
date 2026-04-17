"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

function sanitizeProducts(input: unknown): ProductMatch[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      const p = item as Record<string, unknown>;
      return {
        id: Number(p.id),
        name: String(p.name ?? ""),
        slug: String(p.slug ?? ""),
        price: p.price == null ? null : Number(p.price),
      };
    })
    .filter((p) => Number.isFinite(p.id) && p.name.length > 0 && p.slug.length > 0);
}

const STORAGE_KEY = "cp_chatbot_history";
const INITIAL_ASSISTANT_MESSAGE =
  "Hola, soy el asistente de CP Material Deportivo. Te ayudo a encontrar productos, precios y preparar un presupuesto.";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: INITIAL_ASSISTANT_MESSAGE,
    },
  ]);
  const [products, setProducts] = useState<ProductMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  const historyForApi = useMemo(
    () => messages.filter((m) => m.role === "user" || m.role === "assistant").slice(-10),
    [messages],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { messages?: ChatMessage[] };
      if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
        setMessages(parsed.messages);
      }
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages }));
    } catch {
      // noop
    }
  }, [messages]);

  function clearConversation() {
    const initial = [{ role: "assistant" as const, content: INITIAL_ASSISTANT_MESSAGE }];
    setMessages(initial);
    setProducts([]);
    setError(null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: initial }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setError(null);
    setIsLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: historyForApi,
          stream: true,
        }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo procesar tu consulta.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const event = JSON.parse(trimmed) as
              | { type: "products"; products: ProductMatch[] }
              | { type: "chunk"; text: string }
              | { type: "done" }
              | { type: "error"; error: string };

            if (event.type === "products") {
              setProducts(sanitizeProducts(event.products));
            } else if (event.type === "chunk") {
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.role === "assistant") {
                  next[next.length - 1] = { ...last, content: `${last.content}${event.text}` };
                }
                return next;
              });
            } else if (event.type === "error") {
              throw new Error(event.error || "Error en streaming.");
            }
          } catch {
            // ignora lineas corruptas
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado.";
      setError(msg);
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && !last.content.trim()) {
          next[next.length - 1] = {
            role: "assistant",
            content:
              "Ahora mismo no puedo responder correctamente. Intenta de nuevo en unos segundos, por favor.",
          };
          return next;
        }
        return [
          ...next,
          {
            role: "assistant",
            content:
              "Ahora mismo no puedo responder correctamente. Intenta de nuevo en unos segundos, por favor.",
          },
        ];
      });
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
            <div className="flex items-center gap-3">
              <button type="button" onClick={clearConversation} className="text-xs opacity-90 hover:opacity-100">
                Limpiar conversacion
              </button>
              <button type="button" onClick={() => setIsOpen(false)} className="text-sm opacity-80 hover:opacity-100">
                Cerrar
              </button>
            </div>
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

            {isLoading && messages[messages.length - 1]?.content === "" && (
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

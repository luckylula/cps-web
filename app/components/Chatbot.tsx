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

type ContactType = "email" | "telefono" | "whatsapp";

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
const INITIAL_ASSISTANT_MESSAGE = `Hola, soy PLAY, el asistente de CP Material Deportivo.
Si tienes alguna duda sobre algun producto, tienes alguna pregunta o no encuentras lo que estas buscando, escribeme aqui:
PREGUNTA:
COMO TE CONTACTAMOS?
DAR OPCION: TLF / WHASTAP / EMAIL:
NOMBRE:
Y el equipo de CP Material Deportivo te contestara en 24/48h.
Gracias!`;

function getStoredHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { messages?: ChatMessage[] };
    return Array.isArray(parsed.messages) ? parsed.messages : [];
  } catch {
    return [];
  }
}

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
  const [avatarError, setAvatarError] = useState(false);
  const [hasStoredHistory, setHasStoredHistory] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactQuestion, setContactQuestion] = useState("");
  const [contactType, setContactType] = useState<ContactType>("email");
  const [contactValue, setContactValue] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [isSendingContact, setIsSendingContact] = useState(false);

  const historyForApi = useMemo(
    () => messages.filter((m) => m.role === "user" || m.role === "assistant").slice(-10),
    [messages],
  );
  const hasUserMessages = useMemo(() => messages.some((m) => m.role === "user"), [messages]);
  const isContactFormValid =
    contactName.trim().length > 0 && contactQuestion.trim().length > 0 && contactValue.trim().length > 0;

  useEffect(() => {
    setHasStoredHistory(getStoredHistory().length > 1);
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
    setHasStoredHistory(false);
  }

  function openChatFresh() {
    setIsOpen(true);
    setInput("");
    setError(null);
    setProducts([]);
    setMessages([{ role: "assistant", content: INITIAL_ASSISTANT_MESSAGE }]);
  }

  function loadPreviousHistory() {
    const history = getStoredHistory();
    if (history.length === 0) return;
    setMessages(history);
    setProducts([]);
    setError(null);
  }

  function resetContactForm() {
    setContactName("");
    setContactQuestion("");
    setContactType("email");
    setContactValue("");
    setContactError(null);
    setIsSendingContact(false);
  }

  function openContactModal() {
    setContactError(null);
    setIsContactModalOpen(true);
  }

  async function handleSendContact() {
    if (!isContactFormValid || isSendingContact) return;

    setContactError(null);
    setIsSendingContact(true);

    try {
      const res = await fetch("http://54.37.231.89:5678/webhook/chatbot-consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: contactName.trim(),
          pregunta: contactQuestion.trim(),
          tipoContacto: contactType,
          contacto: contactValue.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Error enviando consulta.");
      }

      setIsContactModalOpen(false);
      resetContactForm();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "✅ Consulta enviada. El equipo de CP Material Deportivo te respondera en 24-48h.",
        },
      ]);
    } catch {
      const failMessage =
        "❌ Error al enviar consulta. Por favor, escribe a pedidos@cpmaterialdeportivo.com";
      setContactError(failMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: failMessage }]);
    } finally {
      setIsSendingContact(false);
    }
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
      <div className="fixed bottom-4 right-4 z-[70] flex items-center gap-3 md:bottom-5 md:right-5">
        {!isOpen && (
          <button
            type="button"
            onClick={openChatFresh}
            className="hidden rounded-full bg-[#1a1a2e] px-4 py-2 text-sm font-medium text-white shadow-md transition-transform duration-200 hover:scale-[1.02] md:block"
            aria-label="Abrir chatbot"
          >
            Chatbot · Te ayudamos
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              return;
            }
            openChatFresh();
          }}
          className="h-[78px] w-[78px] overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-200 hover:scale-105 md:h-[92px] md:w-[92px]"
          aria-label="Abrir chat"
        >
          {avatarError ? (
            <span className="flex h-full w-full items-center justify-center text-2xl">💬</span>
          ) : (
            <img
              src="/categorias/chatbot%20logo.png"
              alt="Asistente PLAY"
              className="h-full w-full object-cover"
              style={{ objectPosition: "center center" }}
              onError={() => setAvatarError(true)}
            />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-4 z-[70] h-[70vh] w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl md:right-5">
          <div className="flex items-center justify-between bg-[#1a1a2e] px-4 py-3 text-white">
            <h3 className="text-sm font-semibold">Asistente CP Material Deportivo</h3>
            <div className="flex items-center gap-3">
              <button type="button" onClick={clearConversation} className="text-xs opacity-90 hover:opacity-100">
                Limpiar conversacion
              </button>
              <button type="button" onClick={openContactModal} className="text-xs opacity-90 hover:opacity-100">
                📧 Contactar con el equipo
              </button>
              {hasStoredHistory && (
                <button
                  type="button"
                  onClick={loadPreviousHistory}
                  className="text-xs opacity-90 hover:opacity-100"
                >
                  Ver historial anterior
                </button>
              )}
              <button type="button" onClick={() => setIsOpen(false)} className="text-sm opacity-80 hover:opacity-100">
                Cerrar
              </button>
            </div>
          </div>

          <div className="h-[calc(70vh-150px)] space-y-3 overflow-y-auto bg-gray-50 p-3">
            {messages.map((message, idx) => (
              <div
                key={`${message.role}-${idx}`}
                className={`max-w-[90%] whitespace-pre-line rounded-lg px-3 py-2 text-sm ${
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

            {!isLoading && hasUserMessages && products.length === 0 && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <p className="mb-2 text-xs text-orange-900">
                  ¿No encuentras lo que buscas? Te ayudamos personalmente.
                </p>
                <button
                  type="button"
                  onClick={openContactModal}
                  className="rounded-md bg-[#1a1a2e] px-3 py-2 text-xs font-medium text-white hover:opacity-95"
                >
                  📧 Contactar con el equipo
                </button>
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
      {isOpen && isContactModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-2xl md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Contactar con el equipo</h4>
              <button
                type="button"
                onClick={() => {
                  setIsContactModalOpen(false);
                  setContactError(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Nombre *</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#f4a261]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Tu pregunta *</label>
                <textarea
                  value={contactQuestion}
                  onChange={(e) => setContactQuestion(e.target.value)}
                  placeholder="Describe tu consulta..."
                  rows={4}
                  className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#f4a261]"
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-gray-700">¿Como te contactamos? *</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="contactType"
                      value="email"
                      checked={contactType === "email"}
                      onChange={() => setContactType("email")}
                    />
                    Email
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="contactType"
                      value="telefono"
                      checked={contactType === "telefono"}
                      onChange={() => setContactType("telefono")}
                    />
                    Telefono
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="contactType"
                      value="whatsapp"
                      checked={contactType === "whatsapp"}
                      onChange={() => setContactType("whatsapp")}
                    />
                    WhatsApp
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  {contactType === "email" ? "Email" : contactType === "telefono" ? "Telefono" : "WhatsApp"} *
                </label>
                <input
                  type={contactType === "email" ? "email" : "tel"}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={contactType === "email" ? "tu@email.com" : "622 61 33 93"}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#f4a261]"
                />
              </div>
            </div>

            {contactError && <p className="mt-3 text-xs text-red-600">{contactError}</p>}

            <button
              type="button"
              onClick={handleSendContact}
              disabled={!isContactFormValid || isSendingContact}
              className="mt-4 w-full rounded-md bg-[#f4a261] px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSendingContact ? "Enviando..." : "Enviar consulta"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

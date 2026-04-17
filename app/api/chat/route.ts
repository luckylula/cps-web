import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/client";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  message?: string;
  conversationHistory?: ChatMessage[];
  stream?: boolean;
};

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-3-haiku-20240307";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const SAFE_REPLACEMENT_MESSAGE =
  "Tenemos una amplia gama de productos. ¿Qué tipo de producto buscas? Por ejemplo: material educativo, balones, colchonetas, puzzles...";

const requestLogByIp = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const existing = requestLogByIp.get(ip) ?? [];
  const recent = existing.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLogByIp.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function extractKeywords(input: string): string[] {
  return [...new Set(input.toLowerCase().split(/[^a-z0-9áéíóúñü]+/i).filter((w) => w.length >= 3))].slice(
    0,
    8,
  );
}

function filterForbiddenWords(text: string): string {
  const forbiddenPatterns = [
    /miniland/i,
    /jim\s+sports/i,
    /made\s+for\s+sport/i,
    /marca[s]?/i,
    /proveedor(es)?/i,
    /fabricante[s]?/i,
    /esa\s+marca/i,
    /otra[s]?\s+marca[s]?/i,
    /similar(es)?\s+de\s+otra[s]?\s+marca[s]?/i,
    /no\s+(tenemos|ofrecemos|disponemos).*marca/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      return SAFE_REPLACEMENT_MESSAGE;
    }
  }

  return text;
}

async function searchProducts(query: string) {
  const keywords = extractKeywords(query);
  const whereOr: Prisma.ProductWhereInput[] = [
    {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    {
      description: {
        contains: query,
        mode: "insensitive",
      },
    },
  ];

  for (const kw of keywords) {
    whereOr.push(
      { name: { contains: kw, mode: "insensitive" } },
      { description: { contains: kw, mode: "insensitive" } },
      { subcategory: { contains: kw, mode: "insensitive" } },
      { categoryId: { contains: kw, mode: "insensitive" } },
    );
  }

  const products = await prisma.product.findMany({
    where: {
      visible_web: true,
      activo: true,
      OR: whereOr,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      categoryId: true,
      subcategory: true,
      description: true,
    },
    take: 8,
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price != null ? Number(p.price) : null,
    categoryId: p.categoryId,
    subcategory: p.subcategory,
    description: p.description,
  }));
}

function buildSystemPrompt(products: Awaited<ReturnType<typeof searchProducts>>) {
  const catalogContext =
    products.length > 0
      ? products
          .map((p, idx) => {
            const priceText = p.price != null ? `${p.price} EUR` : "Consultar precio";
            return `${idx + 1}. ${p.name} | categoria: ${p.categoryId} | subcategoria: ${
              p.subcategory ?? "N/A"
            } | precio: ${priceText} | slug: ${p.slug}`;
          })
          .join("\n")
      : "No se han encontrado productos para esta consulta en este momento.";

  const systemPrompt = `Eres el asistente de CP Material Deportivo.

REGLAS ABSOLUTAS - NO NEGOCIABLES:

1. NUNCA uses las palabras: "marca", "proveedor", "fabricante", "Miniland", "Jim Sports", "Made for Sport"
2. Si el usuario menciona cualquier nombre de marca, IGNORALO COMPLETAMENTE
3. Responde SOLO sobre tipos de productos, categorias y caracteristicas

EJEMPLOS DE RESPUESTAS CORRECTAS:

Usuario: "Que productos de Miniland teneis?"
Tu: "Tenemos una amplia gama de productos. ¿Que tipo de producto buscas? Por ejemplo: material educativo, balones, colchonetas, puzzles..."

Usuario: "Teneis balones Jim Sports?"
Tu: "Tenemos una amplia gama de productos. ¿Que tipo de producto buscas? Por ejemplo: material educativo, balones, colchonetas, puzzles..."

Usuario: "Necesito puzzles educativos"
Tu: [Busca puzzles y muestralos SIN mencionar marca]

NUNCA digas:
- "No tenemos productos de X marca"
- "Tenemos productos de X marca"
- "Productos similares de otras marcas"
- Cualquier cosa que mencione marcas

Actua como si las marcas no existieran. Solo existen tipos de productos.`;

  return `${systemPrompt}\n\nCONTEXTO_CATALOGO:\n${catalogContext}`;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as ChatRequestBody;
    const message = body.message?.trim();
    const conversationHistory = Array.isArray(body.conversationHistory) ? body.conversationHistory : [];
    const stream = !!body.stream;

    if (!message) {
      return NextResponse.json({ error: "El mensaje es obligatorio." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "Falta configurar ANTHROPIC_API_KEY en servidor." }, { status: 500 });
    }

    const products = await searchProducts(message);
    const system = buildSystemPrompt(products);
    const messages = [...conversationHistory, { role: "user", content: message }]
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }));

    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        temperature: 0.4,
        system,
        messages,
        stream,
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("[API Chat] Anthropic error:", anthropicResponse.status, errorText);
      return NextResponse.json({ error: "No se pudo obtener respuesta del asistente." }, { status: 502 });
    }

    if (!stream) {
      const data = (await anthropicResponse.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };
      const responseText =
        data.content?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim() ||
        "No he podido generar una respuesta en este momento.";
      const safeResponseText = filterForbiddenWords(responseText);

      return NextResponse.json({
        response: safeResponseText,
        products,
      });
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const streamBody = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(encoder.encode(`${JSON.stringify({ type: "products", products })}\n`));
        let buffer = "";
        const reader = anthropicResponse.body?.getReader();
        if (!reader) {
          controller.enqueue(
            encoder.encode(`${JSON.stringify({ type: "error", error: "No se pudo leer el stream." })}\n`),
          );
          controller.close();
          return;
        }
        let accumulatedResponse = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const rawLine of lines) {
              const line = rawLine.trim();
              if (!line.startsWith("data:")) continue;
              const dataText = line.replace(/^data:\s*/, "");
              if (dataText === "[DONE]") {
                controller.enqueue(encoder.encode(`${JSON.stringify({ type: "done" })}\n`));
                continue;
              }
              try {
                const event = JSON.parse(dataText) as {
                  type?: string;
                  delta?: { text?: string };
                };
                if (event.type === "content_block_delta" && event.delta?.text) {
                  accumulatedResponse += event.delta.text;
                }
              } catch {
                // ignora lineas no parseables del stream
              }
            }
          }
          const finalResponse = filterForbiddenWords(accumulatedResponse);
          if (finalResponse.trim().length > 0) {
            controller.enqueue(encoder.encode(`${JSON.stringify({ type: "chunk", text: finalResponse })}\n`));
          }
          controller.enqueue(encoder.encode(`${JSON.stringify({ type: "done" })}\n`));
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Error en streaming.",
              })}\n`,
            ),
          );
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new NextResponse(streamBody, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[API Chat] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

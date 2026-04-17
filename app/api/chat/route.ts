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
};

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-3-5-haiku-20241022";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

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

  return [
    "Eres el asistente virtual de CP Material Deportivo.",
    "Ayudas a buscar productos, precios y presupuestos.",
    "Responde siempre en espanol, con tono profesional pero cercano.",
    "Si no encuentras productos exactos, sugiere alternativas por categoria o uso.",
    "Cuando cites productos, usa solo la informacion proporcionada en CONTEXTO_CATALOGO.",
    "No inventes precios ni disponibilidad.",
    "",
    "CONTEXTO_CATALOGO:",
    catalogContext,
  ].join("\n");
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
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("[API Chat] Anthropic error:", anthropicResponse.status, errorText);
      return NextResponse.json({ error: "No se pudo obtener respuesta del asistente." }, { status: 502 });
    }

    const data = (await anthropicResponse.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const responseText =
      data.content?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim() ||
      "No he podido generar una respuesta en este momento.";

    return NextResponse.json({
      response: responseText,
      products,
    });
  } catch (error) {
    console.error("[API Chat] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

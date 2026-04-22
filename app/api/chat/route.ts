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
const DEFAULT_MODELS = [
  "claude-haiku-4-5",
  "claude-sonnet-4-5",
  "claude-sonnet-4-6",
  "claude-opus-4-6",
  "claude-3-5-haiku-20241022",
  "claude-3-5-sonnet-20241022",
  "claude-3-haiku-20240307",
] as const;
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

function normalizeTerm(term: string): string {
  return term
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function keywordVariants(word: string): string[] {
  const variants = new Set<string>([word]);
  if (word.endsWith("es") && word.length > 4) {
    variants.add(word.slice(0, -2));
  }
  if (word.endsWith("s") && word.length > 3) {
    variants.add(word.slice(0, -1));
  }
  return [...variants];
}

function extractImportantKeywords(input: string): string[] {
  const stopWords = new Set([
    "para",
    "con",
    "sin",
    "del",
    "de",
    "la",
    "el",
    "los",
    "las",
    "y",
    "o",
    "en",
    "por",
    "un",
    "una",
    "unos",
    "unas",
  ]);

  const baseWords = normalizeTerm(input).split(/[^a-z0-9ñü]+/).filter((w) => w.length >= 3 && !stopWords.has(w));
  const variants = new Set<string>();
  for (const word of baseWords) {
    keywordVariants(word).forEach((v) => variants.add(v));
  }
  return [...variants];
}

function expandWithSynonyms(baseTerms: string[]): string[] {
  const synonymMap: Record<string, string[]> = {
    futbol: ["futbol", "balon", "porteria", "campo"],
    baloncesto: ["baloncesto", "basket", "canasta", "aro"],
    gimnasia: ["gimnasia", "colchoneta", "tatami", "espalderas"],
    gimnasio: [
      "gimnasio",
      "colchoneta",
      "espaldera",
      "espalderas",
      "tatami",
      "quitamiedo",
      "plinto",
      "potro",
      "banco sueco",
      "aro",
      "cuerda",
      "pica",
    ],
    escolar: ["escolar", "educacion", "colegio", "infantil", "primaria"],
    fitness: ["fitness", "pesas", "mancuerna", "barra", "disco", "banco", "step"],
  };

  const expanded = new Set<string>();
  for (const term of baseTerms) {
    const normalized = normalizeTerm(term);
    if (!normalized) continue;
    expanded.add(term);
    expanded.add(normalized);

    for (const [key, related] of Object.entries(synonymMap)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        related.forEach((r) => expanded.add(r));
      }
    }
  }

  return [...expanded].filter((t) => t.length >= 3);
}

function filterForbiddenWords(text: string): string {
  const forbiddenPatterns = [
    /miniland/i,
    /jim\s+sports/i,
    /made\s+for\s+sport/i,
    /\bmarca[s]?\b/i,
    /\bproveedor(es)?\b/i,
    /\bfabricante[s]?\b/i,
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
  const LIMIT = 15;
  const importantKeywords = extractImportantKeywords(query);
  const expandedTerms = expandWithSynonyms([query, ...importantKeywords]);
  const searchTerms = [...new Set([...importantKeywords, ...expandedTerms])].filter((t) => t.length >= 3);

  const orFilters: Prisma.ProductWhereInput[] = [];
  for (const term of searchTerms) {
    orFilters.push(
      { name: { contains: term, mode: "insensitive" } },
      { subcategory: { contains: term, mode: "insensitive" } },
      { categoryId: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
    );
  }

  // Refuerzo específico para subcategorías habituales en búsquedas de gimnasio/escolar/fitness
  const aggressiveTerms = new Set(["gimnasio", "escolar", "fitness"]);
  const hasAggressiveIntent = searchTerms.some((t) => aggressiveTerms.has(normalizeTerm(t)));
  if (hasAggressiveIntent) {
    ["Gimnasio", "Escolar", "Fitness"].forEach((sub) => {
      orFilters.push(
        { subcategory: { equals: sub, mode: "insensitive" } },
        { subcategory: { contains: sub, mode: "insensitive" } },
      );
    });
  }

  const candidates = await prisma.product.findMany({
    where: {
      visible_web: true,
      activo: true,
      OR: orFilters,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      categoryId: true,
      subcategory: true,
      description: true,
      featured: true,
      updatedAt: true,
    },
    take: 250,
  });

  const colchonetaKeywords = ["colchoneta", "colchonetas"];
  const gimnasiaKeywords = ["gimnasia", "gimnasio"];

  const scored = candidates
    .map((p) => {
      const name = normalizeTerm(p.name);
      const sub = normalizeTerm(p.subcategory ?? "");
      const cat = normalizeTerm(p.categoryId);
      const desc = normalizeTerm(p.description ?? "");
      const haystack = `${name} ${sub} ${cat} ${desc}`;

      let score = 0;
      let hasAnyKeyword = false;
      let hasColchoneta = false;
      let hasGimnasia = false;

      for (const kw of importantKeywords) {
        const kwNorm = normalizeTerm(kw);
        if (!kwNorm) continue;
        const inName = name.includes(kwNorm);
        const inSub = sub.includes(kwNorm);
        const inCat = cat.includes(kwNorm);
        const inDesc = desc.includes(kwNorm);

        if (inName || inSub || inCat || inDesc) hasAnyKeyword = true;
        if (inName) score += 90;
        if (inSub) score += 55;
        if (inCat) score += 35;
        if (inDesc) score += 18;
      }

      for (const kw of searchTerms) {
        const kwNorm = normalizeTerm(kw);
        if (!kwNorm) continue;
        if (name.includes(kwNorm)) score += 20;
        else if (sub.includes(kwNorm)) score += 12;
        else if (cat.includes(kwNorm)) score += 8;
        else if (desc.includes(kwNorm)) score += 5;
      }

      if (colchonetaKeywords.some((k) => name.includes(k))) {
        hasColchoneta = true;
        score += 120; // prioridad máxima para colchonetas en nombre
      }
      if (gimnasiaKeywords.some((k) => haystack.includes(k))) {
        hasGimnasia = true;
        score += 60; // prioridad media para gimnasia
      }
      if (hasColchoneta && hasGimnasia) {
        score += 80; // prioridad alta cuando coinciden ambas
      }

      if (p.featured) score += 4;

      return { ...p, score, hasAnyKeyword };
    })
    .filter((p) => p.hasAnyKeyword || p.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    })
    .slice(0, LIMIT);

  return scored.map((p) => ({
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

INFORMACION DE LA EMPRESA CP MATERIAL DEPORTIVO:

## TRANSPORTE Y ENVIOS:
- Envio GRATIS en pedidos > 100EUR (peninsula)
- Pedidos < 100EUR: 8EUR (peninsula)
- Baleares: 15EUR fijo
- Plazo: 48-72h (2-3 dias laborables)
- Algunos productos bajo pedido: hasta 1 mes
- Canarias/Ceuta/Melilla: presupuesto individual

## DEVOLUCIONES:
- 14 dias naturales derecho de desistimiento
- Producto en condiciones adecuadas
- Costes de devolucion a cargo del cliente
- NO se aceptan: productos personalizados o bajo pedido
- Contacto: pedidos@cpmaterialdeportivo.com / 622 61 33 93

## FORMAS DE PAGO:
- PayPal
- Tarjeta debito/credito
- Bizum

## FACTURA:
- Durante el checkout hay checkbox "Quiero factura"
- Requiere introducir NIF/CIF

## CONTACTO:
- Email: pedidos@cpmaterialdeportivo.com
- Telefono: 622 61 33 93
- WhatsApp: 622 61 33 93

IMPORTANTE:
- Si el usuario pregunta sobre envios, devoluciones, pagos o factura, usa esta informacion.
- Si buscas un producto que no encuentras, sugiere contactar al equipo.
- Manten tono profesional pero cercano.

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

  const criticalRule = `IMPORTANTE:
- SOLO menciona productos que REALMENTE aparecen en el CONTEXTO_CATALOGO
- NUNCA inventes productos, colores, tallas o caracteristicas
- Si no tienes informacion exacta, di 'tenemos varias opciones disponibles' sin inventar detalles
- Cuando hables de productos especificos, COPIA el nombre exacto del catalogo`;

  return `${systemPrompt}\n\n${criticalRule}\n\nCONTEXTO_CATALOGO:\n${catalogContext}`;
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

    const modelCandidates = [
      process.env.ANTHROPIC_MODEL?.trim(),
      ...DEFAULT_MODELS,
    ].filter((m): m is string => Boolean(m));

    let anthropicResponse: Response | null = null;
    let lastErrorText = "";

    for (const model of modelCandidates) {
      anthropicResponse = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 500,
          temperature: 0.4,
          system,
          messages,
          stream,
        }),
      });

      if (anthropicResponse.ok) {
        break;
      }

      const errorText = await anthropicResponse.text();
      lastErrorText = errorText;
      const isModelNotFound = anthropicResponse.status === 404 && errorText.includes("not_found_error");
      console.error("[API Chat] Anthropic error:", anthropicResponse.status, errorText, "| model:", model);
      if (!isModelNotFound) {
        break;
      }
    }

    if (!anthropicResponse) {
      return NextResponse.json({ error: "No se pudo obtener respuesta del asistente." }, { status: 502 });
    }

    if (!anthropicResponse.ok) {
      console.error("[API Chat] Anthropic error final:", anthropicResponse.status, lastErrorText);
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

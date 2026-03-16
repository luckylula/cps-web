/**
 * Corrige typos habituales en URLs de la BD (ej. Made for Sport: "https//" sin dos puntos).
 * Si la URL está mal concatenada (ej. "https://www.madeforsport.https//www.madeforsport.eu/..."),
 * extrae la parte correcta.
 */
const HTTPS_MALFORMED = /\.?https\/\/(.+)$/;
const HTTP_MALFORMED = /\.?http\/\/(.+)$/;

/** Dominio conocido Made for Sport: si aparece en la URL, usamos desde ahí como fallback. */
const MADEFORSPORT_DOMAIN = 'www.madeforsport.eu';

export function fixUrlProtocol(url: string): string {
  if (!url || typeof url !== 'string') return url;
  // Normalizar barras invertidas que a veces vienen de la BD
  let t = url.trim().replace(/\\/g, '/');
  // 1) Patrón "https//" o ".https//" → usar todo lo que va después de "https//"
  const mHttps = t.match(HTTPS_MALFORMED);
  if (mHttps) return 'https://' + mHttps[1].trim();
  const mHttp = t.match(HTTP_MALFORMED);
  if (mHttp) return 'http://' + mHttp[1].trim();
  if (t.startsWith('https//')) return 'https://' + t.slice(7);
  if (t.startsWith('http//')) return 'http://' + t.slice(6);
  // 2) Fallback: si la URL contiene el dominio real, recortar hasta ahí (concat mal hecha)
  const idx = t.indexOf(MADEFORSPORT_DOMAIN);
  if (idx !== -1) return 'https://' + t.slice(idx);
  return t;
}

/**
 * Convierte una URL de imagen de producto en URL absoluta.
 * Si en la BD solo está el nombre del archivo (ej. "aro-psicomotricidad-40-4452-5.jpg"),
 * se le añade la base. Configura NEXT_PUBLIC_PRODUCT_IMAGES_BASE_URL (ej. https://cdn.ejemplo.com/imagenes/)
 * o deja que use la raíz del sitio (/) para rutas relativas.
 */
export function resolveProductImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }
  const trimmed = fixUrlProtocol(url.trim());
  if (trimmed === '') return null;

  // Caso específico Made for Sport: rutas tipo "../upload/archivo.jpg" o "/../upload/archivo.jpg"
  if (trimmed.startsWith('../upload') || trimmed.startsWith('/../upload')) {
    const path = trimmed.replace(/^\/?\.\.\//, ''); // -> "upload/archivo.jpg"
    return `https://${MADEFORSPORT_DOMAIN}/${path}`;
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  const base =
    typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_PRODUCT_IMAGES_BASE_URL
      ? process.env.NEXT_PUBLIC_PRODUCT_IMAGES_BASE_URL.replace(/\/+$/, '')
      : '';
  return base ? `${base}/${trimmed}` : `/${trimmed}`;
}

// Helper function to validate and clean image URLs
export function validateImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = fixUrlProtocol(url.trim());

  if (trimmed === '' ||
      (!trimmed.startsWith('http://') &&
       !trimmed.startsWith('https://') &&
       !trimmed.startsWith('data:') &&
       !trimmed.startsWith('/'))) {
    return null;
  }

  return trimmed;
}

/**
 * Genera un blurDataURL base64 para usar como placeholder en next/image
 * Crea un SVG pequeño con un gradiente suave
 * Funciona tanto en cliente como servidor
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:1" /><stop offset="100%" style="stop-color:#d1d5db;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#grad)" /></svg>`;
  
  // Funciona tanto en cliente como servidor
  if (typeof window === 'undefined') {
    // Servidor: usar Buffer
    try {
      const base64 = Buffer.from(svg).toString('base64');
      return `data:image/svg+xml;base64,${base64}`;
    } catch {
      // Fallback si Buffer no está disponible
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg==';
    }
  } else {
    // Cliente: usar btoa
    try {
      const base64 = btoa(unescape(encodeURIComponent(svg)));
      return `data:image/svg+xml;base64,${base64}`;
    } catch {
      // Fallback si btoa falla
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg==';
    }
  }
}

/**
 * Determina si una URL de imagen viene de un dominio externo que requiere unoptimized
 */
export function shouldUnoptimizeImage(src: string): boolean {
  return (
    src.includes('cdn.jimsports.shop') ||
    src.includes('cdn.b2b.grupojimsports.com') ||
    src.includes('jimsports.shop') ||
    src.includes('madeforsport.eu') ||
    src.includes('www.madeforsport.eu')
  );
}

/**
 * Normaliza el campo images que puede venir en distintos formatos desde la BD:
 * - string[] (correcto, Prisma)
 * - string tipo PostgreSQL array: "{url1,url2}" o "{url}"
 * - string JSON: ["url1","url2"]
 * - string URL única
 */
export function normalizeImages(images: unknown): string[] {
  let result: string[] = [];
  if (Array.isArray(images)) {
    result = images
      .filter((img): img is string => typeof img === 'string' && img.trim() !== '')
      .map((img) => img.trim());
  } else if (typeof images === 'string') {
    const trimmed = images.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const inner = trimmed.slice(1, -1);
      result = inner
        .split(',')
        .map((s) => s.trim().replace(/^"|"$/g, ''))
        .filter((s) => s.length > 0);
    } else if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) {
          result = parsed
            .filter((img): img is string => typeof img === 'string' && img.trim() !== '')
            .map((img) => img.trim());
        }
      } catch {
        // ignore
      }
    } else if (trimmed.startsWith('http') || trimmed.startsWith('/')) {
      result = [trimmed];
    } else {
      result = [trimmed];
    }
  }

  return result.map((url) => resolveProductImageUrl(url) || url);
}

/**
 * Obtiene la primera imagen válida de un array de imágenes.
 * Acepta URLs completas, rutas que empiezan por /, o solo nombre de archivo
 * (se resuelve con resolveProductImageUrl).
 */
export function getFirstValidImage(images: unknown): string | null {
  const normalized = normalizeImages(images);
  if (normalized.length === 0) {
    return null;
  }

  for (const img of normalized) {
    let url = validateImageUrl(img);
    if (!url) {
      url = resolveProductImageUrl(img);
    }
    if (url) {
      return url;
    }
  }

  return null;
}

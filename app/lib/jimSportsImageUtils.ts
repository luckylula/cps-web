export interface JimSportsVariantImageRow {
  color: string | null;
  talla: string | null;
  imagen: string | null;
}

export function isValidJimSportsImageUrl(url: string | null | undefined): url is string {
  return Boolean(url && String(url).trim().startsWith('http'));
}

/** Rellena imágenes vacías usando otras variantes del mismo color o talla. */
export function propagateVariantImages<T extends JimSportsVariantImageRow>(variants: T[]): T[] {
  const byColor = new Map<string, string>();
  const byTalla = new Map<string, string>();

  for (const variant of variants) {
    if (isValidJimSportsImageUrl(variant.imagen)) {
      if (variant.color) byColor.set(variant.color, variant.imagen);
      if (variant.talla) byTalla.set(variant.talla, variant.imagen);
    }
  }

  for (const variant of variants) {
    if (!isValidJimSportsImageUrl(variant.imagen)) {
      if (variant.color && byColor.has(variant.color)) {
        variant.imagen = byColor.get(variant.color)!;
      } else if (variant.talla && byTalla.has(variant.talla)) {
        variant.imagen = byTalla.get(variant.talla)!;
      }
    }
  }

  const fallback = variants.find((v) => isValidJimSportsImageUrl(v.imagen))?.imagen ?? null;
  if (fallback) {
    for (const variant of variants) {
      if (!isValidJimSportsImageUrl(variant.imagen)) {
        variant.imagen = fallback;
      }
    }
  }

  return variants;
}

/** Galería del producto padre: URLs únicas de todas las variantes. */
export function buildProductGalleryImages(
  variants: JimSportsVariantImageRow[]
): string[] {
  const seen = new Set<string>();
  const images: string[] = [];

  for (const variant of variants) {
    if (isValidJimSportsImageUrl(variant.imagen) && !seen.has(variant.imagen)) {
      seen.add(variant.imagen);
      images.push(variant.imagen);
    }
  }

  return images;
}

export function imagesArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((url, i) => url === b[i]);
}

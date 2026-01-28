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
    src.includes('jimsports.shop') ||
    src.includes('madeforsport.eu') ||
    src.includes('www.madeforsport.eu')
  );
}

/**
 * Obtiene la primera imagen válida de un array de imágenes
 */
export function getFirstValidImage(images: string[]): string | null {
  if (!images || images.length === 0) return null;
  return images.find(img => img && img.trim() !== '') || null;
}

// Mapeo de slugs a nombres completos para la navegación multinivel
// Esto permite usar URLs amigables mientras se filtran productos por nombres exactos en la BD

export const slugToName: Record<string, Record<string, Record<string, string>>> = {
  deportes: {
    colectivos: {
      futbol: 'Fútbol',
      baloncesto: 'Baloncesto',
      voleibol: 'Voleibol',
      balonmano: 'Balonmano',
      rugby: 'Rugby',
      hockey: 'Hockey',
      beisbol: 'Béisbol',
      arbitro: 'Árbitro',
      varios: 'Varios',
    },
    individual: {
      fitness: 'Fitness',
      yoga: 'Yoga',
      natacion: 'Natación',
      atletismo: 'Atletismo',
      gimnasia: 'Gimnasia',
      'deportes-de-contacto': 'Deportes de contacto',
      outdoor: 'Outdoor',
      'deportes-de-playa': 'Deportes de playa',
      running: 'Running',
    },
    raqueta: {
      padel: 'Pádel',
      tenis: 'Tenis',
      badminton: 'Bádminton',
      'tenis-de-mesa': 'Tenis de mesa',
      pickleball: 'Pickleball',
    },
  },
  textil: {
    'ropa-deportiva': {
      equipaciones: 'Equipaciones',
      'por-deporte-padel': 'Por deporte - Pádel',
    },
    calzado: {
      casual: 'Casual',
    },
  },
  instalaciones: {
    'estructuras-deportivas': {
      baloncesto: 'Baloncesto',
      futbol: 'Fútbol',
      'futbol-sala': 'Fútbol Sala',
      voleibol: 'Voleibol',
      tenis: 'Tenis',
      padel: 'Pádel',
      varios: 'Varios',
    },
  },
  'material-escolar': {
    juegos: {
      'juegos-exterior': 'Juegos exterior',
      'juegos-acuaticos': 'Juegos acuáticos',
      'juegos-mesa': 'Juegos mesa',
    },
  },
};

export const subcategorySlugToName: Record<string, Record<string, string>> = {
  deportes: {
    colectivos: 'Colectivos',
    individual: 'Individual',
    raqueta: 'Raqueta',
  },
  textil: {
    'ropa-casual': 'Ropa Casual',
    'ropa-deportiva': 'Ropa Deportiva',
    calzado: 'Calzado',
  },
  instalaciones: {
    'estructuras-deportivas': 'Estructuras deportivas',
    'redes-y-protecciones': 'Redes y Protecciones',
    gimnasio: 'Gimnasio',
    vestuarios: 'Vestuarios',
    piscina: 'Piscina',
    mobiliario: 'Mobiliario',
  },
  'material-escolar': {
    psicomotricidad: 'Psicomotricidad',
    'figuras-espuma': 'Figuras espuma',
    'balones-escolares': 'Juegos en Educación infantil',
    'juegos-alternativos': 'Juegos alternativos',
    // Para filtrar en BD: la subcategoría real en Product es "Iniciación deportiva".
    // Mantenemos alias de slugs anteriores y añadimos el nuevo slug solicitado.
    'material-didactico': 'Iniciación deportiva',
    malabares: 'Iniciación deportiva',
    'iniciacion-deportiva': 'Iniciación deportiva',
    'educacion-infantil': 'Juegos en Educación infantil',
    'material-foam': 'Material foam',
    // Para filtrar en BD: el subcategory real en Product sigue siendo "Colchonetas".
    // Añadimos el nuevo slug URL ("manualidades") como alias.
    manualidades: 'Colchonetas',
    colchonetas: 'Colchonetas',
    // Alias de slug para la UI: la BD puede seguir usando el nombre "Educación musical".
    'educacion-musical': 'Educación musical',
    'juguetes-educativos': 'Educación musical',
  },
};

// Mapeo de slugs a nombres "para mostrar"/SEO en UI.
// Nota: el valor real de Product para esta subcategoría sigue siendo "Iniciación deportiva".
export const subcategorySlugToDisplayName: Record<string, Record<string, string>> = {
  'material-escolar': {
    'material-didactico': 'Material Didáctico',
    malabares: 'Material Didáctico',
    'iniciacion-deportiva': 'Material Didáctico',
    manualidades: 'Manualidades',
    colchonetas: 'Manualidades',
    'educacion-infantil': 'Juegos en Educación infantil',
    'balones-escolares': 'Juegos en Educación infantil',
    'educacion-musical': 'Juguetes Educativos',
    'juguetes-educativos': 'Juguetes Educativos',
  },
};

export const categorySlugToName: Record<string, string> = {
  deportes: 'Deportes',
  textil: 'Textil',
  instalaciones: 'Instalaciones',
  'material-escolar': 'Material Escolar',
};

/**
 * Convierte un slug de grupo a su nombre completo para usar en filtros de BD
 */
export function getGrupoName(categoriaSlug: string, subcategorySlug: string, grupoSlug: string): string | null {
  return slugToName[categoriaSlug]?.[subcategorySlug]?.[grupoSlug] || null;
}

/**
 * Convierte un slug de subcategoría a su nombre completo
 */
export function getSubcategoryName(categoriaSlug: string, subcategorySlug: string): string | null {
  return subcategorySlugToName[categoriaSlug]?.[subcategorySlug] || null;
}

/**
 * Convierte un slug de subcategoría a su nombre para mostrar (breadcrumbs/H1/SEO).
 * Si no existe un mapeo específico de display, fallback al nombre de filtro (BD).
 */
export function getSubcategoryDisplayName(
  categoriaSlug: string,
  subcategorySlug: string
): string | null {
  return (
    subcategorySlugToDisplayName[categoriaSlug]?.[subcategorySlug] ||
    getSubcategoryName(categoriaSlug, subcategorySlug)
  );
}

/**
 * Convierte un slug de categoría a su nombre completo
 */
export function getCategoryName(categoriaSlug: string): string | null {
  return categorySlugToName[categoriaSlug] || null;
}

/**
 * Convierte un nombre de subcategoría (BD) a slug para URLs
 */
export function getSubcategorySlug(categoriaSlug: string, subcategoryName: string): string | null {
  const subMap = subcategorySlugToName[categoriaSlug];
  if (!subMap) return null;
  const entry = Object.entries(subMap).find(([, name]) => name === subcategoryName);
  return entry ? entry[0] : null;
}

/**
 * Convierte un nombre de grupo (BD) a slug para URLs
 */
export function getGrupoSlug(categoriaSlug: string, subcategorySlug: string, grupoName: string): string | null {
  const grupoMap = slugToName[categoriaSlug]?.[subcategorySlug];
  if (!grupoMap) return null;
  const entry = Object.entries(grupoMap).find(([, name]) => name === grupoName);
  return entry ? entry[0] : null;
}

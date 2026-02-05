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
      natacion: 'Natación',
      atletismo: 'Atletismo',
      gimnasia: 'Gimnasia',
      'deportes-de-contacto': 'Deportes de contacto',
      outdoor: 'Outdoor',
      running: 'Running',
      'deportes-de-playa': 'Deportes de playa',
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
    'balones-escolares': 'Balones de uso escolar',
    'juegos-alternativos': 'Juegos alternativos',
    malabares: 'Malabares', // BD: Malabares; UI: Iniciación Deportiva
    'educacion-infantil': 'Juegos en Educación infantil',
    'material-foam': 'Material foam',
    colchonetas: 'Colchonetas',
    'educacion-musical': 'Educación musical',
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
 * Convierte un slug de categoría a su nombre completo
 */
export function getCategoryName(categoriaSlug: string): string | null {
  return categorySlugToName[categoriaSlug] || null;
}

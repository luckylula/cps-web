/**
 * Mapeo taxonomía Jim Sports (categoria_padre + categoria_texto) → navegación web CPS.
 */

export type JimTaxonomy = {
  categoryId: string;
  subcategory: string;
  grupo: string | null;
};

const ESTRUCTURAS_GRUPO: Record<string, string> = {
  Baloncesto: 'Baloncesto',
  'Fútbol 11 y 7': 'Fútbol',
  'Fútbol sala - Balonmano': 'Fútbol Sala',
  Voleibol: 'Voleibol',
  Tenis: 'Tenis',
  Pádel: 'Pádel',
  'Otros deportes': 'Varios',
};

const COLECTIVOS_PADRES = new Set([
  'Fútbol',
  'Fútbol sala',
  'Baloncesto',
  'Voleibol',
  'Balonmano',
  'Rugby',
  'Hockey/Floorball',
  'Béisbol',
  'Fútbol americano',
  'Waterpolo',
  'Árbitro',
]);

const RAQUETA_PADRES = new Set(['Pádel', 'Tenis', 'Bádminton', 'Tenis de mesa', 'Pickleball']);

const GRUPO_ALIASES: Record<string, string> = {
  'Fútbol sala': 'Fútbol Sala',
  'Hockey/Floorball': 'Hockey',
  'Gimnasia rítmica': 'Gimnasia',
  Playa: 'Deportes de playa',
};

function normalizeGrupo(padre: string): string {
  return GRUPO_ALIASES[padre] ?? padre;
}

function deportesSubcategory(padre: string): string {
  if (COLECTIVOS_PADRES.has(padre)) return 'Colectivos';
  if (RAQUETA_PADRES.has(padre)) return 'Raqueta';
  return 'Individual';
}

function parseSubcategoryField(subcategory: string | null): { padre: string; texto: string } | null {
  if (!subcategory?.includes('>')) return null;
  const [padre, texto] = subcategory.split('>').map((s) => s.trim());
  if (!padre) return null;
  return { padre, texto: texto || '' };
}

function resolveTextil(padre: string, texto: string): JimTaxonomy | null {
  if (padre === 'Casual' && ['Textil', 'Accesorios', 'Complementos'].includes(texto)) {
    return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  }
  if (padre === 'Casual' && texto === 'Calzado') {
    return { categoryId: 'textil', subcategory: 'Calzado', grupo: null };
  }
  if (padre === 'Equipaciones') {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: null };
  }
  if (padre === 'Pádel' && texto === 'Textil') {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Por deporte - Pádel' };
  }
  if (texto === 'Bañadores' || (padre === 'Natación' && texto === 'Calzado')) {
    return {
      categoryId: 'textil',
      subcategory: texto === 'Calzado' ? 'Calzado' : 'Ropa Deportiva',
      grupo: null,
    };
  }
  if (padre === 'Línea Work') {
    return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  }
  if (texto === 'Textil' || texto === 'Calzado') {
    return {
      categoryId: 'textil',
      subcategory: texto === 'Calzado' ? 'Calzado' : 'Ropa Casual',
      grupo: null,
    };
  }
  return null;
}

function resolveInstalaciones(
  padre: string,
  texto: string,
  categoryId?: string | null
): JimTaxonomy | null {
  if (padre === 'Equipamiento') {
    if (ESTRUCTURAS_GRUPO[texto]) {
      return {
        categoryId: 'instalaciones',
        subcategory: 'Estructuras deportivas',
        grupo: ESTRUCTURAS_GRUPO[texto],
      };
    }
    if (texto === 'Redes' || texto === 'Protecciones columnas') {
      return { categoryId: 'instalaciones', subcategory: 'Redes y Protecciones', grupo: null };
    }
    if (texto === 'Equipamiento agua') {
      return { categoryId: 'instalaciones', subcategory: 'Piscina', grupo: null };
    }
    if (texto === 'Vestuarios') {
      return { categoryId: 'instalaciones', subcategory: 'Vestuarios', grupo: null };
    }
    if (texto === 'Colchonetas' || texto === 'Gimnasia') {
      return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null };
    }
    if (texto === 'Banquillos') {
      return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
    }
  }
  if (padre === 'Fitness' && ['Musculación', 'Entrenamiento funcional', 'Cardio'].includes(texto)) {
    if (categoryId === 'instalaciones') {
      return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null };
    }
    return null;
  }
  if (padre === 'Para la tienda' && texto === 'Mobiliario') {
    return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  }
  if (padre === 'Entrenamiento' && texto === 'Portamaterial') {
    return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  }
  if (padre === 'Entrenamiento' && texto === 'Accesorios' && categoryId === 'instalaciones') {
    return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null };
  }
  if (padre === 'Entrenamiento' && texto === 'Protecciones' && categoryId === 'instalaciones') {
    return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null };
  }
  if (padre === 'Outdoor' && texto === 'Accesorios') {
    return { categoryId: 'instalaciones', subcategory: 'Redes y Protecciones', grupo: null };
  }
  if (padre === 'Pádel' && texto === 'Accesorios' && categoryId === 'instalaciones') {
    return { categoryId: 'instalaciones', subcategory: 'Estructuras deportivas', grupo: 'Pádel' };
  }
  if (padre === 'Para la tienda' && texto === 'Accesorios') {
    return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  }
  return null;
}

function resolveMaterialEscolar(padre: string, texto: string): JimTaxonomy | null {
  if (padre === 'Psicomotricidad') {
    return { categoryId: 'material-escolar', subcategory: 'Psicomotricidad', grupo: null };
  }
  if (padre === 'Juegos') {
    const grupoMap: Record<string, string> = {
      'Juegos exterior': 'Juegos exterior',
      'Juegos de mesa': 'Juegos mesa',
      'Juegos acuáticos': 'Juegos acuáticos',
    };
    if (grupoMap[texto]) {
      return {
        categoryId: 'material-escolar',
        subcategory: 'Juegos alternativos',
        grupo: grupoMap[texto],
      };
    }
    return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo: null };
  }
  if (padre === 'Juegos de salón') {
    return {
      categoryId: 'material-escolar',
      subcategory: 'Juegos alternativos',
      grupo: texto === 'Mesas' || texto === 'Dardos' ? 'Juegos mesa' : null,
    };
  }
  if (padre === 'Entrenamiento' && texto === 'Iniciación infantil') {
    return {
      categoryId: 'material-escolar',
      subcategory: 'Juegos en Educación infantil',
      grupo: null,
    };
  }
  if (padre === 'Deportes alternativos') {
    if (texto === 'Malabares') {
      return { categoryId: 'material-escolar', subcategory: 'Material Didáctico', grupo: null };
    }
    if (['Petanca', 'Lanzamiento', 'Indiaka'].includes(texto)) {
      return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo: null };
    }
  }
  if (padre === 'Natación' && texto === 'Juegos piscina') {
    return {
      categoryId: 'material-escolar',
      subcategory: 'Juegos alternativos',
      grupo: 'Juegos acuáticos',
    };
  }
  if (padre === 'Equipamiento' && texto === 'Colchonetas') {
    return { categoryId: 'material-escolar', subcategory: 'Manualidades', grupo: null };
  }
  return null;
}

function resolveDeportes(padre: string, _texto: string): JimTaxonomy {
  const subcategory = deportesSubcategory(padre);
  return {
    categoryId: 'deportes',
    subcategory,
    grupo: normalizeGrupo(padre),
  };
}

/** Resuelve taxonomía web a partir de campos Jim Sports. */
export function resolveJimSportsTaxonomy(
  categoriaPadre: string | null | undefined,
  categoriaTexto: string | null | undefined,
  fallbackSubcategory?: string | null,
  fallbackCategoryId?: string | null
): JimTaxonomy | null {
  let padre = categoriaPadre?.trim() || '';
  let texto = categoriaTexto?.trim() || '';

  if (!padre && fallbackSubcategory) {
    const parsed = parseSubcategoryField(fallbackSubcategory);
    if (parsed) {
      padre = parsed.padre;
      texto = parsed.texto;
    }
  }

  if (!padre) return null;

  if (padre === 'Producto promocional') {
    return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  }

  const textil = resolveTextil(padre, texto);
  if (textil) return textil;

  const instalaciones = resolveInstalaciones(padre, texto, fallbackCategoryId);
  if (instalaciones) return instalaciones;

  const escolar = resolveMaterialEscolar(padre, texto);
  if (escolar) return escolar;

  // Deportes por defecto para padres deportivos conocidos
  if (
    COLECTIVOS_PADRES.has(padre) ||
    RAQUETA_PADRES.has(padre) ||
    [
      'Fitness',
      'Natación',
      'Outdoor',
      'Atletismo',
      'Running',
      'Gimnasia rítmica',
      'Deportes de contacto',
      'Playa',
      'Entrenamiento',
      'Producto promocional',
      'Para la tienda',
      'Deportes alternativos',
    ].includes(padre)
  ) {
    return resolveDeportes(padre, texto);
  }

  // Fallback según categoryId Jim Sports si no hay regla específica
  if (fallbackCategoryId === 'textil') {
    return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  }
  if (fallbackCategoryId === 'instalaciones') {
    return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null };
  }
  if (fallbackCategoryId === 'material-escolar') {
    return { categoryId: 'material-escolar', subcategory: 'Psicomotricidad', grupo: null };
  }
  if (fallbackCategoryId === 'deportes') {
    return resolveDeportes(padre || 'Varios', texto);
  }

  return null;
}

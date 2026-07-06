export type MfsTaxonomy = {
  categoryId: string;
  subcategory: string | null;
  grupo: string | null;
};

const COLECTIVOS_GRUPOS = new Set([
  'Fútbol',
  'Fútbol Sala',
  'Baloncesto',
  'Voleibol',
  'Balonmano',
  'Rugby',
  'Hockey',
  'Béisbol',
  'Árbitro',
  'Varios',
]);

const RAQUETA_GRUPOS = new Set(['Pádel', 'Tenis', 'Bádminton', 'Tenis de mesa', 'Pickleball']);

const INDIVIDUAL_GRUPOS = new Set([
  'Fitness',
  'Yoga',
  'Natación',
  'Atletismo',
  'Gimnasia',
  'Outdoor',
  'Running',
  'Deportes de playa',
  'Deportes de contacto',
]);

const LEGACY_SUBCATEGORIES = new Set(['Redes y porterías', 'Tenis de mesa', 'Juegos']);

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isTenisMesaName(n: string): boolean {
  if (n.includes('billar')) return false;
  return (
    n.includes('tenis de mesa') ||
    n.includes('ping pong') ||
    n.includes('ping-pong') ||
    n.includes('pingpong') ||
    (n.includes('mesa') && (n.includes('enebe') || n.includes('europa') || n.includes('donic'))) ||
    (n.includes('red') &&
      (n.includes(' tt') ||
        n.includes('donic') ||
        n.includes('enebe') ||
        n.includes('tenis de mesa') ||
        n.includes('schildkrot'))) ||
    (n.includes('soporte') &&
      n.includes('red') &&
      (n.includes('enebe') || n.includes('donic') || n.includes('tt'))) ||
    n.includes('pala enebe') ||
    (n.includes('pala') && n.includes('enebe')) ||
    (n.includes('pelota') && n.includes('tenis de mesa')) ||
    n.includes('lote tenis mesa')
  );
}

function isPorteriaName(n: string): boolean {
  return n.includes('porteria');
}

function isBaloncestoInstalacionName(n: string): boolean {
  if (n.includes('flotante')) return false;
  if (n.includes('balon') || n.includes('balón')) return false;
  return (
    n.includes('canasta') ||
    n.includes('minicanasta') ||
    n.includes('plafon basket') ||
    n.includes('plafón basket') ||
    (n.includes('aro') && n.includes('baloncesto')) ||
    (n.includes('tablero') && (n.includes('basket') || n.includes('baloncesto'))) ||
    n.includes('retorno basket') ||
    (n.includes('soporte') && n.includes('baloncesto')) ||
    n.includes('jgo canastas') ||
    (n.includes('juego') && n.includes('canasta'))
  );
}

function mapGrupo(grupo: string): MfsTaxonomy {
  if (COLECTIVOS_GRUPOS.has(grupo)) {
    return { categoryId: 'deportes', subcategory: 'Colectivos', grupo };
  }
  if (RAQUETA_GRUPOS.has(grupo)) {
    return { categoryId: 'deportes', subcategory: 'Raqueta', grupo };
  }
  if (INDIVIDUAL_GRUPOS.has(grupo)) {
    return { categoryId: 'deportes', subcategory: 'Individual', grupo };
  }
  if (grupo === 'Individual') {
    return { categoryId: 'deportes', subcategory: 'Individual', grupo: 'Fitness' };
  }
  return { categoryId: 'deportes', subcategory: 'Colectivos', grupo: 'Varios' };
}

/** Resuelve taxonomía web para productos Made for Sport en subcategorías legacy. */
export function resolveMadeForSportTaxonomy(
  productName: string,
  grupo: string | null | undefined,
  currentSubcategory?: string | null
): MfsTaxonomy | null {
  const n = normalizeName(productName);
  const g = grupo?.trim() || null;
  const legacy = currentSubcategory ? LEGACY_SUBCATEGORIES.has(currentSubcategory) : false;

  if (isTenisMesaName(n)) {
    return { categoryId: 'deportes', subcategory: 'Raqueta', grupo: 'Tenis de mesa' };
  }
  if (isBaloncestoInstalacionName(n)) {
    return {
      categoryId: 'instalaciones',
      subcategory: 'Estructuras deportivas',
      grupo: 'Baloncesto',
    };
  }
  if (isPorteriaName(n)) {
    const grupo = n.includes('balonmano')
      ? 'Balonmano'
      : n.includes('futbol sala') || n.includes('f.sala')
        ? 'Fútbol Sala'
        : 'Fútbol';
    return { categoryId: 'deportes', subcategory: 'Colectivos', grupo };
  }
  if (n.includes('voleibol')) {
    return { categoryId: 'deportes', subcategory: 'Colectivos', grupo: 'Voleibol' };
  }
  if (n.includes('floorball') || (n.includes('stick') && n.includes('hockey'))) {
    return { categoryId: 'deportes', subcategory: 'Colectivos', grupo: 'Hockey' };
  }

  if (!legacy) {
    return null;
  }

  if (g) {
    return mapGrupo(g);
  }

  if (n.includes('gancho') && n.includes('red')) {
    return { categoryId: 'instalaciones', subcategory: 'Redes y Protecciones', grupo: null };
  }
  if (n.includes('portapicas') || n.includes('conos') || n.includes('pica entrenamiento')) {
    return { categoryId: 'deportes', subcategory: 'Individual', grupo: 'Fitness' };
  }

  return null;
}

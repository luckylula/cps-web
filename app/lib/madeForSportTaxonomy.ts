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

function colectivos(grupo: string): MfsTaxonomy {
  return { categoryId: 'deportes', subcategory: 'Colectivos', grupo };
}

function individual(grupo: string): MfsTaxonomy {
  return { categoryId: 'deportes', subcategory: 'Individual', grupo };
}

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
    return colectivos(grupo);
  }
  if (RAQUETA_GRUPOS.has(grupo)) {
    return { categoryId: 'deportes', subcategory: 'Raqueta', grupo };
  }
  if (INDIVIDUAL_GRUPOS.has(grupo)) {
    return individual(grupo);
  }
  if (grupo === 'Individual') {
    return individual('Fitness');
  }
  return colectivos('Varios');
}

/** Clasificación por nombre al importar CSV o reclasificar productos mal ubicados. */
export function classifyMadeForSportProduct(name: string, description = ''): MfsTaxonomy {
  const n = normalizeName(`${name} ${description}`);

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
    return colectivos(grupo);
  }
  if (n.includes('voleibol') || n.includes('voley') || (n.includes('balon') && n.includes('volei'))) {
    return colectivos('Voleibol');
  }
  if (n.includes('balonmano') || (n.includes('balon') && n.includes('balonmano'))) {
    return colectivos('Balonmano');
  }
  if (
    n.includes('baloncesto') ||
    n.includes('minibasket') ||
    (n.includes('marcador') && n.includes('baloncesto')) ||
    (n.includes('pizarra') && n.includes('baloncesto'))
  ) {
    return colectivos('Baloncesto');
  }
  if (n.includes('floorball') || (n.includes('stick') && n.includes('hockey'))) {
    return colectivos('Hockey');
  }
  if (
    n.includes('futbol') ||
    n.includes('soccer') ||
    (n.includes('balon') && n.includes('futbol')) ||
    n.includes('banderin corner') ||
    n.includes('banderin de corner') ||
    n.includes('arco perfeccionamiento pases') ||
    n.includes('base jugador barrera')
  ) {
    return colectivos('Fútbol');
  }
  if (n.includes('padel') || n.includes('pala de padel')) {
    return { categoryId: 'deportes', subcategory: 'Raqueta', grupo: 'Pádel' };
  }
  if (
    (n.includes('tenis') && !n.includes('mesa')) ||
    (n.includes('raqueta') && n.includes('tenis') && !n.includes('mesa'))
  ) {
    return { categoryId: 'deportes', subcategory: 'Raqueta', grupo: 'Tenis' };
  }
  if (n.includes('badminton') || n.includes('volante') || n.includes('pluma')) {
    return { categoryId: 'deportes', subcategory: 'Raqueta', grupo: 'Bádminton' };
  }
  if (n.includes('pickleball')) {
    return { categoryId: 'deportes', subcategory: 'Raqueta', grupo: 'Pickleball' };
  }
  if (n.includes('rugby')) {
    return colectivos('Rugby');
  }
  if (n.includes('beisbol') || n.includes('baseball')) {
    return colectivos('Béisbol');
  }
  if (n.includes('arbitr') || n.includes('silbato') || (n.includes('tarjeta') && n.includes('roja'))) {
    return colectivos('Árbitro');
  }

  if (n.includes('natacion') || n.includes('swimming') || n.match(/gafas.*nata|aleta|pullboy/)) {
    return individual('Natación');
  }
  if (n.includes('lanzamiento') || n.match(/\bboul\b/) || n.match(/\bdisco caucho\b|\bdisco\b.*\bkg\b/)) {
    return individual('Atletismo');
  }
  if (n.match(/atletismo|running|carrera|cronometro/)) {
    return individual('Atletismo');
  }
  if (
    n.includes('gimnasia ritmica') ||
    (n.includes('gimnasia') && n.includes('ritmica')) ||
    (n.includes('aro') && n.includes('gimnasia') && n.includes('ritmica'))
  ) {
    return individual('Gimnasia');
  }
  if (n.match(/yoga|pilates|esterilla|fitball|rodillo yoga/)) {
    return individual('Yoga');
  }
  if (
    n.match(/fitness|gym|gimnasio|mancuerna|pesa|kettlebell|step|bosu/) ||
    n.match(/medicinal|flexiones|dominadas|resistencia|balance board|abdominal/) ||
    n.match(/portabalones|carro portabalones|bolsa portabalones|hinchador balones|aguja.*hinchar/) ||
    n.includes('aro plano entrenamiento') ||
    n.match(/conos|pica entrenamiento|portapicas|escalera.*agilidad/) ||
    n.match(/anillas madera|barra dominadas|barra alzamiento|barra lastrada|comba |pelota de masaje|valla flexible/) ||
    n.match(/arnes|barra de masaje|muniquera.*lastrad|tobillera.*lastrad/)
  ) {
    return individual('Fitness');
  }

  if (n.includes('red voley') || n.includes('red volei')) {
    return colectivos('Voleibol');
  }
  if (n.match(/m² red proteccion|m2 red proteccion|red proteccion/)) {
    return { categoryId: 'instalaciones', subcategory: 'Redes y Protecciones', grupo: null };
  }
  if (n.includes('banderin') && n.includes('corner')) {
    return colectivos('Fútbol');
  }

  if (n.includes('gancho') && n.includes('red')) {
    return { categoryId: 'instalaciones', subcategory: 'Redes y Protecciones', grupo: null };
  }
  if (n.match(/colchoneta|tatami|quitamiedos|espaldera/)) {
    return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null };
  }
  if (n.match(/banco|banquillo|grada/) && !n.includes('banco pvc')) {
    return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  }

  if (n.match(/psicomotricidad|sensorial|didactico/)) {
    return { categoryId: 'material-escolar', subcategory: 'Material Didáctico', grupo: null };
  }
  if (n.match(/air hockey|billar/)) {
    return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo: null };
  }
  if (n.match(/juego|ludico|recreo/) && !n.includes('baloncesto')) {
    return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo: null };
  }

  if (n.match(/camiseta|polo|sudadera|jersey|chaleco/)) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Equipaciones' };
  }
  if (n.match(/pantalon|short|bermuda|leggin|culotte/) || (n.includes('malla') && !n.includes('ciclista'))) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Equipaciones' };
  }
  if (n.match(/chandal|chaqueta|cortaviento|anorak/)) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Equipaciones' };
  }
  if (n.match(/zapatilla|calzado|bota(?!n)|playera/)) {
    return { categoryId: 'textil', subcategory: 'Calzado', grupo: null };
  }
  if (n.match(/banador|bikini|traje de bano/) || (n.includes('lycra') && n.includes('gorro'))) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Natación y Playa' };
  }
  if (n.match(/calcetin|tobillera|\bmedias\b|\bmedia de\b|\bmedia futbol\b/)) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Equipaciones' };
  }

  return colectivos('Varios');
}

function isMisplacedInVarios(
  categoryId: string,
  subcategory: string | null,
  grupo: string | null
): boolean {
  return categoryId === 'deportes' && subcategory === 'Colectivos' && grupo === 'Varios';
}

function isMisplacedTextil(categoryId: string): boolean {
  return categoryId === 'textil';
}

/** Resuelve taxonomía web para productos Made for Sport mal clasificados. */
export function resolveMadeForSportTaxonomy(
  productName: string,
  grupo: string | null | undefined,
  currentSubcategory?: string | null,
  currentCategoryId?: string | null
): MfsTaxonomy | null {
  const g = grupo?.trim() || null;
  const legacy = currentSubcategory ? LEGACY_SUBCATEGORIES.has(currentSubcategory) : false;
  const inVarios = isMisplacedInVarios(
    currentCategoryId ?? '',
    currentSubcategory ?? null,
    g
  );
  const inTextil = isMisplacedTextil(currentCategoryId ?? '');

  if (!legacy && !inVarios && !inTextil) {
    return null;
  }

  const byName = classifyMadeForSportProduct(productName);
  if (inTextil && byName.categoryId !== 'textil') {
    return byName;
  }
  if (!inVarios || byName.grupo !== 'Varios' || byName.subcategory !== 'Colectivos') {
    return byName;
  }

  if (g) {
    return mapGrupo(g);
  }

  return byName;
}

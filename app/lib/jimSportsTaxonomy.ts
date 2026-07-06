/**
 * Mapeo taxonomía Jim Sports (categoria_padre + categoria_texto) → navegación web CPS.
 */

import { classifyTextilByName } from './textilTaxonomy';

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

function applyTextilNameRefine(tax: JimTaxonomy, productName: string | null | undefined): JimTaxonomy {
  if (tax.categoryId !== 'textil') return tax;
  const refined = classifyTextilByName(productName ?? '');
  if (!refined) return tax;
  return refined;
}

function resolveTextil(padre: string, texto: string): JimTaxonomy | null {
  if (padre === 'Casual' && ['Textil', 'Accesorios', 'Complementos'].includes(texto)) {
    return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  }
  if (padre === 'Casual' && texto === 'Calzado') {
    return { categoryId: 'textil', subcategory: 'Calzado', grupo: null };
  }
  if (padre === 'Equipaciones') {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Equipaciones' };
  }
  if (padre === 'Pádel' && texto === 'Textil') {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Por deporte - Pádel' };
  }
  if (texto === 'Bañadores' || (padre === 'Natación' && texto === 'Calzado')) {
    return {
      categoryId: 'textil',
      subcategory: texto === 'Calzado' ? 'Calzado' : 'Ropa Deportiva',
      grupo: texto === 'Calzado' ? null : 'Natación y Playa',
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

function normalizeProductName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function isPapeleriaEscolar(productName: string): boolean {
  const n = normalizeProductName(productName);
  return (
    n.includes('portadocumento') ||
    n.includes('archivador') ||
    n.includes('portafolio')
  );
}

function isBancoVestuario(productName: string): boolean {
  const n = normalizeProductName(productName);
  return n.startsWith('banco pvc') || n.includes('banco vestuario') || n.includes('banco de vestuario');
}

function fitnessIndividual(): JimTaxonomy {
  return { categoryId: 'deportes', subcategory: 'Individual', grupo: 'Fitness' };
}

function yogaIndividual(): JimTaxonomy {
  return { categoryId: 'deportes', subcategory: 'Individual', grupo: 'Yoga' };
}

function outdoorIndividual(): JimTaxonomy {
  return { categoryId: 'deportes', subcategory: 'Individual', grupo: 'Outdoor' };
}

function gimnasioInstalaciones(): JimTaxonomy {
  return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null };
}

/**
 * Jim Sports agrupa muchas colchonetas en Equipamiento > Colchonetas.
 * Solo las de instalación deportiva van a Instalaciones > Gimnasio.
 */
function resolveColchonetasByName(productName: string): JimTaxonomy {
  const n = normalizeProductName(productName);

  if (n.includes('camping')) return outdoorIndividual();
  if (n.includes('aerobic') || n.includes('aerobico')) return fitnessIndividual();
  if (n.includes('pilates') || n.includes('yoga') || n.includes('bolsa softee')) {
    return yogaIndividual();
  }
  if (n.includes('fitness multifuncion')) return fitnessIndividual();
  if (n.includes('plegable 180x60')) return yogaIndividual();

  if (
    n.includes('ignifuga') ||
    n.includes('clasica 200') ||
    n.includes('clasica 240') ||
    n.includes('reforzada') ||
    n.includes('matrixcell') ||
    n.includes('quitamiedos') ||
    n.includes('funda colchoneta') ||
    n.includes('funda quitamiedos') ||
    n.includes('loseta proteccion') ||
    n.includes('tatami') ||
    n.includes('saltos portero') ||
    n.includes('termoconformada') ||
    n.includes('figura colchoneta')
  ) {
    return gimnasioInstalaciones();
  }

  if (n.includes('tapices infantil') || n.includes('infantil')) {
    return { categoryId: 'material-escolar', subcategory: 'Material foam', grupo: null };
  }

  return { categoryId: 'material-escolar', subcategory: 'Manualidades', grupo: null };
}

function isFitnessGimnasioEquipment(n: string): boolean {
  if (n.includes('agarre') && !n.startsWith('disco ')) return true;
  if (n.includes('anillas') && n.includes('suspension')) return true;
  if (n.startsWith('banco ') || n.includes('para banco')) return true;
  if (n.startsWith('barra ')) {
    if (n.includes('masaje') || n.includes('equilibrio')) return false;
    return true;
  }
  if (n.startsWith('bicicleta ')) return true;
  if (n.includes('cinta motorizada')) return true;
  if (n.includes('eliptica')) return true;
  if (n.includes('mancuerna') || n.includes('mancuernero')) return true;
  if (n.startsWith('suspension ')) return true;
  return false;
}

function resolveInstalaciones(
  padre: string,
  texto: string,
  categoryId?: string | null,
  productName?: string | null
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
      if (isBancoVestuario(productName ?? '')) {
        return { categoryId: 'instalaciones', subcategory: 'Vestuarios', grupo: null };
      }
      return { categoryId: 'instalaciones', subcategory: 'Piscina', grupo: null };
    }
    if (texto === 'Vestuarios') {
      return { categoryId: 'instalaciones', subcategory: 'Vestuarios', grupo: null };
    }
    if (texto === 'Gimnasia') {
      return gimnasioInstalaciones();
    }
    if (texto === 'Banquillos') {
      return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
    }
  }
  if (padre === 'Fitness' && ['Musculación', 'Entrenamiento funcional', 'Cardio'].includes(texto)) {
    return gimnasioInstalaciones();
  }
  if (padre === 'Para la tienda' && texto === 'Mobiliario') {
    return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  }
  if (padre === 'Entrenamiento' && texto === 'Portamaterial') {
    return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  }
  if (padre === 'Entrenamiento' && texto === 'Protecciones' && categoryId === 'instalaciones') {
    return gimnasioInstalaciones();
  }
  if (padre === 'Pádel' && texto === 'Accesorios' && categoryId === 'instalaciones') {
    return { categoryId: 'instalaciones', subcategory: 'Estructuras deportivas', grupo: 'Pádel' };
  }
  if (padre === 'Para la tienda' && texto === 'Accesorios') {
    if (isPapeleriaEscolar(productName ?? '')) {
      return materialDidacticoEscolar();
    }
    return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  }
  return null;
}

function figurasEspumaEscolar(): JimTaxonomy {
  return { categoryId: 'material-escolar', subcategory: 'Figuras espuma', grupo: null };
}

function materialFoamEscolar(): JimTaxonomy {
  return { categoryId: 'material-escolar', subcategory: 'Material foam', grupo: null };
}

function materialDidacticoEscolar(): JimTaxonomy {
  return { categoryId: 'material-escolar', subcategory: 'Material Didáctico', grupo: null };
}

function juguetesEducativosEscolar(): JimTaxonomy {
  return { categoryId: 'material-escolar', subcategory: 'Juguetes Educativos', grupo: null };
}

function educacionInfantilEscolar(): JimTaxonomy {
  return { categoryId: 'material-escolar', subcategory: 'Juegos en Educación infantil', grupo: null };
}

/** Productos cuyo nombre incluye "juego(s)" → Juguetes Educativos o Educación infantil. */
function resolveJuegoEscolarByName(productName: string): JimTaxonomy | null {
  const n = normalizeProductName(productName);
  if (!n.includes('juego')) return null;
  if (/infantil|iniciacion|educacion infantil|bebe|0-3|1-2 anos/.test(n)) {
    return educacionInfantilEscolar();
  }
  return juguetesEducativosEscolar();
}

function applyJuegoNameOverride(
  taxonomy: JimTaxonomy | null,
  productName?: string | null
): JimTaxonomy | null {
  if (!taxonomy || taxonomy.categoryId !== 'material-escolar') return taxonomy;
  if (taxonomy.subcategory === 'Juegos alternativos') return taxonomy;
  if (isPelotaProductName(normalizeProductName(productName ?? ''))) return taxonomy;
  const juego = resolveJuegoEscolarByName(productName ?? '');
  return juego ?? taxonomy;
}

function isPsicomotricidadBase(n: string): boolean {
  return (
    n.startsWith('base ') ||
    n.includes('base maciza') ||
    n.includes('base para pica') ||
    n.includes('base softee')
  );
}

function isFiguraEspumaName(n: string): boolean {
  return (
    n.startsWith('figura ') ||
    n.includes(' set figura') ||
    n.startsWith('set figura') ||
    n.includes('plinton') ||
    (n.includes('set tatami') && n.includes('figura'))
  );
}

function isPiscinaBolasFoam(n: string): boolean {
  if (n.includes('suelo de lona') && n.includes('piscina')) return true;
  if (n.includes('piscina de bolas')) return true;
  if (n.startsWith('lote ') && n.includes('pelotas')) return false;
  return (
    n.includes('piscina') &&
    (n.includes('llenado') || n.includes('pelota') || n.includes('bola'))
  );
}

function isFoamMaterialName(n: string): boolean {
  return (
    n.includes('foam') ||
    n.includes('espuma') ||
    n.includes('softee') ||
    n.includes('superseguro')
  );
}

/** Pelotas sueltas o lotes de bolas/pelotas → Material Didáctico (no sets ni juegos con accesorios). */
function isPelotaProductName(n: string): boolean {
  if (n.startsWith('pelota ')) return true;
  if (n.startsWith('lote ') && (n.includes('pelotas') || n.includes('bolas'))) return true;
  if (
    (n.startsWith('juego de pelota') || n.startsWith('juego pelota')) &&
    !n.includes('raqueta')
  ) {
    return true;
  }
  return false;
}

function juegosAlternativosEscolar(grupo: string | null, productName?: string | null): JimTaxonomy {
  if (isPelotaProductName(normalizeProductName(productName ?? ''))) {
    return materialDidacticoEscolar();
  }
  return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo };
}

/** Entrenamiento > Iniciación infantil: foam → Material foam; pelotas → Material Didáctico. */
function resolveIniciacionInfantil(productName: string): JimTaxonomy {
  const n = normalizeProductName(productName);
  if (isFoamMaterialName(n)) return materialFoamEscolar();
  if (isPelotaProductName(n)) return materialDidacticoEscolar();
  return educacionInfantilEscolar();
}

function isBarraEquilibrioEspuma(n: string): boolean {
  return n.includes('barra') && n.includes('espuma');
}

function isPanelSenalizacionTrafico(n: string): boolean {
  if (n.includes('para pica')) return false;
  return n.includes('panel') && n.includes('senalizacion') && n.includes('trafico');
}

function isAntifazName(n: string): boolean {
  return n.includes('antifaz') || n.includes('antifaces');
}

/**
 * Jim Sports agrupa Psicomotricidad en Accesorios y Figuras acolchadas.
 * Las figuras de espuma van a Figuras espuma; antifaz y bases no son psicomotricidad.
 */
function resolvePsicomotricidad(texto: string, productName: string): JimTaxonomy {
  const n = normalizeProductName(productName);

  if (isAntifazName(n)) {
    return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo: null };
  }
  if (isPsicomotricidadBase(n)) {
    return materialFoamEscolar();
  }
  if (isPiscinaBolasFoam(n)) {
    return figurasEspumaEscolar();
  }
  if (isBarraEquilibrioEspuma(n)) {
    return figurasEspumaEscolar();
  }
  if (isPanelSenalizacionTrafico(n)) {
    return materialDidacticoEscolar();
  }
  if (isPelotaProductName(n)) {
    return materialDidacticoEscolar();
  }
  if (texto === 'Figuras acolchadas') {
    return figurasEspumaEscolar();
  }
  if (isFiguraEspumaName(n)) {
    return figurasEspumaEscolar();
  }

  return { categoryId: 'material-escolar', subcategory: 'Psicomotricidad', grupo: null };
}

function resolveMaterialEscolar(
  padre: string,
  texto: string,
  productName?: string | null
): JimTaxonomy | null {
  if (padre === 'Psicomotricidad') {
    return resolvePsicomotricidad(texto, productName ?? '');
  }
  if (padre === 'Juegos') {
    const grupoMap: Record<string, string> = {
      'Juegos exterior': 'Juegos exterior',
      'Juegos de mesa': 'Juegos mesa',
      'Juegos acuáticos': 'Juegos acuáticos',
    };
    if (grupoMap[texto]) {
      return juegosAlternativosEscolar(grupoMap[texto], productName);
    }
    return juegosAlternativosEscolar(null, productName);
  }
  if (padre === 'Juegos de salón') {
    return juegosAlternativosEscolar(
      texto === 'Mesas' || texto === 'Dardos' ? 'Juegos mesa' : null,
      productName
    );
  }
  if (padre === 'Entrenamiento' && texto === 'Iniciación infantil') {
    return resolveIniciacionInfantil(productName ?? '');
  }
  if (padre === 'Deportes alternativos') {
    if (texto === 'Malabares') {
      return { categoryId: 'material-escolar', subcategory: 'Material Didáctico', grupo: null };
    }
    if (['Petanca', 'Lanzamiento', 'Indiaka'].includes(texto)) {
      return juegosAlternativosEscolar(null, productName);
    }
  }
  if (padre === 'Natación' && texto === 'Juegos piscina') {
    return juegosAlternativosEscolar('Juegos acuáticos', productName);
  }
  if (padre === 'Equipamiento' && texto === 'Colchonetas') {
    return { categoryId: 'material-escolar', subcategory: 'Manualidades', grupo: null };
  }
  return null;
}

function resolveEntrenamientoAccesorios(
  productName: string | null | undefined,
  categoryId?: string | null
): JimTaxonomy | null {
  const n = normalizeProductName(productName ?? '');
  if (n.includes('botella')) return fitnessIndividual();
  if (categoryId === 'instalaciones') return gimnasioInstalaciones();
  return null;
}

function resolveDeportes(padre: string, texto: string, productName?: string | null): JimTaxonomy {
  const n = normalizeProductName(productName ?? '');
  if (padre === 'Fitness' && texto === 'Actividades dirigidas' && isFitnessGimnasioEquipment(n)) {
    return gimnasioInstalaciones();
  }
  const subcategory = deportesSubcategory(padre);
  return {
    categoryId: 'deportes',
    subcategory,
    grupo: normalizeGrupo(padre),
  };
}

function isJabalinaEscolarFoam(n: string): boolean {
  return n.includes('jabalina');
}

function isTenisMesaProductName(n: string): boolean {
  if (n.includes('billar')) return false;
  return (
    n.includes('tenis de mesa') ||
    n.includes('ping pong') ||
    n.includes('ping-pong') ||
    n.includes('pingpong') ||
    n.includes('mini-mesa de tenis') ||
    n.includes('minimesa de tenis') ||
    n.includes('red de tenis de mesa') ||
    n.includes('red tenis de mesa') ||
    (n.includes('mesa') && n.includes('tenis de mesa'))
  );
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

function tenisMesaDeportes(): JimTaxonomy {
  return { categoryId: 'deportes', subcategory: 'Raqueta', grupo: 'Tenis de mesa' };
}

function baloncestoEstructuras(): JimTaxonomy {
  return {
    categoryId: 'instalaciones',
    subcategory: 'Estructuras deportivas',
    grupo: 'Baloncesto',
  };
}

/** Resuelve taxonomía web a partir de campos Jim Sports. */
export function resolveJimSportsTaxonomy(
  categoriaPadre: string | null | undefined,
  categoriaTexto: string | null | undefined,
  fallbackSubcategory?: string | null,
  fallbackCategoryId?: string | null,
  productName?: string | null
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

  if (isJabalinaEscolarFoam(normalizeProductName(productName ?? ''))) {
    return materialFoamEscolar();
  }

  const normalizedName = normalizeProductName(productName ?? '');

  if (isTenisMesaProductName(normalizedName)) {
    return tenisMesaDeportes();
  }
  if (isBaloncestoInstalacionName(normalizedName)) {
    return baloncestoEstructuras();
  }

  if (padre === 'Equipamiento' && texto === 'Colchonetas') {
    return resolveColchonetasByName(productName ?? '');
  }

  if (padre === 'Outdoor') {
    return outdoorIndividual();
  }

  if (padre === 'Entrenamiento' && texto === 'Accesorios') {
    const accesorios = resolveEntrenamientoAccesorios(productName, fallbackCategoryId);
    if (accesorios) return accesorios;
  }

  if (padre === 'Producto promocional') {
    return applyTextilNameRefine(
      { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null },
      productName
    );
  }

  const textil = resolveTextil(padre, texto);
  if (textil) return applyTextilNameRefine(textil, productName);

  const instalaciones = resolveInstalaciones(padre, texto, fallbackCategoryId, productName);
  if (instalaciones) return instalaciones;

  const escolar = resolveMaterialEscolar(padre, texto, productName);
  if (escolar) return applyJuegoNameOverride(escolar, productName);

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
    return resolveDeportes(padre, texto, productName);
  }

  // Fallback según categoryId Jim Sports si no hay regla específica
  if (fallbackCategoryId === 'textil') {
    return applyTextilNameRefine(
      { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null },
      productName
    );
  }
  if (fallbackCategoryId === 'instalaciones') {
    return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null };
  }
  if (fallbackCategoryId === 'material-escolar') {
    return applyJuegoNameOverride(
      { categoryId: 'material-escolar', subcategory: 'Psicomotricidad', grupo: null },
      productName
    );
  }
  if (fallbackCategoryId === 'deportes') {
    return resolveDeportes(padre || 'Varios', texto, productName);
  }

  return null;
}

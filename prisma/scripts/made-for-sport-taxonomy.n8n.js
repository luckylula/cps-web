// Copia para n8n — mantener alineado con app/lib/madeForSportTaxonomy.ts

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

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isTenisMesaName(n) {
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

function isPorteriaName(n) {
  return n.includes('porteria');
}

function isBaloncestoInstalacionName(n) {
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

function mapGrupo(grupo) {
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

/** Clasificación al importar CSV (taxonomía web CPS). */
function classifyMadeForSportProduct(name, description) {
  const n = normalizeName(`${name || ''} ${description || ''}`);

  if (isTenisMesaName(n)) {
    return { categoryId: 'deportes', subcategory: 'Raqueta', grupo: 'Tenis de mesa' };
  }
  if (isBaloncestoInstalacionName(n)) {
    return { categoryId: 'instalaciones', subcategory: 'Estructuras deportivas', grupo: 'Baloncesto' };
  }
  if (isPorteriaName(n)) {
    const grupo = n.includes('balonmano')
      ? 'Balonmano'
      : n.includes('futbol sala') || n.includes('f.sala')
        ? 'Fútbol Sala'
        : 'Fútbol';
    return { categoryId: 'deportes', subcategory: 'Colectivos', grupo };
  }
  if (n.includes('voleibol') || (n.includes('balon') && n.includes('volei'))) {
    return { categoryId: 'deportes', subcategory: 'Colectivos', grupo: 'Voleibol' };
  }
  if (n.includes('balonmano') || (n.includes('balon') && n.includes('balonmano'))) {
    return { categoryId: 'deportes', subcategory: 'Colectivos', grupo: 'Balonmano' };
  }
  if (n.includes('floorball') || (n.includes('stick') && n.includes('hockey'))) {
    return { categoryId: 'deportes', subcategory: 'Colectivos', grupo: 'Hockey' };
  }
  if (
    n.includes('futbol') ||
    n.includes('soccer') ||
    (n.includes('balon') && n.includes('futbol'))
  ) {
    return { categoryId: 'deportes', subcategory: 'Colectivos', grupo: 'Fútbol' };
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
    return { categoryId: 'deportes', subcategory: 'Colectivos', grupo: 'Rugby' };
  }
  if (n.includes('arbitr') || n.includes('silbato') || n.includes('tarjeta') && n.includes('roja')) {
    return { categoryId: 'deportes', subcategory: 'Colectivos', grupo: 'Árbitro' };
  }

  if (n.match(/camiseta|polo|sudadera|jersey|chaleco/)) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Equipaciones' };
  }
  if (n.match(/pantalon|short|bermuda|leggin|malla|culotte/)) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Equipaciones' };
  }
  if (n.match(/chandal|chaqueta|cortaviento|anorak/)) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Equipaciones' };
  }
  if (n.match(/zapatilla|calzado|bota(?!n)|playera/)) {
    return { categoryId: 'textil', subcategory: 'Calzado', grupo: null };
  }
  if (n.match(/banador|bikini|traje de bano|lycra/)) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Natación y Playa' };
  }
  if (n.match(/calcetin|media|tobillera/)) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Equipaciones' };
  }

  if (n.includes('natacion') || n.includes('swimming') || n.match(/gafas.*nata|aleta|pullboy/)) {
    return { categoryId: 'deportes', subcategory: 'Individual', grupo: 'Natación' };
  }
  if (n.match(/fitness|gym|gimnasio|mancuerna|pesa|kettlebell|step|bosu/)) {
    return { categoryId: 'deportes', subcategory: 'Individual', grupo: 'Fitness' };
  }
  if (n.match(/yoga|pilates|esterilla|fitball/)) {
    return { categoryId: 'deportes', subcategory: 'Individual', grupo: 'Yoga' };
  }
  if (n.match(/atletismo|running|carrera|cronometro|cronometro/)) {
    return { categoryId: 'deportes', subcategory: 'Individual', grupo: 'Atletismo' };
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
  if (n.match(/juego|ludico|recreo/) && !n.includes('baloncesto')) {
    return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo: null };
  }

  if (n.match(/conos|pica entrenamiento|portapicas|escalera.*agilidad/)) {
    return { categoryId: 'deportes', subcategory: 'Individual', grupo: 'Fitness' };
  }

  return { categoryId: 'deportes', subcategory: 'Colectivos', grupo: 'Varios' };
}

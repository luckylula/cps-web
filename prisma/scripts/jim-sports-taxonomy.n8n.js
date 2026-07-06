// Copia para n8n — mantener alineado con app/lib/jimSportsTaxonomy.ts
// Workflow completo: node prisma/scripts/build-jim-sports-n8n-catalog.cjs
const ESTRUCTURAS_GRUPO = {
  Baloncesto: 'Baloncesto',
  'Fútbol 11 y 7': 'Fútbol',
  'Fútbol sala - Balonmano': 'Fútbol Sala',
  Voleibol: 'Voleibol',
  Tenis: 'Tenis',
  Pádel: 'Pádel',
  'Otros deportes': 'Varios',
};
const COLECTIVOS_PADRES = new Set(['Fútbol', 'Fútbol sala', 'Baloncesto', 'Voleibol', 'Balonmano', 'Rugby', 'Hockey/Floorball', 'Béisbol', 'Fútbol americano', 'Waterpolo', 'Árbitro']);
const RAQUETA_PADRES = new Set(['Pádel', 'Tenis', 'Bádminton', 'Tenis de mesa', 'Pickleball']);
const GRUPO_ALIASES = { 'Fútbol sala': 'Fútbol Sala', 'Hockey/Floorball': 'Hockey', 'Gimnasia rítmica': 'Gimnasia', Playa: 'Deportes de playa' };

function normalizeGrupo(padre) { return GRUPO_ALIASES[padre] ?? padre; }
function deportesSubcategory(padre) {
  if (COLECTIVOS_PADRES.has(padre)) return 'Colectivos';
  if (RAQUETA_PADRES.has(padre)) return 'Raqueta';
  return 'Individual';
}
function parseSubcategoryField(subcategory) {
  if (!subcategory || !subcategory.includes('>')) return null;
  const parts = subcategory.split('>').map((s) => s.trim());
  if (!parts[0]) return null;
  return { padre: parts[0], texto: parts[1] || '' };
}
function normalizeProductName(name) {
  return String(name || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}
function isPapeleriaEscolar(productName) {
  const n = normalizeProductName(productName);
  return n.includes('portadocumento') || n.includes('archivador') || n.includes('portafolio');
}
function isBancoVestuario(productName) {
  const n = normalizeProductName(productName);
  return n.startsWith('banco pvc') || n.includes('banco vestuario') || n.includes('banco de vestuario');
}
function fitnessIndividual() { return { categoryId: 'deportes', subcategory: 'Individual', grupo: 'Fitness' }; }
function yogaIndividual() { return { categoryId: 'deportes', subcategory: 'Individual', grupo: 'Yoga' }; }
function outdoorIndividual() { return { categoryId: 'deportes', subcategory: 'Individual', grupo: 'Outdoor' }; }
function gimnasioInstalaciones() { return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null }; }
function resolveColchonetasByName(productName) {
  const n = normalizeProductName(productName);
  if (n.includes('camping')) return outdoorIndividual();
  if (n.includes('aerobic') || n.includes('aerobico')) return fitnessIndividual();
  if (n.includes('pilates') || n.includes('yoga') || n.includes('bolsa softee')) return yogaIndividual();
  if (n.includes('fitness multifuncion')) return fitnessIndividual();
  if (n.includes('plegable 180x60')) return yogaIndividual();
  if (n.includes('ignifuga') || n.includes('clasica 200') || n.includes('clasica 240') || n.includes('reforzada') || n.includes('matrixcell') || n.includes('quitamiedos') || n.includes('funda colchoneta') || n.includes('funda quitamiedos') || n.includes('loseta proteccion') || n.includes('tatami') || n.includes('saltos portero') || n.includes('termoconformada') || n.includes('figura colchoneta')) {
    return gimnasioInstalaciones();
  }
  if (n.includes('tapices infantil') || n.includes('infantil')) {
    return { categoryId: 'material-escolar', subcategory: 'Material foam', grupo: null };
  }
  return { categoryId: 'material-escolar', subcategory: 'Manualidades', grupo: null };
}
function resolveTextil(padre, texto) {
  if (padre === 'Casual' && ['Textil', 'Accesorios', 'Complementos'].includes(texto)) return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  if (padre === 'Casual' && texto === 'Calzado') return { categoryId: 'textil', subcategory: 'Calzado', grupo: null };
  if (padre === 'Equipaciones') return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Equipaciones' };
  if (padre === 'Pádel' && texto === 'Textil') return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Por deporte - Pádel' };
  if (texto === 'Bañadores' || (padre === 'Natación' && texto === 'Calzado')) {
    return {
      categoryId: 'textil',
      subcategory: texto === 'Calzado' ? 'Calzado' : 'Ropa Deportiva',
      grupo: texto === 'Calzado' ? null : 'Natación y Playa',
    };
  }
  if (padre === 'Línea Work') return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  if (texto === 'Textil' || texto === 'Calzado') return { categoryId: 'textil', subcategory: texto === 'Calzado' ? 'Calzado' : 'Ropa Casual', grupo: null };
  return null;
}
function isFitnessGimnasioEquipment(n) {
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
function resolveInstalaciones(padre, texto, categoryId, productName) {
  if (padre === 'Equipamiento') {
    if (ESTRUCTURAS_GRUPO[texto]) return { categoryId: 'instalaciones', subcategory: 'Estructuras deportivas', grupo: ESTRUCTURAS_GRUPO[texto] };
    if (texto === 'Redes' || texto === 'Protecciones columnas') return { categoryId: 'instalaciones', subcategory: 'Redes y Protecciones', grupo: null };
    if (texto === 'Equipamiento agua') {
      if (isBancoVestuario(productName)) return { categoryId: 'instalaciones', subcategory: 'Vestuarios', grupo: null };
      return { categoryId: 'instalaciones', subcategory: 'Piscina', grupo: null };
    }
    if (texto === 'Vestuarios') return { categoryId: 'instalaciones', subcategory: 'Vestuarios', grupo: null };
    if (texto === 'Gimnasia') return gimnasioInstalaciones();
    if (texto === 'Banquillos') return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  }
  if (padre === 'Fitness' && ['Musculación', 'Entrenamiento funcional', 'Cardio'].includes(texto)) return gimnasioInstalaciones();
  if (padre === 'Para la tienda' && texto === 'Mobiliario') return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  if (padre === 'Entrenamiento' && texto === 'Portamaterial') return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  if (padre === 'Entrenamiento' && texto === 'Protecciones' && categoryId === 'instalaciones') return gimnasioInstalaciones();
  if (padre === 'Pádel' && texto === 'Accesorios' && categoryId === 'instalaciones') return { categoryId: 'instalaciones', subcategory: 'Estructuras deportivas', grupo: 'Pádel' };
  if (padre === 'Para la tienda' && texto === 'Accesorios') {
    if (isPapeleriaEscolar(productName)) return materialDidacticoEscolar();
    return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  }
  return null;
}
function figurasEspumaEscolar() { return { categoryId: 'material-escolar', subcategory: 'Figuras espuma', grupo: null }; }
function materialFoamEscolar() { return { categoryId: 'material-escolar', subcategory: 'Material foam', grupo: null }; }
function materialDidacticoEscolar() { return { categoryId: 'material-escolar', subcategory: 'Material Didáctico', grupo: null }; }
function juguetesEducativosEscolar() { return { categoryId: 'material-escolar', subcategory: 'Juguetes Educativos', grupo: null }; }
function educacionInfantilEscolar() { return { categoryId: 'material-escolar', subcategory: 'Juegos en Educación infantil', grupo: null }; }
function resolveJuegoEscolarByName(productName) {
  const n = normalizeProductName(productName || '');
  if (!n.includes('juego')) return null;
  if (/infantil|iniciacion|educacion infantil|bebe|0-3|1-2 anos/.test(n)) return educacionInfantilEscolar();
  return juguetesEducativosEscolar();
}
function applyJuegoNameOverride(taxonomy, productName) {
  if (!taxonomy || taxonomy.categoryId !== 'material-escolar') return taxonomy;
  if (taxonomy.subcategory === 'Juegos alternativos') return taxonomy;
  if (isPelotaProductName(normalizeProductName(productName || ''))) return taxonomy;
  return resolveJuegoEscolarByName(productName || '') || taxonomy;
}
function isPsicomotricidadBase(n) {
  return n.startsWith('base ') || n.includes('base maciza') || n.includes('base para pica') || n.includes('base softee');
}
function isFiguraEspumaName(n) {
  return n.startsWith('figura ') || n.includes(' set figura') || n.startsWith('set figura') || n.includes('plinton') || (n.includes('set tatami') && n.includes('figura'));
}
function isPiscinaBolasFoam(n) {
  if (n.includes('suelo de lona') && n.includes('piscina')) return true;
  if (n.includes('piscina de bolas')) return true;
  if (n.startsWith('lote ') && n.includes('pelotas')) return false;
  return n.includes('piscina') && (n.includes('llenado') || n.includes('pelota') || n.includes('bola'));
}
function isFoamMaterialName(n) {
  return n.includes('foam') || n.includes('espuma') || n.includes('softee') || n.includes('superseguro');
}
function isPelotaProductName(n) {
  if (n.startsWith('pelota ')) return true;
  if (n.startsWith('lote ') && (n.includes('pelotas') || n.includes('bolas'))) return true;
  if ((n.startsWith('juego de pelota') || n.startsWith('juego pelota')) && !n.includes('raqueta')) return true;
  return false;
}
function juegosAlternativosEscolar(grupo, productName) {
  if (isPelotaProductName(normalizeProductName(productName || ''))) return materialDidacticoEscolar();
  return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo };
}
function resolveIniciacionInfantil(productName) {
  const n = normalizeProductName(productName || '');
  if (isFoamMaterialName(n)) return materialFoamEscolar();
  if (isPelotaProductName(n)) return materialDidacticoEscolar();
  return { categoryId: 'material-escolar', subcategory: 'Juegos en Educación infantil', grupo: null };
}
function isBarraEquilibrioEspuma(n) { return n.includes('barra') && n.includes('espuma'); }
function isPanelSenalizacionTrafico(n) {
  if (n.includes('para pica')) return false;
  return n.includes('panel') && n.includes('senalizacion') && n.includes('trafico');
}
function isAntifazName(n) {
  return n.includes('antifaz') || n.includes('antifaces');
}
function resolvePsicomotricidad(texto, productName) {
  const n = normalizeProductName(productName || '');
  if (isAntifazName(n)) return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo: null };
  if (isPsicomotricidadBase(n)) return materialFoamEscolar();
  if (isPiscinaBolasFoam(n)) return figurasEspumaEscolar();
  if (isBarraEquilibrioEspuma(n)) return figurasEspumaEscolar();
  if (isPanelSenalizacionTrafico(n)) return materialDidacticoEscolar();
  if (isPelotaProductName(n)) return materialDidacticoEscolar();
  if (texto === 'Figuras acolchadas') return figurasEspumaEscolar();
  if (isFiguraEspumaName(n)) return figurasEspumaEscolar();
  return { categoryId: 'material-escolar', subcategory: 'Psicomotricidad', grupo: null };
}
function resolveMaterialEscolar(padre, texto, productName) {
  if (padre === 'Psicomotricidad') return resolvePsicomotricidad(texto, productName || '');
  if (padre === 'Juegos') {
    const grupoMap = { 'Juegos exterior': 'Juegos exterior', 'Juegos de mesa': 'Juegos mesa', 'Juegos acuáticos': 'Juegos acuáticos' };
    if (grupoMap[texto]) return juegosAlternativosEscolar(grupoMap[texto], productName);
    return juegosAlternativosEscolar(null, productName);
  }
  if (padre === 'Juegos de salón') return juegosAlternativosEscolar(texto === 'Mesas' || texto === 'Dardos' ? 'Juegos mesa' : null, productName);
  if (padre === 'Entrenamiento' && texto === 'Iniciación infantil') return resolveIniciacionInfantil(productName || '');
  if (padre === 'Deportes alternativos') {
    if (texto === 'Malabares') return { categoryId: 'material-escolar', subcategory: 'Material Didáctico', grupo: null };
    if (['Petanca', 'Lanzamiento', 'Indiaka'].includes(texto)) return juegosAlternativosEscolar(null, productName);
  }
  if (padre === 'Natación' && texto === 'Juegos piscina') return juegosAlternativosEscolar('Juegos acuáticos', productName);
  if (padre === 'Equipamiento' && texto === 'Colchonetas') return { categoryId: 'material-escolar', subcategory: 'Manualidades', grupo: null };
  return null;
}
function resolveEntrenamientoAccesorios(productName, categoryId) {
  const n = normalizeProductName(productName);
  if (n.includes('botella')) return fitnessIndividual();
  if (categoryId === 'instalaciones') return gimnasioInstalaciones();
  return null;
}
function resolveDeportes(padre, texto, productName) {
  const n = normalizeProductName(productName || '');
  if (padre === 'Fitness' && texto === 'Actividades dirigidas' && isFitnessGimnasioEquipment(n)) return gimnasioInstalaciones();
  return { categoryId: 'deportes', subcategory: deportesSubcategory(padre), grupo: normalizeGrupo(padre) };
}
function isJabalinaEscolarFoam(n) {
  return n.includes('jabalina');
}
function resolveJimSportsTaxonomy(categoriaPadre, categoriaTexto, fallbackSubcategory, fallbackCategoryId, productName) {
  let padre = (categoriaPadre || '').trim();
  let texto = (categoriaTexto || '').trim();
  if (!padre && fallbackSubcategory) {
    const parsed = parseSubcategoryField(fallbackSubcategory);
    if (parsed) { padre = parsed.padre; texto = parsed.texto; }
  }
  if (!padre) return null;
  if (isJabalinaEscolarFoam(normalizeProductName(productName || ''))) return materialFoamEscolar();
  if (padre === 'Equipamiento' && texto === 'Colchonetas') return resolveColchonetasByName(productName || '');
  if (padre === 'Outdoor') return outdoorIndividual();
  if (padre === 'Entrenamiento' && texto === 'Accesorios') {
    const acc = resolveEntrenamientoAccesorios(productName, fallbackCategoryId);
    if (acc) return acc;
  }
  if (padre === 'Producto promocional') return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  const textil = resolveTextil(padre, texto);
  if (textil) return textil;
  const instalaciones = resolveInstalaciones(padre, texto, fallbackCategoryId, productName);
  if (instalaciones) return instalaciones;
  const escolar = resolveMaterialEscolar(padre, texto, productName);
  if (escolar) return applyJuegoNameOverride(escolar, productName);
  if (COLECTIVOS_PADRES.has(padre) || RAQUETA_PADRES.has(padre) || ['Fitness', 'Natación', 'Outdoor', 'Atletismo', 'Running', 'Gimnasia rítmica', 'Deportes de contacto', 'Playa', 'Entrenamiento', 'Para la tienda', 'Deportes alternativos'].includes(padre)) {
    return resolveDeportes(padre, texto, productName);
  }
  if (fallbackCategoryId === 'textil') return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  if (fallbackCategoryId === 'instalaciones') return gimnasioInstalaciones();
  if (fallbackCategoryId === 'material-escolar') return applyJuegoNameOverride({ categoryId: 'material-escolar', subcategory: 'Psicomotricidad', grupo: null }, productName);
  if (fallbackCategoryId === 'deportes') return resolveDeportes(padre || 'Varios', texto, productName);
  return null;
}

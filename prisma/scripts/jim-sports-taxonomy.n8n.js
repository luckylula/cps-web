// Copia para n8n — mantener alineado con app/lib/jimSportsTaxonomy.ts
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
function resolveTextil(padre, texto) {
  if (padre === 'Casual' && ['Textil', 'Accesorios', 'Complementos'].includes(texto)) return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  if (padre === 'Casual' && texto === 'Calzado') return { categoryId: 'textil', subcategory: 'Calzado', grupo: null };
  if (padre === 'Equipaciones') return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: null };
  if (padre === 'Pádel' && texto === 'Textil') return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Por deporte - Pádel' };
  if (texto === 'Bañadores' || (padre === 'Natación' && texto === 'Calzado')) return { categoryId: 'textil', subcategory: texto === 'Calzado' ? 'Calzado' : 'Ropa Deportiva', grupo: null };
  if (padre === 'Línea Work') return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  if (texto === 'Textil' || texto === 'Calzado') return { categoryId: 'textil', subcategory: texto === 'Calzado' ? 'Calzado' : 'Ropa Casual', grupo: null };
  return null;
}
function resolveInstalaciones(padre, texto, categoryId) {
  if (padre === 'Equipamiento') {
    if (ESTRUCTURAS_GRUPO[texto]) return { categoryId: 'instalaciones', subcategory: 'Estructuras deportivas', grupo: ESTRUCTURAS_GRUPO[texto] };
    if (texto === 'Redes' || texto === 'Protecciones columnas') return { categoryId: 'instalaciones', subcategory: 'Redes y Protecciones', grupo: null };
    if (texto === 'Equipamiento agua') return { categoryId: 'instalaciones', subcategory: 'Piscina', grupo: null };
    if (texto === 'Vestuarios') return { categoryId: 'instalaciones', subcategory: 'Vestuarios', grupo: null };
    if (texto === 'Colchonetas' || texto === 'Gimnasia') return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null };
    if (texto === 'Banquillos') return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  }
  if (padre === 'Fitness' && ['Musculación', 'Entrenamiento funcional', 'Cardio'].includes(texto)) {
    if (categoryId === 'instalaciones') return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null };
    return null;
  }
  if (padre === 'Para la tienda' && texto === 'Mobiliario') return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  if (padre === 'Entrenamiento' && texto === 'Portamaterial') return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  if (padre === 'Entrenamiento' && texto === 'Accesorios' && categoryId === 'instalaciones') return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null };
  if (padre === 'Entrenamiento' && texto === 'Protecciones' && categoryId === 'instalaciones') return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null };
  if (padre === 'Outdoor' && texto === 'Accesorios') return { categoryId: 'instalaciones', subcategory: 'Redes y Protecciones', grupo: null };
  if (padre === 'Pádel' && texto === 'Accesorios' && categoryId === 'instalaciones') return { categoryId: 'instalaciones', subcategory: 'Estructuras deportivas', grupo: 'Pádel' };
  if (padre === 'Para la tienda' && texto === 'Accesorios') return { categoryId: 'instalaciones', subcategory: 'Mobiliario', grupo: null };
  return null;
}
function resolveMaterialEscolar(padre, texto) {
  if (padre === 'Psicomotricidad') return { categoryId: 'material-escolar', subcategory: 'Psicomotricidad', grupo: null };
  if (padre === 'Juegos') {
    const grupoMap = { 'Juegos exterior': 'Juegos exterior', 'Juegos de mesa': 'Juegos mesa', 'Juegos acuáticos': 'Juegos acuáticos' };
    if (grupoMap[texto]) return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo: grupoMap[texto] };
    return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo: null };
  }
  if (padre === 'Juegos de salón') return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo: texto === 'Mesas' || texto === 'Dardos' ? 'Juegos mesa' : null };
  if (padre === 'Entrenamiento' && texto === 'Iniciación infantil') return { categoryId: 'material-escolar', subcategory: 'Juegos en Educación infantil', grupo: null };
  if (padre === 'Deportes alternativos') {
    if (texto === 'Malabares') return { categoryId: 'material-escolar', subcategory: 'Material Didáctico', grupo: null };
    if (['Petanca', 'Lanzamiento', 'Indiaka'].includes(texto)) return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo: null };
  }
  if (padre === 'Natación' && texto === 'Juegos piscina') return { categoryId: 'material-escolar', subcategory: 'Juegos alternativos', grupo: 'Juegos acuáticos' };
  if (padre === 'Equipamiento' && texto === 'Colchonetas') return { categoryId: 'material-escolar', subcategory: 'Manualidades', grupo: null };
  return null;
}
function resolveDeportes(padre) {
  return { categoryId: 'deportes', subcategory: deportesSubcategory(padre), grupo: normalizeGrupo(padre) };
}
function resolveJimSportsTaxonomy(categoriaPadre, categoriaTexto, fallbackSubcategory, fallbackCategoryId) {
  let padre = (categoriaPadre || '').trim();
  let texto = (categoriaTexto || '').trim();
  if (!padre && fallbackSubcategory) {
    const parsed = parseSubcategoryField(fallbackSubcategory);
    if (parsed) { padre = parsed.padre; texto = parsed.texto; }
  }
  if (!padre) return null;
  if (padre === 'Producto promocional') return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  const textil = resolveTextil(padre, texto);
  if (textil) return textil;
  const instalaciones = resolveInstalaciones(padre, texto, fallbackCategoryId);
  if (instalaciones) return instalaciones;
  const escolar = resolveMaterialEscolar(padre, texto);
  if (escolar) return escolar;
  if (COLECTIVOS_PADRES.has(padre) || RAQUETA_PADRES.has(padre) || ['Fitness', 'Natación', 'Outdoor', 'Atletismo', 'Running', 'Gimnasia rítmica', 'Deportes de contacto', 'Playa', 'Entrenamiento', 'Para la tienda', 'Deportes alternativos'].includes(padre)) {
    return resolveDeportes(padre);
  }
  if (fallbackCategoryId === 'textil') return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  if (fallbackCategoryId === 'instalaciones') return { categoryId: 'instalaciones', subcategory: 'Gimnasio', grupo: null };
  if (fallbackCategoryId === 'material-escolar') return { categoryId: 'material-escolar', subcategory: 'Psicomotricidad', grupo: null };
  if (fallbackCategoryId === 'deportes') return resolveDeportes(padre || 'Varios');
  return null;
}

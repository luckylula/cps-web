// Copia para n8n — mantener alineado con app/lib/textilTaxonomy.ts

function normalizeTextilName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function classifyTextilByName(name) {
  const n = normalizeTextilName(name);

  if (n.match(/\bzapatillas?\b|\bbotas?\b|calzado deportivo|pantufla|sandalia/)) {
    return { categoryId: 'textil', subcategory: 'Calzado', grupo: null };
  }
  if (
    n.match(/banador|bikini|braga bikini|boxer squba/) ||
    (n.includes('gorro') && n.includes('natacion'))
  ) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Natación y Playa' };
  }
  if (
    n.match(/varlion|black crown/) &&
    n.match(/calcetin|camiseta|pantalon|falda|abrigo|chaqueta|polar|mallas/)
  ) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Por deporte - Pádel' };
  }
  if (n.match(/enebe/) && n.match(/calcetin|camiseta|pantalon|falda/)) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Por deporte - Pádel' };
  }
  if (
    !n.match(/\bbotas?\b/) &&
    n.match(
      /chandal|chubasquero givova|equipacion|dri-fit|park 20|givova|gymsack|teambag|duffel|bolsa deportiva|mochila modelo equipo|mochila givova|mochila fed|mochila softee tri|medias de futbol|media de futbol|mallas de futbol|malla ciclista|calcetin.*running|running.*calcetin|calcetines running|calcetines de running|camiseta mizuno|camiseta nike dri|pantalon givova|pantalon softee full|sudadera givova|sudadera softee kelvin|sudadera softee owen|set softee leader|termica softee bubble|camiseta givova|chaqueta givova|bolsa adidas/
    )
  ) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Equipaciones' };
  }
  if (
    n.match(
      /camiseta softee experience|camiseta softee ignition|camiseta softee imperial|camiseta softee extreme|camiseta rox r-|camiseta miler|camiseta.*iffley|softee team/
    )
  ) {
    return { categoryId: 'textil', subcategory: 'Ropa Deportiva', grupo: 'Equipaciones' };
  }
  if (n.match(/pijama|fruit of the loom|boxer tacchini|caja de 12 pijamas|braga cuello|pijashort/)) {
    return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  }
  if (n.match(/calcetin|tobillera/) && !n.match(/running|padel|black crown|enebe|varlion|vibor|kait|futbol/)) {
    return { categoryId: 'textil', subcategory: 'Ropa Casual', grupo: null };
  }
  return null;
}

function applyTextilNameRefine(tax, productName) {
  if (!tax || tax.categoryId !== 'textil') return tax;
  const refined = classifyTextilByName(productName || '');
  return refined || tax;
}

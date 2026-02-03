// Estructura de navegación multinivel - puede ser usado en Server y Client Components

export interface Grupo {
  nombre: string;
  slug: string;
}

export interface Subcategoria {
  nombre: string;
  slug: string;
  grupos: Grupo[];
}

export interface Categoria {
  nombre: string;
  slug: string;
  subcategorias: Subcategoria[];
}

// Estructura de navegación multinivel según especificaciones
export const navigationStructure: Categoria[] = [
  {
    nombre: "Instalaciones",
    slug: "instalaciones",
    subcategorias: [
      {
        nombre: "Estructuras deportivas",
        slug: "estructuras-deportivas",
        grupos: [
          { nombre: "Baloncesto", slug: "baloncesto" },
          { nombre: "Fútbol", slug: "futbol" },
          { nombre: "Fútbol Sala", slug: "futbol-sala" },
          { nombre: "Voleibol", slug: "voleibol" },
          { nombre: "Tenis", slug: "tenis" },
          { nombre: "Pádel", slug: "padel" },
          { nombre: "Varios", slug: "varios" },
        ],
      },
      {
        nombre: "Mobiliario",
        slug: "mobiliario",
        grupos: [],
      },
      {
        nombre: "Gimnasio",
        slug: "gimnasio",
        grupos: [],
      },
      {
        nombre: "Redes y Protecciones",
        slug: "redes-y-protecciones",
        grupos: [],
      },
      {
        nombre: "Vestuarios",
        slug: "vestuarios",
        grupos: [],
      },
      {
        nombre: "Piscina",
        slug: "piscina",
        grupos: [],
      },
    ],
  },
  {
    nombre: "Material Escolar",
    slug: "material-escolar",
    subcategorias: [
      {
        nombre: "Psicomotricidad",
        slug: "psicomotricidad",
        grupos: [],
      },
      {
        nombre: "Iniciación Deportiva",
        slug: "iniciacion-deportiva",
        grupos: [],
      },
      {
        nombre: "Juegos",
        slug: "juegos",
        grupos: [
          { nombre: "Juegos exterior", slug: "juegos-exterior" },
          { nombre: "Juegos acuáticos", slug: "juegos-acuaticos" },
          { nombre: "Juegos mesa", slug: "juegos-mesa" },
        ],
      },
    ],
  },
  {
    nombre: "Deportes",
    slug: "deportes",
    subcategorias: [
      {
        nombre: "Colectivos",
        slug: "colectivos",
        grupos: [
          { nombre: "Fútbol", slug: "futbol" },
          { nombre: "Baloncesto", slug: "baloncesto" },
          { nombre: "Voleibol", slug: "voleibol" },
          { nombre: "Balonmano", slug: "balonmano" },
          { nombre: "Rugby", slug: "rugby" },
          { nombre: "Hockey", slug: "hockey" },
          { nombre: "Béisbol", slug: "beisbol" },
          { nombre: "Árbitro", slug: "arbitro" },
          { nombre: "Varios", slug: "varios" },
        ],
      },
      {
        nombre: "Individual",
        slug: "individual",
        grupos: [
          { nombre: "Fitness", slug: "fitness" },
          { nombre: "Natación", slug: "natacion" },
          { nombre: "Atletismo", slug: "atletismo" },
          { nombre: "Gimnasia", slug: "gimnasia" },
          { nombre: "Deportes de contacto", slug: "deportes-de-contacto" },
          { nombre: "Outdoor", slug: "outdoor" },
          { nombre: "Running", slug: "running" },
          { nombre: "Deportes de playa", slug: "deportes-de-playa" },
        ],
      },
      {
        nombre: "Raqueta",
        slug: "raqueta",
        grupos: [
          { nombre: "Pádel", slug: "padel" },
          { nombre: "Tenis", slug: "tenis" },
          { nombre: "Bádminton", slug: "badminton" },
          { nombre: "Tenis de mesa", slug: "tenis-de-mesa" },
          { nombre: "Pickleball", slug: "pickleball" },
        ],
      },
    ],
  },
  {
    nombre: "Textil",
    slug: "textil",
    subcategorias: [
      {
        nombre: "Ropa Casual",
        slug: "ropa-casual",
        grupos: [],
      },
      {
        nombre: "Ropa Deportiva",
        slug: "ropa-deportiva",
        grupos: [
          { nombre: "Equipaciones", slug: "equipaciones" },
          { nombre: "Por deporte - Pádel", slug: "por-deporte-padel" },
        ],
      },
      {
        nombre: "Calzado",
        slug: "calzado",
        grupos: [
          { nombre: "Casual", slug: "casual" },
        ],
      },
    ],
  },
];

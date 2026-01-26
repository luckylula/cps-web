import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper function to create or get category
async function getOrCreateCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}) {
  return await prisma.category.upsert({
    where: { slug: data.slug },
    update: {
      name: data.name,
      description: data.description,
      image: data.image,
    },
    create: {
      id: data.slug, // El id debe coincidir con el slug para consistencia
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.image,
    },
  });
}

async function main() {
  console.log('🌱 Iniciando seed completo de productos...\n');

  // ============================================
  // MATERIAL ESCOLAR
  // ============================================
  
  const materialEscolar = await getOrCreateCategory({
    name: 'Material Escolar',
    slug: 'material-escolar',
    description: 'Artículos que te permiten enseñar y crear un entorno de aprendizaje deportivo.',
  });

  // Psicomotricidad
  const psicomotricidad = await getOrCreateCategory({
    name: 'Psicomotricidad',
    slug: 'psicomotricidad',
    description: 'Material de psicomotricidad para desarrollo motor',
    image: '/categorias/material-escolar/psicomotricidad.png',
  });

  const productosPsicomotricidad = [
    'Ladrillo con soporte para pica y aro', 'Cono con soporte', 'Trampolín',
    'Cuerda rítmica', 'Cuerda Salto', 'Cuerda salto colectivo 5mts',
    'Cuerda salto colectivo 10mts', 'Cinta métrica', 'Cono flexible',
    'Conos economic', 'Equipo de audio portátil', 'Set islas de equilibrio',
    'Islas equilibrio', 'Circuito de equilibrio', 'Túnel basic',
    'Túnel Psicomotricidad', 'Pack pelotas llenado', 'Pelotas llenado 75 mm',
    'Pelotas llenado 85 mm', 'Parque Nylon', 'Piscina cuadrada',
    'Piscina superior', 'Aro', 'Pack 20 picas', 'Base para Pica y aro',
    'Semi-cilindro', 'Arco', 'Semicilindro', 'Triangulo', 'Rampa grande',
    'Rampa pequeña', 'Círculo', 'Cilindro', 'Figura M', 'Cuadrado 60cm',
    'Cuadrado 25cm', 'Escalera MD', 'Escalera grande', 'Mini cilindro',
    'Figura Asiento'
  ];

  // Figuras espuma
  const figurasEspuma = await getOrCreateCategory({
    name: 'Figuras espuma',
    slug: 'figuras-espuma',
    description: 'Pelotas y figuras de espuma para juegos seguros',
    image: '/categorias/material-escolar/figuras-espuma.jpg',
  });

  const productosFigurasEspuma = [
    'Balón Voleibol SILVA', 'Minirugbi Caucho (Celular) T3', 'Nylon del 3-7',
    'BALÓN VOLEIBOL SOFTEE SOFT', 'BALÓN VOLEIBOL SOFTEE INICIACIÓN PVC',
    'Polivalente lisa pequeña', 'kanguro 55', 'kanguro 45', 'Tapón P. Gigante',
    'Extrator tapón', 'Pelota gigante', 'Pelota gigante flexible',
    'Pelota canguro', 'Pelota Caucho', 'Pelota multiuso PVC',
    'Polivalente lisa grande', 'Polivalente lisa amarilla',
    'Polivalente lisa media', 'Polivalente animal', 'Pelota Delux',
    'Pelota polivalente rugosa PVC', 'Balón Spider'
  ];

  // Balones escolares
  const balonesEscolares = await getOrCreateCategory({
    name: 'Balones de uso escolar',
    slug: 'balones-escolares',
    description: 'Balones y material para uso escolar',
    image: '/categorias/material-escolar/balones-escolares.jpg',
  });

  const productosBalonesEscolares = [
    'Cuerda salto colectivo 5mts', 'Juego de Bolos', 'Conos abecedario',
    'Indiaka Max', 'Indiaka deluxe', 'Indiaka', 'Comba', 'Escalera de agilidad',
    'Sogatira 10 mts', 'Cuerda salto colectivo 10mts', 'Cuerda Salto',
    'Torpedo', 'Misíl', 'Lanzamiento', 'Canasta Juegos', 'Set pala de Licra',
    'Zancos Bajos Deluxe', 'Zancos antideslizantes de 12cm', 'Trampolín plus',
    'Trampolín Reforzado', 'Paracaídas 7mts', 'Palo Lacrosse', 'Pala Mazaball',
    'Cuadrados', 'Manta diana', 'Kicking ball x12', 'Juego de Red',
    'Pelota divertida'
  ];

  // Juegos alternativos
  const juegosAlternativos = await getOrCreateCategory({
    name: 'Juegos alternativos',
    slug: 'juegos-alternativos',
    description: 'Material para juegos alternativos y arena',
    image: '/categorias/material-escolar/juegos-alternativos.jpg',
  });

  const productosJuegosAlternativos = [
    'Marcador campos', 'Set arena Junior', 'Cubo especial', 'Cubo pequeño',
    'Set arena bebe', 'Harineras bebe', 'Rastrillo bebe', 'Palas bebe',
    'Cedazo especial', 'Rastrillos', 'Palas especiales', 'Llanas', 'Paletas',
    'Pala Harinera', 'Cubos especiales', 'Cubos pequeños', 'Minimobil JOBS',
    'Mini contenedor', 'Minimobil Bote', 'Mini Display', 'School Mini',
    'Mini mobil JOBS', 'Mini mobil dumpy'
  ];

  // Educación infantil
  const educacionInfantil = await getOrCreateCategory({
    name: 'Juegos en Educación infantil',
    slug: 'educacion-infantil',
    description: 'Material para educación infantil',
    image: '/categorias/material-escolar/educacion-infantil.jpg',
  });

  const productosEducacionInfantil = [
    'Plato chino', 'Palos del Diablo', 'Malabares', 'Juego de 3 aros',
    'Diábolo Escolar', 'Diábolo Deluxe'
  ];

  // Malabares
  const malabares = await getOrCreateCategory({
    name: 'Malabares',
    slug: 'malabares',
    description: 'Material de malabares',
    image: '/categorias/material-escolar/malabares.jpg',
  });

  const productosMalabares = [
    'Plato chino', 'Palos del Diablo', 'Malabares', 'Juego de 3 aros',
    'Diábolo Escolar', 'Diábolo Deluxe'
  ];

  // Material foam
  const materialFoam = await getOrCreateCategory({
    name: 'Material foam',
    slug: 'material-foam',
    description: 'Material deportivo de espuma FOAM',
    image: '/categorias/material-escolar/material-foam.jpg',
  });

  const productosMaterialFoam = [
    'Testigo relevo FOAM', 'Anti-stress', 'Sable FOAM', 'Sables esgrima',
    'Javalina FOAM', 'Cuerda salto', 'Juego de bolos', 'Indiaka Max',
    'Indiaka deluxe', 'FOAM Balonmano', 'Foam Volley', 'FOAM basket',
    'Futbol FOAM', 'Pelota Béisbol FOAM', 'Kit béisbol FOAM',
    'Bate Béisbol FOAM regulable', 'Bate Béisbol FOAM', 'Rugby FOAM',
    'Pelota FOAM delux90', 'Mini Pelota Tenis FOAM', 'Disco Volador Foam',
    'Dado gigante FOAM', 'Cono FOAM 32cm', 'Aro FOAM', 'Construcción',
    'Set números y letras FOAM', 'Cubos FOAM', 'Animales FOAM'
  ];

  // Colchonetas
  const colchonetas = await getOrCreateCategory({
    name: 'Colchonetas',
    slug: 'colchonetas',
    description: 'Colchonetas y material de seguridad',
    image: '/categorias/material-escolar/colchonetas.jpg',
  });

  const productosColchonetas = [
    'Soporte pack', 'Soporte', 'Colchoneta aerobic', 'Adhesivo antideslizante',
    'Set Velcro', 'Carro', 'Funda quitamiedos', 'Colchoneta plegable',
    'Quitamiedos', 'Colchoneta caída max.', 'Colchoneta caída grande',
    'Colchoneta caída media', 'Colchoneta caída escolar', 'Colchoneta infantil',
    'Colchoneta escolar', 'Económica'
  ];

  // Educación musical
  const educacionMusical = await getOrCreateCategory({
    name: 'Educación musical',
    slug: 'educacion-musical',
    description: 'Instrumentos musicales para educación',
    image: '/categorias/material-escolar/educacion-musical.jpg',
  });

  const productosEducacionMusical = [
    'Set percussión mediano', 'Equipo de audio portátil',
    'Set iniciación a la música', 'Tambor de Mano', 'Set percussión grande',
    'Set 3 tambores', 'Carrillón', 'Carrillón Curvo',
    'Carrillón con notas separadas', 'Pandereta media', 'Pandereta mini',
    'Platos 20cm.', 'Agogo bell', 'Crótalos', 'Claves de madera', 'Triangulo',
    'Tambor olas', 'Palo lluvia', 'Raspa', 'Caja china',
    'Castañuelas de madera', 'Castañuelas plastico', 'Maracas arena',
    'Mini maracas', 'Cascabel', 'Tobillera de cascabeles', 'Pulsera cascabel',
    'Campanitas musicales'
  ];

  // ============================================
  // DEPORTE INDIVIDUAL
  // ============================================

  const deporteIndividual = await getOrCreateCategory({
    name: 'Deporte Individual',
    slug: 'deporte-individual',
    description: 'Material para deportes individuales',
  });

  // Tenis de Mesa
  const tenisDeMesa = await getOrCreateCategory({
    name: 'Tenis de Mesa',
    slug: 'tenis-de-mesa',
    description: 'Material de tenis de mesa',
  });

  const productosTenisDeMesa = [
    'Mesa tenis de exterior', 'Mesa ping pong interior', 'Kit tablero',
    'Tarro 60 pelotas pvc', 'Pelotas ping pong 6 und.',
    'Raqueta de tenis mesa P900', 'Raqueta de tenis mesa P700',
    'Raqueta de tenis P300', 'Pala Tenis de mesa Uso escolar'
  ];

  // Tenis
  const tenis = await getOrCreateCategory({
    name: 'Tenis',
    slug: 'tenis',
    description: 'Material de tenis',
  });

  const productosTenis = [
    'Bolsa 3 pelotas iniciación tenis', 'Bote tenis wilson "championship"',
    'Raqueta tenis Junior', "'T1000 REAL ATTACK'", 'SET SHUTTLEBALL',
    'Postes tenis metalicos', 'Juego postes tenis fijos cuadrados',
    'Juegos postes de tenis con base', 'Juego botes con tapa para postes fijos',
    'Postes de tenis trasladables', 'Botes metálicos cuadrados tenis',
    'Postes de tenis aluminio', 'Red tenis premium', 'Red tenis',
    'Repuesto cable de acero tenis', 'Centro guia', 'Carro portapelotas',
    'Tubo recogepelotas', 'Banco 2 plazas PVC'
  ];

  // Padel
  const padel = await getOrCreateCategory({
    name: 'Padel',
    slug: 'padel',
    description: 'Material de pádel',
    image: '/categorias/deporte-individual/padel.jpg',
  });

  const productosPadel = [
    'Pala Padel tour carbon', 'Pala pádel k3 carbon',
    'PALA PADEL SOFTEE CARBURO 5', 'Paletero softee padel', 'Paletero TOUR'
  ];

  // Badminton
  const badminton = await getOrCreateCategory({
    name: 'Badminton',
    slug: 'badminton',
    description: 'Material de badminton',
  });

  const productosBadminton = [
    'Set mini Badminton i tenis', 'Red Badminton sencilla',
    'Juego postes Badminton Fijos', 'Raqueta badminton B500 junior',
    'Raqueta Badminton B5000', 'Raqueta Badminton B3000',
    'Raqueta Badminton junior', 'Volantes Badminton Nylon',
    'Volantes Badminton', 'Cordaje badminton 10mt'
  ];

  // Atletismo
  const atletismo = await getOrCreateCategory({
    name: 'Atletismo',
    slug: 'atletismo',
    description: 'Material de atletismo',
  });

  const productosAtletismo = [
    'Cronómetro', 'Valla de salto', 'Testigo relevo FOAM',
    'Testigo de aluminio antideslizante', 'Testigo relevo alumnio',
    'Testigo Relevo PVC profesional', 'Peso lanzamiento de Caucho',
    'Liston fibra de vidrio', 'Listón deluxe',
    'Juego Saltómetro metálicos graduables', 'Jabalina Torpedo',
    'Jabalina espuma', 'Cuerda saltómetro con contrapeso',
    'Cuerda elástica tramos saltómetro', 'Disco Lanzamiento Extra Soft',
    'Disco lanzamiento caucho'
  ];

  // Gimnasia Rítmica
  const gimnasiaRitmica = await getOrCreateCategory({
    name: 'Gimnasia Rítmica',
    slug: 'gimnasia-ritmica',
    description: 'Material de gimnasia rítmica',
    image: '/categorias/deporte-individual/gimnasia-ritmica.jpg',
  });

  const productosGimnasiaRitmica = [
    'Pelota Rítmica Adulto', 'Pelota Rítmica INFANTIL',
    'Juego de mazas rítimica adult', 'Juego maza rítmicas infantil',
    'Cuerda rítmica', 'Cinta métrica sin varilla 6m',
    'Cinta métrica sin varilla 4m', 'Stick- Varilla para cinta rítmica',
    'Cinta métrica 6m', 'Cinta métrica 4m', 'Aro de rítmica Junior',
    'Aro de rítmica adulto'
  ];

  // Piscina
  const piscina = await getOrCreateCategory({
    name: 'Piscina',
    slug: 'piscina',
    description: 'Material para piscina y natación',
    image: '/categorias/deporte-individual/piscina.jpg',
  });

  const productosPiscina = [
    'Suelo Helsinki vestuario', 'Loseta softee 30x40', 'Cubos FOAM',
    'Animales FOAM', 'Loseta suelo', 'Salvavidas', 'Tapónes Oído-Orejas',
    'Tapón Nariz', 'Gafas Natación Adulto Classic',
    'Gafas Natación Infantil Classic', 'Gorro Natación De Silicona',
    'Gorro Natación De Licra', 'Gorro Natación De Latex',
    'Gorro Natación Poliester', 'Barras flotantes', 'Puente rio KWAI',
    'Tapiz con agujeros', 'Tapiz 50 X 50 X 3CM', 'Tapiz 100 X 50 X 3CM',
    'Tapiz 150 X 100 X 3CM', 'Juego 5 bastones', 'Collar flotación',
    'Manquernas', 'Cinturón aquaeróbic', 'Cinturón Junior de aprendizaje',
    'Cinturón de aprendizaje Junior', 'cinturón alargado',
    'Cinturón aprendizaje para adulto'
  ];

  // Yoga
  const yoga = await getOrCreateCategory({
    name: 'Yoga',
    slug: 'yoga',
    description: 'Material de yoga',
  });

  const productosYoga = [
    'Aerial YOGA', 'Columpio Yoga', 'Correo Yoga', 'Rueda de Yoga',
    'Bolsa colchoneta Yoga Pro', 'Bolsa Softee colchoneta Yoga',
    'Ladrillo Yoga Corcho', 'Ladrillo Yoga PRO', 'Ladrillo Yoga',
    'Esterilla caucho natural', 'Esterilla eco-friendly',
    'Esterilla de Yoga', 'Esterilla YUTE', 'Esterilla Yoga T.P.E'
  ];

  // Pilates
  const pilates = await getOrCreateCategory({
    name: 'Pilates',
    slug: 'pilates',
    description: 'Material de pilates',
    image: '/categorias/deporte-individual/pilates.png',
  });

  const productosPilates = [
    'Semirodillo 30cm pilates', 'Semicilindro pilates 90cm', 'Plataforma Boss',
    'Pelota pilates 20cm', 'Pelota pilates 26cm transparente',
    'Colchoneta Pilates 4mm', 'Rodillo de pilates', 'Cilindro pilates 90cm',
    'Aro pilates'
  ];

  // ============================================
  // DEPORTES COLECTIVOS
  // ============================================

  const deportesColectivos = await getOrCreateCategory({
    name: 'Deportes Colectivos',
    slug: 'deportes-colectivos',
    description: 'Material para deportes en equipo',
  });

  // Fútbol
  const futbol = await getOrCreateCategory({
    name: 'Fútbol / Fútbol Sala',
    slug: 'futbol',
    description: 'Material de fútbol y fútbol sala',
  });

  const productosFutbol = [
    'Portería multiusos plegable metálica', 'Porteria desmontable',
    'Balón de fútbol TPU', 'Balón Softee Strike Fut. 11', 'Balón Softee Seal',
    'Balón Softee React', 'Balón Softee Position', 'Balón Softee Maximum',
    'Balón Softee Iconic Fut 11', 'Balón Softee Denim', 'Balón Inter Fut.11',
    'Balón Molten T7', 'Balón Molten T6', 'Balón Molten T5',
    'Balón Softee Park', 'Red de fútbol', 'Conos de entrenamiento',
    'Petos deportivos'
  ];

  // Baloncesto
  const baloncesto = await getOrCreateCategory({
    name: 'Baloncesto',
    slug: 'baloncesto',
    description: 'Material de baloncesto',
  });

  const productosBaloncesto = [
    'Balón Cuero Rox Dunk', 'Basket Naranja Caucho Celular del 5-7',
    'Nylon del 3-7', 'Balón MIKASA B-6', 'Balón Minibasket N-7',
    'Balón Minibasket', 'Juego de canastas trasladables',
    'Aro macizo galvanizado', 'Aro tubo Deluxe', 'Red de baloncesto',
    'Canasta baloncesto portátil', 'Bomba de inflado'
  ];

  // Balonmano
  const balonmano = await getOrCreateCategory({
    name: 'Balonmano',
    slug: 'balonmano',
    description: 'Material de balonmano',
  });

  const productosBalonmano = [
    'Portería desmontable', 'Balón balonmano Softee Heros',
    'Balón balonmano Flash Elite', 'Balón balonmano Softee Flash',
    'Balón balonmano Softee Microcelular', 'Balón balonmano Soft TPE',
    'Carro de portería', 'Red de balonmano', 'Resina para balonmano'
  ];

  // Voleibol
  const voleibol = await getOrCreateCategory({
    name: 'Voleibol / Voley Playa',
    slug: 'voleibol',
    description: 'Material de voleibol y voley playa',
  });

  const productosVoleibol = [
    'Voleibol Playa Cuero Sintético', 'Balón Volley Playa Cuero Cosido',
    'Balón Voleybeach', 'Volley Cuero', 'Balón Voley MIKASA 200',
    'Balón Voley MIKASA', 'Balón Molten Voley', 'Balón Voleibol SILVA',
    'Balón Voleibol Softee Soft', 'Balón Voleibol Softee Iniciación PVC',
    'Red de voleibol', 'Postes de voleibol', 'Antenas de voleibol'
  ];

  // Waterpolo
  const waterpolo = await getOrCreateCategory({
    name: 'Waterpolo',
    slug: 'waterpolo',
    description: 'Material de waterpolo',
  });

  const productosWaterpolo = [
    'Portería Waterpolo', 'Waterpolo Caucho Celular',
    'Mini Waterpolo Caucho Celular', 'Balón waterpolo talla 5',
    'Balón waterpolo talla 4', 'Balón waterpolo talla 3', 'Gorro waterpolo',
    'Red waterpolo'
  ];

  // Rugby
  const rugby = await getOrCreateCategory({
    name: 'Rugby',
    slug: 'rugby',
    description: 'Material de rugby',
  });

  const productosRugby = [
    'Plot Rugby', 'Minirugbi Caucho Celular T3', 'Rugbi Caucho Celular T5',
    'Balón Rugby DERBY', 'Pelota Rugby con Relieve', 'Pelota Rugby Torbellino',
    'Balón rugby talla 4', 'Balón rugby talla 3', 'Conos de entrenamiento'
  ];

  // Hockey
  const hockey = await getOrCreateCategory({
    name: 'Hockey',
    slug: 'hockey',
    description: 'Material de hockey',
  });

  const productosHockey = [
    'Portería Hockey Acero', 'Set Hockey Foam 12 Mazas + Pelota',
    'Stick De Hockey Deluxe', 'Stick Hockey Hierba', 'Stick Hockey 0,95mt',
    'Stick Hockey 0,85mt', 'Set mini Hockey', 'Pelota Hockey',
    'Pelota Hockey 100mm', 'Pelota Hockey 70mm', 'Pastilla Hockey'
  ];

  // Béisbol
  const beisbol = await getOrCreateCategory({
    name: 'Béisbol',
    slug: 'beisbol',
    description: 'Material de béisbol',
  });

  const productosBeisbol = [
    'Bases de Caucho', 'Soporte Prebéisbol', 'Pelota Piel Baseball',
    'Pelota Béisbol Soft', 'Pelota béisbol FOAM', 'Guante Béisbol Adulto',
    'Bate de Béisbol Regulable', 'Bate de Béisbol Aluminio',
    'Bate de Béisbol Madera 69cm', 'Bate de Béisbol de madera 90cm',
    'Guante de Béisbol Junior', 'Bate de béisbol FOAM'
  ];

  // ============================================
  // MATERIAL COMPLEMENTARIO
  // ============================================

  const materialComplementario = await getOrCreateCategory({
    name: 'Material Deportivo Complementario',
    slug: 'material-complementario',
    description: 'Imprescindibles para tus instalaciones deportivas',
  });

  // Complemento de balones
  const complementoBalones = await getOrCreateCategory({
    name: 'Complemento de balones',
    slug: 'complemento-balones',
    description: 'Accesorios y complementos para balones',
  });

  const productosComplementoBalones = [
    'Marcador campos', 'Carro de portería', 'Juego De Canastas Trasladables',
    'Aro macizo Galvanizado', 'Aro tubo Deluxe',
    'Portería multiusos plegable metálica', 'Portería Hockey Acero',
    'Porteria desmontable', 'Portería multiusos 300x180x90cm',
    'Portería multiusos 160x115x60cm', 'Portería multiusos metálica',
    'Carro Almacenamiento', 'Carro lleva pelotas', 'Saco portabalones Deluxe',
    'Red porta balones', 'Banasta', 'Compresor eléctrico deluxe',
    'Compresor eléctrico', 'Medidor de presión'
  ];

  // Balones medicinales
  const balonesMedicinales = await getOrCreateCategory({
    name: 'Balones medicinales',
    slug: 'balones-medicinales',
    description: 'Balones medicinales para entrenamiento',
  });

  const productosBalonesMedicinales = [
    'Balón Medicinal Soft', 'Balones medicinales con bote', 'Balón Sin bote'
  ];

  // Material de entrenamiento
  const materialEntrenamiento = await getOrCreateCategory({
    name: 'Material Entrenamiento',
    slug: 'material-entrenamiento',
    description: 'Material para entrenamiento deportivo',
  });

  const productosMaterialEntrenamiento = [
    'Juego Tobilleras Muñequeras Lastradas', 'Marcador campos',
    'Cuerda trepa Nudo', 'Cuerda trepa Lisa', 'Conos abecedario',
    'Brazalete capitán', 'Siluetas de entrenamiento', 'Pica de madera',
    'Pica Pvc', 'Valla abatible 40cm', 'Valla flexible', 'Cono flexible',
    'Cono chino Pack', 'Cono redondo', 'Cono con soporte', 'Base Maciza',
    'Ladrillo con soporte basic', 'Ladrillo con soporte para pica y aro',
    'Cinta métrica 50 MT', 'Cinta métrica 30MT'
  ];

  // Preparación física
  const preparacionFisica = await getOrCreateCategory({
    name: 'Preparación física',
    slug: 'preparacion-fisica',
    description: 'Material para preparación física',
  });

  const productosPreparacionFisica = [
    'Juego Tobilleras Muñequeras Lastradas', 'Punch Trainer',
    'Mini Bands Textile Elastube', 'Anclaje Techo-Pared Para Suspension Trainer',
    'Tobilleras Inversión', 'Colgador Brazos Muscle Belt', 'Jump Fitness Tramp',
    'Estantería Para Air Steps', 'Balance board 40cm', 'Balance pad',
    'Balance Islands', 'Balance Cushion 36cm', 'Balance Cushion 50cm',
    'Cojín Lumbar Hinchable', 'Wedge Balance Cushion', 'Cilindro para masaje',
    'Cilindro Desentumecedor Estriado', 'Core Wheels', 'Correa de estiramientos',
    'Cinturón Ruso'
  ];

  // Material polivalente
  const materialPolivalente = await getOrCreateCategory({
    name: 'Material Polivalente',
    slug: 'material-polivalente',
    description: 'Material polivalente para gimnasio',
  });

  const productosMaterialPolivalente = [
    'Juego Tobilleras Muñequeras Lastradas', 'Trampolín',
    'Trampolín Elástico 110 X 110 Cm.', 'Plinto Fijo', 'Trampolín de salto',
    'Espaldera simple', 'Espaldera doble', 'Banco sueco'
  ];

  // ============================================
  // EQUIPACIÓN TEXTIL
  // ============================================

  const equipacionTextil = await getOrCreateCategory({
    name: 'Equipación Textil',
    slug: 'equipacion-textil',
    description: 'Equipación completa para todas tus necesidades deportivas',
  });

  const productosEquipacionTextil = [
    'Camiseta blanca económica - marcaje a una tinta',
    'Camiseta de color económica - marcaje a una tinta',
    'Camiseta blanca Premium - marcaje a una tinta',
    'Camiseta Premium de color - marcaje a una tinta',
    'Camiseta Técnica blanca - marcaje a una tinta',
    'Camiseta Técnica de color - marcaje a una tinta'
  ];

  // ============================================
  // FUNCIÓN PARA CREAR PRODUCTOS
  // ============================================

  async function createProducts(categoryId: string, productNames: string[]) {
    const products = productNames.map((name) => ({
      name,
      slug: generateSlug(name),
      description: `${name}. Producto de calidad para uso deportivo.`,
      price: 0, // Precio a definir según catálogo
      stock: 0,
      categoryId,
      published: true,
      featured: false,
      images: [],
    }));

    await prisma.product.createMany({
      data: products,
      skipDuplicates: true,
    });

    return products.length;
  }

  // Crear todos los productos
  console.log('📦 Creando productos...\n');

  const counts = {
    psicomotricidad: await createProducts(psicomotricidad.id, productosPsicomotricidad),
    figurasEspuma: await createProducts(figurasEspuma.id, productosFigurasEspuma),
    balonesEscolares: await createProducts(balonesEscolares.id, productosBalonesEscolares),
    juegosAlternativos: await createProducts(juegosAlternativos.id, productosJuegosAlternativos),
    educacionInfantil: await createProducts(educacionInfantil.id, productosEducacionInfantil),
    malabares: await createProducts(malabares.id, productosMalabares),
    materialFoam: await createProducts(materialFoam.id, productosMaterialFoam),
    colchonetas: await createProducts(colchonetas.id, productosColchonetas),
    educacionMusical: await createProducts(educacionMusical.id, productosEducacionMusical),
    tenisDeMesa: await createProducts(tenisDeMesa.id, productosTenisDeMesa),
    tenis: await createProducts(tenis.id, productosTenis),
    padel: await createProducts(padel.id, productosPadel),
    badminton: await createProducts(badminton.id, productosBadminton),
    atletismo: await createProducts(atletismo.id, productosAtletismo),
    gimnasiaRitmica: await createProducts(gimnasiaRitmica.id, productosGimnasiaRitmica),
    piscina: await createProducts(piscina.id, productosPiscina),
    yoga: await createProducts(yoga.id, productosYoga),
    pilates: await createProducts(pilates.id, productosPilates),
    futbol: await createProducts(futbol.id, productosFutbol),
    baloncesto: await createProducts(baloncesto.id, productosBaloncesto),
    balonmano: await createProducts(balonmano.id, productosBalonmano),
    voleibol: await createProducts(voleibol.id, productosVoleibol),
    waterpolo: await createProducts(waterpolo.id, productosWaterpolo),
    rugby: await createProducts(rugby.id, productosRugby),
    hockey: await createProducts(hockey.id, productosHockey),
    beisbol: await createProducts(beisbol.id, productosBeisbol),
    complementoBalones: await createProducts(complementoBalones.id, productosComplementoBalones),
    balonesMedicinales: await createProducts(balonesMedicinales.id, productosBalonesMedicinales),
    materialEntrenamiento: await createProducts(materialEntrenamiento.id, productosMaterialEntrenamiento),
    preparacionFisica: await createProducts(preparacionFisica.id, productosPreparacionFisica),
    materialPolivalente: await createProducts(materialPolivalente.id, productosMaterialPolivalente),
    equipacionTextil: await createProducts(equipacionTextil.id, productosEquipacionTextil),
  };

  const totalProducts = Object.values(counts).reduce((sum, count) => sum + count, 0);

  console.log('✅ Seed completado!\n');
  console.log('📊 Resumen:');
  console.log(`   - Categorías principales: 5`);
  console.log(`   - Subcategorías: ${Object.keys(counts).length}`);
  console.log(`   - Total productos: ${totalProducts}\n`);

  Object.entries(counts).forEach(([category, count]) => {
    console.log(`   - ${category}: ${count} productos`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

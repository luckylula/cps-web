import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Función para limpiar descripciones de forma agresiva
function cleanDescription(description: string): string {
  if (!description || description.trim().length === 0) {
    return 'Consultar especificaciones técnicas.';
  }

  let cleaned = description;

  // 0. ELIMINAR TODO DESDE PALABRAS CLAVE PROBLEMÁTICAS (MUY AGRESIVO)
  const stopWords = [
    'Material:',
    'DETALLES TÉCNICOS:',
    'DETALLES TECNICOS:',
    'Detalles técnicos:',
    'Detalles Tecnicos:',
    'MoreUse tab to navigate',
    'Use tab to navigate',
    'Tab to navigate',
    'Material Escolar',
    'DEPORTE INDIVIDUAL',
    'DEPORTES COLECTIVOS',
    'MATERIAL DEPORTIVO COMPLEMENTARIO',
    'EQUIPACIÓN TEXTIL',
    'EQUIPACION TEXTIL',
  ];

  for (const stopWord of stopWords) {
    const index = cleaned.indexOf(stopWord);
    if (index !== -1) {
      cleaned = cleaned.substring(0, index).trim();
      break; // Solo cortar en la primera ocurrencia
    }
  }

  // 0.1. Eliminar líneas que empiezan con estas palabras
  const initialLines = cleaned.split('\n');
  const filteredLines: string[] = [];
  let foundStopLine = false;

  for (const line of initialLines) {
    const trimmedLine = line.trim();
    
    // Si encontramos una línea con palabra de parada, cortar aquí
    if (stopWords.some(word => trimmedLine.toUpperCase().includes(word.toUpperCase()))) {
      foundStopLine = true;
      break;
    }
    
    // Si ya encontramos una línea de parada, no añadir más
    if (foundStopLine) {
      continue;
    }
    
    filteredLines.push(line);
  }

  cleaned = filteredLines.join('\n');

  // 1. Eliminar código JavaScript común
  const jsPatterns = [
    /var\s+\w+\s*=\s*[^;]+;/gi,
    /const\s+\w+\s*=\s*[^;]+;/gi,
    /let\s+\w+\s*=\s*[^;]+;/gi,
    /function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/gi,
    /mutate\([^)]*\)/gi,
    /\.then\([^)]*\)/gi,
    /\.catch\([^)]*\)/gi,
    /document\.querySelector[^;]*;/gi,
    /window\.location[^;]*;/gi,
    /addEventListener\([^)]*\)/gi,
    /getElementById\([^)]*\)/gi,
    /querySelector\([^)]*\)/gi,
    /innerHTML\s*=/gi,
    /textContent\s*=/gi,
    /setAttribute\([^)]*\)/gi,
    /classList\.(add|remove|toggle)\([^)]*\)/gi,
    /data-hook[^>]*/gi,
    /onclick\s*=\s*"[^"]*"/gi,
    /onclick\s*=\s*'[^']*'/gi,
  ];

  jsPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // 2. Eliminar código CSS
  const cssPatterns = [
    /<style[^>]*>[\s\S]*?<\/style>/gi,
    /style\s*=\s*"[^"]*"/gi,
    /style\s*=\s*'[^']*'/gi,
    /\.\w+\s*\{[^}]*\}/gi,
    /#[a-fA-F0-9]{3,6}/g,
    /rgba?\([^)]*\)/gi,
  ];

  cssPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // 3. Eliminar menús concatenados (patrones como "Material EscolarPsicomotricidad...")
  const menuPatterns = [
    /Material\s*Escolar[A-Z][a-z]+/gi,
    /DEPORTE\s*INDIVIDUAL[A-Z][a-z]+/gi,
    /DEPORTES\s*COLECTIVOS[A-Z][a-z]+/gi,
    /MATERIAL\s*DEPORTIVO\s*COMPLEMENTARIO[A-Z][a-z]+/gi,
    /EQUIPACI[ÓO]N\s*T[ÉE]XTIL[A-Z][a-z]+/gi,
    /Home[A-Z][a-z]+/gi,
    /Mi\s*cesta[A-Z][a-z]+/gi,
  ];

  menuPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // 4. Eliminar atributos HTML problemáticos
  const htmlAttributePatterns = [
    /data-hook\s*=\s*"[^"]*"/gi,
    /data-hook\s*=\s*'[^']*'/gi,
    /data-[a-z-]+\s*=\s*"[^"]*"/gi,
    /data-[a-z-]+\s*=\s*'[^']*'/gi,
    /aria-[a-z-]+\s*=\s*"[^"]*"/gi,
    /aria-[a-z-]+\s*=\s*'[^']*'/gi,
    /class\s*=\s*"[^"]*"/gi,
    /class\s*=\s*'[^']*'/gi,
    /id\s*=\s*"[^"]*"/gi,
    /id\s*=\s*'[^']*'/gi,
  ];

  htmlAttributePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // 5. Eliminar tags HTML pero mantener el contenido si es texto legible
  // Primero, preservar contenido de párrafos y listas
  cleaned = cleaned.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n');
  cleaned = cleaned.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');
  cleaned = cleaned.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '$1\n');
  cleaned = cleaned.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1');
  cleaned = cleaned.replace(/<em[^>]*>(.*?)<\/em>/gi, '$1');
  cleaned = cleaned.replace(/<b[^>]*>(.*?)<\/b>/gi, '$1');
  cleaned = cleaned.replace(/<i[^>]*>(.*?)<\/i>/gi, '$1');
  
  // Eliminar todos los demás tags HTML
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // 6. Eliminar comentarios HTML/JS
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  cleaned = cleaned.replace(/\/\/[^\n]*/g, '');

  // 7. Eliminar URLs largas o enlaces
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/gi, '');
  cleaned = cleaned.replace(/www\.[^\s]+/gi, '');

  // 8. Eliminar caracteres de control y espacios múltiples
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // 9. Eliminar líneas que parecen código (muchos caracteres especiales seguidos)
  const lines = cleaned.split('\n');
  const cleanedLines = lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return false;
    
    // Si la línea tiene muchos caracteres especiales de código, eliminarla
    const specialCharCount = (trimmed.match(/[{}();=<>\[\]\/\\]/g) || []).length;
    if (specialCharCount > trimmed.length * 0.3) return false;
    
    // Si la línea parece ser código JavaScript/CSS, eliminarla
    if (/^(var|const|let|function|class|import|export|return|if|else|for|while)\s/.test(trimmed)) {
      return false;
    }
    
    // Si la línea es solo caracteres especiales, eliminarla
    if (/^[^a-zA-Z0-9\s]+$/.test(trimmed)) {
      return false;
    }
    
    return true;
  });

  cleaned = cleanedLines.join('\n').trim();

  // 10. Extraer variantes si están en formato JSON comentado
  const variantsMatch = cleaned.match(/<!--\s*VARIANTES:\s*({.*?})\s*-->/);
  if (variantsMatch) {
    try {
      const variants = JSON.parse(variantsMatch[1]);
      const variantsText = Object.entries(variants)
        .map(([key, values]: [string, any]) => {
          if (Array.isArray(values) && values.length > 0) {
            return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${values.join(', ')}`;
          }
          return null;
        })
        .filter(Boolean)
        .join(' | ');
      
      if (variantsText) {
        cleaned = cleaned.replace(/<!--\s*VARIANTES:[\s\S]*?-->/g, '');
        cleaned += `\n\nVariantes disponibles: ${variantsText}`;
      }
    } catch (e) {
      // Ignorar errores de parsing
      cleaned = cleaned.replace(/<!--\s*VARIANTES:[\s\S]*?-->/g, '');
    }
  }

  // 11. Limpiar secciones de "DETALLES TÉCNICOS" duplicadas o mal formateadas
  cleaned = cleaned.replace(/DETALLES\s*T[ÉE]CNICOS:[\s\S]*?DETALLES\s*T[ÉE]CNICOS:/gi, '');
  
  // 12. EXTRAER SOLO EL PRIMER PÁRRAFO DESCRIPTIVO
  // Dividir por párrafos (doble salto de línea o etiquetas <p>)
  const paragraphs = cleaned.split(/\n\s*\n|<p[^>]*>/i);
  
  // Buscar el primer párrafo que tenga contenido descriptivo (más de 20 caracteres, no solo código)
  let firstDescriptiveParagraph = '';
  for (const para of paragraphs) {
    const trimmed = para
      .replace(/<\/p>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
    
    // Debe tener al menos 20 caracteres y no ser solo código
    if (trimmed.length >= 20) {
      // Verificar que no sea principalmente código
      const codeCharCount = (trimmed.match(/[{}();=<>\[\]\/\\]/g) || []).length;
      if (codeCharCount < trimmed.length * 0.2) {
        firstDescriptiveParagraph = trimmed;
        break;
      }
    }
  }

  // Si encontramos un párrafo descriptivo, usarlo; si no, usar lo que tenemos
  if (firstDescriptiveParagraph) {
    cleaned = firstDescriptiveParagraph;
  }

  // 13. Si después de limpiar queda muy poco texto, usar un mensaje por defecto
  if (cleaned.trim().length < 20) {
    return 'Consultar especificaciones técnicas.';
  }

  // 14. Limitar longitud máxima (solo el primer párrafo, máximo 500 caracteres)
  if (cleaned.length > 500) {
    // Intentar cortar en un punto, coma o espacio
    const cutIndex = Math.min(
      cleaned.lastIndexOf('.', 500),
      cleaned.lastIndexOf(',', 500),
      cleaned.lastIndexOf(' ', 500)
    );
    if (cutIndex > 200) {
      cleaned = cleaned.substring(0, cutIndex + 1);
    } else {
      cleaned = cleaned.substring(0, 500) + '...';
    }
  }

  return cleaned.trim();
}

async function main() {
  console.log('🧹 Iniciando limpieza de descripciones...\n');

  try {
    // Obtener todos los productos
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    });

    console.log(`📦 Total de productos encontrados: ${products.length}\n`);

    let updated = 0;
    let skipped = 0;
    const errors: Array<{ product: string; error: string }> = [];

    for (const product of products) {
      try {
        const originalDescription = product.description || '';
        const cleanedDescription = cleanDescription(originalDescription);

        // Solo actualizar si la descripción cambió
        if (cleanedDescription !== originalDescription) {
          await prisma.product.update({
            where: { id: product.id },
            data: { description: cleanedDescription },
          });

          updated++;
          console.log(`✅ Limpiado: ${product.name}`);
          console.log(`   Antes: ${originalDescription.substring(0, 100)}...`);
          console.log(`   Después: ${cleanedDescription.substring(0, 100)}...\n`);
        } else {
          skipped++;
        }
      } catch (error: any) {
        console.error(`❌ Error al limpiar ${product.name}:`, error.message);
        errors.push({
          product: product.name,
          error: error.message,
        });
        skipped++;
      }
    }

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE LIMPIEZA');
    console.log('='.repeat(60));
    console.log(`✅ Productos actualizados: ${updated}`);
    console.log(`⏭️  Productos sin cambios: ${skipped}`);
    console.log(`📦 Total procesados: ${products.length}`);

    if (errors.length > 0) {
      console.log(`\n❌ Errores encontrados: ${errors.length}`);
      errors.slice(0, 10).forEach(({ product, error }) => {
        console.log(`   - ${product}: ${error}`);
      });
      if (errors.length > 10) {
        console.log(`   ... y ${errors.length - 10} errores más`);
      }
    }

    console.log('\n✅ Limpieza completada!');
  } catch (error: any) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);

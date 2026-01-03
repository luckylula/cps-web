import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Validar el token de autenticación
function validateAuthToken(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = request.headers.get('x-api-key');
  
  // Verificar Authorization Bearer token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const expectedToken = process.env.ADMIN_API_TOKEN;
    if (expectedToken && token === expectedToken) {
      return true;
    }
  }
  
  // Verificar X-API-Key header
  if (apiKey) {
    const expectedKey = process.env.ADMIN_API_KEY;
    if (expectedKey && apiKey === expectedKey) {
      return true;
    }
  }
  
  return false;
}

// Validar los datos del producto
function validateProductData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('El nombre del producto es obligatorio');
  }
  
  if (!data.slug || typeof data.slug !== 'string' || data.slug.trim().length === 0) {
    errors.push('El slug del producto es obligatorio');
  }
  
  if (!data.categorySlug || typeof data.categorySlug !== 'string') {
    errors.push('El categorySlug es obligatorio');
  }
  
  if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
    errors.push('El precio debe ser un número positivo');
  }
  
  if (data.stock !== undefined && (typeof data.stock !== 'number' || data.stock < 0 || !Number.isInteger(data.stock))) {
    errors.push('El stock debe ser un número entero positivo');
  }
  
  if (data.images && !Array.isArray(data.images)) {
    errors.push('Las imágenes deben ser un array');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Generar slug desde el nombre si no se proporciona
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
}

export async function POST(request: Request) {
  try {
    // Validar autenticación
    if (!validateAuthToken(request)) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere un token de autenticación válido.' },
        { status: 401 }
      );
    }

    // Parsear el body
    const body = await request.json();
    
    // Soporte para un solo producto o un array de productos
    const productsData = Array.isArray(body) ? body : [body];
    
    const results = [];
    const errors = [];

    for (const productData of productsData) {
      try {
        // Validar datos
        const validation = validateProductData(productData);
        if (!validation.valid) {
          errors.push({
            product: productData.name || 'Producto sin nombre',
            errors: validation.errors,
          });
          continue;
        }

        // Generar slug si no se proporciona
        const slug = productData.slug || generateSlug(productData.name);

        // Buscar la categoría por slug
        const category = await prisma.category.findUnique({
          where: { slug: productData.categorySlug },
        });

        if (!category) {
          errors.push({
            product: productData.name,
            errors: [`La categoría con slug "${productData.categorySlug}" no existe`],
          });
          continue;
        }

        // Preparar datos del producto
        const productToCreate = {
          name: productData.name.trim(),
          slug: slug.trim(),
          description: productData.description?.trim() || `${productData.name}. Producto de calidad para uso deportivo.`,
          price: productData.price || 0,
          stock: productData.stock || 0,
          categoryId: category.id,
          subcategory: productData.subcategory?.trim() || null,
          published: productData.published !== undefined ? productData.published : true,
          featured: productData.featured || false,
          images: productData.images || [],
        };

        // Crear o actualizar el producto (upsert)
        const product = await prisma.product.upsert({
          where: { slug: productToCreate.slug },
          update: {
            name: productToCreate.name,
            description: productToCreate.description,
            price: productToCreate.price,
            stock: productToCreate.stock,
            categoryId: productToCreate.categoryId,
            subcategory: productToCreate.subcategory,
            published: productToCreate.published,
            featured: productToCreate.featured,
            images: productToCreate.images,
          },
          create: productToCreate,
        });

        results.push({
          success: true,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
          },
        });
      } catch (error: any) {
        errors.push({
          product: productData.name || 'Producto desconocido',
          errors: [error.message || 'Error al procesar el producto'],
        });
      }
    }

    // Respuesta
    const response: any = {
      success: errors.length === 0,
      processed: results.length,
      failed: errors.length,
      results,
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    const statusCode = errors.length === 0 ? 200 : errors.length === productsData.length ? 400 : 207; // 207 Multi-Status

    return NextResponse.json(response, { status: statusCode });
  } catch (error: any) {
    console.error('Error en API admin/products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al procesar la solicitud',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar que la API está funcionando (solo con autenticación)
export async function GET(request: Request) {
  if (!validateAuthToken(request)) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: 'API de administración de productos activa',
    endpoints: {
      POST: 'Crear o actualizar productos',
    },
    requiredFields: {
      name: 'string (obligatorio)',
      categorySlug: 'string (obligatorio)',
      slug: 'string (opcional, se genera automáticamente si no se proporciona)',
      description: 'string (opcional)',
      price: 'number (opcional, default: 0)',
      stock: 'number (opcional, default: 0)',
      subcategory: 'string (opcional)',
      published: 'boolean (opcional, default: true)',
      featured: 'boolean (opcional, default: false)',
      images: 'array (opcional)',
    },
  });
}

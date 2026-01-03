# API de Administración de Productos

Esta API permite crear y actualizar productos desde n8n usando Google Sheets.

## Configuración

### Variables de Entorno

Añade estas variables a tu archivo `.env`:

```env
ADMIN_API_TOKEN=tu_token_secreto_aqui
# O alternativamente:
ADMIN_API_KEY=tu_api_key_secreta_aqui
```

**Importante**: Usa un token fuerte y seguro. Puedes generar uno con:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Endpoint

**URL**: `/api/admin/products`

**Método**: `POST`

**Autenticación**: 
- Header `Authorization: Bearer <ADMIN_API_TOKEN>`
- O header `X-API-Key: <ADMIN_API_KEY>`

## Formato de la Petición

### Producto Individual

```json
{
  "name": "Nombre del Producto",
  "categorySlug": "material-escolar",
  "slug": "nombre-del-producto",
  "description": "Descripción del producto",
  "price": 29.99,
  "stock": 50,
  "subcategory": "Psicomotricidad",
  "published": true,
  "featured": false,
  "images": ["https://example.com/imagen.jpg"]
}
```

### Múltiples Productos (Array)

```json
[
  {
    "name": "Producto 1",
    "categorySlug": "material-escolar",
    "price": 29.99
  },
  {
    "name": "Producto 2",
    "categorySlug": "deporte-individual",
    "price": 39.99
  }
]
```

## Campos

### Obligatorios
- `name` (string): Nombre del producto
- `categorySlug` (string): Slug de la categoría (ej: "material-escolar", "deporte-individual")

### Opcionales
- `slug` (string): Slug único del producto. Si no se proporciona, se genera automáticamente desde el nombre
- `description` (string): Descripción del producto. Si no se proporciona, se genera una descripción por defecto
- `price` (number): Precio del producto (default: 0)
- `stock` (number): Stock disponible (default: 0)
- `subcategory` (string): Subcategoría del producto (ej: "Psicomotricidad", "Tenis de Mesa")
- `published` (boolean): Si el producto está publicado (default: true)
- `featured` (boolean): Si el producto es destacado (default: false)
- `images` (array): Array de URLs de imágenes

## Ejemplo de Uso desde n8n

### HTTP Request Node

**URL**: `https://tu-dominio.com/api/admin/products`

**Method**: `POST`

**Headers**:
```
Authorization: Bearer tu_token_secreto
Content-Type: application/json
```

**Body** (desde Google Sheets):
```json
{
  "name": "{{ $json.Nombre }}",
  "categorySlug": "{{ $json.Categoria }}",
  "slug": "{{ $json.Slug }}",
  "description": "{{ $json.Descripcion }}",
  "price": {{ $json.Precio }},
  "stock": {{ $json.Stock }},
  "subcategory": "{{ $json.Subcategoria }}",
  "published": true,
  "images": ["{{ $json.Imagen }}"]
}
```

## Respuestas

### Éxito (200)
```json
{
  "success": true,
  "processed": 1,
  "failed": 0,
  "results": [
    {
      "success": true,
      "product": {
        "id": "clx...",
        "name": "Nombre del Producto",
        "slug": "nombre-del-producto"
      }
    }
  ]
}
```

### Error Parcial (207 Multi-Status)
Cuando algunos productos fallan:
```json
{
  "success": false,
  "processed": 1,
  "failed": 1,
  "results": [...],
  "errors": [
    {
      "product": "Producto con error",
      "errors": ["Mensaje de error"]
    }
  ]
}
```

### Error de Autenticación (401)
```json
{
  "error": "No autorizado. Se requiere un token de autenticación válido."
}
```

## Características

- ✅ Autenticación mediante token o API key
- ✅ Validación de datos
- ✅ Soporte para productos individuales o arrays
- ✅ Upsert: crea o actualiza productos existentes
- ✅ Generación automática de slug si no se proporciona
- ✅ Validación de que la categoría existe
- ✅ Manejo de errores detallado
- ✅ Soporte para subcategorías

## Categorías Disponibles

- `material-escolar`
- `deporte-individual`
- `deportes-colectivos`
- `material-complementario`
- `equipacion-textil`

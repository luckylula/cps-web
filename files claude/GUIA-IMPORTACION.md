# 📋 GUÍA COMPLETA: IMPORTAR WORKFLOWS N8N

## ✅ ARCHIVOS CREADOS

1. **workflow-jim-sports.json** - Sincronización Jim Sports (cada 4 horas)
2. **workflow-made-for-sport.json** - Sincronización Made for Sport (cada 24 horas)

---

## 🚀 PASO 1: IMPORTAR WORKFLOWS EN N8N

### A) Importar Jim Sports

1. Ve a: https://n8n.lulamartinezperez.com
2. En la esquina superior derecha, busca el botón **"+"** o **"Import"**
3. Click en **"Import from File"** o **"Import Workflow"**
4. Selecciona el archivo: **workflow-jim-sports.json**
5. Click en **"Import"** o **"Open"**
6. ✅ El workflow aparecerá con todos los nodos conectados

### B) Importar Made for Sport

1. Repite el mismo proceso
2. Selecciona: **workflow-made-for-sport.json**
3. Click en **"Import"**
4. ✅ Segundo workflow importado

---

## 🔧 PASO 2: CONFIGURAR CREDENCIAL NEON (UNA SOLA VEZ)

Esta credencial se usa para AMBOS workflows.

### A) Crear credencial PostgreSQL

1. En n8n, ve a **Settings** (⚙️ arriba a la derecha)
2. Click en **"Credentials"**
3. Click en **"+ Add Credential"**
4. Busca y selecciona **"Postgres"**
5. Rellena los campos:

```
Name: Neon PostgreSQL
Host: ep-round-frog-agng8dqn-pooler.c-2.eu-central-1.aws.neon.tech
Database: neondb
User: neondb_owner
Password: npg_n70fjEHqAKak
Port: 5432
SSL: Enable (activar checkbox)
```

6. Click en **"Save"**
7. ✅ Credencial creada

### B) Asignar credencial a workflows

**Para Jim Sports:**
1. Abre el workflow "Sync Jim Sports CSV"
2. Click en el nodo **"Insert to Neon"** (el último nodo)
3. En "Credential to connect with", selecciona **"Neon PostgreSQL"**
4. Click en **"Save"** (arriba a la derecha del workflow)

**Para Made for Sport:**
1. Abre el workflow "Sync Made for Sport CSV"
2. Click en el nodo **"Insert to Neon"**
3. Selecciona **"Neon PostgreSQL"**
4. Click en **"Save"**

---

## ✅ PASO 3: VERIFICAR URL MADE FOR SPORT

El workflow de Made for Sport ya tiene configurada la URL correcta:

**URL:** `https://madeforsport.eu/csv/productoses.csv`

Este CSV se actualiza diariamente de forma automática en el servidor de Made for Sport.

Si necesitas verificar o cambiar la URL:
1. Abre el workflow "Sync Made for Sport CSV"
2. Click en el nodo **"Download CSV Made for Sport"**
3. Verifica que la URL sea: `https://madeforsport.eu/csv/productoses.csv`
4. Click en **"Save"**

---

## 🧪 PASO 4: PROBAR LOS WORKFLOWS

### A) Probar Jim Sports

1. Abre el workflow "Sync Jim Sports CSV"
2. Click en **"Execute Workflow"** (arriba a la derecha)
3. Espera 30-60 segundos
4. Verás los nodos ejecutándose en verde ✅
5. Si todo está bien, verás mensajes de éxito

### B) Verificar en Neon

1. Ve a Neon: https://console.neon.tech
2. Abre SQL Editor
3. Ejecuta:

```sql
-- Ver cuántos productos se insertaron
SELECT COUNT(*) FROM "Product" WHERE proveedor = 'jim_sports';

-- Ver algunos productos
SELECT id, proveedor, sku_interno, name, stock 
FROM "Product" 
WHERE proveedor = 'jim_sports' 
LIMIT 5;
```

4. Deberías ver productos de Jim Sports ✅

### C) Probar Made for Sport (cuando tengas la URL)

1. Abre el workflow "Sync Made for Sport CSV"
2. Click en **"Execute Workflow"**
3. Verifica en Neon:

```sql
SELECT COUNT(*) FROM "Product" WHERE proveedor = 'made_for_sport';
```

---

## ⏰ PASO 5: ACTIVAR SINCRONIZACIÓN AUTOMÁTICA

### A) Activar Jim Sports (cada 4 horas)

1. Abre el workflow "Sync Jim Sports CSV"
2. En la esquina superior derecha, verás un toggle **"Inactive / Active"**
3. Click para cambiar a **"Active"**
4. ✅ El workflow se ejecutará automáticamente cada 4 horas

Horarios: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00

### B) Activar Made for Sport (cada 24 horas)

1. Abre el workflow "Sync Made for Sport CSV"
2. Toggle a **"Active"**
3. ✅ Se ejecutará todos los días a las 2:00 AM

---

## 📊 ESTRUCTURA DE DATOS

### Jim Sports → Tabla "Product"

```
CSV Columna → Campo BD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
column_0 (REF_PATRON) → ref_proveedor
column_1 (REF_VARIANTE) → ref_variante
column_2 (EAN) → ean
column_3 (STOCK) → stock
column_4 (NOMBRE) → name
column_5 (MARCA) → marca
column_6 (IMAGEN) → images (array)
column_7 (CATEGORIA) → categoria_texto
column_8 (CATEGORIA_PADRE) → categoria_padre
column_9 (COLOR) → color
column_10 (TALLAJE) → talla

Adicional:
- proveedor = 'jim_sports'
- sku_interno = generado automático (ej: J-PELOTA123)
- published = true
- activo = true
```

### Made for Sport → Tabla "Product"

```
CSV Columna → Campo BD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
column_0 (Nombre) → name
column_1 (Precio) → price
column_2 (SKU) → ref_proveedor
column_3 (EAN) → ean
column_4 (Stock) → stock
column_5 (Descripción) → description
column_6 (URLs Imágenes) → images (array, split por comas)

Adicional:
- proveedor = 'made_for_sport'
- sku_interno = generado automático (ej: MF-888415)
- published = true
- activo = true
```

---

## 🔍 VERIFICACIÓN FINAL

Después de activar ambos workflows, verifica que todo funcione:

```sql
-- Ver todos los productos por proveedor
SELECT proveedor, COUNT(*) as total
FROM "Product"
GROUP BY proveedor;

-- Ver últimos 10 productos insertados
SELECT sku_interno, proveedor, name, stock, "createdAt"
FROM "Product"
ORDER BY "createdAt" DESC
LIMIT 10;

-- Ver productos con imágenes
SELECT sku_interno, name, images
FROM "Product"
WHERE array_length(images, 1) > 0
LIMIT 5;
```

---

## ⚠️ PROBLEMAS COMUNES

### 1. Error en nodo Postgres
**Causa:** Credencial mal configurada
**Solución:** Revisa que los datos de Neon sean correctos

### 2. CSV no se descarga
**Causa:** URL incorrecta o red bloqueada
**Solución:** Verifica la URL, prueba en el navegador

### 3. Datos no aparecen en Neon
**Causa:** Workflow no ejecutó completamente
**Solución:** Revisa los logs de ejecución en n8n

### 4. Error "duplicate key"
**Causa:** Producto ya existe
**Solución:** Es normal, el ON CONFLICT lo actualiza automáticamente

---

## 📞 SIGUIENTE PASO: CONECTAR CON NEXT.JS

Una vez que tengas productos en Neon, dile a Cursor:

```
"He actualizado la tabla Product en Neon con productos de múltiples proveedores.
Ahora tiene estos campos nuevos:
- proveedor (jim_sports, made_for_sport)
- sku_interno (J-XXX, MF-XXX)
- marca
- categoria_texto

Actualiza la aplicación Next.js para:
1. Mostrar estos nuevos campos
2. Filtrar por proveedor si quiero
3. Usar categoria_texto en vez de categoryId
4. Mostrar el sku_interno en cada producto"
```

---

## ✅ CHECKLIST FINAL

- [ ] Workflows importados en n8n
- [ ] Credencial Neon configurada
- [ ] URL Made for Sport actualizada (cuando la tengas)
- [ ] Jim Sports probado manualmente
- [ ] Productos visibles en Neon
- [ ] Workflows activados
- [ ] Next.js actualizado (con Cursor)
- [ ] Web funcionando con nuevos productos

---

## 🎉 ¡LISTO!

Tus workflows están configurados y sincronizando productos automáticamente.

**Jim Sports:** Cada 4 horas
**Made for Sport:** Cada 24 horas (2 AM)

Todos los productos se guardan en tabla "Product" de Neon, que tu web Next.js lee automáticamente.

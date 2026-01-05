# 🔍 Guía: Verificar DATABASE_URL en Vercel

## ⚠️ Problema Común

Si la web en Vercel sale vacía (sin productos), es muy probable que la `DATABASE_URL` en Vercel sea diferente a la que usas localmente. Esto significa que Vercel está conectándose a una base de datos diferente o incorrecta.

## ✅ Solución: Verificar y Sincronizar DATABASE_URL

### Paso 1: Verificar DATABASE_URL Local

1. **Ejecuta el script de verificación:**
   ```bash
   npm run verify:db
   ```

2. **Anota la información que muestra:**
   - Host de la base de datos
   - Nombre de la base de datos
   - Número de productos y categorías

### Paso 2: Obtener tu DATABASE_URL Local

La `DATABASE_URL` local está en tu archivo `.env.local` (no está en el repositorio por seguridad).

**Formato típico de Neon:**
```
postgresql://usuario:password@host.neon.tech/database?sslmode=require
```

### Paso 3: Verificar DATABASE_URL en Vercel

1. **Ve a tu proyecto en Vercel:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto `cps_web`

2. **Navega a Settings:**
   - Click en "Settings" en el menú superior
   - Click en "Environment Variables" en el menú lateral

3. **Busca `DATABASE_URL`:**
   - Deberías ver una variable llamada `DATABASE_URL`
   - Verifica que el valor sea **exactamente igual** al de tu `.env.local`

4. **Compara los valores:**
   - Host: Debe ser el mismo (ej: `ep-xxx-xxx.us-east-2.aws.neon.tech`)
   - Database: Debe ser el mismo nombre
   - User: Debe ser el mismo usuario

### Paso 4: Actualizar DATABASE_URL en Vercel (si es necesario)

Si la URL es diferente:

1. **Click en "Edit" en la variable `DATABASE_URL`**

2. **Copia el valor exacto de tu `.env.local`:**
   - Abre `.env.local` en tu editor
   - Copia toda la línea `DATABASE_URL=...`
   - Pega solo la parte después del `=` en Vercel

3. **Selecciona los entornos:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **Click en "Save"**

5. **Redeploy:**
   - Ve a "Deployments"
   - Click en los 3 puntos del último deployment
   - Click en "Redeploy"

### Paso 5: Verificar que Funciona

Después del redeploy:

1. **Abre tu web en Vercel**
2. **Verifica que los productos aparezcan**
3. **Si sigue vacía, ejecuta localmente:**
   ```bash
   npm run verify:db
   ```
   Y compara los resultados con lo que ves en la web

## 🔧 Script de Verificación

He creado un script que verifica la conexión y muestra información útil:

```bash
npm run verify:db
```

Este script:
- ✅ Verifica que DATABASE_URL esté definida
- ✅ Prueba la conexión a la base de datos
- ✅ Muestra el número de productos y categorías
- ✅ Muestra ejemplos de productos
- ✅ Ayuda a identificar problemas de conexión

## 📋 Checklist de Verificación

- [ ] `DATABASE_URL` existe en `.env.local` localmente
- [ ] `DATABASE_URL` existe en Vercel (Settings > Environment Variables)
- [ ] Ambos valores son **exactamente iguales**
- [ ] Ambos apuntan a la misma base de datos Neon
- [ ] El script `npm run verify:db` funciona localmente
- [ ] La web en Vercel muestra productos después del redeploy

## ⚠️ Errores Comunes

### Error: "does not exist"
- **Causa:** La base de datos no existe o la URL es incorrecta
- **Solución:** Verifica que la URL apunte a la base de datos correcta en Neon

### Error: "password authentication failed"
- **Causa:** Credenciales incorrectas
- **Solución:** Verifica que el usuario y contraseña en la URL sean correctos

### Error: "timeout"
- **Causa:** Problema de conectividad o firewall
- **Solución:** Verifica que Neon permita conexiones desde Vercel

### Web vacía pero script local funciona
- **Causa:** DATABASE_URL diferente en Vercel
- **Solución:** Sincroniza la URL exactamente como se describe arriba

## 💡 Tips

1. **Usa la misma base de datos para desarrollo y producción:**
   - Esto asegura que los datos sean consistentes
   - Facilita el debugging

2. **Guarda la URL de forma segura:**
   - Nunca la subas a Git
   - Usa `.env.local` localmente
   - Usa Environment Variables en Vercel

3. **Verifica después de cada cambio:**
   - Ejecuta `npm run verify:db` después de cambios importantes
   - Verifica la web en Vercel después de cada deploy

## 🆘 Si el Problema Persiste

1. **Verifica en Neon:**
   - Ve a tu proyecto en Neon
   - Verifica que la base de datos tenga datos
   - Verifica que las tablas existan

2. **Revisa los logs de Vercel:**
   - Ve a "Deployments" > Click en el deployment
   - Revisa "Build Logs" y "Function Logs"
   - Busca errores relacionados con la base de datos

3. **Prueba la conexión manualmente:**
   - Usa un cliente SQL (pgAdmin, DBeaver, etc.)
   - Conecta usando la misma DATABASE_URL
   - Verifica que puedas ver los datos

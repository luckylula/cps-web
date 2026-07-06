# Configurar Redsys (TPV Virtual) para pagos

## Variables de entorno

Añade estas variables en `.env.local` (desarrollo) y en el panel de tu hosting (Vercel, etc.) para **producción**:

```env
# Redsys / TPV Virtual BBVA
REDSYS_MERCHANT_CODE=370080988
REDSYS_TERMINAL=001
REDSYS_SECRET_KEY=           # Clave de producción (ver abajo)
REDSYS_ENV=production        # 'sandbox' pruebas | 'production' pagos reales
REDSYS_MERCHANT_NAME=CONTROL PLAY SERVICES

# URL pública del sitio (URLs de retorno y notificaciones)
NEXT_PUBLIC_URL=https://cpmaterialdeportivo.com
```

> Con `REDSYS_ENV=production` la librería usa automáticamente la URL real de Redsys  
> (`https://sis.redsys.es/sis/realizarPago`). No hace falta cambiar código.

## Paso a producción (BBVA)

Cuando BBVA valida tu web, debes hacer **solo esto**:

1. **Obtener la clave secreta de producción**
   - Entra en https://canales.redsys.es/portalBBVA
   - Usuario: `370080988`
   - Contraseña: «He olvidado mi contraseña» (te llega al email del comercio)
   - Menú: **Comercios → Consultar → Ver clave** (introduce tu contraseña del panel)
   - Copia la clave SHA256 que se muestra unos segundos

2. **Actualizar variables en Vercel** (Settings → Environment Variables → **Production**):
   - `REDSYS_ENV` → `production` (exactamente, minúsculas, sin espacios)
   - `REDSYS_MERCHANT_CODE` → `370080988`
   - `REDSYS_TERMINAL` → `001`
   - `REDSYS_SECRET_KEY` → la clave real del panel (sustituye la de test)
   - `NEXT_PUBLIC_URL` → `https://cpmaterialdeportivo.com`

   > **Importante:** las variables deben estar en el entorno **Production**, no solo en Preview o Development. Tras guardarlas, haz un **Redeploy** (Deployments → ⋯ → Redeploy).

3. **Comprobar que estás en producción** (antes de pagar de nuevo):
   - Abre DevTools (F12) → pestaña **Red/Network**
   - Inicia un pago y busca la petición `POST /api/checkout/redsys`
   - En la respuesta JSON:
     - `redsysEnv` debe ser `"production"`
     - `form.formAction` debe contener `sis.redsys.es` (sin la `-t`)
   - Si ves `sis-t.redsys.es` o `redsysEnv: "sandbox"`, sigues en pruebas.

4. **Redeploy** del proyecto para que cargue las nuevas variables.

5. **Pruebas recomendadas por BBVA** (con dinero real; luego puedes devolver desde el panel):
   - Tarjeta **autorizada**: una compra real pequeña
   - Tarjeta **denegada**: `1111111111111117`
   - Bizum **autorizado**: teléfono con Bizum activo
   - Bizum **denegado**: cancelar en la pantalla de pago
   - Comprobar en el panel: **Consultas** (operaciones) y **Notificación** (que llegan al servidor)

## Señales de que sigues en pruebas

| Síntoma | Entorno |
|---------|---------|
| Pantalla **«Simulador de autenticación EMV3DS»** con opciones Autenticación con éxito / Denegar | **Sandbox** (`sis-t.redsys.es`) |
| Tarjeta real rechazada tras el simulador | Normal en sandbox: ahí solo funcionan tarjetas de test |
| URL de pago contiene `sis-t.redsys.es` | Sandbox |
| URL de pago contiene `sis.redsys.es` (sin `-t`) | Producción |

## Entornos

| Variable | Sandbox (pruebas) | Producción |
|----------|-------------------|------------|
| `REDSYS_ENV` | `sandbox` | `production` |
| URL pasarela | `sis-t.redsys.es` | `sis.redsys.es` |
| Clave secreta | Clave de test del panel de pruebas | Clave real del portal BBVA |
| Panel admin | https://sis-t.redsys.es:25443/canales/bbva/ | https://canales.redsys.es/portalBBVA |

## Dónde obtener los datos

Tu cliente debe solicitar al banco (BBVA u otro que use Redsys):

1. **Código de comercio (Merchant Code / FUC)**: Identificador único del comercio
2. **Terminal**: Número de terminal (suele ser 001)
3. **Clave secreta**: Clave para firmar las peticiones (SHA256)

## URLs de notificación

Redsys enviará notificaciones a:

- **Notificación (POST)**: `{NEXT_PUBLIC_URL}/api/checkout/redsys/notification`
- **Éxito (redirect)**: `{NEXT_PUBLIC_URL}/carrito/checkout/redsys/success`
- **Error/Cancelar (redirect)**: `{NEXT_PUBLIC_URL}/carrito/checkout/redsys/cancel`

Asegúrate de que estas URLs sean accesibles desde internet. En local, usa un túnel (ngrok) para probar las notificaciones.

## Flujo de pago

1. El usuario completa el checkout y selecciona "Tarjeta de crédito/débito"
2. Al confirmar, se crea un pedido en estado PENDING y se redirige a Redsys
3. El usuario introduce los datos de la tarjeta en la pasarela de Redsys
4. Redsys envía una notificación POST a nuestro servidor
5. Verificamos la firma y actualizamos el pedido a CONFIRMED
6. El usuario es redirigido a la página de éxito

## Soporte BBVA / Redsys

- Teléfono 24h: **912 983 609**
- Email: **soportevirtual@redsys.es** (lun–sáb 8:00–22:00)

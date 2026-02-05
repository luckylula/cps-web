# Configurar Redsys (TPV Virtual) para pagos

## Variables de entorno

Añade estas variables en `.env.local` (y en Vercel para producción):

```env
# Redsys / TPV Virtual BBVA
REDSYS_MERCHANT_CODE=    # Código de comercio (FUC) - lo proporciona el banco
REDSYS_TERMINAL=001      # Número de terminal (normalmente 001)
REDSYS_SECRET_KEY=       # Clave secreta SHA256 - la proporciona el banco
REDSYS_ENV=sandbox       # 'sandbox' para pruebas, 'production' para producción

# URL pública de tu sitio (para las URLs de retorno)
NEXT_PUBLIC_URL=https://tu-dominio.com
```

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

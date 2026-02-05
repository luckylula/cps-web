# Configurar Webhook N8N para Formulario de Contacto

## Paso 1: Crear el Webhook en N8N

1. **Abre tu instancia de N8N** (local o cloud)

2. **Crea un nuevo workflow** o abre uno existente

3. **Añade un nodo "Webhook":**
   - Arrastra el nodo "Webhook" desde el panel izquierdo
   - Configura el webhook:
     - **HTTP Method:** `POST`
     - **Path:** `/contacto-cps` (o el que prefieras)
     - **Response Mode:** `Respond When Last Node Finishes`
     - **Response Code:** `200`
     - **Response Data:** `All Entries`

4. **Activa el workflow** (toggle en la esquina superior derecha)

5. **Copia la URL del webhook:**
   - La URL aparecerá en el nodo Webhook, algo como:
     ```
     https://tu-n8n.com/webhook/contacto-cps
     ```
     o si es local:
     ```
     http://localhost:5678/webhook/contacto-cps
     ```

## Paso 2: Configurar las Variables de Entorno

Añade la URL del webhook a tu archivo `.env.local`:

```env
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/contacto-cps
```

### Webhook de prueba (para probar antes de producción)

Para enviar los mensajes al webhook de **test** (no al de producción), usa:

```env
N8N_WEBHOOK_TEST_URL=https://n8n.lulamartinezperez.com/webhook-test/contacto-cps
NEXT_PUBLIC_N8N_WEBHOOK_TEST=true
```

- `N8N_WEBHOOK_TEST_URL`: prioridad sobre `N8N_WEBHOOK_URL`; la API hace POST a esta URL de prueba
- `NEXT_PUBLIC_N8N_WEBHOOK_TEST`: muestra un banner "Usando webhook de prueba" en el formulario

Cuando tengas la URL de producción, configura `N8N_WEBHOOK_URL` y elimina estas variables.

### Modo test (sin enviar nada)

Para probar el formulario **sin enviar** datos a ningún webhook, añade:

```env
CONTACT_TEST_MODE=true
NEXT_PUBLIC_CONTACT_TEST_MODE=true
```

- `CONTACT_TEST_MODE`: la API no hace POST a N8N (solo valida y responde OK)
- `NEXT_PUBLIC_CONTACT_TEST_MODE`: muestra un banner "Modo test — Los mensajes no se envían al webhook"

**Para producción (Vercel):**
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade:
   - **Name:** `N8N_WEBHOOK_URL`
   - **Value:** La URL de tu webhook de N8N
   - Marca Production, Preview y Development
4. Guarda y haz Redeploy

## Paso 3: El Código Ya Está Listo

El archivo `app/api/contact/route.ts` ya está configurado para usar el webhook si existe la variable `N8N_WEBHOOK_URL`.

## Paso 4: Configurar N8N para Procesar el Mensaje

En N8N, después del nodo Webhook, puedes añadir:

### Opción A: Enviar Email
1. **Nodo "Send Email"** (Gmail, Outlook, SMTP, etc.)
   - **To:** `pedidos@cpsmaterialdeportivo.com`
   - **Subject:** `Nuevo mensaje: {{ $json.asunto }}`
   - **Body:** 
     ```
     De: {{ $json.nombre }}
     Email: {{ $json.email }}
     Teléfono: {{ $json.telefono || 'No proporcionado' }}
     
     Asunto: {{ $json.asunto }}
     
     Mensaje:
     {{ $json.mensaje }}
     ```

### Opción B: Guardar en Base de Datos
1. **Nodo "Postgres"** o tu base de datos
   - Inserta en una tabla de mensajes con los campos recibidos

### Opción C: Notificar por Slack/Discord/Telegram
1. **Nodo "Slack"** / **"Discord"** / **"Telegram"**
   - Envía una notificación con los datos del formulario

### Opción D: Combinación (Recomendado)
1. **Webhook** → Recibe datos
2. **Send Email** → Envía email a pedidos@cpsmaterialdeportivo.com
3. **Postgres** → Guarda en BD (opcional, para historial)
4. **Slack/Telegram** → Notificación inmediata (opcional)

## Estructura de Datos que Recibe N8N

El webhook recibirá un JSON con esta estructura:

```json
{
  "nombre": "Juan Pérez",
  "telefono": "612345678",
  "email": "juan@example.com",
  "asunto": "Consulta sobre material",
  "mensaje": "Me gustaría información sobre..."
}
```

## Ejemplo de Workflow Completo en N8N

```
[Webhook] → [Send Email] → [Postgres (opcional)] → [Slack (opcional)]
```

1. **Webhook:** Recibe el POST del formulario
2. **Send Email:** Envía email a tu bandeja de entrada
3. **Postgres:** Guarda el mensaje en BD (para historial)
4. **Slack:** Te notifica en tiempo real (opcional)

## Pruebas

1. **Prueba local:**
   ```bash
   # Asegúrate de tener N8N corriendo y el webhook activo
   # Envía un mensaje desde el formulario en localhost:3000
   ```

2. **Verifica en N8N:**
   - Ve a "Executions" en N8N
   - Deberías ver la ejecución del workflow con los datos recibidos

3. **Prueba en producción:**
   - Después del deploy en Vercel, prueba el formulario
   - Verifica que N8N reciba los datos

## Troubleshooting

### El webhook no recibe datos
- ✅ Verifica que el workflow esté **activado** en N8N
- ✅ Verifica que la URL del webhook sea correcta en `.env.local`
- ✅ Verifica que `N8N_WEBHOOK_URL` esté en Vercel Environment Variables
- ✅ Revisa los logs de Vercel (Function Logs) para ver errores

### Error 404 en el webhook
- ✅ Verifica que el path del webhook en N8N coincida con la URL completa
- ✅ Si usas N8N Cloud, asegúrate de usar la URL correcta del webhook

### Los datos no llegan correctamente
- ✅ Verifica en N8N → Executions → Ver el payload recibido
- ✅ Asegúrate de que el Content-Type sea `application/json`

## Seguridad (Opcional)

Para mayor seguridad, puedes:

1. **Añadir autenticación al webhook en N8N:**
   - En el nodo Webhook, activa "Authentication"
   - Usa "Header Auth" o "Query Auth"
   - Añade un token secreto

2. **Validar el token en la API:**
   - Añade el token en `N8N_WEBHOOK_TOKEN` en `.env.local`
   - La API lo incluirá en el header al hacer la petición

# Despliegue de la home

## Antes de publicar

Abre `index.html` y edita el bloque `CONFIGURACIÓN` al inicio del `<script>`:

- `WHATSAPP_NUMERO`: tu número real con código de país, sin `+` ni espacios (ej. `573001234567`). Ahora tiene un marcador de posición: **sin esto los botones no funcionarán**.
- `MENSAJE_DEFAULT`: el mensaje que llega prellenado a WhatsApp.
- `FECHA_DEMO`: fecha de la cuenta regresiva del teléfono de ejemplo.

## Publicar en Vercel

1. Crea un repositorio en GitHub y sube `index.html` a la raíz.
2. En vercel.com → Add New → Project → importa el repositorio.
3. Framework: **Other**. Sin build command. Deploy.
4. Cuando tengas `primeraemocion.com`, agrégalo en Settings → Domains.

## Notas

- Es un solo archivo, sin dependencias ni build: cualquier cambio se hace editando `index.html` y haciendo push.
- Los enlaces "Ver demostración" abren WhatsApp por ahora; cuando las demos (Paula, romántica, tarjeta) estén en el dominio propio, cambia el atributo `href` de cada `.sample-link` por la URL de la demo.
- El botón de Instagram apunta a `instagram.com/primeraemocion`; ajústalo si el usuario final es otro.

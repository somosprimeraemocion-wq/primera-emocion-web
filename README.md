# Primera Emoción — Sitio web

Home de **Primera Emoción**: invitaciones y experiencias digitales personalizadas para XV años, bodas y celebraciones.

🌐 [primeraemocion.com](https://primeraemocion.com)

## Sobre el sitio

Sitio estático de un solo archivo. Sin dependencias, sin framework y sin proceso de compilación: `index.html` contiene el HTML, el CSS y el JavaScript.

- `index.html` — la home completa
- `CNAME` — dominio propio para GitHub Pages

## Desarrollo

Abre `index.html` en cualquier navegador. No hace falta instalar nada ni levantar un servidor.

## Configuración

Dentro del bloque `<script>`, al final del archivo:

```js
var WHATSAPP_NUMERO = "573337582722";   // código de país + número, sin "+" ni espacios
var MENSAJE_DEFAULT = "...";            // mensaje prellenado al abrir WhatsApp
var FECHA_DEMO      = "2026-10-18...";  // cuenta regresiva de la invitación de ejemplo
```

Los enlaces de las muestras usan el atributo `data-msg` para enviar un mensaje distinto según la sección desde la que se abre WhatsApp.

## Despliegue

GitHub Pages sobre la rama `master`. Cada `git push` republica el sitio automáticamente en segundos.

---

*Todo gran momento comienza con una emoción.*

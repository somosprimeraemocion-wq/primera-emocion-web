// El endpoint público no contiene contraseñas. El panel usa una clave privada aparte.
window.INVITATION_CONFIG = Object.freeze({
  eventId: 'revelacion-ositos-2026-10-04',
  date: '2026-10-04T15:00:00-05:00',
  whatsapp: '573137509467',
  apiUrl: ['localhost', '127.0.0.1'].includes(location.hostname)
    ? 'http://127.0.0.1:8787'
    : 'https://primera-emocion-confirmaciones.cavcristhian.workers.dev',
});

// El endpoint público no contiene contraseñas. El panel usa una clave privada aparte.
window.INVITATION_CONFIG = Object.freeze({
  eventId: 'revelacion-maria-anderson-2026-10-07',
  date: '2026-10-07T15:00:00-05:00',
  whatsapp: '573168238973',
  apiUrl: ['localhost', '127.0.0.1'].includes(location.hostname)
    ? 'http://127.0.0.1:8789'
    : 'https://primera-emocion-confirmaciones-maria.cavcristhian.workers.dev',
});

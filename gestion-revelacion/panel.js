(() => {
  const $ = selector => document.querySelector(selector);
  const api = window.INVITATION_CONFIG.apiUrl;
  let token = '', records = [], refreshing = false;
  const formatDate = value => value ? new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '';
  const message = text => { $('#status').textContent = text; };
  const filtered = () => {
    const term = $('#search').value.toLocaleLowerCase('es');
    const mode = $('#filter').value;
    return records.filter(row => {
      const matches = `${row.name} ${row.companions} ${row.wish}`.toLocaleLowerCase('es').includes(term);
      return matches && (mode === 'all' || (mode === 'draft' && !row.confirmed_at && !row.whatsapp_at) || (mode === 'confirmed' && row.confirmed_at) || (mode === 'whatsapp' && row.whatsapp_at) || (mode === 'yes' && row.attendance === 'yes') || (mode === 'no' && row.attendance === 'no'));
    });
  };
  const node = (tag, text, className) => { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; };
  const render = () => {
    const visible = filtered(); $('#rows').replaceChildren(); $('#empty').hidden = visible.length > 0;
    $('#summary').textContent = `${visible.length} de ${records.length} respuestas`;
    for (const row of visible) {
      const tr = document.createElement('tr');
      const name = node('td', ''); name.append(node('strong', row.name || '(Nombre aún sin completar)'));
      if (row.companions) name.append(node('small', `Acompañantes: ${row.companions}`));
      const attendance = row.attendance === 'yes' ? `Sí · ${row.party_count} persona(s)` : row.attendance === 'no' ? 'No podrá asistir' : 'Sin elegir';
      const state = node('td', '');
      if (row.confirmed_at) state.append(node('span', 'Confirmada aquí', 'badge green'));
      if (row.whatsapp_at) state.append(node('span', 'Abrió WhatsApp', 'badge blue'));
      if (!row.confirmed_at && !row.whatsapp_at) state.append(node('span', 'Borrador', 'badge'));
      const time = node('td', formatDate(row.updated_at));
      time.append(node('small', `Primer registro: ${formatDate(row.consent_at)}`));
      const actions = node('td', ''); const remove = node('button', 'Eliminar');
      remove.addEventListener('click', async () => {
        if (!confirm(`¿Eliminar definitivamente el registro de ${row.name || 'este invitado'}?`)) return;
        remove.disabled = true;
        try {
          const response = await fetch(`${api}/admin/response?session=${encodeURIComponent(row.session)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          if (!response.ok) throw new Error(); await refresh();
        } catch { message('No se pudo eliminar el registro.'); remove.disabled = false; }
      });
      actions.append(remove);
      tr.append(name, node('td', attendance), node('td', row.prediction === 'girl' ? 'Niña · rosado' : row.prediction === 'boy' ? 'Niño · azul' : 'Sin elegir'), node('td', row.wish || '—'), state, time, actions);
      $('#rows').append(tr);
    }
  };
  async function refresh() {
    if (refreshing || !token) return;
    if (!api) { message('El servicio de registros aún no está conectado para esta dirección.'); return; }
    refreshing = true; $('#refresh').disabled = true;
    try {
      const response = await fetch(`${api}/admin/responses`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (response.status === 401) throw new Error('Clave incorrecta o acceso no configurado.');
      if (!response.ok) throw new Error('No se pudo consultar el registro. Reintenta en un momento.');
      const data = await response.json(); records = data.responses;
      $('#login').hidden = true; $('#dashboard').hidden = false; $('#token').value = '';
      $('#started').textContent = data.metrics.started || 0;
      $('#saved').textContent = records.length;
      $('#attendees').textContent = records.filter(r => r.attendance === 'yes' && r.confirmed_at).reduce((sum, r) => sum + r.party_count, 0);
      $('#updated').textContent = `Última consulta: ${formatDate(new Date())}`;
      message(records.length === data.limit ? `Se muestran los ${data.limit} registros más recientes.` : ''); render();
    } catch (error) { message(error.message || 'No se pudo conectar con el registro.'); }
    finally { refreshing = false; $('#refresh').disabled = false; }
  }
  $('#login').addEventListener('submit', event => { event.preventDefault(); token = $('#token').value.trim(); refresh(); });
  $('#refresh').addEventListener('click', refresh);
  $('#search').addEventListener('input', render); $('#filter').addEventListener('change', render);
  $('#logout').addEventListener('click', () => { token = ''; records = []; $('#rows').replaceChildren(); $('#dashboard').hidden = true; $('#login').hidden = false; message('Sesión cerrada.'); });
  $('#export').addEventListener('click', () => {
    const safeCell = value => { let text = String(value ?? ''); if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"', '""')}"`; };
    const table = [['Nombre', 'Asistencia', 'Personas', 'Acompañantes', 'Predicción', 'Deseo', 'Primer registro', 'Actualizado', 'Confirmada aquí', 'Abrió WhatsApp'], ...filtered().map(r => [r.name, r.attendance, r.party_count, r.companions, r.prediction, r.wish, r.consent_at, r.updated_at, r.confirmed_at, r.whatsapp_at])];
    const blob = new Blob(['\uFEFF', table.map(row => row.map(safeCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'respuestas-revelacion-ositos.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  setInterval(() => { if (token && !document.hidden) refresh(); }, 30000);
})();

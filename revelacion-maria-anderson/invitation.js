(() => {
  'use strict';
  const config = window.INVITATION_CONFIG;
  const $ = (selector) => document.querySelector(selector);
  const form = $('#rsvp-form');
  const status = $('#save-status');
  const music = $('#music');
  let session;
  try { session = sessionStorage.getItem(config.eventId); } catch {}
  if (!/^[a-f0-9]{64}$/.test(session || '')) {
    session = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    try { sessionStorage.setItem(config.eventId, session); } catch {}
  }
  let opened = false, timer, revision = Date.now(), queue = Promise.resolve(), confirmed = false;
  const updateQuickNav = () => document.body.classList.toggle('has-scrolled', window.scrollY > 60);
  window.addEventListener('scroll', updateQuickNav, { passive: true });
  $('.scroll-cue').addEventListener('click', () => document.body.classList.add('has-scrolled'));
  const setStatus = (text, state = '') => { status.textContent = text; status.dataset.state = state; };
  const request = async (path, data, keepalive = false) => {
    if (!config.apiUrl) throw new Error('unconfigured');
    const response = await fetch(`${config.apiUrl}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: config.eventId, session, ...data }),
      signal: keepalive ? undefined : AbortSignal.timeout(12000), keepalive,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };
  const metric = (kind) => request('/event', { kind }, true).catch(() => {});
  const musicState = () => {
    $('#music-toggle').setAttribute('aria-pressed', String(!music.paused));
    $('#music-toggle').setAttribute('aria-label', music.paused ? 'Reproducir música' : 'Pausar música');
  };
  music.addEventListener('play', musicState); music.addEventListener('pause', musicState);
  music.addEventListener('error', () => { $('#music-toggle').setAttribute('aria-label', 'La canción no está disponible'); });
  const play = () => { music.volume = .5; music.play().catch(musicState); };
  $('#music-toggle').addEventListener('click', () => music.paused ? play() : music.pause());
  $('#open').addEventListener('click', () => {
    if (opened) return; opened = true; play();
    $('#welcome').classList.add('opening'); metric('opened');
    const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 850;
    setTimeout(() => {
      $('#invitation').inert = false; document.body.classList.add('opened');
      $('#welcome').classList.add('leaving'); $('#music-toggle').hidden = false; $('#quick-nav').hidden = false;
      window.scrollTo(0, 0);
      updateQuickNav();
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
          document.body.classList.toggle('has-scrolled', entry.intersectionRatio < .75);
        }, { threshold: [.75] }).observe($('.cover'));
      }
      $('#cover-title').setAttribute('tabindex', '-1'); $('#cover-title').focus({ preventScroll: true });
      setTimeout(() => { $('#welcome').hidden = true; }, 900);
      if ('IntersectionObserver' in window) {
        document.body.classList.add('reveal-ready');
        const observer = new IntersectionObserver(entries => entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
        }), { threshold: .08 });
        document.querySelectorAll('.page').forEach(page => observer.observe(page));
      }
    }, delay);
  });
  const countdown = () => {
    const seconds = Math.max(0, Math.floor((new Date(config.date) - Date.now()) / 1000));
    const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
    ['days', 'hours', 'minutes', 'seconds'].forEach((id, i) => { $(`#${id}`).textContent = String(values[i]).padStart(2, '0'); });
  };
  countdown(); setInterval(countdown, 1000);
  const snapshot = (action) => {
    const values = new FormData(form);
    return {
      revision: ++revision, captureNotice: 'form-notice-v2', action,
      name: String(values.get('name') || '').trim(), attendance: values.get('attendance') || '',
      count: values.get('attendance') === 'no' ? 0 : Number(values.get('count') || 1),
      companions: values.get('attendance') === 'no' || Number(values.get('count')) <= 1 ? '' : String(values.get('companions') || '').trim(),
      prediction: values.get('prediction') || '', wish: String(values.get('wish') || '').trim(),
      website: values.get('website') || '',
    };
  };
  const hasContent = (data) => data.name || data.wish || data.prediction || data.attendance || data.companions;
  const save = (action = 'draft', data = snapshot(action)) => {
    clearTimeout(timer);
    if (!hasContent(data)) return Promise.resolve(false);
    const operation = async () => {
      setStatus('Guardando tu respuesta…');
      try {
        await request('/response', data, action === 'confirm_whatsapp');
        if (action === 'confirm_whatsapp') confirmed = true;
        setStatus(confirmed ? 'Respuesta registrada. Completa el envío en WhatsApp. ¡Gracias!' : 'Tus respuestas se están guardando.', 'saved');
        return true;
      } catch {
        setStatus('No pudimos guardar tus datos aquí. Puedes confirmar igualmente por WhatsApp.', 'error');
        return false;
      }
    };
    queue = queue.then(operation, operation);
    return queue;
  };
  const updatePartyFields = () => {
    const absent = form.elements.attendance.value === 'no';
    const withCompanions = !absent && Number(form.elements.count.value) > 1;
    $('#party-fields').hidden = absent;
    form.elements.count.disabled = absent;
    $('#companions-field').hidden = !withCompanions;
    form.elements.companions.disabled = !withCompanions;
    form.elements.companions.required = withCompanions;
    form.elements.companions.setCustomValidity('');
    form.elements.name.setCustomValidity('');
  };
  updatePartyFields();
  let started = false;
  form.addEventListener('input', (event) => {
    if (!started) { started = true; metric('form_started'); }
    updatePartyFields();
    clearTimeout(timer);
    timer = setTimeout(() => save(), 900);
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    form.elements.name.setCustomValidity(form.elements.name.value.trim() ? '' : 'Escribe tu nombre.');
    if (form.elements.companions.required) {
      form.elements.companions.setCustomValidity(form.elements.companions.value.trim() ? '' : 'Escribe los nombres de tus acompañantes.');
    }
    if (!form.reportValidity()) return;
    const data = snapshot('confirm_whatsapp');
    const attendance = data.attendance === 'yes' ? `Sí asistiré. Somos ${data.count} persona(s).` : 'Esta vez no podré asistir.';
    const prediction = data.prediction === 'girl' ? 'niña' : data.prediction === 'boy' ? 'niño' : '';
    const lines = ['¡Hola! Respondo a la revelación de género del 7 de octubre.', `Soy ${data.name}.`, attendance];
    if (data.companions) lines.push(`Mis acompañantes: ${data.companions}`);
    if (prediction) lines.push(`Mi corazonada: ${prediction}.`);
    if (data.wish) lines.push(`Mi deseo para el bebé: ${data.wish}`);
    $('#confirm-attendance').disabled = true;
    // Se guarda en el panel aunque el invitado no termine enviando el mensaje.
    const saving = save('confirm_whatsapp', data);
    // Abrir antes del primer await conserva el gesto de usuario en iOS.
    if (config.whatsapp) {
      window.open(`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
      metric('whatsapp_opened');
    } else {
      setStatus('Falta configurar el número de WhatsApp de la anfitriona.', 'error');
    }
    await saving;
    $('#confirm-attendance').disabled = false;
  });
  // El aviso visible del formulario explica el guardado mientras se completa.
  const flush = () => {
    clearTimeout(timer);
    const data = snapshot('draft');
    if (hasContent(data)) request('/response', data, true).catch(() => {});
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);
  window.addEventListener('online', () => save());
})();

/* Captura de correos «Spanish Grammar Pack» (gramatica.edisonspanish.com).
   POST form-urlencoded (sin preflight) a la web app de Apps Script; muestra los enlaces y los guarda en localStorage. */
(function () {
  'use strict';
  var CLAVE = 'gramatica-starter-v1';
  var EMAIL_RE = /^[A-Za-z0-9._%+'\-]+@[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
  var caja = document.getElementById('pack');
  if (!caja) return;
  var URL_APP = caja.getAttribute('data-pack-url');
  var form = caja.querySelector('.pack-form'), res = caja.querySelector('.pack-res'), msg = caja.querySelector('.pack-msg');
  var t0 = Date.now();
  form.elements.t.value = String(t0);

  function guardados() { try { return JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch (e) { return null; } }
  function guardar(l) { try { localStorage.setItem(CLAVE, JSON.stringify(l)); } catch (e) {} }
  function el(tag, attrs, txt) { var n = document.createElement(tag); for (var k in attrs || {}) n.setAttribute(k, attrs[k]); if (txt != null) n.textContent = txt; return n; }
  function buscar(links, slug) {
    var todos = (links.cuadernillos || []).concat(links.fichas || []);
    for (var i = 0; i < todos.length; i++) if (todos[i].slug === slug) return todos[i].url;
    return null;
  }

  // Cambia los enlaces 🔒 de la página por los de Drive
  function desbloquear(links) {
    document.querySelectorAll('[data-pack]').forEach(function (a) {
      var u = buscar(links, a.getAttribute('data-pack'));
      if (!u) return;
      a.href = u; a.target = '_blank'; a.rel = 'noopener'; a.removeAttribute('data-pack');
      a.innerHTML = a.innerHTML.replace('🔒', '📄');
      var li = a.closest('[data-bloqueada]'); if (li) li.removeAttribute('data-bloqueada');
    });
  }

  function mostrar(links, emailed, email) {
    res.innerHTML = '';
    var h = el('p', { 'class': 'pack-hecho' });
    h.textContent = emailed === false ? '✅ Here is your pack.' : ('✅ Here is your pack' + (email ? '. We also sent the links to ' + email + '.' : '.'));
    res.appendChild(h);
    var tema = document.querySelector('main[data-tema]');
    var slug = tema && tema.getAttribute('data-tema');
    var este = slug && buscar(links, slug);
    if (este) {
      var p = el('p', { 'class': 'pack-este' });
      var a = el('a', { 'class': 'btn', href: este, target: '_blank', rel: 'noopener' }, '📄 Open this topic\u2019s sheet (PDF)');
      p.appendChild(a); res.appendChild(p);
    }
    var det = el('details', { 'class': 'pack-lista' });
    if (!este) det.open = true;
    det.appendChild(el('summary', null, 'All ' + ((links.fichas || []).length + (links.cuadernillos || []).length) + ' PDFs'));
    ['A1', 'A2', 'B1', 'B2'].forEach(function (n) {
      var g = el('div', { 'class': 'pack-nivel', 'data-nivel': n });
      g.appendChild(el('h3', null, n));
      var ul = el('ul');
      (links.cuadernillos || []).concat(links.fichas || []).filter(function (x) { return x.nivel === n; }).forEach(function (x) {
        var li = el('li'), a = el('a', { href: x.url, target: '_blank', rel: 'noopener', lang: 'es' }, (x.slug.indexOf('cuadernillo') === 0 ? '📚 ' : '📄 ') + x.titulo);
        li.appendChild(a); ul.appendChild(li);
      });
      g.appendChild(ul); det.appendChild(g);
    });
    res.appendChild(det);
    var otro = el('button', { type: 'button', 'class': 'pack-otro' }, 'Use another email');
    otro.addEventListener('click', function () { res.hidden = true; form.hidden = false; form.elements.nombre.focus(); });
    res.appendChild(otro);
    form.hidden = true; res.hidden = false;
    desbloquear(links);
  }

  var prev = guardados();
  if (prev && prev.links) mostrar(prev.links, false);

  // Botones de PDF bloqueados → llevar al formulario
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[data-pack]');
    if (!a) return;
    ev.preventDefault();
    caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
    caja.classList.remove('pack-llamada'); void caja.offsetWidth; caja.classList.add('pack-llamada');
    if (!form.hidden) setTimeout(function () { form.elements.nombre.focus({ preventScroll: true }); }, 350);
    if (window.gtag) gtag('event', 'pack_cta', { fuente: form.elements.fuente.value, ficha: a.getAttribute('data-pack') });
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = form.elements, nombre = f.nombre.value.trim(), email = f.email.value.trim();
    var err = !nombre ? ['nombre', 'Please enter your name.'] : !EMAIL_RE.test(email) ? ['email', 'Please enter a valid email address.']
      : !f.consentimiento.checked ? ['consentimiento', 'Please tick the box so we can email you the pack.'] : null;
    ['nombre', 'email', 'consentimiento'].forEach(function (k) { f[k].removeAttribute('aria-invalid'); });
    if (err) { f[err[0]].setAttribute('aria-invalid', 'true'); f[err[0]].focus(); msg.textContent = err[1]; msg.className = 'pack-msg mal'; return; }
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true; msg.className = 'pack-msg'; msg.textContent = 'Sending…';
    var datos = new URLSearchParams(new FormData(form));
    if (Date.now() - t0 < 2600) datos.set('t', String(Date.now() - 3000)); // quien escribe muy rápido (autocompletar) no es un bot
    fetch(URL_APP, { method: 'POST', body: datos })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        btn.disabled = false;
        if (j && j.ok && j.links) {
          guardar({ links: j.links, fecha: Date.now() });
          msg.textContent = '';
          mostrar(j.links, j.emailed, email);
          res.querySelector('.pack-hecho').focus && res.querySelector('.pack-hecho').setAttribute('tabindex', '-1');
          res.querySelector('.pack-hecho').focus();
          if (window.gtag) gtag('event', 'generate_lead', { fuente: f.fuente.value });
        } else if (j && j.ok) {
          msg.textContent = 'Thank you!'; msg.className = 'pack-msg';
        } else {
          var m = { email: 'Please enter a valid email address.', name: 'Please enter your name.', consent: 'Please tick the box so we can email you the pack.', too_fast: 'Please try again.' };
          msg.textContent = m[j && j.error] || 'Something went wrong. Please try again in a minute.'; msg.className = 'pack-msg mal';
        }
      })
      .catch(function () { btn.disabled = false; msg.textContent = 'Could not connect. Please check your connection and try again.'; msg.className = 'pack-msg mal'; });
  });
})();

(() => {
  const CONTACT_EMAIL = 'ia.agiliza@gmail.com';
  const H0 = 8, H1 = 18, SPAN = H1 - H0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);
  const chat = $('#chat'), cols = [...document.querySelectorAll('.col')], log = $('#log'), sync = $('#sync'), syncText = $('#sync-text');

  // Horas da grade
  const hours = $('#hours');
  for (let h = H0 + 1; h < H1; h++) { const s = document.createElement('span'); s.style.top = ((h - H0) / SPAN * 100) + '%'; s.textContent = h + 'h'; hours.appendChild(s); }

  // Agenda base (dia 0 = qua, 1 = qui, 2 = sex)
  const BASE = [
    { id: 'a1', d: 0, s: 8.5, e: 9.5, t: 'Pedro A.', k: 'Avaliação' },
    { id: 'a2', d: 0, s: 10, e: 11.5, t: 'Helena M.', k: 'Canal' },
    { id: 'a3', d: 0, s: 12, e: 13, t: 'Almoço', block: 1 },
    { id: 'a4', d: 0, s: 14, e: 15, t: 'Otávio R.', k: 'Limpeza' },
    { id: 'a5', d: 0, s: 15.5, e: 17, t: 'Bloqueado', block: 1 },
    { id: 'b1', d: 1, s: 8, e: 9, t: 'João P.', k: 'Restauração' },
    { id: 'b2', d: 1, s: 9, e: 10, t: 'Lúcia F.', k: 'Avaliação' },
    { id: 'b3', d: 1, s: 11, e: 12, t: 'Carla S.', k: 'Canal' },
    { id: 'b4', d: 1, s: 12, e: 13, t: 'Almoço', block: 1 },
    { id: 'b5', d: 1, s: 13, e: 14, t: 'Rafael T.', k: 'Clareamento' },
    { id: 'b6', d: 1, s: 15, e: 16.5, t: 'Bruna C.', k: 'Implante' },
    { id: 'c1', d: 2, s: 8, e: 9, t: 'Tiago L.', k: 'Avaliação' },
    { id: 'c2', d: 2, s: 10, e: 12, t: 'Paula N.', k: 'Prótese' },
    { id: 'c3', d: 2, s: 12, e: 13, t: 'Almoço', block: 1 },
    { id: 'c4', d: 2, s: 13, e: 14, t: 'Diego V.', k: 'Limpeza' },
    { id: 'c5', d: 2, s: 14, e: 15, t: 'Fernanda B.', k: 'Avaliação' },
    { id: 'c6', d: 2, s: 16, e: 17, t: 'Sônia G.', k: 'Restauração' },
  ];
  const fmt = h => { const m = Math.round((h % 1) * 60); return Math.floor(h) + 'h' + (m ? String(m).padStart(2, '0') : ''); };
  const pos = (el, s, e) => { el.style.top = ((s - H0) / SPAN * 100) + '%'; el.style.height = `calc(${(e - s) / SPAN * 100}% - 2px)`; };
  const evEls = {};
  function drawEv(ev, enter) {
    const el = document.createElement('div');
    el.className = 'ev' + (ev.block ? ' block' : '') + (ev.mine ? ' mine' : '') + (ev.ok ? ' confirmed' : '') + (enter ? ' enter' : '');
    el.innerHTML = `<b>${ev.t}</b><small>${fmt(ev.s)}–${fmt(ev.e)}${ev.k ? ' · ' + ev.k : ''}</small>` + (ev.mine ? `<span class="tag">${ev.ok ? 'Confirmado' : 'Pelo WhatsApp'}</span>` : '');
    pos(el, ev.s, ev.e);
    cols[ev.d].appendChild(el); evEls[ev.id] = el;
    if (enter) requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('enter')));
    return el;
  }
  function clearOverlays() { document.querySelectorAll('.slot, .ghost').forEach(n => n.remove()); }
  function resetCal(state) {
    cols.forEach(c => c.innerHTML = ''); for (const k in evEls) delete evEls[k];
    BASE.forEach(ev => drawEv(ev));
    if (state) drawEv(state);
  }
  // Estado da consulta da Marina antes de cada cena
  const MARINA = { id: 'm', t: 'Marina C.', k: 'Limpeza', mine: 1 };
  const before = [
    null,
    { ...MARINA, d: 1, s: 14, e: 15 },
    { ...MARINA, d: 2, s: 15, e: 16 },
    { ...MARINA, d: 2, s: 15, e: 16, ok: 1 },
    { ...MARINA, d: 2, s: 15, e: 16, ok: 1 },
    null,
  ];

  // Motor
  let run = 0, paused = false, current = 0;
  const sleep = ms => new Promise((res, rej) => { const my = run; const step = () => { if (my !== run) return rej('x'); if (paused) return setTimeout(step, 150); ms -= 50; if (ms <= 0) res(); else setTimeout(step, 50); }; step(); });
  const TICK = '<svg class="tick" viewBox="0 0 16 11"><path d="M11.07.65 10.4.1a.37.37 0 0 0-.52.06L4.27 7.07 1.7 4.65a.36.36 0 0 0-.5.02l-.6.62a.37.37 0 0 0 .01.52l3.38 3.18c.15.14.39.13.52-.03L11.13 1.17a.37.37 0 0 0-.06-.52z" fill="currentColor"/><path d="M15.07.65 14.4.1a.37.37 0 0 0-.52.06L8.27 7.07l-.8-.76-.86 1.06 1.33 1.25c.15.14.39.13.52-.03L15.13 1.17a.37.37 0 0 0-.06-.52z" fill="currentColor"/></svg>';
  let clock = 14 * 60 + 27;
  const now = () => { clock += 1; return String(Math.floor(clock / 60)).padStart(2, '0') + ':' + String(clock % 60).padStart(2, '0'); };
  function bubble(cls, html) {
    const m = document.createElement('div');
    const prev = chat.lastElementChild;
    const side = cls.split(' ')[0];
    const tail = side !== 'sys' && !(prev && prev.classList.contains('msg') && prev.classList.contains(side));
    m.className = 'msg ' + cls + (tail ? ' tail' : '');
    m.innerHTML = html + (side === 'sys' ? '' : `<span class="t">${now()}${side === 'out' ? TICK : ''}</span>`);
    chat.appendChild(m); trim(); return m;
  }
  function trim() { while (chat.scrollHeight > chat.clientHeight + 4 && chat.children.length > 2) chat.removeChild(chat.children[0]); }
  const draft = $('#wa-draft'), sendBtn = $('#wa-send'), wa = document.querySelector('.wa');
  function setDraft(t) { draft.textContent = t || 'Mensagem'; draft.classList.toggle('ph', !t); sendBtn.classList.toggle('typing', !!t); wa.classList.toggle('typing-field', !!t); }
  function readAll() { chat.querySelectorAll('.tick:not(.read)').forEach(t => t.classList.add('read')); }
  async function pac(text) {
    await sleep(reduce ? 100 : 600);
    try {
      if (!reduce) { for (let i = 1; i <= text.length; i += 2) { setDraft(text.slice(0, i)); await sleep(32); } }
      setDraft(text); await sleep(reduce ? 50 : 250);
    } finally { setDraft(''); }
    bubble('out', text);
  }
  async function bot(text, note) {
    await sleep(reduce ? 50 : 500); readAll();
    await sleep(reduce ? 50 : 350);
    $('#wa-status').textContent = 'digitando...';
    try { await sleep(reduce ? 100 : 900 + Math.min(text.length * 14, 1400)); } finally { $('#wa-status').textContent = 'online'; }
    bubble('in', (note ? `<span class="note">${note}</span>` : '') + text);
  }
  function audioHtml() {
    const hs = [30,55,40,75,90,60,45,80,100,70,50,35,65,85,55,40,60,30,50,70,45,25,40,55,35,20,30,25];
    return '<span class="audio"><span class="aava">M<svg viewBox="0 0 24 24"><path d="M12 15a3.5 3.5 0 0 0 3.5-3.5v-6a3.5 3.5 0 0 0-7 0v6A3.5 3.5 0 0 0 12 15zm6-3.5h-1.7a4.3 4.3 0 0 1-8.6 0H6a6 6 0 0 0 5.1 5.9V21h1.8v-3.6a6 6 0 0 0 5.1-5.9z" fill="currentColor"/></svg></span>'
      + '<svg class="play" viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>'
      + '<span class="bars">' + hs.map((h, i) => `<i style="height:${h}%"${i === 0 ? ' class="on"' : ''}></i>`).join('') + '<span class="dur">0:07</span></span></span>';
  }
  function busy(on, text) { sync.classList.toggle('on', on); syncText.textContent = on ? (text || 'Atualizando...') : 'Sincronizado'; }
  function say(html) { log.innerHTML = html; }
  function slots(d, list) { return list.map(([s, e]) => { const el = document.createElement('div'); el.className = 'slot'; pos(el, s, e); el.textContent = 'livre'; cols[d].appendChild(el); return el; }); }
  async function calStep(fn, text) { busy(true, text); await sleep(reduce ? 50 : 700); fn(); busy(false); }

  const scenes = [
    async () => { // Marcar
      day('Hoje');
      await pac('Oi! Queria marcar uma limpeza com a Dra. Ana essa semana');
      busy(true, 'Consultando horários...'); say('Consultando a agenda da <b>Dra. Ana</b> na quinta...');
      await sleep(900); const sl = slots(1, [[10, 11], [14, 15], [16.5, 17.5]]); busy(false);
      say('<b>3 horários livres</b> encontrados na quinta.');
      await bot('Oi, Marina! A Dra. Ana tem horário na quinta (3/12) às <b>10h</b>, <b>14h</b> ou <b>16h30</b>. Qual fica melhor?');
      await pac('14h');
      sl[1].classList.add('chosen'); sl[1].textContent = 'reservando';
      await calStep(() => { clearOverlays(); drawEv({ ...MARINA, d: 1, s: 14, e: 15 }, true); }, 'Criando evento...');
      say('Evento criado: <b>Marina C. · Limpeza</b>, qui 3/12, 14h–15h.');
      await bot('Pronto! Limpeza com a Dra. Ana marcada para <b>quinta, 3/12, às 14h</b>. Te mando um lembrete na véspera 😉');
    },
    async () => { // Remarcar
      day('Hoje');
      await pac('Oi, surgiu um imprevisto. Dá pra passar minha consulta de quinta pra sexta?');
      busy(true, 'Consultando horários...'); say('Procurando horários livres na <b>sexta</b>...');
      await sleep(900); slots(2, [[9, 10], [15, 16]]); busy(false);
      await bot('Claro! Na sexta (4/12) tenho <b>9h</b> ou <b>15h</b>. Qual prefere?');
      await pac('15h, por favor');
      await calStep(() => { clearOverlays(); const el = evEls.m; const g = document.createElement('div'); g.className = 'ghost'; pos(g, 14, 15); cols[1].appendChild(g); setTimeout(() => g.style.opacity = 0, 600); el.remove(); drawEv({ ...MARINA, d: 2, s: 15, e: 16 }, true); }, 'Movendo evento...');
      say('Evento movido: qui 14h → <b>sex 4/12, 15h–16h</b>.');
      await bot('Remarcado! Sua limpeza agora é <b>sexta, 4/12, às 15h</b>. O horário de quinta já ficou livre para outro paciente.');
    },
    async () => { // Lembrete
      day('Quinta, 3/12 · véspera');
      say('Lembrete automático, enviado 24 h antes da consulta.');
      await sleep(600);
      await bot('Oi, Marina! Lembrete: amanhã, <b>sexta às 15h</b>, sua limpeza com a Dra. Ana.<br><br>Responda <b>1</b> para confirmar ou <b>2</b> para remarcar.', 'lembrete automático');
      await pac('1');
      await calStep(() => { const el = evEls.m; el.classList.add('confirmed'); el.querySelector('.tag').textContent = 'Confirmado'; }, 'Confirmando...');
      say('Consulta <b>confirmada</b> pela paciente. A recepção vê isso na agenda.');
      await bot('Confirmado! Até amanhã. Se precisar, é só chamar por aqui.');
    },
    async () => { // Áudio
      day('Hoje');
      await sleep(reduce ? 100 : 900);
      bubble('out', audioHtml());
      say('Áudio recebido. Transcrevendo...'); busy(true, 'Transcrevendo áudio...');
      await sleep(1100); busy(false);
      say('Transcrição: <b>“quanto custa o clareamento e vocês aceitam convênio?”</b>');
      await bot('O clareamento custa <b>R$ 600</b> (duas sessões). Atendemos Amil Dental e OdontoPrev; o clareamento é particular. Quer marcar uma avaliação?', 'respondendo ao áudio');
      await pac('Quero sim, mas vejo isso semana que vem');
      await bot('Combinado! É só me chamar quando quiser.');
    },
    async () => { // Cancelar
      day('Sexta, 4/12');
      await pac('Bom dia, vou precisar cancelar a consulta de hoje às 15h');
      await calStep(() => { const el = evEls.m; el.classList.add('leave'); setTimeout(() => el.remove(), 400); const g = document.createElement('div'); g.className = 'ghost'; pos(g, 15, 16); cols[2].appendChild(g); setTimeout(() => g.style.opacity = 0, 900); }, 'Cancelando...');
      say('Evento <b>cancelado</b>. Horário de sex 15h liberado.');
      await bot('Cancelado, Marina. Quer que eu já deixe outro dia marcado?');
      await pac('Agora não, obrigada!');
      await bot('Tudo bem! Quando quiser remarcar, é só mandar mensagem.');
    },
    async () => { // Chamar a equipe
      day('Hoje');
      await pac('Queria conversar com alguém sobre um orçamento de implante, tenho umas dúvidas');
      await bot('Claro! Vou chamar alguém da equipe para conversar com você sobre o orçamento. Só um instante.');
      busy(true, 'Avisando a equipe...'); await sleep(800); busy(false);
      bubble('sys', 'Conversa passada para a recepção');
      say('<b>Recepção avisada</b> no portal. O assistente fica em silêncio nesta conversa.');
      await sleep(reduce ? 100 : 1600);
      await bot('Oi, Marina! Aqui é a Júlia, da recepção. Me conta: você já fez avaliação com a gente?', 'Júlia · equipe');
    },
  ];
  function day(label) { const d = document.createElement('div'); d.className = 'day'; d.textContent = label; chat.appendChild(d); }

  const chips = [...document.querySelectorAll('.chip')];
  async function play(i) {
    const my = ++run; current = i;
    chips.forEach((c, j) => { c.setAttribute('aria-pressed', j === i); c.querySelector('.prog').style.width = j < i ? '100%' : '0'; });
    chat.innerHTML = ''; setDraft(''); clock = 14 * 60 + 27; clearOverlays(); resetCal(before[i]); busy(false); say('Agenda da clínica, atualizada pelo assistente em tempo real.');
    try {
      await scenes[i]();
      chips[i].querySelector('.prog').style.width = '100%';
      await sleep(reduce ? 2500 : 3200);
      if (my === run) play((i + 1) % scenes.length);
    } catch (e) { if (e !== 'x') throw e; }
  }
  chips.forEach((c, i) => c.addEventListener('click', () => { paused = false; setPause(); play(i); }));
  const pauseBtn = $('#pause');
  function setPause() { pauseBtn.textContent = paused ? '▶ Continuar' : '❚❚ Pausar'; pauseBtn.setAttribute('aria-pressed', paused); }
  pauseBtn.addEventListener('click', () => { paused = !paused; setPause(); });

  // Pausa quando a demo sai da tela
  let visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe($('#demo'));

  resetCal(null);
  play(0);

  // Menu Entrar
  const lb = $('#login-btn'), lm = $('#login-menu');
  lb.addEventListener('click', e => { e.stopPropagation(); lm.hidden = !lm.hidden; lb.setAttribute('aria-expanded', !lm.hidden); });
  document.addEventListener('click', e => { if (!lm.contains(e.target)) { lm.hidden = true; lb.setAttribute('aria-expanded', 'false'); } });

  // Formulário (prévia)
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const m = $('#form-msg'); m.hidden = false;
    const v = id => $(id).value.trim();
    if (!v('#f-nome') || !v('#f-whats')) { m.style.color = 'var(--warn)'; m.textContent = 'Preencha seu nome e WhatsApp.'; return; }
    const body = `Nome: ${v('#f-nome')}\nClínica: ${v('#f-clinica')}\nWhatsApp: ${v('#f-whats')}\nAgenda hoje: ${v('#f-agenda')}\n\n${v('#f-msg')}`;
    location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Demonstração Agiliz - ' + (v('#f-clinica') || v('#f-nome'))) + '&body=' + encodeURIComponent(body);
    m.style.color = 'var(--text-2)';
    m.innerHTML = 'Abrimos o seu e-mail com o pedido pronto. Se não abriu, escreva para <b>' + CONTACT_EMAIL + '</b>.';
  });
})();

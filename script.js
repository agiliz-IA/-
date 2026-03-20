/* ============================================================
   agilizIA – script.js
   Funcionalidades: tema, menu, animações, chat demo, form
   ============================================================ */

'use strict';

// ── UTILITÁRIOS ──────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── TEMA (DARK / LIGHT) ──────────────────────────────────────
const ThemeManager = (() => {
  const html   = document.documentElement;
  const btn    = $('#theme-toggle');
  const DARK   = 'dark';
  const LIGHT  = 'light';
  const KEY    = 'agilizIA-theme';

  function apply(theme) {
    html.setAttribute('data-theme', theme);
    const isDark = theme === DARK;
    btn.setAttribute('aria-pressed', String(!isDark));
    btn.setAttribute('aria-label', isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro');
    localStorage.setItem(KEY, theme);
  }

  function toggle() {
    const current = html.getAttribute('data-theme');
    apply(current === DARK ? LIGHT : DARK);
  }

  function init() {
    const saved  = localStorage.getItem(KEY);
    const system = window.matchMedia('(prefers-color-scheme: light)').matches ? LIGHT : DARK;
    apply(saved || system);
    btn.addEventListener('click', toggle);
  }

  return { init };
})();

// ── MENU MOBILE ──────────────────────────────────────────────
const MenuManager = (() => {
  const menuBtn  = $('#menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const links    = $$('.mobile-menu__link');

  function open() {
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Fechar menu de navegação');
    mobileMenu.setAttribute('aria-hidden', 'false');
  }

  function close() {
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menu de navegação');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  function init() {
    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      expanded ? close() : open();
    });

    links.forEach(link => link.addEventListener('click', close));

    // Close on outside click
    document.addEventListener('click', e => {
      if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) close();
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });
  }

  return { init };
})();

// ── HEADER SCROLL ────────────────────────────────────────────
const HeaderScroll = (() => {
  const header = $('.site-header');

  function init() {
    const update = () => {
      if (window.scrollY > 20) {
        header.style.boxShadow = '0 2px 30px rgba(0,0,0,.3)';
      } else {
        header.style.boxShadow = '';
      }
    };
    window.addEventListener('scroll', update, { passive: true });
  }

  return { init };
})();

// ── PARTICLES (HERO) ─────────────────────────────────────────
const Particles = (() => {
  const container = $('#particles');

  function create() {
    if (!container) return;
    const count = window.innerWidth < 600 ? 12 : 24;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';

      const size  = Math.random() * 3 + 1;
      const left  = Math.random() * 100;
      const delay = Math.random() * 12;
      const dur   = Math.random() * 10 + 8;
      const opacity = Math.random() * 0.4 + 0.1;

      p.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${left}%; bottom: -10px;
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
        opacity: ${opacity};
      `;

      // Alternate colors
      if (i % 3 === 1) p.style.background = 'var(--clr-neon)';
      if (i % 3 === 2) p.style.background = 'var(--clr-cyan)';

      container.appendChild(p);
    }
  }

  return { init: create };
})();

// ── COUNTER ANIMATION ────────────────────────────────────────
const CounterAnimation = (() => {
  const stats = $$('.stat__number');
  let started = false;

  function animateCounter(el) {
    const target  = parseInt(el.getAttribute('data-target'), 10);
    const dur     = 1800;
    const step    = 16;
    const steps   = dur / step;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(timer);
    }, step);
  }

  function init() {
    if (!stats.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          stats.forEach(el => animateCounter(el));
        }
      });
    }, { threshold: 0.4 });

    const statsContainer = $('.hero__stats');
    if (statsContainer) observer.observe(statsContainer);
  }

  return { init };
})();

// ── SCROLL REVEAL ────────────────────────────────────────────
const ScrollReveal = (() => {
  function addRevealClasses() {
    const sections = $$('section:not(.hero)');
    sections.forEach(section => {
      const children = $$(':scope > .container > *', section);
      children.forEach((child, i) => {
        child.classList.add('reveal');
        child.style.transitionDelay = `${i * 0.08}s`;
      });
    });
  }

  function observe() {
    const items = $$('.reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    items.forEach(el => observer.observe(el));
  }

  function init() {
    addRevealClasses();
    // Small delay to avoid flash
    requestAnimationFrame(() => requestAnimationFrame(observe));
  }

  return { init };
})();

// ── CHAT DEMO ────────────────────────────────────────────────
const ChatDemo = (() => {
  const chatBody = $('#chat-body');
  if (!chatBody) return { init: () => {} };

  const conversation = [
    { type: 'bot',  text: '👋 Olá! Sou a assistente virtual da <strong>Clínica Saúde+</strong>. Posso ajudar com agendamentos, dúvidas ou informações. Como posso te ajudar hoje?' },
    { type: 'user', text: 'Oi! Quero agendar uma consulta com o Dr. Carlos.' },
    { type: 'bot',  text: 'Claro! O Dr. Carlos tem disponibilidade nos seguintes horários:<br><br>📅 <strong>Segunda-feira, 24/03</strong> — 10h ou 14h30<br>📅 <strong>Quarta-feira, 26/03</strong> — 09h ou 16h<br><br>Qual prefere?' },
    { type: 'user', text: 'Segunda às 14h30 está ótimo!' },
    { type: 'bot',  text: '✅ <strong>Agendamento confirmado!</strong><br><br>📅 Segunda, 24/03 às 14h30<br>👨‍⚕️ Dr. Carlos — Clínica Geral<br><br>Você receberá uma confirmação e um lembrete 1h antes. Posso ajudar com mais alguma coisa?' },
    { type: 'user', text: 'Não, obrigado! Muito fácil!' },
    { type: 'bot',  text: '😊 Fico feliz em ajudar! Qualquer dúvida, estou por aqui. Até segunda! 👋' },
  ];

  let index = 0;
  let running = false;

  function getTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function addTyping() {
    const el = document.createElement('div');
    el.className = 'msg msg--bot';
    el.id = 'typing';
    el.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
    return el;
  }

  function removeTyping() {
    const t = $('#typing');
    if (t) t.remove();
  }

  function addMessage(msg, delay) {
    return new Promise(resolve => {
      setTimeout(() => {
        removeTyping();

        const el = document.createElement('div');
        el.className = `msg msg--${msg.type}`;
        el.style.animationDelay = '0s';
        el.innerHTML = `
          <div class="msg__bubble">${msg.text}</div>
          <div class="msg__time">${getTime()}</div>
        `;
        chatBody.appendChild(el);
        chatBody.scrollTop = chatBody.scrollHeight;
        resolve();
      }, delay);
    });
  }

  async function playConversation() {
    if (running || index >= conversation.length) return;
    running = true;

    for (let i = index; i < conversation.length; i++) {
      const msg = conversation[i];
      const isBot = msg.type === 'bot';

      if (isBot) {
        addTyping();
        await addMessage(msg, 1100);
      } else {
        await addMessage(msg, 600);
      }

      // Pause between messages
      await new Promise(r => setTimeout(r, 500));
    }

    index = conversation.length;
    running = false;

    // Restart after delay
    setTimeout(() => {
      chatBody.innerHTML = '';
      index = 0;
      playConversation();
    }, 4000);
  }

  function init() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !running && index === 0) {
          playConversation();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(chatBody);
  }

  return { init };
})();

// ── CONTACT FORM ─────────────────────────────────────────────
const ContactForm = (() => {
  const form     = $('#contact-form');
  const feedback = $('#form-feedback');
  const submitBtn = $('#form-submit');
  const btnText   = $('#btn-text');

  function validate(data) {
    const errors = [];
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.nome.trim())    errors.push({ id: 'nome', msg: 'Nome é obrigatório.' });
    if (!emailRx.test(data.email)) errors.push({ id: 'email', msg: 'E-mail inválido.' });
    if (!data.mensagem.trim()) errors.push({ id: 'mensagem', msg: 'Mensagem é obrigatória.' });

    return errors;
  }

  function clearState() {
    $$('.form-input').forEach(i => { i.classList.remove('is-error', 'is-success'); });
    feedback.className = 'form-feedback';
    feedback.textContent = '';
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.textContent = loading ? 'Enviando...' : 'Enviar Mensagem';
  }

  function showFeedback(type, msg) {
    feedback.className = `form-feedback ${type}`;
    feedback.textContent = msg;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function init() {
    if (!form) return;

    // Live validation
    $$('.form-input[required]').forEach(input => {
      input.addEventListener('blur', () => {
        if (input.value.trim()) {
          input.classList.remove('is-error');
          input.classList.add('is-success');
        } else {
          input.classList.add('is-error');
          input.classList.remove('is-success');
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearState();

      const data = {
        nome:     $('#nome').value,
        email:    $('#email').value,
        empresa:  $('#empresa').value,
        mensagem: $('#mensagem').value,
      };

      const errors = validate(data);

      if (errors.length) {
        errors.forEach(err => {
          const input = $(`#${err.id}`);
          if (input) input.classList.add('is-error');
        });
        showFeedback('error', errors[0].msg);
        $(`#${errors[0].id}`)?.focus();
        return;
      }

      setLoading(true);

      // Simulate async send (replace with real fetch if needed)
      await new Promise(r => setTimeout(r, 1500));

      setLoading(false);
      form.reset();
      $$('.form-input').forEach(i => i.classList.remove('is-success', 'is-error'));
      showFeedback('success', '✅ Mensagem enviada! Retornaremos em até 2 horas úteis.');
    });
  }

  return { init };
})();

// ── SMOOTH SCROLL FOR NAV LINKS ──────────────────────────────
const SmoothScroll = (() => {
  function init() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();

        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
        const top  = target.getBoundingClientRect().top + window.scrollY - navH;

        window.scrollTo({ top, behavior: 'smooth' });
        // Update focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  return { init };
})();

// ── ACTIVE NAV LINK ──────────────────────────────────────────
const ActiveNav = (() => {
  const links = $$('.nav__link');
  const sections = $$('section[id]');

  function update() {
    const scrollY = window.scrollY + 120;
    let current = '';

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });

    links.forEach(link => {
      const href = link.getAttribute('href').slice(1);
      link.style.color = href === current ? 'var(--clr-electric)' : '';
    });
  }

  function init() {
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  return { init };
})();

// ── FOOTER YEAR ──────────────────────────────────────────────
function setFooterYear() {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

// ── INIT ALL ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  MenuManager.init();
  HeaderScroll.init();
  Particles.init();
  CounterAnimation.init();
  ScrollReveal.init();
  ChatDemo.init();
  ContactForm.init();
  SmoothScroll.init();
  ActiveNav.init();
  setFooterYear();
});

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Footer year
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Highlight the current page in the nav
const currentPage = document.body.dataset.page;
if (currentPage) {
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    if (a.dataset.page === currentPage) a.classList.add('active');
  });
}

// Solid nav bar once the page is scrolled
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Chosen profile (from the "Who's watching?" screen) shows in the nav
const PROFILES = {
  recruiter: ['Recruiter', '#4a6fa5', ['Resume', 'resume.html'], ['education', 'top', 'achievements', 'skills', 'projects', 'contact']],
  developer: ['Developer', '#e50914', ['Projects', 'projects.html'], ['projects', 'top', 'skills', 'education', 'achievements', 'contact']],
  collaborator: ['Collaborator', '#d4a53a', ['Contact', 'contact.html'], ['achievements', 'projects', 'contact', 'top', 'skills', 'education']],
  guest: ['Guest', '#7d838d', ['Projects', 'projects.html'], ['top', 'projects', 'skills', 'education', 'achievements', 'contact']]
};
let chosen = new URLSearchParams(window.location.search).get('as');
try {
  if (chosen && PROFILES[chosen]) sessionStorage.setItem('profile', chosen);
  else chosen = sessionStorage.getItem('profile');
} catch (e) { /* storage can be unavailable; fall back to the default */ }
const profile = PROFILES[chosen] || PROFILES.guest;
document.querySelectorAll('.nav-profile').forEach(el => {
  el.setAttribute('aria-label', 'Switch profile (now ' + profile[0] + ')');
  const avatar = el.querySelector('.nav-avatar');
  const name = el.querySelector('.nav-profile-name');
  if (avatar) avatar.style.background = profile[1];
  if (name) name.textContent = profile[0];
});

// The chosen profile decides which rows and which button play first
const homeRows = document.querySelectorAll('.row[data-row]');
if (homeRows.length) {
  const order = profile[3];
  const holder = homeRows[0].parentElement;
  [...homeRows]
    .sort((a, b) => order.indexOf(a.dataset.row) - order.indexOf(b.dataset.row))
    .forEach(r => holder.appendChild(r));
  const cta = document.querySelector('[data-cta]');
  if (cta) {
    cta.setAttribute('href', profile[2][1]);
    const label = cta.querySelector('.cta-label');
    if (label) label.textContent = profile[2][0];
  }
}

// Skill genres: one panel at a time (all panels stay visible without JS)
const uniTabs = document.querySelectorAll('.uni-tab');
if (uniTabs.length) {
  document.documentElement.classList.add('js');
  const panels = document.querySelectorAll('.uni-panel');
  const select = i => {
    uniTabs.forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === String(i))));
    panels.forEach(p => p.classList.toggle('active', p.dataset.panel === String(i)));
  };
  uniTabs.forEach(b => b.addEventListener('click', () => select(b.dataset.tab)));
  select(0);
}

// Arrow buttons on rows that scroll sideways
document.querySelectorAll('.row').forEach(row => {
  const track = row.querySelector('.row-track');
  if (!track) return;
  const make = (dir, label, glyph) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'row-arrow ' + dir;
    b.setAttribute('aria-label', label);
    b.textContent = glyph;
    b.addEventListener('click', () => {
      const step = track.clientWidth * 0.85 * (dir === 'next' ? 1 : -1);
      track.scrollBy({ left: step, behavior: 'smooth' });
    });
    row.appendChild(b);
    return b;
  };
  const prev = make('prev', 'Scroll left', '‹');
  const next = make('next', 'Scroll right', '›');
  const update = () => {
    prev.hidden = track.scrollLeft < 8;
    next.hidden = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
  };
  update();
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
});

// Intro on the first page: name, photo, "Play now", then the profile screen
const intro = document.getElementById('intro');
const chooser = document.getElementById('chooser');
if (intro && chooser) {
  const showChooser = () => {
    intro.hidden = true;
    chooser.hidden = false;
    window.scrollTo(0, 0);
    const first = chooser.querySelector('.profile');
    if (first) first.focus({ preventScroll: true });
  };
  if (window.location.hash === '#profiles') {
    showChooser();
  } else {
    intro.querySelectorAll('[data-play]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        history.replaceState(null, '', '#profiles');
        showChooser();
      });
    });
  }
}

// ======================================================================
// Motion, avatar and 360 ring
// ======================================================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// ---- Scroll reveals --------------------------------------------------
(() => {
  const rows = document.querySelectorAll('.row');
  const timelines = document.querySelectorAll('.timeline');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    rows.forEach(r => r.classList.add('in'));
    timelines.forEach(r => r.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  // [selector, siblings stagger?, fixed index]
  const items = [
    ['.page-title', false, 0], ['.page-sub', false, 2],
    ['.section-head', false, 0], ['.dossier', false, 0], ['.t-item', false, 0],
    ['.poster', true], ['.moment', true], ['.links li', true],
    ['.resume-head', false, 0], ['.resume-contact', false, 1], ['.resume-block', false, 0],
    ['.ring-scene', false, 0], ['.ring-controls', false, 2], ['.avatar-stage', false, 1]
  ];
  items.forEach(([sel, stagger, fixed]) => {
    document.querySelectorAll(sel).forEach(el => {
      let i = fixed || 0;
      if (stagger) i = Math.min([...el.parentElement.children].filter(n => n.matches(sel)).indexOf(el), 7);
      el.style.setProperty('--i', i);
      el.classList.add('reveal');
      io.observe(el);
    });
  });
  rows.forEach(r => {
    r.querySelectorAll('.tile').forEach((t, i) => t.style.setProperty('--i', Math.min(i, 8)));
    io.observe(r);
  });
  timelines.forEach(t => io.observe(t));
})();

// ---- Fade out when leaving to another page of the site ----------------
if (!reduceMotion) {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download') || a.origin !== window.location.origin) return;
    if (a.pathname === window.location.pathname) return; // same page (hash, intro buttons)
    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(() => { window.location.href = a.href; }, 200);
  });
  window.addEventListener('pageshow', () => document.body.classList.remove('leaving'));
}

// ---- Skill chips get a stagger index each time they are shown ---------
document.querySelectorAll('.uni-panel').forEach(p => {
  p.querySelectorAll('.uni-chip').forEach((c, i) => c.style.setProperty('--i', i));
});

// ---- Tilt on cards, following the pointer ----------------------------
if (!reduceMotion && finePointer) {
  document.querySelectorAll('.poster, .moment').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (y * -9).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  });
}

// ---- Home billboard: the photo leans toward the cursor ----------------
(() => {
  const hero = document.querySelector('.billboard');
  const photo = hero && hero.querySelector('.billboard-photo');
  if (!photo || reduceMotion || !finePointer) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const loop = () => {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    photo.style.transform =
      'perspective(1100px) rotateY(' + (cx * 7).toFixed(2) + 'deg) rotateX(' + (cy * -4).toFixed(2) +
      'deg) translate3d(' + (cx * -14).toFixed(1) + 'px,' + (cy * -8).toFixed(1) + 'px,0)';
    raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002) ? requestAnimationFrame(loop) : 0;
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(loop); };
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
    ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
    go();
  });
  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; go(); });
})();

// ---- Contact avatar: head and eyes follow the pointer ------------------
(() => {
  const svg = document.querySelector('.avatar-svg');
  if (!svg) return;
  const head = svg.querySelector('#av-head');
  const hair = svg.querySelector('#av-hair');
  const feat = svg.querySelector('#av-feat');
  const body = svg.querySelector('#av-body');
  const eyeParts = ['#av-pupil-l', '#av-pupil-r', '#av-shine-l', '#av-shine-r'].map(s => svg.querySelector(s));
  const bubble = document.querySelector('.avatar-bubble');
  let tx = 0, ty = 0, cx = 0, cy = 0, last = performance.now(), seen = false;

  const apply = () => {
    head.style.transform = 'rotate(' + (cx * 6).toFixed(2) + 'deg) translate(' + (cx * 5).toFixed(2) + 'px,' + (cy * 3).toFixed(2) + 'px)';
    hair.style.transform = 'translate(' + (cx * 3).toFixed(2) + 'px,' + (cy * 2).toFixed(2) + 'px)';
    feat.style.transform = 'translate(' + (cx * 8).toFixed(2) + 'px,' + (cy * 5.5).toFixed(2) + 'px)';
    body.style.transform = 'translate(' + (cx * -3).toFixed(2) + 'px,0)';
    eyeParts.forEach(p => { p.style.transform = 'translate(' + (cx * 5.2).toFixed(2) + 'px,' + (cy * 3.4).toFixed(2) + 'px)'; });
  };
  if (reduceMotion) { apply(); return; }

  window.addEventListener('pointermove', e => {
    const r = svg.getBoundingClientRect();
    const mx = r.left + r.width * 0.5;
    const my = r.top + r.height * 0.42;
    tx = clamp((e.clientX - mx) / 360, -1, 1);
    ty = clamp((e.clientY - my) / 300, -1, 1);
    last = performance.now();
    seen = true;
  }, { passive: true });
  window.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

  let showTimer = 0;
  const say = text => {
    if (!bubble) return;
    bubble.textContent = text;
    bubble.classList.add('show');
    clearTimeout(showTimer);
    showTimer = setTimeout(() => bubble.classList.remove('show'), 1700);
  };
  svg.addEventListener('click', () => say('Hey, caught you!'));
  svg.addEventListener('pointerenter', () => { if (finePointer) say('Hi there!'); });

  const tick = now => {
    // With no pointer for a while the avatar glances around on its own
    if (!seen || now - last > 3500) {
      tx = Math.sin(now / 1900) * 0.7;
      ty = Math.sin(now / 2600 + 1) * 0.25;
    }
    cx += (tx - cx) * 0.09;
    cy += (ty - cy) * 0.09;
    apply();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

// ---- About: 360 degree ring ------------------------------------------
(() => {
  const scene = document.querySelector('.ring-scene');
  if (!scene) return;
  const ring = scene.querySelector('.ring');
  const panels = [...ring.querySelectorAll('.ring-panel')];
  const caption = document.querySelector('.ring-caption');
  const STEP = 360 / panels.length;
  let ry = 0, vel = 0, target = null, dragging = false, coast = false, lastX = 0;
  let hover = false, visible = true, resumeAt = performance.now() + 2500;

  const norm = a => ((a % 360) + 360) % 360;
  const render = () => {
    ring.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    let best = 0, bestF = -2;
    panels.forEach((p, i) => {
      const f = Math.cos(norm(i * STEP + ry) * Math.PI / 180);
      p.style.setProperty('--b', (0.45 + 0.55 * Math.max(0, f)).toFixed(3));
      if (f > bestF) { bestF = f; best = i; }
    });
    if (caption && caption.textContent !== panels[best].dataset.label) caption.textContent = panels[best].dataset.label;
  };
  const snap = dir => {
    const k = Math.round(-ry / STEP);
    target = -(k + (dir || 0)) * STEP;
    coast = false;
    resumeAt = performance.now() + 3000;
  };

  scene.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    dragging = true; coast = false; target = null; vel = 0; lastX = e.clientX;
    scene.classList.add('dragging');
    scene.setPointerCapture(e.pointerId);
  });
  scene.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    ry += dx * 0.45;
    vel = dx * 0.45;
    render();
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    scene.classList.remove('dragging');
    if (reduceMotion || Math.abs(vel) < 0.4) snap(0); else coast = true;
    resumeAt = performance.now() + 3000;
  };
  scene.addEventListener('pointerup', release);
  scene.addEventListener('pointercancel', release);
  scene.addEventListener('pointerenter', () => { hover = true; });
  scene.addEventListener('pointerleave', () => { hover = false; });
  scene.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); snap(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); snap(-1); }
  });
  document.querySelectorAll('[data-ring]').forEach(b => {
    b.addEventListener('click', () => snap(Number(b.dataset.ring)));
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(scene);
  }

  const tick = now => {
    if (visible) {
      if (target !== null) {
        ry = reduceMotion ? target : ry + (target - ry) * 0.12;
        if (Math.abs(target - ry) < 0.05) { ry = target; target = null; }
      } else if (coast) {
        ry += vel; vel *= 0.94;
        if (Math.abs(vel) < 0.2) snap(0);
      } else if (!dragging && !reduceMotion && !hover && now > resumeAt) {
        ry -= 0.12; // slow turn while nobody is touching it
      }
      render();
    }
    requestAnimationFrame(tick);
  };
  render();
  requestAnimationFrame(tick);
})();

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
  recruiter: ['Recruiter', '#2f80ed', ['Resume', 'resume.html'], ['education', 'top', 'achievements', 'skills', 'projects', 'contact']],
  developer: ['Developer', '#e50914', ['Projects', 'projects.html'], ['projects', 'top', 'skills', 'education', 'achievements', 'contact']],
  collaborator: ['Collaborator', '#f5a524', ['Contact', 'contact.html'], ['achievements', 'projects', 'contact', 'top', 'skills', 'education']],
  guest: ['Guest', '#2ecc71', ['Projects', 'projects.html'], ['top', 'projects', 'skills', 'education', 'achievements', 'contact']]
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

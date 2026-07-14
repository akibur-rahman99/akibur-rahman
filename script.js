// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Close menu on link click (mobile)
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    links?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  });
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Highlight the current page in the nav
const currentPage = document.body.dataset.page;
if (currentPage) {
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    if (a.dataset.page === currentPage) a.classList.add('active');
  });
}

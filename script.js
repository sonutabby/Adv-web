/* script.js
   - Loads shared navbar (navbar.html) into #navbar-container across pages
   - Attaches header behaviors: scroll, mobile menu, theme toggle (persisted)
   - Adds fade-in on scroll, gallery lightbox, menu filter, contact form validation
*/

(function () {
  // ————— Load shared navbar —————
  async function loadNavbar() {
    try {
      const res = await fetch('navbar.html');
      if (!res.ok) throw new Error('Could not load navbar');
      const html = await res.text();
      document.getElementById('navbar-container').innerHTML = html;
      setupNavbarFeatures(); // wire up after injection
    } catch (err) {
      console.error('Navbar load error:', err);
    }
  }

// Navbar features
function setupNavbarFeatures() {
  const header = document.querySelector('.header') || document.getElementById('site-header');
  const menuToggle = document.getElementById('menuToggle');
  const navList = document.getElementById('main-nav'); // <-- use main-nav instead of .nav-list
  const themeToggle = document.getElementById('themeToggle');

  // Persisted theme
  const saved = localStorage.getItem('pgc-theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.textContent = '☀️';
  } else {
    if (themeToggle) themeToggle.textContent = '🌙';
  }

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 44);
  });

  // Mobile menu toggle
  if (menuToggle && navList) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      navList.classList.toggle('open'); // match CSS
    });
  }

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('pgc-theme');
        themeToggle.textContent = '🌙';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('pgc-theme', 'dark');
        themeToggle.textContent = '☀️';
      }
    });
  }

  // Active link highlight
  document.querySelectorAll('.nav-list a').forEach(link => {
    if (location.pathname.endsWith(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });
}

  // ————— Fade-in on scroll using IntersectionObserver —————
  function setupFadeOnScroll() {
    const faders = document.querySelectorAll('.fade-in');
    if (!faders.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18 });
    faders.forEach(el => io.observe(el));
  }

  // ————— Lightbox for gallery images —————
  function setupLightbox() {
    const root = document.getElementById('lightbox-root') || createLightboxRoot();
    document.addEventListener('click', (ev) => {
      const img = ev.target.closest('.photo');
      if (!img) return;
      openLightbox(img.src, img.alt || '');
    });

    function createLightboxRoot() {
      const r = document.createElement('div');
      r.id = 'lightbox-root';
      document.body.appendChild(r);
      return r;
    }

    function openLightbox(src, alt) {
      // create overlay
      const overlay = document.createElement('div');
      overlay.className = 'lightbox-root visible';
      overlay.tabIndex = -1;
      const image = document.createElement('img');
      image.src = src;
      image.alt = alt;
      overlay.appendChild(image);

      // close on click / esc
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlayRemove();
      });

      const onKey = (e) => { if (e.key === 'Escape') overlayRemove(); };
      function overlayRemove() {
        overlay.classList.remove('visible');
        overlay.remove();
        document.removeEventListener('keydown', onKey);
      }
      document.addEventListener('keydown', onKey);
      document.body.appendChild(overlay);
      image.focus && image.focus();
    }
  }

  // ————— Menu filter —————
  function setupMenuFilter() {
    const filters = document.querySelectorAll('.chip');
    const items = document.querySelectorAll('.menu-item');
    if (!filters.length || !items.length) return;
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        items.forEach(it => {
          if (f === 'all') it.style.display = '';
          else it.style.display = it.dataset.category === f ? '' : 'none';
        });
      });
    });
  }

  // ————— Contact form basic validation (no server) —————
  function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const feedback = document.getElementById('formFeedback');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      if (!name || !email || !message) {
        feedback.textContent = 'Please fill in all fields.';
        return;
      }
      // simple email pattern
      const re = /\S+@\S+\.\S+/;
      if (!re.test(email)) {
        feedback.textContent = 'Please enter a valid email address.';
        return;
      }
      // pretend to submit
      feedback.textContent = 'Thanks! Your message has been received — we will reply soon.';
      form.reset();
      setTimeout(() => feedback.textContent = '', 6000);
    });
  }

  // ————— Lazy images / progressive enhancement —————
  function setupLazyImages() {
    const imgs = document.querySelectorAll('img[loading="lazy"]');
    // browser supports lazy natively; nothing else required.
    // optionally could add IntersectionObserver fallback here.
  }

  // ————— Init on DOM ready —————
  function init() {
    loadNavbar().then(() => {
      // after navbar is loaded, set up features
      setupFadeOnScroll();
      setupLightbox();
      setupMenuFilter();
      setupContactForm();
      setupLazyImages();
    });

    // If no navbar injection (fallback), still initialize features
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        setupFadeOnScroll();
        setupLightbox();
        setupMenuFilter();
        setupContactForm();
        setupLazyImages();
      }, 90);
    });
  }

  init();
})();

const menuToggle = document.getElementById('menuToggle');
const navList = document.querySelector('.nav-list');

if (menuToggle && navList) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    navList.classList.toggle('show');
  });
}

// Active link
document.querySelectorAll('.nav-list a').forEach(link => {
  if (location.pathname.endsWith(link.getAttribute('href'))) {
    link.classList.add('active');
  }
});

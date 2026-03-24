/* =====================================================
   B&J GARAGE — main.js
   ===================================================== */

const WA_NUMBER = '59170718685';

/* ── Navbar scroll effect ─────────────────────────── */
(function initNav() {
  const nav = document.getElementById('mainNav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Hero canvas particles ────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.r  = Math.random() * 1.5 + 0.4;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random() * 0.5 + 0.1;
  };
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  };

  function init() {
    particles = Array.from({ length: 80 }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
  resize();
  init();
  draw();
})();

/* ── Scroll animations (Intersection Observer) ───── */
(function initScrollAnim() {
  const els = document.querySelectorAll('[data-animate]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();

/* ── Products ─────────────────────────────────────── */
let allProducts = [];
let activeFilter = 'all';

function buildProductCard(p) {
  const msg   = encodeURIComponent(
    `Hola! Me interesa el *${p.name}* (${p.brand} ${p.scale}) — Bs. ${p.price} 🚗`
  );
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${msg}`;

  const imgHtml = p.image
    ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}"
            loading="lazy"
            onerror="this.parentElement.innerHTML='<div class=\\'product-placeholder\\'><i class=\\'bi bi-car-front\\'></i><span>${escapeHtml(p.brand)}</span></div>'">`
    : `<div class="product-placeholder">
         <i class="bi bi-car-front"></i>
         <span>${escapeHtml(p.brand || 'Auto a Escala')}</span>
       </div>`;

  const featuredBadge = p.featured
    ? `<div class="product-featured-badge"><i class="bi bi-star-fill me-1"></i>Destacado</div>`
    : '';

  const descHtml = p.description
    ? `<p class="product-desc">${escapeHtml(p.description)}</p>`
    : '';

  return `
    <div class="col-sm-6 col-md-4 col-xl-3 product-item" data-brand="${escapeHtml(p.brand || '')}">
      <div class="product-card">
        <div class="product-img-wrap">
          ${imgHtml}
          ${featuredBadge}
        </div>
        <div class="product-body">
          <div class="product-meta">
            ${p.brand  ? `<span class="badge-brand">${escapeHtml(p.brand)}</span>` : ''}
            ${p.scale  ? `<span class="badge-scale">${escapeHtml(p.scale)}</span>` : ''}
          </div>
          <h5 class="product-name">${escapeHtml(p.name || 'Sin nombre')}</h5>
          ${descHtml}
          <div class="product-footer">
            <div class="product-price">
              ${Number(p.price).toLocaleString('es-BO')}
              <span>Bs.</span>
            </div>
            <a href="${waUrl}" target="_blank" class="btn-wa" rel="noopener">
              <i class="bi bi-whatsapp"></i>Pedir
            </a>
          </div>
        </div>
      </div>
    </div>`;
}

function renderProducts(list) {
  const grid   = document.getElementById('productsGrid');
  const noMsg  = document.getElementById('noProducts');

  if (!list.length) {
    grid.innerHTML  = '';
    noMsg.classList.remove('d-none');
    return;
  }
  noMsg.classList.add('d-none');
  grid.innerHTML = list.map(buildProductCard).join('');
}

function applyFilter(brand) {
  activeFilter = brand;
  const items = allProducts.filter(p =>
    brand === 'all' ? true : p.brand === brand
  );
  renderProducts(items);
}

async function loadProducts() {
  try {
    const res  = await fetch('data/products.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    allProducts = data.products || [];
    renderProducts(allProducts);
  } catch (e) {
    console.warn('No se pudieron cargar productos:', e);
    document.getElementById('productsLoading').innerHTML =
      '<p class="text-muted font-raj">Aún no hay productos cargados.<br><small>El cliente puede agregarlos desde el panel CMS.</small></p>';
  }
}

/* Filter buttons */
document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });
});

/* ── Videos TikTok ───────────────────────────────── */
function extractTikTokId(url) {
  const m = (url || '').match(/video\/(\d+)/);
  return m ? m[1] : null;
}

function buildVideoCard(v) {
  const id  = extractTikTokId(v.tiktok_url);
  if (!id) return '';

  const label = v.title ? `<div class="video-label"><i class="bi bi-tiktok"></i>${escapeHtml(v.title)}</div>` : '';

  return `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="video-card">
        ${label}
        <blockquote class="tiktok-embed"
          cite="${escapeHtml(v.tiktok_url)}"
          data-video-id="${id}"
          style="max-width:100%;min-width:280px;">
          <section></section>
        </blockquote>
      </div>
    </div>`;
}

async function loadVideos() {
  const grid = document.getElementById('videosGrid');
  try {
    const res  = await fetch('data/videos.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const videos = (data.videos || []).filter(v => extractTikTokId(v.tiktok_url));

    if (!videos.length) {
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="no-videos-msg">
            <i class="bi bi-tiktok"></i>
            Próximamente videos de nuestra colección
          </div>
        </div>`;
      return;
    }

    grid.innerHTML = videos.map(buildVideoCard).join('');

    // Load TikTok embed script once
    if (!document.getElementById('tiktok-embed-js')) {
      const s  = document.createElement('script');
      s.id     = 'tiktok-embed-js';
      s.src    = 'https://www.tiktok.com/embed.js';
      s.async  = true;
      document.body.appendChild(s);
    }
  } catch (e) {
    console.warn('No se pudieron cargar videos:', e);
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="no-videos-msg">
          <i class="bi bi-tiktok"></i>
          <a href="https://www.tiktok.com/@byj_garage" target="_blank" style="color:var(--gold)">
            Ver videos en @byj_garage
          </a>
        </div>
      </div>`;
  }
}

/* ── Smooth scroll for nav links ─────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    // Close mobile menu if open
    const toggler = document.querySelector('.navbar-toggler');
    const menu    = document.getElementById('navMenu');
    if (menu && menu.classList.contains('show')) {
      toggler && toggler.click();
    }
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 76;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Helper ─────────────────────────────────────── */
function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ── Init ────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadVideos();
});
/* =====================================================
   欣壹服饰 Studio — Main JavaScript
   ===================================================== */

'use strict';

/* =========================================
   DATA: Products
   ========================================= */
const PRODUCTS = [
  {
    id: 1,
    name: '经典极简风衣',
    category: 'coat',
    color: 'white',
    price: 3280,
    originalPrice: null,
    badge: '新品',
    image: 'images/product_2.png',
    isNew: true,
  },
  {
    id: 2,
    name: '羊绒高领毛衣',
    category: 'top',
    color: 'black',
    price: 1680,
    originalPrice: null,
    badge: '热销',
    image: 'images/product_1.png',
    isNew: false,
  },
  {
    id: 3,
    name: '阔腿西装裤',
    category: 'bottom',
    color: 'black',
    price: 1980,
    originalPrice: 2400,
    badge: 'SALE',
    image: 'images/product_3.png',
    isNew: false,
  },
  {
    id: 4,
    name: '真丝质感衬衫',
    category: 'top',
    color: 'white',
    price: 2100,
    originalPrice: null,
    badge: '新品',
    image: 'images/product_4.png',
    isNew: true,
  },
  {
    id: 5,
    name: '结构感西装外套',
    category: 'coat',
    color: 'black',
    price: 3580,
    originalPrice: null,
    badge: null,
    image: 'images/product_5.png',
    isNew: false,
  },
  {
    id: 6,
    name: '羊毛大衣',
    category: 'coat',
    color: 'grey',
    price: 4280,
    originalPrice: null,
    badge: '新品',
    image: 'images/product_6.png',
    isNew: true,
  },
];

/* =========================================
   STATE
   ========================================= */
let currentPage = 'home';
let filterState = {
  category: 'all',
  color: 'all',
  maxPrice: 5000,
  sort: 'default',
};
let viewMode = 'grid'; // 'grid' | 'list'

/* =========================================
   PAGE NAVIGATION
   ========================================= */
function navigateTo(page) {
  if (!page || page === currentPage) return;

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target page
  const target = document.getElementById(`page-${page}`);
  if (!target) return;
  target.classList.add('active');
  currentPage = page;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  // Update header style
  updateHeaderStyle();

  // Init page-specific logic
  if (page === 'products') renderProducts();
  if (page === 'lookbook') initLookbook();

  // Trigger lazy loading
  setTimeout(lazyLoadImages, 100);

  // Trigger reveal animations
  setTimeout(triggerReveal, 150);

  // Close mobile nav
  closeMobileNav();
}

// Delegate [data-page] clicks
document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-page]');
  if (trigger && trigger.dataset.page) {
    e.preventDefault();
    navigateTo(trigger.dataset.page);
  }
});

/* =========================================
   HEADER SCROLL & STYLE
   ========================================= */
const header = document.getElementById('site-header');

function updateHeaderStyle() {
  const isHomePage = currentPage === 'home';
  const scrolled = window.scrollY > 50;

  header.classList.toggle('on-light', !isHomePage);
  header.classList.toggle('scrolled', scrolled || !isHomePage);
  header.classList.toggle('dark-mode', isHomePage && !scrolled);
}

window.addEventListener('scroll', () => {
  updateHeaderStyle();
  triggerReveal();
}, { passive: true });

/* =========================================
   HAMBURGER / MOBILE NAV
   ========================================= */
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('main-nav');
const mobileOverlay = document.getElementById('mobile-overlay');

hamburger.addEventListener('click', () => {
  const isOpen = mainNav.classList.contains('open');
  if (isOpen) {
    closeMobileNav();
  } else {
    openMobileNav();
  }
});

mobileOverlay.addEventListener('click', closeMobileNav);

function openMobileNav() {
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mainNav.classList.add('open');
  mobileOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mainNav.classList.remove('open');
  mobileOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

/* =========================================
   RENDER PRODUCTS
   ========================================= */
function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  let filtered = [...PRODUCTS];

  // Category filter
  if (filterState.category !== 'all') {
    filtered = filtered.filter(p => p.category === filterState.category);
  }

  // Color filter
  if (filterState.color !== 'all') {
    filtered = filtered.filter(p => p.color === filterState.color);
  }

  // Price filter
  filtered = filtered.filter(p => p.price <= filterState.maxPrice);

  // Sort
  if (filterState.sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (filterState.sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (filterState.sort === 'newest') {
    filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }

  // Update count
  const countEl = document.getElementById('products-count');
  if (countEl) countEl.textContent = `共 ${filtered.length} 件产品`;

  // Render
  grid.innerHTML = '';
  filtered.forEach((product, i) => {
    const card = createProductCard(product, i);
    grid.appendChild(card);
  });

  // Apply view mode
  grid.className = `products-grid${viewMode === 'list' ? ' list-view' : ''}`;

  // Lazy load
  setTimeout(lazyLoadImages, 50);
}

function createProductCard(product, index) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-id', product.id);
  card.setAttribute('data-category', product.category);
  card.setAttribute('data-color', product.color);
  card.setAttribute('data-price', product.price);
  card.style.animationDelay = `${index * 0.06}s`;

  const catLabel = { coat: '外套', top: '上衣', bottom: '下装' }[product.category];
  const badgeClass = product.badge === 'SALE' ? 'sale' : '';

  card.innerHTML = `
    <div class="product-card-img">
      <img data-src="${product.image}" alt="${product.name}" class="lazy" />
      ${product.badge ? `<span class="product-card-badge ${badgeClass}">${product.badge}</span>` : ''}
      <div class="product-card-overlay">
        <button class="btn btn-primary btn-sm" onclick="addToCart(event, ${product.id})">加入购物袋</button>
      </div>
    </div>
    <div class="product-card-info">
      <div class="product-cat">${catLabel}</div>
      <h3>${product.name}</h3>
      <div class="product-card-price">
        <span class="price">¥ ${product.price.toLocaleString()}</span>
        ${product.originalPrice ? `<span class="price-original">¥ ${product.originalPrice.toLocaleString()}</span>` : ''}
      </div>
    </div>
  `;

  card.addEventListener('click', e => {
    if (!e.target.closest('.btn')) {
      openLightbox(product.image, product.name);
    }
  });

  return card;
}

function addToCart(e, productId) {
  e.stopPropagation();
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  // Update badge count
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.textContent = parseInt(badge.textContent || '0') + 1;
  }

  showToast(`已将《${product.name}》加入购物袋`);
}

/* =========================================
   FILTER LOGIC
   ========================================= */
// Category
document.querySelectorAll('input[name="category"]').forEach(input => {
  input.addEventListener('change', () => {
    filterState.category = input.value;
    renderProducts();
  });
});

// Color
document.querySelectorAll('.swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    filterState.color = swatch.dataset.color;
    renderProducts();
  });
});

// Price slider
const priceSlider = document.getElementById('price-slider');
const priceMaxLabel = document.getElementById('price-max-label');

if (priceSlider) {
  priceSlider.addEventListener('input', () => {
    filterState.maxPrice = parseInt(priceSlider.value);
    if (priceMaxLabel) priceMaxLabel.textContent = `¥ ${filterState.maxPrice.toLocaleString()}`;
    renderProducts();
  });
}

// Sort
const sortSelect = document.getElementById('sort-select');
if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    filterState.sort = sortSelect.value;
    renderProducts();
  });
}

// Reset
const resetBtn = document.getElementById('reset-filters');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    filterState = { category: 'all', color: 'all', maxPrice: 5000, sort: 'default' };

    // Reset UI
    document.querySelector('input[name="category"][value="all"]').checked = true;
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    document.querySelector('.swatch[data-color="all"]').classList.add('active');
    if (priceSlider) { priceSlider.value = 5000; priceMaxLabel.textContent = '¥ 5000'; }
    if (sortSelect) sortSelect.value = 'default';

    renderProducts();
    showToast('筛选已重置');
  });
}

// Filter toggle (mobile)
const filterToggle = document.getElementById('filter-toggle');
const filtersBody = document.getElementById('filters-body');
if (filterToggle && filtersBody) {
  filterToggle.addEventListener('click', () => {
    const isOpen = filtersBody.classList.contains('open');
    filtersBody.classList.toggle('open', !isOpen);
    const arrow = filterToggle.querySelector('svg');
    if (arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
  });
}

/* =========================================
   VIEW MODE TOGGLE
   ========================================= */
const viewGridBtn = document.getElementById('view-grid');
const viewListBtn = document.getElementById('view-list');

if (viewGridBtn) {
  viewGridBtn.addEventListener('click', () => {
    viewMode = 'grid';
    viewGridBtn.classList.add('active');
    viewListBtn.classList.remove('active');
    renderProducts();
  });
}

if (viewListBtn) {
  viewListBtn.addEventListener('click', () => {
    viewMode = 'list';
    viewListBtn.classList.add('active');
    viewGridBtn.classList.remove('active');
    renderProducts();
  });
}

/* =========================================
   LOOKBOOK TABS
   ========================================= */
function initLookbook() {
  const tabs = document.querySelectorAll('.lb-tab');
  const items = document.querySelectorAll('.lb-item');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const chapter = tab.dataset.chapter;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      items.forEach(item => {
        if (chapter === 'all' || item.dataset.chapter === chapter) {
          item.classList.remove('filtered-out');
        } else {
          item.classList.add('filtered-out');
        }
      });

      setTimeout(lazyLoadImages, 50);
    });
  });

  // Lightbox for lookbook
  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.lb-caption h3');
      if (img) {
        const src = img.src || img.dataset.src;
        const text = caption ? caption.textContent : '';
        openLightbox(src, text);
      }
    });
  });
}

/* =========================================
   LIGHTBOX
   ========================================= */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox(src, caption = '') {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = caption;
  if (lightboxCaption) lightboxCaption.textContent = caption;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    if (lightboxImg) lightboxImg.src = '';
  }, 400);
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) {
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeMobileNav();
  }
});

/* =========================================
   TOAST
   ========================================= */
let toastTimer = null;

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), duration);
}

/* =========================================
   FORMS
   ========================================= */
function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  showToast('感谢订阅！我们将不时为您送上精选内容。');
  input.value = '';
  return false;
}

function handleContact(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('contact-submit');
  if (submitBtn) {
    submitBtn.textContent = '发送中...';
    submitBtn.disabled = true;
  }

  setTimeout(() => {
    showToast('留言已发送，我们将在 24 小时内回复您。');
    document.getElementById('contact-form').reset();
    if (submitBtn) {
      submitBtn.textContent = '发送留言';
      submitBtn.disabled = false;
    }
  }, 1200);

  return false;
}

/* =========================================
   LAZY LOADING
   ========================================= */
function lazyLoadImages() {
  const lazyImages = document.querySelectorAll('img.lazy:not(.loaded)');

  if ('IntersectionObserver' in window) {
    lazyImages.forEach(img => {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const src = img.dataset.src || img.getAttribute('data-src');
            if (src) {
              img.src = src;
              img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
              img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
            }
            obs.unobserve(img);
          }
        });
      }, { rootMargin: '200px 0px' });
      observer.observe(img);
    });
  } else {
    // Fallback
    lazyImages.forEach(img => {
      const src = img.dataset.src;
      if (src) {
        img.src = src;
        img.classList.add('loaded');
      }
    });
  }
}

/* =========================================
   SCROLL REVEAL ANIMATIONS
   ========================================= */
function triggerReveal() {
  const reveals = document.querySelectorAll('.reveal:not(.visible)');
  const viewBottom = window.innerHeight + window.scrollY;

  reveals.forEach(el => {
    if (el.getBoundingClientRect().top + window.scrollY < viewBottom - 80) {
      el.classList.add('visible');
    }
  });
}

// Add reveal classes to section headers dynamically
function addRevealClasses() {
  const selectors = [
    '.section-header',
    '.featured-card',
    '.value-card',
    '.timeline-item',
    '.brand-story-text',
    '.brand-story-image',
  ];

  selectors.forEach((sel, sIdx) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      if (i > 0) el.classList.add(`reveal-delay-${Math.min(i, 3)}`);
    });
  });
}

/* =========================================
   HERO PARALLAX (subtle)
   ========================================= */
const heroImg = document.querySelector('.hero-img');
window.addEventListener('scroll', () => {
  if (heroImg && currentPage === 'home') {
    const scrolled = window.scrollY;
    heroImg.style.transform = `scale(1) translateY(${scrolled * 0.25}px)`;
  }
}, { passive: true });

/* =========================================
   SMOOTH SCROLL INDICATOR
   ========================================= */
window.addEventListener('scroll', () => {
  const hero = document.getElementById('hero');
  const hint = document.querySelector('.hero-scroll-hint');
  if (hero && hint) {
    hint.style.opacity = Math.max(0, 1 - window.scrollY / 200);
  }
}, { passive: true });

/* =========================================
   INIT
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Kickstart home page
  navigateTo('home');

  // Lazy load initial images
  lazyLoadImages();

  // Reveal animations
  addRevealClasses();
  setTimeout(triggerReveal, 200);

  // Header style
  updateHeaderStyle();

  // Preload first page
  renderProducts();
});

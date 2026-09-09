/**
 * Bhopal Farmline — main.js (v3.0 Ultra Clean)
 * Handles site navigation, live filtering, detail template, and farmhouse submission.
 */

// Global Error Boundary for Diagnostics
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Diagnostic error caught:", message, source, lineno, colno, error);
  var errorDiv = document.getElementById('jsDiagnosticError');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'jsDiagnosticError';
    errorDiv.style.position = 'fixed';
    errorDiv.style.bottom = '10px';
    errorDiv.style.right = '10px';
    errorDiv.style.backgroundColor = '#991B1B';
    errorDiv.style.color = '#FFF';
    errorDiv.style.padding = '12px 18px';
    errorDiv.style.borderRadius = '8px';
    errorDiv.style.zIndex = '99999';
    errorDiv.style.fontFamily = 'monospace';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    errorDiv.innerHTML = '<strong>⚠️ Error:</strong> ' + message;
    document.body.appendChild(errorDiv);
  }
  return false;
};

// Supabase Configuration
const SUPABASE_URL = 'https://jgardnqycrpvgkhwzdkw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYXJkbnF5Y3JwdmdraHd6ZGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NjI5NzQsImV4cCI6MjA5NzMzODk3NH0.Ej_BHaG9kqkuG5CyRIE_qktAH2wcMYF05Jrjjij_dpQ';

// Video storage: max 20MB per file, ~50 videos fit in 1GB free tier bucket. Video upload is optional per listing.
// video_url: optional, one video per farmhouse. Max 20MB per file.
// Used in rotating hero showcase on index.html and shown alongside
// photos on the farmhouse detail page. Owner uploads via add-farmhouse.html.

// ── SUPABASE TOGGLE ──────────────────────────────────────────────
// Live database connected.
const SUPABASE_ENABLED = true;
// ─────────────────────────────────────────────────────────────────

let supabaseClient = null;
if (SUPABASE_ENABLED && typeof window.supabase !== 'undefined' && window.supabase.createClient) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Storage Helpers
function safeSessionGet(key) {
  try { return sessionStorage.getItem(key); } catch (e) { return null; }
}
function safeSessionSet(key, value) {
  try { sessionStorage.setItem(key, value); } catch (e) {}
}
function safeSessionRemove(key) {
  try { sessionStorage.removeItem(key); } catch (e) {}
}

// UI Configuration Constants (Filter Options & Icons)
window.areas = window.areas || [
  "Kolar Road", "Ratibad", "Berasia Road", "Vidisha Road", "Obedullaganj",
  "Hoshangabad Road", "Kerwa Dam", "Misrod", "Neelbad", "Phanda",
  "Katara Hills", "Bairagarh", "Raisen Road", "Sehore Road", "Ayodhya Bypass",
  "Bhadbhada Road", "Kalkheda", "Islam Nagar", "Badwai", "Mandideep", "Airport Road"
];

window.amenityFilters = window.amenityFilters || [
  "Pool", "DJ Allowed", "Bonfire/BBQ", "AC Rooms", "Overnight Stay",
  "Catering", "Crockery & Utensils", "Tables & Chairs", "Tents", "Parking", "Decoration Service"
];

window.amenityIcons = window.amenityIcons || {
  "Pool": "🏊", "DJ Allowed": "🎵", "Bonfire/BBQ": "🔥", "AC Rooms": "❄️",
  "Overnight Stay": "🌙", "Catering": "🍽️", "Crockery & Utensils": "🍴",
  "Tables & Chairs": "🪑", "Tents": "⛺", "Parking": "🅿️", "Decoration Service": "🎊"
};

window.bestForOptions = window.bestForOptions || [
  "Wedding", "Birthday", "Picnic", "Family Gathering", "Corporate", "Other"
];

window.bestForIcons = window.bestForIcons || {
  "Wedding": "💒", "Birthday": "🎂", "Picnic": "🧺",
  "Family Gathering": "👨‍👩‍👧‍👦", "Corporate": "💼", "Other": "🎉"
};

// Global State
let allFarmhouses = [];
let filteredFarmhouses = [];
let activeAreaFilter = null;
let activeAmenityFilters = [];
let searchQuery = '';
let compareList = [];
let galleryImages = [];
let lbIndex = 0;

// Escape HTML
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// URL Params
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Page Detection
function detectCurrentPage() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('add-farmhouse.html') || document.getElementById('farmhouseForm') || document.getElementById('ownershipGate')) {
    return 'form';
  } else if (path.includes('farmhouse.html') || document.getElementById('detailContent')) {
    return 'detail';
  } else if (path.includes('about.html')) {
    return 'about';
  } else if (path.includes('privacy.html')) {
    return 'privacy';
  } else {
    return 'home';
  }
}

// App Initialization
function initializeApp() {
  initMobileMenu();
  initBackToTop();
  initPageTransitions();
  initScrollDrawDividers();
  
  const page = detectCurrentPage();
  if (page === 'home') {
    initHomePage();
  } else if (page === 'detail') {
    initDetailPage();
  } else if (page === 'form') {
    initFormPage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// --- PAGE TRANSITIONS (Soft cross-fade between pages) ---
function initPageTransitions() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('page-loaded');
    return;
  }

  window.requestAnimationFrame(() => {
    document.body.classList.add('page-loaded');
  });

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('https://wa.me') || href.startsWith('http') || link.getAttribute('target') === '_blank') {
      return;
    }
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(() => {
        window.location.href = href;
      }, 180);
    });
  });
}

// --- SCROLL-TRIGGERED RULE DIVIDERS & EYEBROWS DRAW-IN ---
function initScrollDrawDividers() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-drawn');
        const parent = entry.target.closest('section, .detail-section-block, .form-section, .content-card, .search-card');
        if (parent) {
          const eyebrow = parent.querySelector('.section-eyebrow');
          if (eyebrow) eyebrow.classList.add('eyebrow-revealed');
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.filter-divider, .hero-meta-bar, .listings-header, .form-section, .detail-section-block, .rule').forEach(el => {
    el.classList.add('draw-line');
    observer.observe(el);
  });
}

// --- MOBILE MENU ---
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.classList.remove('active');
      });
    });
  }
}

// --- BACK TO TOP ---
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) btn.classList.add('visible');
    else btn.classList.remove('visible');
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// --- HOME PAGE LOGIC ---
async function initHomePage() {
  renderFilterButtons();
  setupSearchAndControls();
  
  allFarmhouses = await fetchListings();
  updateStats();
  renderNewListings();
  renderFilterButtons();
  applyFilters();

  // Rotating hero video showcase for approved listings with video_url
  const withVideo = allFarmhouses.filter(f => Boolean(f.video_url));
  initHeroVideoShowcase(withVideo);
}

// Rotating hero video showcase
// Only activates if approved farmhouses with video_url exist.
// Falls back to static placeholder (unchanged) if none do.
function initHeroVideoShowcase(farmhousesWithVideo) {
  const placeholder = document.querySelector('.hero-video-placeholder');
  const videoEl = document.querySelector('.hero-video');
  const overlay = document.querySelector('.hero-video-overlay');
  const caption = document.querySelector('.hero-video-caption');
  const captionName = document.querySelector('.hero-video-caption-name');
  const captionArea = document.querySelector('.hero-video-caption-area');

  if (!farmhousesWithVideo || farmhousesWithVideo.length === 0 || !videoEl) {
    return; // keep existing static placeholder
  }

  // Activate video container
  if (placeholder) placeholder.style.display = 'none';
  videoEl.style.display = 'block';
  if (overlay) overlay.style.display = 'block';
  if (caption) caption.style.display = 'flex';

  let currentIndex = 0;

  function playCurrent(fade = false) {
    const fh = farmhousesWithVideo[currentIndex];
    if (!fh || !fh.video_url) return;

    if (fade) {
      videoEl.classList.add('video-fade');
      if (caption) caption.style.opacity = '0';
      setTimeout(() => {
        videoEl.src = fh.video_url;
        videoEl.play().catch(() => {});
        if (captionName) captionName.textContent = fh.name;
        if (captionArea) captionArea.textContent = fh.area;
        videoEl.classList.remove('video-fade');
        if (caption) caption.style.opacity = '1';
      }, 300);
    } else {
      videoEl.src = fh.video_url;
      videoEl.play().catch(() => {});
      if (captionName) captionName.textContent = fh.name;
      if (captionArea) captionArea.textContent = fh.area;
    }
  }

  // Play first video without upfront preloading of others
  playCurrent(false);

  // If user prefers reduced motion, do not auto-rotate
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // If multiple videos exist, auto-cycle every 8 seconds with cross-fade
  if (farmhousesWithVideo.length > 1) {
    setInterval(() => {
      currentIndex = (currentIndex + 1) % farmhousesWithVideo.length;
      playCurrent(true);
    }, 8000);
  }
}

// Fetch Listings from Supabase / Fallback
async function fetchListings() {
  const CACHE_KEY = 'bhopal_farmhouses_live_v4';
  const CACHE_TIME = 'bhopal_farmhouses_live_v4_time';
  const TTL = 2 * 60 * 1000;
  
  const cached = safeSessionGet(CACHE_KEY);
  const time = safeSessionGet(CACHE_TIME);
  if (cached && time && (Date.now() - parseInt(time) < TTL)) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch(e) {}
  }
  
  if (supabaseClient) {
    try {
      // Try ordering by submitted_at first, then fallback to default select
      let res = await supabaseClient
        .from('farmhouses')
        .select('*')
        .order('submitted_at', { ascending: false });
        
      if (res.error) {
        res = await supabaseClient.from('farmhouses').select('*');
      }
      
      const { data, error } = res;
      if (!error && data) {
        const approved = data.filter(item => !item.status || item.status.toLowerCase() === 'approved');
        const formatted = approved.map(item => ({
          id: item.id,
          name: item.name,
          area: item.area,
          address: item.address,
          capacity: item.capacity,
          priceRange: item.price_range || item.priceRange,
          amenities: item.amenities || [],
          bestFor: item.best_for || item.bestFor || [],
          description: item.description,
          phone: item.phone,
          whatsapp: item.whatsapp,
          images: item.image_urls || item.images || [],
          video_url: item.video_url || item.videoUrl || null,
          reviews: item.reviews || [],
          faqs: item.faqs || [],
          enquiryCount: item.enquiry_count || 0
        }));
        
        if (formatted.length > 0) {
          safeSessionSet(CACHE_KEY, JSON.stringify(formatted));
          safeSessionSet(CACHE_TIME, Date.now().toString());
        }
        return formatted;
      }
    } catch(err) {
      console.error("Supabase fetch failed:", err);
    }
  }
  
  return window.farmhouses || [];
}

// Render Filter Buttons
function renderFilterButtons() {
  const areaContainer = document.getElementById('areaFilters');
  const amenityContainer = document.getElementById('amenityFilters');
  
  // Base predefined areas
  const baseAreas = (window.areas || []).slice();
  const allKnownAreas = [...baseAreas];
  
  // Dynamically add any custom areas from active listings if not already in the predefined list
  if (Array.isArray(allFarmhouses) && allFarmhouses.length > 0) {
    allFarmhouses.forEach(f => {
      if (f.area && typeof f.area === 'string') {
        const trimmed = f.area.trim();
        if (trimmed && !allKnownAreas.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
          // Capitalize each word nicely
          const formattedArea = trimmed.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          allKnownAreas.push(formattedArea);
        }
      }
    });
  }
  
  const amenityList = window.amenityFilters || [];
  const amenityIconsMap = window.amenityIcons || {};
  
  if (areaContainer) {
    let html = `<button class="filter-btn ${activeAreaFilter === null ? 'neu-pressed area-active' : 'neu-raised'}" data-type="area" data-value="all">Sab Jagah</button>`;
    html += allKnownAreas.map(area => {
      const active = (activeAreaFilter && activeAreaFilter.toLowerCase() === area.toLowerCase()) ? ' neu-pressed area-active' : ' neu-raised';
      return `<button class="filter-btn${active}" data-type="area" data-value="${escapeHTML(area)}">${escapeHTML(area)}</button>`;
    }).join('');
    areaContainer.innerHTML = html;
    
    areaContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.value;
        if (val === 'all') {
          activeAreaFilter = null;
        } else {
          activeAreaFilter = val;
        }
        renderFilterButtons();
        applyFilters();
      });
    });
  }
  
  if (amenityContainer) {
    amenityContainer.innerHTML = amenityList.map(amenity => {
      const active = activeAmenityFilters.includes(amenity) ? ' neu-pressed amenity-active' : ' neu-raised';
      const icon = amenityIconsMap[amenity] || '✨';
      return `<button class="filter-btn${active}" data-type="amenity" data-value="${escapeHTML(amenity)}">${icon} ${escapeHTML(amenity)}</button>`;
    }).join('');
    
    amenityContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.value;
        const idx = activeAmenityFilters.indexOf(val);
        if (idx === -1) {
          activeAmenityFilters.push(val);
        } else {
          activeAmenityFilters.splice(idx, 1);
        }
        renderFilterButtons();
        applyFilters();
      });
    });
  }
}


// Search & Controls
function setupSearchAndControls() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const clearFiltersBtn = document.getElementById('clearFilters');
  const clearAmenitiesBtn = document.getElementById('clearAmenities');
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      if (searchClear) searchClear.style.display = searchQuery ? 'flex' : 'none';
      applyFilters();
    });
  }
  
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      searchClear.style.display = 'none';
      applyFilters();
    });
  }
  
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      activeAreaFilter = null;
      activeAmenityFilters = [];
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.style.display = 'none';
      renderFilterButtons();
      applyFilters();
    });
  }

  if (clearAmenitiesBtn) {
    clearAmenitiesBtn.addEventListener('click', () => {
      activeAmenityFilters = [];
      renderFilterButtons();
      applyFilters();
    });
  }
}

// Number Count-Up Animation (Magic UI Number Ticker pattern)
function animateNumberCountUp(el, targetValue, duration = 1200) {
  if (!el) return;
  const num = parseInt(targetValue, 10);
  if (isNaN(num) || num <= 0) {
    el.textContent = targetValue || 0;
    return;
  }
  
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = num;
    return;
  }

  let start = null;
  const startVal = 0;
  
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    // Ease-out cubic curve
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(startVal + easeProgress * (num - startVal));
    el.textContent = current;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      el.textContent = num;
    }
  }
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          window.requestAnimationFrame(step);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(el);
  } else {
    window.requestAnimationFrame(step);
  }
}

// Update Hero Stats with Animated Number Ticker
function updateStats() {
  const statF = document.getElementById('statFarmhouses');
  const statA = document.getElementById('statAreas');
  const countF = allFarmhouses.length || (window.farmhouses ? window.farmhouses.length : 0);
  const uniqueAreas = new Set((allFarmhouses.length ? allFarmhouses : (window.farmhouses||[])).map(f => f.area));
  const countA = uniqueAreas.size || (window.areas ? window.areas.length : 0);
  
  if (statF) animateNumberCountUp(statF, countF);
  if (statA) animateNumberCountUp(statA, countA);
}

// Render Recently Added Row
function renderNewListings() {
  const section = document.getElementById('newListingsSection');
  const grid = document.getElementById('newListingsGrid');
  if (!section || !grid) return;
  
  if (allFarmhouses.length >= 2) {
    section.style.display = 'block';
    grid.innerHTML = allFarmhouses.slice(0, 4).map(f => createCardHTML(f, true)).join('');
    initCardAnimations();
  } else {
    section.style.display = 'none';
  }
}

// Apply All Active Filters
function applyFilters() {
  filteredFarmhouses = allFarmhouses.filter(f => {
    // Search query
    if (searchQuery) {
      const haystack = `${f.name} ${f.area} ${f.address} ${f.description}`.toLowerCase();
      if (!haystack.includes(searchQuery)) return false;
    }
    // Area filter (single select, case-insensitive)
    if (activeAreaFilter && activeAreaFilter.toLowerCase() !== (f.area || '').toLowerCase()) {
      return false;
    }
    // Amenity filter (must match ALL active)
    if (activeAmenityFilters.length > 0) {
      const fAmens = f.amenities || [];
      const hasAll = activeAmenityFilters.every(a => fAmens.includes(a));
      if (!hasAll) return false;
    }
    return true;
  });
  
  // Update clear buttons and badges
  const clearAmenitiesBtn = document.getElementById('clearAmenities');
  const amenitySelected = document.getElementById('amenitySelected');
  if (activeAmenityFilters.length > 0) {
    if (clearAmenitiesBtn) clearAmenitiesBtn.style.display = 'block';
    if (amenitySelected) {
      amenitySelected.textContent = `${activeAmenityFilters.length} suvidhaen select ki gayi hain`;
      amenitySelected.style.display = 'block';
    }
  } else {
    if (clearAmenitiesBtn) clearAmenitiesBtn.style.display = 'none';
    if (amenitySelected) amenitySelected.style.display = 'none';
  }

  const hasAnyFilter = activeAreaFilter !== null || activeAmenityFilters.length > 0 || searchQuery.length > 0;
  const clearFiltersBtn = document.getElementById('clearFilters');
  if (clearFiltersBtn) {
    clearFiltersBtn.style.display = hasAnyFilter ? 'block' : 'none';
  }
  
  const countDisplay = document.getElementById('listingsCount');
  if (countDisplay) {
    countDisplay.textContent = `${filteredFarmhouses.length} farmhouse${filteredFarmhouses.length !== 1 ? 's' : ''} mile`;
  }
  
  renderCardGrid();
}

// Render Card Grid
function renderCardGrid() {
  const grid = document.getElementById('cardGrid');
  if (!grid) return;
  
  if (filteredFarmhouses.length === 0) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column: 1/-1; padding: var(--space-8) var(--space-4); text-align: center;">
        <div class="no-results-emoji" style="font-size: 3.2rem; margin-bottom: var(--space-3);">🏡</div>
        <h3 class="no-results-text" style="font-family: var(--font-display); font-size: 1.4rem; color: var(--ink-primary); margin-bottom: var(--space-2);">No farmhouses found</h3>
        <p style="color: var(--ink-muted); font-size: 0.95rem; max-width: 440px; margin: 0 auto var(--space-5);">No farmhouses match your active filters, or no verified listings have been published yet.</p>
        <a href="add-farmhouse.html" class="btn btn-primary btn-large" style="display: inline-flex; width: auto;">+ List Your Farmhouse (Free)</a>
      </div>`;
    return;
  }
  
  grid.innerHTML = filteredFarmhouses.map(f => createCardHTML(f)).join('');
  initCardAnimations();
}

// Fire GA4 event alongside the existing Supabase enquiry counter.
// This does not replace enquiry_count — it's a second, independent
// record so visitor behavior can be viewed in Google Analytics too.
window.trackContactClick = function(farmhouseId, farmhouseName, contactMethod) {
  if (typeof gtag === 'function') {
    gtag('event', 'contact_click', {
      'farmhouse_id': farmhouseId,
      'farmhouse_name': farmhouseName,
      'contact_method': contactMethod // 'whatsapp' or 'call'
    });
  }

  // Increment Supabase enquiry counter if connected
  if (supabaseClient && farmhouseId) {
    try {
      supabaseClient.rpc('increment_enquiry', { farmhouse_id: farmhouseId }).catch(() => {});
    } catch(e) {}
  }
};

// Create Card HTML — Clean Separated Structured Layout
function createCardHTML(f, isNew = false) {
  const imgUrl = (f.images && f.images.length > 0) ? f.images[0] : '';
  const amens = f.amenities || [];
  const iconsMap = window.amenityIcons || {};
  const topAmens = amens.slice(0, 3).map(a => `<span class="card-amenity-pill">${iconsMap[a] || '✨'} ${escapeHTML(a)}</span>`).join('');
  
  const badgeHTML = isNew ? `<div class="card-badge-new">NEW LISTING</div>` : '';
  const imgHTML = imgUrl 
    ? `<img src="${escapeHTML(imgUrl)}" class="card-image" loading="lazy" decoding="async" width="400" height="220" alt="${escapeHTML(f.name)}">`
    : `<div class="card-image-placeholder">🏡</div>`;
    
  const waMsg = encodeURIComponent(`Hi! I saw ${f.name} on Bhopal Farmline and want to enquire about availability.`);
  const waNumber = String(f.whatsapp || f.phone || '').replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/91${waNumber.slice(-10)}?text=${waMsg}`;
  const callLink = `tel:+91${String(f.phone || '').slice(-10)}`;
  
  return `
    <article class="farm-card" onclick="if(!event.target.closest('.card-actions')) window.location.href='farmhouse.html?id=${f.id}'">
      <div class="card-image-wrapper">
        ${badgeHTML}
        ${imgHTML}
        <div class="card-area-badge">📍 ${escapeHTML(f.area)}</div>
      </div>
      
      <div class="card-body">
        <h3 class="card-name">${escapeHTML(f.name)}</h3>
        
        <div class="card-specs-row">
          <div class="spec-col">
            <span class="spec-label">Capacity</span>
            <span class="spec-val">👥 Up to ${f.capacity || '50'}</span>
          </div>
          <div class="spec-col">
            <span class="spec-label">Tariff / Day</span>
            <span class="spec-val spec-price">💰 ${escapeHTML(f.priceRange || 'Contact')}</span>
          </div>
        </div>

        ${topAmens ? `<div class="card-amenities-row">${topAmens}</div>` : ''}

        <div class="card-actions">
          <a href="${waLink}" class="btn btn-whatsapp" target="_blank" rel="noopener" onclick="event.stopPropagation(); trackContactClick('${f.id}', '${escapeHTML(f.name).replace(/'/g, "\\'")}', 'whatsapp');">WhatsApp</a>
          <a href="${callLink}" class="btn btn-call" onclick="event.stopPropagation(); trackContactClick('${f.id}', '${escapeHTML(f.name).replace(/'/g, "\\'")}', 'call');">Call</a>
        </div>
      </div>
    </article>
  `;
}

// Farmhouse Cards Scroll-Reveal + Restrained 3D Tilt (Magic UI Blur Fade pattern)
function initCardAnimations() {
  const cards = document.querySelectorAll('.farm-card:not(.animated-card)');
  if (cards.length === 0) return;

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const parent = card.parentElement;
          const index = parent ? Array.from(parent.children).indexOf(card) : 0;
          const delay = (index % 3) * 60;
          setTimeout(() => {
            card.classList.add('card-visible');
          }, delay);
          obs.unobserve(card);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    cards.forEach(card => {
      card.classList.add('card-reveal-init', 'animated-card');
      observer.observe(card);
    });
  } else {
    cards.forEach(card => {
      card.classList.add('card-visible', 'animated-card');
    });
  }

  // Subtle cursor tilt on hover (max 4-6 degrees)
  if (!prefersReducedMotion && !('ontouchstart' in window)) {
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-3px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }
}

// --- DETAIL PAGE LOGIC ---
async function initDetailPage() {
  const id = getUrlParam('id');
  if (!id) {
    showDetailError('No farmhouse specified. Please return to Browse.');
    return;
  }
  
  let farm = null;
  if (supabaseClient) {
    try {
      const { data } = await supabaseClient.from('farmhouses').select('*').eq('id', id).single();
      if (data) {
        farm = {
          id: data.id,
          name: data.name,
          area: data.area,
          address: data.address,
          capacity: data.capacity,
          priceRange: data.price_range || data.priceRange,
          amenities: data.amenities || [],
          bestFor: data.best_for || data.bestFor || [],
          description: data.description,
          phone: data.phone,
          whatsapp: data.whatsapp,
          images: data.image_urls || data.images || [],
          video_url: data.video_url || data.videoUrl || null,
          reviews: data.reviews || [],
          faqs: data.faqs || [],
          enquiryCount: data.enquiry_count || 0
        };
      }
    } catch(err) {}
  }
  
  if (!farm) {
    const list = window.farmhouses || [];
    farm = list.find(f => f.id === id);
  }
  
  if (!farm) {
    showDetailError('Farmhouse listing not found.');
    return;
  }
  
  populateDetailPage(farm);
}

function showDetailError(msg) {
  const content = document.getElementById('detailContent');
  if (content) {
    content.innerHTML = `
      <div class="no-results" style="padding: 4rem 1rem;">
        <div class="no-results-emoji">😕</div>
        <div class="no-results-text">Listing Not Found</div>
        <div class="no-results-subtext">${escapeHTML(msg)}</div>
        <a href="index.html" class="btn btn-primary mt-lg">← Back to Browse</a>
      </div>`;
  }
}

function populateDetailPage(farm) {
  document.title = `${farm.name} — Bhopal Farmline`;

  // Dynamic SEO & Open Graph Metadata
  const dynamicDesc = `${farm.name} in ${farm.area}, Bhopal. Capacity: up to ${farm.capacity} guests. Tariff: ${farm.priceRange || 'Contact Owner'}. Direct owner contact with zero booking fees.`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = dynamicDesc;

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = `${farm.name} — Bhopal Farmline`;

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.content = dynamicDesc;

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.content = window.location.href;

  const ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg && farm.images && farm.images.length > 0) {
    ogImg.content = farm.images[0];
  }
  
  // Area & Name
  const areaEl = document.getElementById('detailArea');
  const nameEl = document.getElementById('detailName');
  if (areaEl) areaEl.textContent = `📍 ${farm.area}`;
  if (nameEl) nameEl.textContent = farm.name;
  
  // Badges
  const badgesEl = document.getElementById('detailBadges');
  if (badgesEl) {
    badgesEl.innerHTML = `
      <span class="stamp-badge">👥 Up to ${farm.capacity} Guests</span>
      <span class="stamp-badge">💰 ${escapeHTML(farm.priceRange)}</span>`;
  }
  
  // Best For
  const bestForEl = document.getElementById('bestForTags');
  if (bestForEl) {
    const icons = window.bestForIcons || {};
    bestForEl.innerHTML = (farm.bestFor || []).map(tag => `<span class="best-for-tag">${icons[tag] || '🎉'} ${escapeHTML(tag)}</span>`).join('');
  }
  
  // Amenities
  const amensEl = document.getElementById('amenityList');
  if (amensEl) {
    const icons = window.amenityIcons || {};
    amensEl.innerHTML = (farm.amenities || []).map(a => `<div class="amenity-item"><span class="icon">${icons[a] || '✨'}</span> <span>${escapeHTML(a)}</span></div>`).join('');
  }
  
  // Description & Address
  const descEl = document.getElementById('detailDescription');
  const addrEl = document.getElementById('detailAddress');
  const mapLink = document.getElementById('mapLink');
  if (descEl) descEl.textContent = farm.description || 'No description provided.';
  if (addrEl) addrEl.textContent = farm.address || farm.area;
  if (mapLink) {
    mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((farm.address || farm.area) + ', Bhopal')}`;
  }
  
  // WhatsApp & Call Buttons
  const waBtn = document.getElementById('detailWhatsapp');
  const callBtn = document.getElementById('detailCall');
  
  if (waBtn) {
    const msg = encodeURIComponent(`Hi! I saw ${farm.name} on Bhopal Farmline and want to check availability.`);
    const num = String(farm.whatsapp || farm.phone || '').replace(/[^0-9]/g, '').slice(-10);
    waBtn.href = `https://wa.me/91${num}?text=${msg}`;
    waBtn.onclick = () => {
      trackContactClick(farm.id, farm.name, 'whatsapp');
    };
  }
  
  if (callBtn) {
    const num = String(farm.phone || '').replace(/[^0-9]/g, '').slice(-10);
    callBtn.href = `tel:+91${num}`;
    callBtn.onclick = () => {
      trackContactClick(farm.id, farm.name, 'call');
    };
  }
  
  // Share Button
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'listing_shared', {
          'farmhouse_id': farm.id
        });
      }
      if (navigator.share) {
        navigator.share({ title: farm.name, text: `Check out ${farm.name} on Bhopal Farmline!`, url: window.location.href });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        const tooltip = document.getElementById('shareTooltip');
        if (tooltip) {
          tooltip.style.display = 'block';
          setTimeout(() => tooltip.style.display = 'none', 2000);
        }
      }
    });
  }
  
  // Gallery & Video
  galleryImages = farm.images || [];
  const gVideo = document.getElementById('galleryVideo');
  const gMain = document.getElementById('galleryMain');
  const gPlaceholder = document.getElementById('galleryPlaceholder');
  const gThumbs = document.getElementById('galleryThumbs');
  const hasVideo = Boolean(farm.video_url);

  window.showGalleryVideo = function() {
    if (gVideo && farm.video_url) {
      gVideo.src = farm.video_url;
      gVideo.style.display = 'block';
    }
    if (gMain) gMain.style.display = 'none';
    if (gPlaceholder) gPlaceholder.style.display = 'none';
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    const vThumb = document.querySelector('.gallery-thumb-video');
    if (vThumb) vThumb.classList.add('active');
  };

  window.changeMainImage = function(url, thumbEl, index) {
    if (gVideo) {
      gVideo.pause();
      gVideo.style.display = 'none';
    }
    if (gMain) {
      gMain.src = url;
      gMain.style.display = 'block';
    }
    if (gPlaceholder) gPlaceholder.style.display = 'none';
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
    lbIndex = index;
  };

  if (gThumbs) {
    let thumbsHTML = '';
    if (hasVideo) {
      thumbsHTML += `
        <div class="gallery-thumb gallery-thumb-video active" onclick="showGalleryVideo()">
          <span style="font-size:1.1rem;">🎥</span>
          <span style="font-size:0.6rem; font-family:var(--font-mono); text-transform:uppercase;">Video</span>
        </div>
      `;
    }
    if (galleryImages.length > 0) {
      thumbsHTML += galleryImages.map((img, i) => `
        <img src="${escapeHTML(img)}" class="gallery-thumb ${(!hasVideo && i===0)?'active':''}" loading="lazy" decoding="async" alt="Thumbnail ${i+1}" onclick="changeMainImage('${escapeHTML(img)}', this, ${i})">
      `).join('');
    }
    gThumbs.innerHTML = thumbsHTML;
  }

  if (hasVideo) {
    window.showGalleryVideo();
  } else if (galleryImages.length > 0 && gMain) {
    gMain.src = galleryImages[0];
    gMain.style.display = 'block';
    if (gPlaceholder) gPlaceholder.style.display = 'none';
    if (gVideo) gVideo.style.display = 'none';
  } else {
    if (gMain) gMain.style.display = 'none';
    if (gVideo) gVideo.style.display = 'none';
    if (gPlaceholder) gPlaceholder.style.display = 'flex';
  }

  if (gMain) {
    gMain.addEventListener('click', () => {
      if (galleryImages.length > 0) openLightbox(lbIndex);
    });
  }
  
  // Reviews
  const revSec = document.getElementById('reviewsSection');
  const revList = document.getElementById('reviewsList');
  if (revSec && revList) {
    const revs = farm.reviews || [];
    if (revs.length > 0) {
      revSec.style.display = 'block';
      revList.innerHTML = revs.map(r => `
        <div class="review-card card-reveal-init">
          <p class="review-text">"${escapeHTML(r.text)}"</p>
          <div class="review-author"><strong>${escapeHTML(r.name)}</strong> • <span>${escapeHTML(r.event || 'Guest')}</span></div>
        </div>
      `).join('');
      initCardAnimations();
    } else {
      revSec.style.display = 'none';
    }
  }
  
  // FAQs
  const faqSec = document.getElementById('faqsSection');
  const faqList = document.getElementById('faqsList');
  if (faqSec && faqList) {
    const faqs = farm.faqs || [];
    if (faqs.length > 0) {
      faqSec.style.display = 'block';
      faqList.innerHTML = faqs.map(f => `
        <div class="faq-item">
          <button class="faq-trigger" type="button">
            <span>${escapeHTML(f.q)}</span>
            <span class="faq-icon">▾</span>
          </button>
          <div class="faq-content">
            <div class="faq-inner">
              <p>${escapeHTML(f.a)}</p>
            </div>
          </div>
        </div>
      `).join('');
      
      faqList.querySelectorAll('.faq-trigger').forEach(trig => {
        trig.addEventListener('click', () => {
          const item = trig.closest('.faq-item');
          const isOpen = item.classList.contains('open');
          faqList.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
          if (!isOpen) {
            item.classList.add('open');
          }
        });
      });
    } else {
      faqSec.style.display = 'none';
    }
  }
}

// Gallery Helper
window.changeMainImage = function(url, thumbEl, index) {
  const main = document.getElementById('galleryMain');
  if (main) main.src = url;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
  lbIndex = index;
};

// Lightbox
function openLightbox(index) {
  if (!galleryImages.length) return;
  lbIndex = index;
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  if (box && img) {
    img.src = galleryImages[lbIndex];
    box.style.display = 'flex';
  }
}

const lbClose = document.getElementById('lightboxClose');
if (lbClose) {
  lbClose.addEventListener('click', () => {
    const box = document.getElementById('lightbox');
    if (box) box.style.display = 'none';
  });
}

// --- FORM PAGE LOGIC ---
function initFormPage() {
  const form = document.getElementById('farmhouseForm');
  const formWrapper = document.getElementById('formWrapper');
  const gate = document.getElementById('ownershipGate');
  const gateYes = document.getElementById('gateYes');
  
  // Ownership Gate Handling
  if (gate && gateYes) {
    gateYes.addEventListener('click', () => {
      gate.style.display = 'none';
      if (formWrapper) formWrapper.style.display = 'block';
      if (form) form.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
    
  // Custom Area Toggle
  const areaSel = document.getElementById('formArea');
  const areaCustom = document.getElementById('formAreaCustom');
  if (areaSel && areaCustom) {
    areaSel.addEventListener('change', () => {
      if (areaSel.value === 'Other') {
        areaCustom.style.display = 'block';
        areaCustom.required = true;
        areaCustom.focus();
      } else {
        areaCustom.style.display = 'none';
        areaCustom.required = false;
        areaCustom.value = '';
      }
    });
  }
  
  // Phone Restrictions (10 digits)
  ['formSubmitterPhone', 'formPhone', 'formWhatsapp'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/[^0-9]/g, '').slice(0, 10);
      });
    }
  });
  
  // Same as Phone Checkbox
  const sameCheck = document.getElementById('sameAsPhone');
  const phoneIn = document.getElementById('formPhone');
  const waIn = document.getElementById('formWhatsapp');
  if (sameCheck && phoneIn && waIn) {
    sameCheck.addEventListener('change', () => {
      if (sameCheck.checked) {
        waIn.value = phoneIn.value;
      }
    });
    phoneIn.addEventListener('input', () => {
      if (sameCheck.checked) {
        waIn.value = phoneIn.value;
      }
    });
  }
  
  // Permission Checkbox -> Submit Button Enable
  const permCheck = document.getElementById('formPermission');
  const submitBtn = document.getElementById('submitBtn');
  if (permCheck && submitBtn) {
    const updateSubmit = () => { submitBtn.disabled = !permCheck.checked; };
    updateSubmit();
    permCheck.addEventListener('change', updateSubmit);
  }

  // Instant Visual Feedback for Amenities and Best-For Checkbox Chips
  document.querySelectorAll('.checkbox-visual input[type="checkbox"]').forEach(cb => {
    const updateVisual = () => {
      const parent = cb.closest('.checkbox-visual');
      if (parent) {
        parent.classList.toggle('is-checked', cb.checked);
      }
    };
    updateVisual();
    cb.addEventListener('change', updateVisual);
  });
  
  // Photo Upload & Previews
  let selectedFiles = [];
  const photoInput = document.getElementById('formPhotos');
  const uploadArea = document.getElementById('uploadArea');
  const uploadPreviews = document.getElementById('uploadPreviews');
  
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 5) {
        alert('Maximum 5 photos allowed.');
        photoInput.value = '';
        return;
      }

      // Check MIME type and file size (max 5MB per photo)
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
      const maxPhotoBytes = 5 * 1024 * 1024; // 5MB

      for (let f of files) {
        if (!allowedMimes.includes(f.type)) {
          alert(`File "${f.name}" is not a valid image format. Only JPG, PNG, WebP, and AVIF are allowed.`);
          photoInput.value = '';
          selectedFiles = [];
          renderPhotoPreviews();
          return;
        }
        if (f.size > maxPhotoBytes) {
          alert(`Photo "${f.name}" exceeds the 5MB size limit. Please choose a smaller photo.`);
          photoInput.value = '';
          selectedFiles = [];
          renderPhotoPreviews();
          return;
        }
      }

      selectedFiles = files;
      renderPhotoPreviews();
    });
  }
  
  function renderPhotoPreviews() {
    if (!uploadPreviews) return;
    if (selectedFiles.length === 0) {
      uploadPreviews.style.display = 'none';
      uploadPreviews.innerHTML = '';
      return;
    }
    uploadPreviews.style.display = 'grid';
    uploadPreviews.innerHTML = selectedFiles.map((file, idx) => `
      <div class="preview-item">
        <img src="${URL.createObjectURL(file)}" alt="Preview ${idx+1}">
        <button type="button" class="preview-remove" onclick="removeSelectedPhoto(${idx})">×</button>
      </div>
    `).join('');
  }
  
  window.removeSelectedPhoto = function(idx) {
    selectedFiles.splice(idx, 1);
    renderPhotoPreviews();
  };

  // Property Video Upload & Preview
  let selectedVideoFile = null;
  const videoInput = document.getElementById('formVideo');
  const videoPreview = document.getElementById('videoPreview');
  const videoError = document.getElementById('videoError');
  const videoUploadArea = document.getElementById('videoUploadArea');

  if (videoInput) {
    videoInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (videoError) {
        videoError.style.display = 'none';
        videoError.textContent = '';
      }

      // Check MIME type: mp4, webm, quicktime
      const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        const msg = 'Sirf MP4, WebM ya MOV video allowed hai';
        if (videoError) {
          videoError.textContent = msg;
          videoError.style.display = 'block';
        } else {
          alert(msg);
        }
        videoInput.value = '';
        selectedVideoFile = null;
        renderVideoPreview();
        return;
      }

      // Check max size: 20MB
      const maxBytes = 20 * 1024 * 1024;
      if (file.size > maxBytes) {
        const msg = 'Video 20MB se bada hai — chhota video try karo ya trim karke upload karo';
        if (videoError) {
          videoError.textContent = msg;
          videoError.style.display = 'block';
        } else {
          alert(msg);
        }
        videoInput.value = '';
        selectedVideoFile = null;
        renderVideoPreview();
        return;
      }

      selectedVideoFile = file;
      renderVideoPreview();
    });
  }

  function renderVideoPreview() {
    if (!videoPreview) return;
    if (!selectedVideoFile) {
      videoPreview.style.display = 'none';
      videoPreview.innerHTML = '';
      if (videoUploadArea) videoUploadArea.style.display = 'block';
      return;
    }

    const sizeMB = (selectedVideoFile.size / (1024 * 1024)).toFixed(1);
    const vObjectUrl = URL.createObjectURL(selectedVideoFile);
    if (videoUploadArea) videoUploadArea.style.display = 'none';
    videoPreview.style.display = 'block';
    videoPreview.innerHTML = `
      <div class="video-preview-card">
        <video src="${vObjectUrl}" class="video-preview-player" controls playsinline></video>
        <div class="video-preview-meta">
          <span class="video-preview-info">🎬 ${escapeHTML(selectedVideoFile.name)} (${sizeMB} MB)</span>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('formVideo').click()">Change</button>
            <button type="button" class="btn btn-ghost btn-sm" onclick="removeSelectedVideo()" style="color:var(--error);">Remove</button>
          </div>
        </div>
      </div>
    `;
  }

  window.removeSelectedVideo = function() {
    selectedVideoFile = null;
    if (videoInput) videoInput.value = '';
    renderVideoPreview();
  };
  
  // Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value !== '') return;

      // Rate limit: 30-second cooldown per client
      const lastSubmitTime = localStorage.getItem('bhopal_last_farmhouse_submit');
      if (lastSubmitTime) {
        const elapsedSec = (Date.now() - parseInt(lastSubmitTime, 10)) / 1000;
        if (elapsedSec < 30) {
          const waitSec = Math.ceil(30 - elapsedSec);
          alert(`Please wait ${waitSec} seconds before submitting another listing.`);
          return;
        }
      }
      
      const submitBtn = document.getElementById('submitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }
      
      try {
        let imageUrls = [];
        if (selectedFiles.length > 0 && window.imageCompression && supabaseClient) {
          for (let file of selectedFiles) {
            if (submitBtn) submitBtn.textContent = 'Compressing & uploading photos...';
            const compressed = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 1280, useWebWorker: true });
            const filename = `farm_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const { error: uploadErr } = await supabaseClient.storage.from('farmhouse-photos').upload(filename, compressed);
            if (!uploadErr) {
              const { data: pubData } = supabaseClient.storage.from('farmhouse-photos').getPublicUrl(filename);
              if (pubData?.publicUrl) imageUrls.push(pubData.publicUrl);
            }
          }
        }

        // Optional Property Video Upload
        let videoUrl = null;
        if (selectedVideoFile && supabaseClient) {
          try {
            if (submitBtn) submitBtn.textContent = 'Uploading property video...';
            const ext = selectedVideoFile.name.split('.').pop() || 'mp4';
            const vFilename = `video_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
            
            // Try dedicated bucket first
            let uploadRes = await supabaseClient.storage.from('farmhouse-videos').upload(vFilename, selectedVideoFile);
            let targetBucket = 'farmhouse-videos';
            
            // If farmhouse-videos bucket doesn't exist or fails, fallback to active farmhouse-photos bucket
            if (uploadRes.error) {
              uploadRes = await supabaseClient.storage.from('farmhouse-photos').upload(vFilename, selectedVideoFile);
              targetBucket = 'farmhouse-photos';
            }
            
            if (!uploadRes.error) {
              const { data: vPubData } = supabaseClient.storage.from(targetBucket).getPublicUrl(vFilename);
              if (vPubData?.publicUrl) videoUrl = vPubData.publicUrl;
            } else {
              console.warn("Video upload warning:", uploadRes.error);
            }
          } catch (vErr) {
            console.warn("Video upload exception:", vErr);
          }
        }
        
        const areaVal = areaSel.value === 'Other' ? areaCustom.value : areaSel.value;
        const amens = Array.from(document.querySelectorAll('input[name="amenities"]:checked')).map(cb => cb.value);
        const bestFor = Array.from(document.querySelectorAll('input[name="best_for"]:checked')).map(cb => cb.value);
        
        const payload = {
          name: document.getElementById('formName').value,
          area: areaVal,
          address: document.getElementById('formAddress').value,
          capacity: parseInt(document.getElementById('formCapacity').value) || 50,
          price_range: document.getElementById('formPrice').value,
          phone: document.getElementById('formPhone').value,
          whatsapp: document.getElementById('formWhatsapp').value,
          description: document.getElementById('formDescription').value,
          amenities: amens,
          best_for: bestFor,
          image_urls: imageUrls,
          video_url: videoUrl,
          owner_confirmed: true,
          status: 'pending'
        };
        
        if (supabaseClient) {
          const { error: dbErr } = await supabaseClient.from('farmhouses').insert([payload]);
          if (dbErr) throw dbErr;
          localStorage.setItem('bhopal_last_farmhouse_submit', Date.now().toString());
        }
        
        // Track form submission as a conversion event
        if (typeof gtag === 'function') {
          gtag('event', 'farmhouse_submitted', {
            'area': areaVal
          });
        }
        
        // Show Success
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
          formContainer.innerHTML = `
            <div class="success-state" style="padding: 4rem 1rem; text-align: center;">
              <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
              <h2 style="font-family: var(--font-display); font-size: 2.2rem; color: var(--primary); margin-bottom: 1rem;">Listing Submitted!</h2>
              <p style="font-size: 1.1rem; max-width: 500px; margin: 0 auto 2rem; color: var(--ink-muted);">
                Dhanyawad! We will call you within 24-48 hours to verify the listing before making it live on Bhopal Farmline.
              </p>
              <a href="index.html" class="btn btn-primary btn-large" style="display: inline-flex; width: auto;">Go to Home Page</a>
            </div>`;
        }
      } catch (err) {
        console.error("Submission error:", err);
        alert("Submission failed: " + err.message);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Listing';
        }
      }
    });
  }
}

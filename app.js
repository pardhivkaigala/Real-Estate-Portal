/**
 * app.js - Core JavaScript for HavenReal Real Estate Portal
 * Features: Separate User & Admin Login Gateways, Property Listings, Filters, Favourites, Contact Owner, Admin Dashboard
 */

// Global State
let properties = JSON.parse(localStorage.getItem('haven_properties')) || [];
let favorites = JSON.parse(localStorage.getItem('haven_favorites')) || [];
let inquiries = JSON.parse(localStorage.getItem('haven_inquiries')) || [];
let currentUser = JSON.parse(localStorage.getItem('haven_current_user')) || null;
let currentAdmin = JSON.parse(localStorage.getItem('haven_current_admin')) || null;
let currentTab = 'explore';

// DOM Ready Init
document.addEventListener('DOMContentLoaded', () => {
  updateFavBadge();
  updateUserNavUI();
  applyFilters();
  renderFavorites();
  renderAdminInventory();
  renderAdminInquiries();
});

/* ==========================================================================
   1. USER AUTHENTICATION & LOGIN (SEPARATE USER LOGIN)
   ========================================================================== */
function quickFillUser() {
  document.getElementById('user-login-email').value = 'user@example.com';
  document.getElementById('user-login-password').value = 'user123';
  handleUserLogin({ preventDefault: () => {} });
}

function handleUserLogin(e) {
  if (e && e.preventDefault) e.preventDefault();

  const email = document.getElementById('user-login-email').value.trim();
  const password = document.getElementById('user-login-password').value.trim();

  if (!email || !password) {
    showToast('Please enter both your email and password', 'error');
    return;
  }

  // Set user session
  currentUser = {
    name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Authenticated User',
    email: email,
    phone: '+1 (555) 321-7654',
    role: 'user',
    loggedInAt: new Date().toISOString()
  };

  localStorage.setItem('haven_current_user', JSON.stringify(currentUser));
  updateUserNavUI();
  showToast(`Welcome back, ${currentUser.name}!`, 'success');
  switchTab('explore');
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('haven_current_user');
  updateUserNavUI();
  showToast('You have been logged out of your user account', 'info');
}

function updateUserNavUI() {
  const btnSignin = document.getElementById('btn-user-signin');
  const profileBadge = document.getElementById('user-profile-badge');

  if (currentUser) {
    btnSignin.classList.add('hidden');
    profileBadge.classList.remove('hidden');
    profileBadge.classList.add('flex');
    document.getElementById('user-display-name').innerText = currentUser.name;
    document.getElementById('user-avatar-initial').innerText = currentUser.name.charAt(0).toUpperCase();
  } else {
    btnSignin.classList.remove('hidden');
    profileBadge.classList.add('hidden');
    profileBadge.classList.remove('flex');
  }
}

/* ==========================================================================
   2. ADMIN AUTHENTICATION & GATEWAY PROTECTION (SEPARATE ADMIN LOGIN)
   ========================================================================== */
function quickFillAdmin() {
  document.getElementById('admin-login-email').value = 'admin@havenreal.com';
  document.getElementById('admin-login-password').value = 'admin123';
  handleAdminLogin({ preventDefault: () => {} });
}

function handleAdminLogin(e) {
  if (e && e.preventDefault) e.preventDefault();

  const email = document.getElementById('admin-login-email').value.trim();
  const password = document.getElementById('admin-login-password').value.trim();

  if (!email || !password) {
    showToast('Please enter valid admin credentials', 'error');
    return;
  }

  // Validate admin credentials (support demo credentials or any email ending in havenreal.com)
  if ((email === 'admin@havenreal.com' && password === 'admin123') || email.includes('admin')) {
    currentAdmin = {
      name: 'Administrator',
      email: email,
      role: 'admin',
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem('haven_current_admin', JSON.stringify(currentAdmin));
    showToast('Admin access granted. Welcome to Portal Management!', 'success');
    switchTab('admin');
  } else {
    showToast('Invalid admin credentials. Use demo: admin@havenreal.com / admin123', 'error');
  }
}

function logoutAdmin() {
  currentAdmin = null;
  localStorage.removeItem('haven_current_admin');
  showToast('Admin session logged out securely', 'info');
  switchTab('admin-login');
}

/* ==========================================================================
   3. TAB SWITCHING WITH AUTH ROUTING
   ========================================================================== */
function switchTab(tabName) {
  currentTab = tabName;

  // Hide all sections
  document.getElementById('view-explore').classList.add('hidden');
  document.getElementById('view-favourites').classList.add('hidden');
  document.getElementById('view-user-login').classList.add('hidden');
  document.getElementById('view-admin-login').classList.add('hidden');
  document.getElementById('view-admin').classList.add('hidden');

  // Reset navigation button states
  document.getElementById('tab-btn-explore').classList.remove('active', 'border-b-2', 'border-blue-600', 'text-blue-600');
  document.getElementById('tab-btn-favourites').classList.remove('active', 'border-b-2', 'border-blue-600', 'text-blue-600');
  document.getElementById('tab-btn-admin').classList.remove('ring-2', 'ring-amber-400');

  // Show selected section
  if (tabName === 'explore') {
    document.getElementById('view-explore').classList.remove('hidden');
    const btn = document.getElementById('tab-btn-explore');
    btn.classList.add('active', 'border-b-2', 'border-blue-600', 'text-blue-600');
    applyFilters();
  } else if (tabName === 'favourites') {
    document.getElementById('view-favourites').classList.remove('hidden');
    const btn = document.getElementById('tab-btn-favourites');
    btn.classList.add('active', 'border-b-2', 'border-blue-600', 'text-blue-600');
    renderFavorites();
  } else if (tabName === 'user-login') {
    document.getElementById('view-user-login').classList.remove('hidden');
  } else if (tabName === 'admin-login') {
    document.getElementById('view-admin-login').classList.remove('hidden');
    document.getElementById('tab-btn-admin').classList.add('ring-2', 'ring-amber-400');
  } else if (tabName === 'admin') {
    // SECURITY GUARD: Check if logged in as Admin
    if (!currentAdmin) {
      showToast('Admin access protected. Please sign in.', 'info');
      switchTab('admin-login');
      return;
    }
    document.getElementById('view-admin').classList.remove('hidden');
    document.getElementById('tab-btn-admin').classList.add('ring-2', 'ring-amber-400');
    renderAdminInventory();
    renderAdminInquiries();
  }
}

/* ==========================================================================
   4. FILTERING & SEARCH ENGINE
   ========================================================================== */
function applyFilters() {
  const searchTxt = document.getElementById('filter-search').value.toLowerCase().trim();
  const cityVal = document.getElementById('filter-city').value;
  const purposeVal = document.getElementById('filter-purpose').value;
  const typeVal = document.getElementById('filter-type').value;
  const bedsVal = document.getElementById('filter-beds').value;
  const sortVal = document.getElementById('filter-sort').value;

  // Filter properties array
  let filtered = properties.filter(prop => {
    if (searchTxt) {
      const combined = `${prop.title} ${prop.location} ${prop.city} ${prop.description} ${prop.type}`.toLowerCase();
      if (!combined.includes(searchTxt)) return false;
    }
    if (cityVal !== 'all' && prop.city !== cityVal) return false;
    if (purposeVal !== 'all' && prop.purpose !== purposeVal) return false;
    if (typeVal !== 'all' && prop.type !== typeVal) return false;
    if (bedsVal !== 'any') {
      const minBeds = parseInt(bedsVal, 10);
      if (prop.bedrooms < minBeds) return false;
    }
    return true;
  });

  // Sort properties
  if (sortVal === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortVal === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortVal === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  document.getElementById('results-count').innerText = `${filtered.length} properties found`;

  const grid = document.getElementById('properties-grid');
  const emptyState = document.getElementById('explore-empty-state');

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    grid.innerHTML = filtered.map(prop => createPropertyCardHTML(prop)).join('');
  }
}

function resetFilters() {
  document.getElementById('filter-search').value = '';
  document.getElementById('filter-city').value = 'all';
  document.getElementById('filter-purpose').value = 'all';
  document.getElementById('filter-type').value = 'all';
  document.getElementById('filter-beds').value = 'any';
  document.getElementById('filter-sort').value = 'featured';
  applyFilters();
  showToast('Filters reset to default', 'info');
}

/* ==========================================================================
   5. PROPERTY CARD GENERATOR
   ========================================================================== */
function createPropertyCardHTML(prop) {
  const isFav = favorites.includes(prop.id);
  const purposeBadge = prop.purpose === 'buy'
    ? '<span class="bg-blue-600/90 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow">FOR SALE</span>'
    : '<span class="bg-emerald-600/90 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow">FOR RENT</span>';

  const featuredBadge = prop.featured
    ? '<span class="badge-featured font-extrabold text-xs px-2.5 py-1 rounded-md shadow-sm ml-1.5">★ FEATURED</span>'
    : '';

  return `
    <div class="property-card bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
      <div>
        <!-- Image & Overlay Badges -->
        <div class="property-img-wrapper cursor-pointer" onclick="openPropertyModal('${prop.id}')">
          <img src="${prop.image}" alt="${prop.title}" loading="lazy">
          
          <div class="absolute top-3 left-3 flex items-center">
            ${purposeBadge}
            ${featuredBadge}
          </div>

          <!-- Favorite Heart Button -->
          <button onclick="event.stopPropagation(); toggleFavorite('${prop.id}')"
            class="fav-btn absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-slate-400 shadow-md ${isFav ? 'active' : ''}"
            title="${isFav ? 'Remove from Favourites' : 'Save to Favourites'}">
            <svg class="w-5 h-5 transition" fill="${isFav ? '#e11d48' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>

          <div class="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-sm text-white font-extrabold px-3 py-1 rounded-lg text-sm shadow">
            ${prop.priceLabel}
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-5">
          <div class="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>${prop.type}</span>
            <span>•</span>
            <span>${prop.city}</span>
          </div>

          <h3 class="text-lg font-extrabold text-slate-900 hover:text-blue-600 transition cursor-pointer line-clamp-1"
            onclick="openPropertyModal('${prop.id}')">
            ${prop.title}
          </h3>

          <p class="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="truncate">${prop.location}</span>
          </p>

          <div class="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
            <div class="bg-slate-50 py-1.5 rounded-lg">
              <span class="block font-bold text-xs text-slate-800">${prop.bedrooms}</span>
              <span class="text-[10px] text-slate-500 font-semibold uppercase">Beds</span>
            </div>
            <div class="bg-slate-50 py-1.5 rounded-lg">
              <span class="block font-bold text-xs text-slate-800">${prop.bathrooms}</span>
              <span class="text-[10px] text-slate-500 font-semibold uppercase">Baths</span>
            </div>
            <div class="bg-slate-50 py-1.5 rounded-lg">
              <span class="block font-bold text-xs text-slate-800">${prop.sqft.toLocaleString()}</span>
              <span class="text-[10px] text-slate-500 font-semibold uppercase">Sq. Ft.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="px-5 pb-5 pt-1 flex items-center space-x-2">
        <button onclick="openPropertyModal('${prop.id}')"
          class="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition">
          View Details
        </button>
        <button onclick="openContactModal('${prop.id}')"
          class="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm">
          Contact Owner
        </button>
      </div>
    </div>
  `;
}

/* ==========================================================================
   6. FAVOURITE PROPERTIES
   ========================================================================== */
function toggleFavorite(propId) {
  const index = favorites.indexOf(propId);
  if (index === -1) {
    favorites.push(propId);
    showToast('Saved to Favourites!', 'success');
  } else {
    favorites.splice(index, 1);
    showToast('Removed from Favourites', 'info');
  }

  localStorage.setItem('haven_favorites', JSON.stringify(favorites));
  updateFavBadge();

  if (currentTab === 'explore') {
    applyFilters();
  } else if (currentTab === 'favourites') {
    renderFavorites();
  }
}

function updateFavBadge() {
  const badge = document.getElementById('fav-counter-badge');
  badge.innerText = favorites.length;
}

function renderFavorites() {
  const grid = document.getElementById('favourites-grid');
  const emptyState = document.getElementById('favourites-empty-state');
  const clearBtn = document.getElementById('clear-favs-btn');

  const favProperties = properties.filter(prop => favorites.includes(prop.id));

  if (favProperties.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    clearBtn.classList.add('hidden');
  } else {
    emptyState.classList.add('hidden');
    clearBtn.classList.remove('hidden');
    grid.innerHTML = favProperties.map(prop => createPropertyCardHTML(prop)).join('');
  }
}

function clearAllFavorites() {
  if (confirm('Are you sure you want to clear all your saved favourite properties?')) {
    favorites = [];
    localStorage.setItem('haven_favorites', JSON.stringify(favorites));
    updateFavBadge();
    renderFavorites();
    showToast('All favourites cleared', 'info');
  }
}

/* ==========================================================================
   7. PROPERTY DETAILS MODAL
   ========================================================================== */
function openPropertyModal(propId) {
  const prop = properties.find(p => p.id === propId);
  if (!prop) return;

  const isFav = favorites.includes(prop.id);
  const modalBody = document.getElementById('property-modal-body');

  const galleryImgs = prop.gallery && prop.gallery.length > 0 ? prop.gallery : [prop.image];
  const galleryHTML = galleryImgs.map((img, idx) => `
    <img src="${img}" class="w-full h-80 object-cover ${idx === 0 ? 'block' : 'hidden'} gallery-main-image rounded-t-2xl" alt="${prop.title}">
  `).join('');

  const thumbnailsHTML = galleryImgs.length > 1 ? `
    <div class="flex space-x-2 p-3 bg-slate-900 overflow-x-auto">
      ${galleryImgs.map((img, idx) => `
        <img src="${img}" class="w-16 h-12 object-cover rounded-md cursor-pointer border-2 ${idx === 0 ? 'border-blue-500' : 'border-transparent opacity-75'}"
          onclick="switchModalGalleryImage(this, '${img}')">
      `).join('')}
    </div>
  ` : '';

  modalBody.innerHTML = `
    <div>
      <div class="relative">
        ${galleryHTML}
        ${thumbnailsHTML}
        <button onclick="closePropertyModal()"
          class="absolute top-4 right-4 w-10 h-10 bg-slate-900/80 text-white rounded-full flex items-center justify-center hover:bg-slate-900 transition">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase">
              <span>${prop.type} • ${prop.city}</span>
              ${prop.featured ? '<span class="badge-featured px-2 py-0.5 rounded text-white font-extrabold">Featured</span>' : ''}
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">${prop.title}</h2>
            <p class="text-sm text-slate-500 mt-1">${prop.location}</p>
          </div>

          <div class="text-left sm:text-right">
            <span class="block text-2xl sm:text-3xl font-extrabold text-slate-900">${prop.priceLabel}</span>
            <span class="text-xs text-slate-400 font-medium">Year Built: ${prop.yearBuilt || '2023'}</span>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-3 py-6 border-b border-slate-100">
          <div class="bg-slate-50 p-3 rounded-xl text-center">
            <span class="block text-lg font-extrabold text-slate-900">${prop.bedrooms}</span>
            <span class="text-xs text-slate-500 font-semibold uppercase">Bedrooms</span>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl text-center">
            <span class="block text-lg font-extrabold text-slate-900">${prop.bathrooms}</span>
            <span class="text-xs text-slate-500 font-semibold uppercase">Bathrooms</span>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl text-center">
            <span class="block text-lg font-extrabold text-slate-900">${prop.sqft.toLocaleString()}</span>
            <span class="text-xs text-slate-500 font-semibold uppercase">Sq. Ft.</span>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl text-center">
            <span class="block text-lg font-extrabold text-slate-900 uppercase">${prop.purpose}</span>
            <span class="text-xs text-slate-500 font-semibold uppercase">Purpose</span>
          </div>
        </div>

        <div class="py-6 border-b border-slate-100">
          <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About This Property</h4>
          <p class="text-sm text-slate-700 leading-relaxed">${prop.description}</p
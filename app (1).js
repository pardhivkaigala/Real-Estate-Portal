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
          <p class="text-sm text-slate-700 leading-relaxed">${prop.description}</p>
        </div>

        ${prop.amenities && prop.amenities.length > 0 ? `
          <div class="py-6 border-b border-slate-100">
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Amenities & Highlights</h4>
            <div class="flex flex-wrap gap-2">
              ${prop.amenities.map(item => `
                <span class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100">
                  ✓ ${item}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="mt-6 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <img src="${prop.owner.avatar}" alt="${prop.owner.name}" class="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm">
            <div>
              <span class="text-xs font-semibold text-blue-600">${prop.owner.agency || 'Authorized Agent'}</span>
              <h5 class="text-base font-bold text-slate-900">${prop.owner.name}</h5>
              <p class="text-xs text-slate-500">${prop.owner.email} • ${prop.owner.phone}</p>
            </div>
          </div>

          <div class="flex space-x-3 w-full sm:w-auto">
            <button onclick="toggleFavorite('${prop.id}')"
              class="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-bold text-sm text-slate-700 flex items-center justify-center space-x-1.5 transition">
              <span>${isFav ? 'Saved ★' : 'Save Fav ★'}</span>
            </button>
            <button onclick="closePropertyModal(); openContactModal('${prop.id}');"
              class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md flex-1 sm:flex-none">
              Contact Owner
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('property-detail-modal').classList.remove('hidden');
}

function switchModalGalleryImage(thumbEl, imgUrl) {
  const modal = document.getElementById('property-detail-modal');
  const mainImg = modal.querySelector('.gallery-main-image');
  if (mainImg) mainImg.src = imgUrl;

  modal.querySelectorAll('img.w-16').forEach(el => {
    el.classList.remove('border-blue-500');
    el.classList.add('border-transparent', 'opacity-75');
  });
  thumbEl.classList.remove('border-transparent', 'opacity-75');
  thumbEl.classList.add('border-blue-500');
}

function closePropertyModal() {
  document.getElementById('property-detail-modal').classList.add('hidden');
}

/* ==========================================================================
   8. CONTACT OWNER MODAL & INQUIRIES SYSTEM
   ========================================================================== */
function openContactModal(propId) {
  const prop = properties.find(p => p.id === propId);
  if (!prop) return;

  document.getElementById('contact-prop-id').value = prop.id;
  document.getElementById('contact-prop-title').innerText = `${prop.title} — ${prop.owner.name} (${prop.owner.phone})`;

  // AUTO-FILL WITH LOGGED-IN USER INFO!
  if (currentUser) {
    document.getElementById('contact-name').value = currentUser.name || '';
    document.getElementById('contact-email').value = currentUser.email || '';
    document.getElementById('contact-phone').value = currentUser.phone || '';
  }

  document.getElementById('contact-modal').classList.remove('hidden');
}

function closeContactModal() {
  document.getElementById('contact-modal').classList.add('hidden');
}

function handleContactSubmit(e) {
  e.preventDefault();

  const propId = document.getElementById('contact-prop-id').value;
  const prop = properties.find(p => p.id === propId);
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  const message = document.getElementById('contact-message').value.trim();

  if (!name || !email || !message) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  const newInquiry = {
    id: 'inq-' + Date.now(),
    propertyId: propId,
    propertyTitle: prop ? prop.title : 'Unknown Property',
    userName: name,
    userEmail: email,
    userPhone: phone,
    message: message,
    createdAt: new Date().toISOString(),
    status: 'new'
  };

  inquiries.unshift(newInquiry);
  localStorage.setItem('haven_inquiries', JSON.stringify(inquiries));

  document.getElementById('contact-owner-form').reset();
  closeContactModal();
  renderAdminInquiries();

  showToast(`Inquiry sent to ${prop.owner.name}! We will contact you soon.`, 'success');
}

/* ==========================================================================
   9. ADMIN PANEL DASHBOARD
   ========================================================================== */
function switchAdminTab(subtab) {
  const invSec = document.getElementById('admin-sec-inventory');
  const inqSec = document.getElementById('admin-sec-inquiries');
  const invBtn = document.getElementById('admin-subtab-inventory');
  const inqBtn = document.getElementById('admin-subtab-inquiries');

  if (subtab === 'inventory') {
    invSec.classList.remove('hidden');
    inqSec.classList.add('hidden');
    invBtn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
    inqBtn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
  } else {
    inqSec.classList.remove('hidden');
    invSec.classList.add('hidden');
    inqBtn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
    invBtn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
  }
}

function renderAdminInventory() {
  const tbody = document.getElementById('admin-properties-tbody');
  document.getElementById('admin-prop-count').innerText = properties.length;

  if (properties.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-slate-400">No properties in inventory. Click "Add New Property" to create one.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = properties.map(prop => `
    <tr>
      <td class="py-4 px-4">
        <div class="flex items-center space-x-3">
          <img src="${prop.image}" alt="${prop.title}" class="w-12 h-12 rounded-lg object-cover">
          <div>
            <div class="font-extrabold text-slate-900">${prop.title}</div>
            <div class="text-xs text-slate-500">${prop.location}</div>
          </div>
        </div>
      </td>
      <td class="py-4 px-4">
        <span class="font-semibold text-slate-800">${prop.type}</span>
        <span class="block text-xs uppercase text-blue-600 font-bold">${prop.purpose}</span>
      </td>
      <td class="py-4 px-4 font-bold text-slate-900">
        ${prop.priceLabel}
      </td>
      <td class="py-4 px-4 text-xs text-slate-600">
        ${prop.bedrooms} Beds • ${prop.bathrooms} Baths<br>
        <span class="text-slate-400">${prop.sqft.toLocaleString()} sqft</span>
      </td>
      <td class="py-4 px-4">
        <button onclick="toggleFeatured('${prop.id}')"
          class="px-2.5 py-1 rounded-full text-xs font-bold transition ${
            prop.featured ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-500'
          }">
          ${prop.featured ? '★ Featured' : 'Standard'}
        </button>
      </td>
      <td class="py-4 px-4 text-right">
        <div class="flex items-center justify-end space-x-2">
          <button onclick="openEditPropertyModal('${prop.id}')"
            class="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition" title="Edit Property">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </button>
          <button onclick="deleteProperty('${prop.id}')"
            class="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition" title="Delete Property">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderAdminInquiries() {
  const tbody = document.getElementById('admin-inquiries-tbody');
  document.getElementById('admin-inquiry-count').innerText = inquiries.length;

  if (inquiries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-slate-400">No lead inquiries received yet.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = inquiries.map(inq => `
    <tr>
      <td class="py-4 px-4 font-bold text-slate-900">
        ${inq.propertyTitle}
      </td>
      <td class="py-4 px-4">
        <div class="font-bold text-slate-800">${inq.userName}</div>
        <div class="text-xs text-slate-500">${inq.userEmail}<br>${inq.userPhone || ''}</div>
      </td>
      <td class="py-4 px-4 text-xs text-slate-700 max-w-xs">
        <p class="line-clamp-2">${inq.message}</p>
      </td>
      <td class="py-4 px-4 text-xs text-slate-400 whitespace-nowrap">
        ${new Date(inq.createdAt).toLocaleDateString()}
      </td>
      <td class="py-4 px-4">
        <select onchange="updateInquiryStatus('${inq.id}', this.value)"
          class="text-xs font-bold px-2 py-1 rounded border border-slate-300 bg-white ${
            inq.status === 'new' ? 'text-blue-700 bg-blue-50' : 'text-emerald-700 bg-emerald-50'
          }">
          <option value="new" ${inq.status === 'new' ? 'selected' : ''}>New Lead</option>
          <option value="contacted" ${inq.status === 'contacted' ? 'selected' : ''}>Contacted</option>
          <option value="closed" ${inq.status === 'closed' ? 'selected' : ''}>Closed</option>
        </select>
      </td>
      <td class="py-4 px-4 text-right">
        <button onclick="deleteInquiry('${inq.id}')"
          class="text-rose-500 hover:text-rose-700 text-xs font-semibold underline">
          Delete
        </button>
      </td>
    </tr>
  `).join('');
}

/* ==========================================================================
   10. ADMIN CRUD ACTIONS (ADD, EDIT, DELETE, TOGGLE FEATURED)
   ========================================================================== */
function openAddPropertyModal() {
  document.getElementById('admin-modal-title').innerText = 'Add New Property';
  document.getElementById('admin-prop-form').reset();
  document.getElementById('admin-prop-id').value = '';
  document.getElementById('admin-property-modal').classList.remove('hidden');
}

function openEditPropertyModal(propId) {
  const prop = properties.find(p => p.id === propId);
  if (!prop) return;

  document.getElementById('admin-modal-title').innerText = 'Edit Property';
  document.getElementById('admin-prop-id').value = prop.id;
  document.getElementById('form-title').value = prop.title;
  document.getElementById('form-image').value = prop.image;
  document.getElementById('form-purpose').value = prop.purpose;
  document.getElementById('form-type').value = prop.type;
  document.getElementById('form-price').value = prop.price;
  document.getElementById('form-location').value = prop.location;
  document.getElementById('form-city').value = prop.city;
  document.getElementById('form-featured').checked = prop.featured;
  document.getElementById('form-bedrooms').value = prop.bedrooms;
  document.getElementById('form-bathrooms').value = prop.bathrooms;
  document.getElementById('form-sqft').value = prop.sqft;
  document.getElementById('form-year').value = prop.yearBuilt || 2023;
  document.getElementById('form-description').value = prop.description;
  document.getElementById('form-amenities').value = (prop.amenities || []).join(', ');

  document.getElementById('admin-property-modal').classList.remove('hidden');
}

function closeAdminPropertyModal() {
  document.getElementById('admin-property-modal').classList.add('hidden');
}

function handleAdminSaveProperty(e) {
  e.preventDefault();

  const id = document.getElementById('admin-prop-id').value;
  const title = document.getElementById('form-title').value.trim();
  const image = document.getElementById('form-image').value.trim();
  const purpose = document.getElementById('form-purpose').value;
  const type = document.getElementById('form-type').value;
  const price = parseFloat(document.getElementById('form-price').value) || 0;
  const location = document.getElementById('form-location').value.trim();
  const city = document.getElementById('form-city').value;
  const featured = document.getElementById('form-featured').checked;
  const bedrooms = parseInt(document.getElementById('form-bedrooms').value, 10) || 0;
  const bathrooms = parseFloat(document.getElementById('form-bathrooms').value) || 0;
  const sqft = parseInt(document.getElementById('form-sqft').value, 10) || 0;
  const yearBuilt = parseInt(document.getElementById('form-year').value, 10) || 2024;
  const description = document.getElementById('form-description').value.trim();
  const amenitiesStr = document.getElementById('form-amenities').value.trim();

  const amenities = amenitiesStr ? amenitiesStr.split(',').map(s => s.trim()).filter(Boolean) : [];
  const priceLabel = purpose === 'buy'
    ? '$' + price.toLocaleString()
    : '$' + price.toLocaleString() + ' / mo';

  if (id) {
    const index = properties.findIndex(p => p.id === id);
    if (index !== -1) {
      properties[index] = {
        ...properties[index],
        title,
        image,
        purpose,
        type,
        price,
        priceLabel,
        location,
        city,
        featured,
        bedrooms,
        bathrooms,
        sqft,
        yearBuilt,
        description,
        amenities
      };
      showToast('Property updated successfully', 'success');
    }
  } else {
    const newProp = {
      id: 'prop-' + Date.now(),
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      purpose,
      type,
      price,
      priceLabel,
      location,
      city,
      featured,
      bedrooms,
      bathrooms,
      sqft,
      yearBuilt,
      image,
      gallery: [image],
      description,
      amenities,
      owner: {
        name: 'Alexander Wright',
        email: 'a.wright@havenreal.com',
        phone: '+1 (310) 555-0192',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        agency: 'HavenReal Official Agent'
      },
      createdAt: new Date().toISOString()
    };
    properties.unshift(newProp);
    showToast('New property listing published!', 'success');
  }

  localStorage.setItem('haven_properties', JSON.stringify(properties));
  closeAdminPropertyModal();
  renderAdminInventory();
  applyFilters();
}

function deleteProperty(propId) {
  if (!confirm('Are you sure you want to delete this property listing?')) return;

  properties = properties.filter(p => p.id !== propId);
  favorites = favorites.filter(id => id !== propId);

  localStorage.setItem('haven_properties', JSON.stringify(properties));
  localStorage.setItem('haven_favorites', JSON.stringify(favorites));

  updateFavBadge();
  renderAdminInventory();
  applyFilters();
  showToast('Property deleted from inventory', 'info');
}

function toggleFeatured(propId) {
  const prop = properties.find(p => p.id === propId);
  if (!prop) return;

  prop.featured = !prop.featured;
  localStorage.setItem('haven_properties', JSON.stringify(properties));

  renderAdminInventory();
  applyFilters();
  showToast(`${prop.title} featured status toggled`, 'info');
}

function updateInquiryStatus(inquiryId, newStatus) {
  const inq = inquiries.find(i => i.id === inquiryId);
  if (!inq) return;

  inq.status = newStatus;
  localStorage.setItem('haven_inquiries', JSON.stringify(inquiries));
  renderAdminInquiries();
  showToast('Inquiry status updated', 'success');
}

function deleteInquiry(inquiryId) {
  inquiries = inquiries.filter(i => i.id !== inquiryId);
  localStorage.setItem('haven_inquiries', JSON.stringify(inquiries));
  renderAdminInquiries();
  showToast('Inquiry deleted', 'info');
}

/* ==========================================================================
   11. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast ' + (type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-800');
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

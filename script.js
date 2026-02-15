// Default data
const DEFAULT_CATEGORIES = ['electronics', 'clothing', 'accessories', 'home'];
const DEFAULT_PRODUCTS = [
    { id: 1, name: "Wireless Headphones", category: "electronics", price: 99.99, description: "Premium wireless headphones with noise cancellation and 30-hour battery life.", emoji: "🎧" },
    { id: 2, name: "Smart Watch", category: "electronics", price: 249.99, description: "Feature-rich smartwatch with fitness tracking and heart rate monitor.", emoji: "⌚" },
    { id: 3, name: "Cotton T-Shirt", category: "clothing", price: 29.99, description: "Comfortable 100% cotton t-shirt available in multiple colors.", emoji: "👕" },
    { id: 4, name: "Denim Jacket", category: "clothing", price: 79.99, description: "Classic denim jacket with modern fit and premium quality.", emoji: "🧥" },
    { id: 5, name: "Leather Wallet", category: "accessories", price: 49.99, description: "Genuine leather wallet with RFID blocking technology.", emoji: "👛" },
    { id: 6, name: "Sunglasses", category: "accessories", price: 89.99, description: "UV protection sunglasses with polarized lenses.", emoji: "🕶️" },
    { id: 7, name: "Coffee Maker", category: "home", price: 129.99, description: "Programmable coffee maker with thermal carafe.", emoji: "☕" },
    { id: 8, name: "Throw Pillow Set", category: "home", price: 39.99, description: "Set of 4 decorative throw pillows for your living room.", emoji: "🛋️" },
    { id: 9, name: "Laptop Stand", category: "electronics", price: 59.99, description: "Ergonomic aluminum laptop stand for better posture.", emoji: "💻" },
    { id: 10, name: "Running Shoes", category: "clothing", price: 119.99, description: "Lightweight running shoes with cushioned sole.", emoji: "👟" },
    { id: 11, name: "Backpack", category: "accessories", price: 69.99, description: "Durable backpack with laptop compartment and USB charging port.", emoji: "🎒" },
    { id: 12, name: "Desk Lamp", category: "home", price: 44.99, description: "LED desk lamp with adjustable brightness and color temperature.", emoji: "💡" }
];

const AUTH_USER = 'admin';
const AUTH_PASS = 'admin123';
const STORAGE_KEY_AUTH = 'mhmd_chamas_admin';
const STORAGE_KEY_THEME = 'mhmd_chamas_theme';
const API_BASE = (typeof window !== 'undefined' && window.API_BASE) || ''; // Set window.API_BASE for Netlify + Render
const PRODUCTS_PER_PAGE = 24;
const PRODUCTS_PER_PAGE_MOBILE = 12;

// Order and contact emails go to this address
const ORDER_EMAIL = 'Moudishamas333@gmail.com';
const WHISH_MONEY_NUMBER = '81490397';
const WHATSAPP_NUMBER = (typeof window !== 'undefined' && window.WHATSAPP_NUMBER) || '96181490397'; // Country code + number, no + or spaces

// State: cart is array of { product, quantity }
let products = [];
let cart = [];
let currentCheckoutItems = []; // items in the open checkout modal (same format: { product, quantity })
let currentPage = 1;
let currentFilteredProducts = [];

// DOM
const productsGrid = document.getElementById('productsGrid');
const filterButtonsContainer = document.getElementById('filterButtons');
const paginationEl = document.getElementById('pagination');
const cartCountElement = document.getElementById('cartCount');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const contactForm = document.getElementById('contactForm');
const navAdmin = document.getElementById('navAdmin');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const btnAddProduct = document.getElementById('btnAddProduct');
const btnManageCategories = document.getElementById('btnManageCategories');

// Modals
const productModal = document.getElementById('productModal');
const closeProductModal = document.getElementById('closeProductModal');
const productModalImage = document.getElementById('productModalImage');
const productModalCategory = document.getElementById('productModalCategory');
const productModalTitle = document.getElementById('productModalTitle');
const productModalDesc = document.getElementById('productModalDesc');
const productModalPrice = document.getElementById('productModalPrice');
const productModalAddCart = document.getElementById('productModalAddCart');
const productModalPayDelivery = document.getElementById('productModalPayDelivery');

const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutModal = document.getElementById('closeCheckoutModal');
const checkoutForm = document.getElementById('checkoutForm');

const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const loginForm = document.getElementById('loginForm');

const categoriesModal = document.getElementById('categoriesModal');
const closeCategoriesModal = document.getElementById('closeCategoriesModal');
const addCategoryForm = document.getElementById('addCategoryForm');
const categoryList = document.getElementById('categoryList');

const productFormModal = document.getElementById('productFormModal');
const closeProductFormModal = document.getElementById('closeProductFormModal');
const productForm = document.getElementById('productForm');
const productFormId = document.getElementById('productFormId');
const productFormCategory = document.getElementById('productFormCategory');
const productFormModalTitle = document.getElementById('productFormModalTitle');

// API helpers
async function apiGetCategories() {
    const res = await fetch(API_BASE + '/api/categories');
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
}

async function apiAddCategory(name) {
    const res = await fetch(API_BASE + '/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to add category');
}

async function apiRemoveCategory(name) {
    const res = await fetch(API_BASE + '/api/categories/' + encodeURIComponent(name), { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to remove category');
}

async function apiGetProducts() {
    const res = await fetch(API_BASE + '/api/products');
    if (!res.ok) throw new Error('Failed to load products');
    return res.json();
}

async function apiAddProduct(product) {
    const res = await fetch(API_BASE + '/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to add product');
    return data.id;
}

async function apiUpdateProduct(id, product) {
    const res = await fetch(API_BASE + '/api/products/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to update product');
}

async function apiDeleteProduct(id) {
    const res = await fetch(API_BASE + '/api/products/' + id, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to delete product');
}

function getCategories() {
    return _categoriesCache || DEFAULT_CATEGORIES;
}

function getProducts() {
    return products.length ? products : JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
}

let _categoriesCache = null;


function isAdmin() {
    return sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true';
}

function setAdmin(value) {
    if (value) sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
    else sessionStorage.removeItem(STORAGE_KEY_AUTH);
    updateAdminUI();
}

window.doLogout = function () {
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
    setAdmin(false);
    if (typeof showNotification === 'function') showNotification('Logged out.');
};

// Theme: light | dark
function getTheme() {
    try {
        const t = localStorage.getItem(STORAGE_KEY_THEME);
        if (t === 'light' || t === 'dark') return t;
    } catch (_) {}
    return 'dark';
}

function setTheme(theme) {
    const next = theme === 'light' ? 'light' : 'dark';
    if (next === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem(STORAGE_KEY_THEME, next); } catch (_) {}
    updateThemeToggleUI();
}

function updateThemeToggleUI() {
    const isLight = getTheme() === 'light';
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const iconDark = btn.querySelector('.theme-icon-dark');
    const iconLight = btn.querySelector('.theme-icon-light');
    if (iconDark) iconDark.style.display = isLight ? 'none' : 'inline';
    if (iconLight) iconLight.style.display = isLight ? 'inline' : 'none';
    btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
}

function setupThemeToggle() {
    setTheme(getTheme());
    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const next = getTheme() === 'light' ? 'dark' : 'light';
            setTheme(next);
            showNotification(next === 'light' ? 'Light mode on.' : 'Dark mode on.');
        });
    }
}

// Edit/Delete product - wrappers and inline implementations
window.openEditProduct = function (id) {
    if (window._openEditProductImpl) window._openEditProductImpl(id);
    else { closeModal(document.getElementById('productModal')); if (window.openProductForm) window.openProductForm(id); }
};
window.deleteProduct = async function (id) {
    if (window._deleteProductImpl) { await window._deleteProductImpl(id); return; }
    if (!confirm('Delete this product?')) return;
    try {
        await apiDeleteProduct(id);
        products = products.filter(function (p) { return p.id !== id; });
        var active = document.querySelector('#filterButtons .filter-btn.active');
        filterProducts(active ? active.getAttribute('data-category') : 'all');
        if (typeof showNotification === 'function') showNotification('Product deleted.');
    } catch (err) {
        if (typeof showNotification === 'function') showNotification(err.message || 'Failed to delete.', true);
    }
};

// Init
document.addEventListener('DOMContentLoaded', async () => {
    var waLink = document.getElementById('whatsappLink');
    if (waLink) {
        waLink.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('plz i need to make order');
    }
    setupThemeToggle();
    try {
        [products, _categoriesCache] = await Promise.all([apiGetProducts(), apiGetCategories()]);
    } catch (err) {
        if (typeof showNotification === 'function') showNotification('Cannot connect to server. Start it with: npm start', true);
        else alert('Cannot connect to server. Start it with: npm start');
        products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
        _categoriesCache = [...DEFAULT_CATEGORIES];
    }
    renderFilterButtons();
    currentFilteredProducts = products;
    currentPage = 1;
    displayProductsPage();
    setupMenuToggle();
    (function () {
        var lastPerPage = getProductsPerPage();
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                var perPage = getProductsPerPage();
                if (perPage !== lastPerPage) {
                    lastPerPage = perPage;
                    displayProductsPage();
                }
            }, 150);
        });
    })();
    setupNavbarScroll();
    setupScrollAnimations();
    setupModals();
    setupLoginButton();
    setupProductImageUpload();
    setupProductCardDelegation();
    updateAdminUI();
    updateCartCount();
});

function setupProductCardDelegation() {
    document.addEventListener('click', function (e) {
        var editBtn = e.target.closest('.btn-edit');
        var deleteBtn = e.target.closest('.btn-delete');
        if (editBtn && editBtn.closest('#productsGrid')) {
            e.preventDefault();
            e.stopPropagation();
            var card = editBtn.closest('.product-card');
            var id = card ? parseInt(card.getAttribute('data-product-id'), 10) : parseInt(editBtn.getAttribute('data-product-id'), 10);
            if (!isNaN(id) && window.openEditProduct) window.openEditProduct(id);
        } else if (deleteBtn && deleteBtn.closest('#productsGrid')) {
            e.preventDefault();
            e.stopPropagation();
            var card = deleteBtn.closest('.product-card');
            var id = card ? parseInt(card.getAttribute('data-product-id'), 10) : parseInt(deleteBtn.getAttribute('data-product-id'), 10);
            if (!isNaN(id) && window.deleteProduct) window.deleteProduct(id);
        }
    }, true);
}

function setupProductImageUpload() {
    var fileInput = document.getElementById('productImageUpload');
    var previewEl = document.getElementById('productImagePreview');
    if (!fileInput || !previewEl) return;
    fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        if (!file.type || file.type.indexOf('image') !== 0) {
            if (typeof showNotification === 'function') showNotification('Please choose an image file (JPG, PNG, etc.).', true);
            return;
        }
        if (typeof showNotification === 'function') showNotification('Loading image...');
        var reader = new FileReader();
        reader.onload = function (e) {
            var dataUrl = e.target && e.target.result;
            if (!dataUrl) {
                if (typeof showNotification === 'function') showNotification('Could not read image.', true);
                return;
            }
            function setPreview(url) {
                window._productImageDataUrl = url;
                previewEl.innerHTML = '';
                var img = document.createElement('img');
                img.src = url;
                img.alt = 'Preview';
                img.className = 'product-form-preview-img';
                previewEl.appendChild(img);
                previewEl.style.minHeight = '120px';
                if (typeof showNotification === 'function') showNotification('Image ready. Click Save product.');
            }
            if (dataUrl.length > 400000) {
                setPreview(dataUrl);
                resizeImageDataUrl(dataUrl, 500, 0.75, function (resized) {
                    if (resized) setPreview(resized);
                });
            } else {
                setPreview(dataUrl);
            }
        };
        reader.onerror = function () {
            if (typeof showNotification === 'function') showNotification('Could not read the image file.', true);
        };
        reader.readAsDataURL(file);
    });
}

function resizeImageDataUrl(dataUrl, maxWidth, quality, callback) {
    if (!dataUrl || typeof callback !== 'function') return;
    var img = new Image();
    var done = false;
    function finish(url) {
        if (done) return;
        done = true;
        callback(url || dataUrl);
    }
    img.onload = function () {
        var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
        if (!w || w <= maxWidth) { finish(dataUrl); return; }
        var nw = maxWidth, nh = Math.round(h * maxWidth / w);
        var canvas = document.createElement('canvas');
        canvas.width = nw;
        canvas.height = nh;
        var ctx = canvas.getContext('2d');
        if (!ctx) { finish(dataUrl); return; }
        ctx.drawImage(img, 0, 0, nw, nh);
        try {
            finish(canvas.toDataURL('image/jpeg', quality || 0.75));
        } catch (err) {
            finish(dataUrl);
        }
    };
    img.onerror = function () { finish(dataUrl); };
    img.src = dataUrl;
}

function setupMenuToggle() {
    var btn = document.getElementById('menuToggle');
    var menu = document.getElementById('navMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        menu.classList.toggle('active');
        btn.setAttribute('aria-expanded', menu.classList.contains('active'));
    });
    document.addEventListener('click', function (e) {
        if (!menu.classList.contains('active')) return;
        if (e.target.closest('.nav-menu') || e.target.closest('#menuToggle')) return;
        menu.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
    });
    menu.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
            menu.classList.remove('active');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
    });
}

function setupLoginButton() {
    if (document.getElementById('loginModal')) window.openLoginModal = function () { openModal(document.getElementById('loginModal')); };
    var btn = document.getElementById('btnLogin');
    if (btn) btn.addEventListener('click', function (e) { e.preventDefault(); openModal(document.getElementById('loginModal')); });
}

function renderFilterButtons() {
    const categories = getCategories();
    const active = filterButtonsContainer.querySelector('.filter-btn.active');
    const activeCat = active ? active.getAttribute('data-category') : 'all';
    filterButtonsContainer.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn' + (activeCat === 'all' ? ' active' : '');
    allBtn.setAttribute('data-category', 'all');
    allBtn.textContent = 'All';
    filterButtonsContainer.appendChild(allBtn);
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (activeCat === cat ? ' active' : '');
        btn.setAttribute('data-category', cat);
        btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        filterButtonsContainer.appendChild(btn);
    });
    reattachFilterListeners();
}

function reattachFilterListeners() {
    filterButtonsContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtonsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProducts(btn.getAttribute('data-category'));
        });
    });
}

function updateAdminUI() {
    const admin = isAdmin();
    if (navAdmin) navAdmin.style.display = admin ? 'block' : 'none';
    if (btnLogin) btnLogin.style.display = admin ? 'none' : 'block';
    if (btnLogout) btnLogout.style.display = admin ? 'block' : 'none';
    if (btnAddProduct) btnAddProduct.style.display = admin ? 'inline-flex' : 'none';
    var active = filterButtonsContainer && filterButtonsContainer.querySelector('.filter-btn.active');
    filterProducts(active ? active.getAttribute('data-category') : 'all');
}

function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function setupScrollAnimations() {
    var sections = document.querySelectorAll('.products-section, .about-section, .contact-section, .policies-section');
    if (!window.IntersectionObserver) return;
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    sections.forEach(function (s) { observer.observe(s); });
}

function isMobileView() {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
}

function getProductsPerPage() {
    return isMobileView() ? PRODUCTS_PER_PAGE_MOBILE : PRODUCTS_PER_PAGE;
}

function displayProducts(productsToShow) {
    productsGrid.innerHTML = '';
    productsToShow.forEach(product => {
        productsGrid.appendChild(createProductCard(product));
    });
}

function renderPagination() {
    if (!paginationEl) return;
    var total = currentFilteredProducts.length;
    var perPage = getProductsPerPage();
    var totalPages = Math.ceil(total / perPage) || 1;
    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        paginationEl.style.display = 'none';
        return;
    }
    paginationEl.style.display = 'flex';
    paginationEl.innerHTML = '';
    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'pagination-btn';
    prevBtn.innerHTML = '&larr; Prev';
    prevBtn.disabled = currentPage <= 1;
    prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; displayProductsPage(); } });
    paginationEl.appendChild(prevBtn);
    var pagesWrap = document.createElement('div');
    pagesWrap.className = 'pagination-pages';
    for (var i = 1; i <= totalPages; i++) {
        (function (pageNum) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pagination-btn' + (pageNum === currentPage ? ' active' : '');
            btn.textContent = pageNum;
            btn.addEventListener('click', function () { currentPage = pageNum; displayProductsPage(); });
            pagesWrap.appendChild(btn);
        })(i);
    }
    paginationEl.appendChild(pagesWrap);
    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'pagination-btn';
    nextBtn.innerHTML = 'Next &rarr;';
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; displayProductsPage(); } });
    paginationEl.appendChild(nextBtn);
}

function displayProductsPage() {
    var total = currentFilteredProducts.length;
    var perPage = getProductsPerPage();
    var totalPages = Math.ceil(total / perPage) || 1;
    if (currentPage > totalPages) currentPage = Math.max(1, totalPages);
    var start = (currentPage - 1) * perPage;
    var pageProducts = currentFilteredProducts.slice(start, start + perPage);
    displayProducts(pageProducts);
    renderPagination();
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.category);
    card.setAttribute('data-product-id', product.id);
    const categoryLabel = (product.category || '').charAt(0).toUpperCase() + (product.category || '').slice(1);
    const emoji = product.emoji || '📦';
    const imageUrl = product.imageUrl || '';
    let adminActions = '';
    if (isAdmin()) {
        var pid = product.id;
        adminActions = `
            <div class="product-card-actions">
                <button type="button" class="btn-edit" aria-label="Edit" onclick="event.stopPropagation();event.preventDefault();window.openEditProduct(${pid})">&#9998;</button>
                <button type="button" class="btn-delete" aria-label="Delete" onclick="event.stopPropagation();event.preventDefault();window.deleteProduct(${pid})">&#10005;</button>
            </div>
        `;
    }
    const emojiOrImgContent = imageUrl ? '<img alt="" class="product-card-img">' : emoji;
    card.innerHTML = `
        <div class="product-image">
            ${emojiOrImgContent}
        </div>
        ${adminActions}
        <div class="product-info">
            <div class="product-category">${categoryLabel}</div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
                <span class="product-price">$${Number(product.price).toFixed(2)}</span>
                <div class="product-card-qty-wrap">
                    <label class="product-qty-label" for="qty-${product.id}">Qty</label>
                    <input type="number" id="qty-${product.id}" class="product-qty-input" min="1" value="1" onclick="event.stopPropagation()">
                    <button type="button" class="add-to-cart">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
    if (imageUrl) {
        var img = card.querySelector('.product-card-img');
        if (img) img.src = imageUrl;
    }
    var addBtn = card.querySelector('.add-to-cart');
    var qtyInput = card.querySelector('.product-qty-input');
    if (addBtn && qtyInput) {
        addBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
            addToCart(product.id, qty);
        });
    }
    card.addEventListener('click', (e) => {
        if (e.target.closest('.product-card-actions') || e.target.closest('.add-to-cart') || e.target.closest('.product-card-qty-wrap')) return;
        openProductDetail(product.id);
    });
    return card;
}

function openProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const categoryLabel = (product.category || '').charAt(0).toUpperCase() + (product.category || '').slice(1);
    productModalCategory.textContent = categoryLabel;
    productModalTitle.textContent = product.name;
    productModalDesc.textContent = product.description;
    productModalPrice.textContent = '$' + Number(product.price).toFixed(2);
    productModalImage.className = 'modal-product-image';
    productModalImage.dataset.category = product.category || '';
    productModalImage.innerHTML = '';
    if (product.imageUrl) {
        var modalImg = document.createElement('img');
        modalImg.src = product.imageUrl;
        modalImg.alt = '';
        modalImg.className = 'modal-product-img';
        productModalImage.appendChild(modalImg);
    } else {
        productModalImage.textContent = product.emoji || '📦';
    }
    var qtyEl = document.getElementById('productModalQty');
    if (qtyEl) qtyEl.value = '1';
    productModalAddCart.onclick = function () {
        var qty = parseInt(document.getElementById('productModalQty').value, 10) || 1;
        addToCart(product.id, qty);
        closeModal(productModal);
    };
    productModalPayDelivery.onclick = function () {
        var qty = parseInt(document.getElementById('productModalQty').value, 10) || 1;
        closeModal(productModal);
        openCheckout([{ product: product, quantity: qty }]);
    };
    openModal(productModal);
}

function openModal(el) {
    if (!el) return;
    el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

window.openLoginModal = function () {
    var el = document.getElementById('loginModal');
    if (el) openModal(el);
};


function closeModal(el) {
    if (!el) return;
    el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// Global close: any click on .modal-close closes its overlay (works even if button is covered)
document.addEventListener('click', function(e) {
    const closeBtn = e.target.closest && e.target.closest('.modal-close');
    if (!closeBtn) return;
    e.preventDefault();
    e.stopPropagation();
    const overlay = closeBtn.closest('.modal-overlay');
    if (overlay) closeModal(overlay);
});

function openCheckout(items) {
    var raw = Array.isArray(items) && items.length ? items : [];
    currentCheckoutItems = raw.map(function (item) {
        return item.product != null ? { product: item.product, quantity: item.quantity || 1 } : { product: item, quantity: 1 };
    });
    checkoutForm.reset();
    renderCheckoutItems();
    openModal(checkoutModal);
}

function renderCheckoutItems() {
    var container = document.getElementById('checkoutItems');
    if (!container) return;
    container.innerHTML = '';
    var list = currentCheckoutItems;
    if (list.length === 0) return;
    list.forEach(function (item, index) {
        var p = item.product;
        var qty = item.quantity || 1;
        var price = Number(p.price) || 0;
        var lineTotal = price * qty;
        var row = document.createElement('div');
        row.className = 'checkout-item';
        row.innerHTML =
            '<span class="checkout-item-emoji">' + (p.emoji || '📦') + '</span>' +
            '<span class="checkout-item-name">' + (p.name || '') + '</span>' +
            '<span class="checkout-item-qty">×' + qty + '</span>' +
            '<span class="checkout-item-price">$' + lineTotal.toFixed(2) + '</span>' +
            '<button type="button" class="checkout-item-remove" aria-label="Remove" data-index="' + index + '">&times;</button>';
        var btn = row.querySelector('.checkout-item-remove');
        if (btn) btn.addEventListener('click', function () {
            var i = parseInt(btn.getAttribute('data-index'), 10);
            currentCheckoutItems.splice(i, 1);
            updateCartCount();
            renderCheckoutItems();
            if (currentCheckoutItems.length === 0) closeModal(document.getElementById('checkoutModal'));
        });
        container.appendChild(row);
    });
    var total = list.reduce(function (s, item) {
        return s + (Number(item.product.price) || 0) * (item.quantity || 1);
    }, 0);
    var totalRow = document.createElement('div');
    totalRow.className = 'checkout-total';
    totalRow.textContent = 'Total: $' + total.toFixed(2);
    container.appendChild(totalRow);
}

function setupModals() {
    function closeOnBackdrop(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal(e.target);
        }
    }
    [productModal, checkoutModal, loginModal, categoriesModal, productFormModal].forEach(overlay => {
        if (overlay) overlay.addEventListener('click', closeOnBackdrop);
    });

    if (checkoutForm) {
        var paymentRadios = checkoutForm.querySelectorAll('input[name="paymentMethod"]');
        var whishInfo = document.getElementById('whishInfo');
        var checkoutSubmitText = document.getElementById('checkoutSubmitText');
        function updatePaymentUI() {
            var method = checkoutForm.querySelector('input[name="paymentMethod"]:checked');
            var isWhish = method && method.value === 'whish';
            if (whishInfo) whishInfo.style.display = isWhish ? 'block' : 'none';
            if (checkoutSubmitText) checkoutSubmitText.textContent = 'Confirm order — ' + (isWhish ? 'Whish Money' : 'Pay on delivery');
        }
        paymentRadios.forEach(function (r) { r.addEventListener('change', updatePaymentUI); });
        updatePaymentUI();

        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            const name = (form.fullName && form.fullName.value) || '';
            const phone = (form.phone && form.phone.value) || '';
            const address = (form.address && form.address.value) || '';
            const city = (form.city && form.city.value) || '';
            const notes = (form.notes && form.notes.value) || '';
            const paymentMethod = (form.paymentMethod && form.paymentMethod.value) || 'whish';

            var orderLines = [];
            currentCheckoutItems.forEach(function (item) {
                var p = item.product;
                var qty = item.quantity || 1;
                var lineTotal = (Number(p.price) || 0) * qty;
                orderLines.push((p.emoji || '📦') + ' ' + (p.name || '') + ' ×' + qty + ' - $' + lineTotal.toFixed(2));
            });
            var total = currentCheckoutItems.reduce(function (s, item) {
                return s + (Number(item.product.price) || 0) * (item.quantity || 1);
            }, 0);
            var subject = 'New order - Mhmd Chamas';
            var paymentLine = paymentMethod === 'whish'
                ? 'Payment: Whish Money (' + WHISH_MONEY_NUMBER + ')'
                : 'Payment: Pay on delivery';
            var body = orderLines.join('\n') + '\nTotal: $' + total.toFixed(2) + '\n\n' +
                'Customer: ' + name + '\nPhone: ' + phone + '\nAddress: ' + address + ', ' + city + '\n' +
                paymentLine + '\n' +
                (notes ? 'Notes: ' + notes : '');
            var mailtoUrl = 'mailto:' + ORDER_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
            window.location.href = mailtoUrl;

            closeModal(checkoutModal);
            var confirmMsg = paymentMethod === 'whish'
                ? 'Order confirmed! Send payment to Whish Money ' + WHISH_MONEY_NUMBER + ', then send the email to complete.'
                : 'Order confirmed! Your email client will open. Send the email to complete. Pay on delivery.';
            showNotification(confirmMsg);
            currentCheckoutItems = [];
            cart.length = 0;
            updateCartCount();
        });
    }

    var whishCopyBtn = document.getElementById('whishCopyBtn');
    if (whishCopyBtn) {
        whishCopyBtn.addEventListener('click', function () {
            var num = document.getElementById('whishNumber');
            var text = num ? num.textContent : WHISH_MONEY_NUMBER;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                    whishCopyBtn.textContent = 'Copied!';
                    whishCopyBtn.classList.add('copied');
                    setTimeout(function () {
                        whishCopyBtn.textContent = 'Copy';
                        whishCopyBtn.classList.remove('copied');
                    }, 2000);
                });
            } else {
                var ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                whishCopyBtn.textContent = 'Copied!';
                whishCopyBtn.classList.add('copied');
                setTimeout(function () {
                    whishCopyBtn.textContent = 'Copy';
                    whishCopyBtn.classList.remove('copied');
                }, 2000);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = (e.target.username && e.target.username.value) || '';
            const pass = (e.target.password && e.target.password.value) || '';
            if (user === AUTH_USER && pass === AUTH_PASS) {
                setAdmin(true);
                closeModal(loginModal);
                loginForm.reset();
                showNotification('Welcome back, admin.');
            } else {
                showNotification('Invalid username or password.', true);
            }
        });
    }

    if (btnLogout) btnLogout.addEventListener('click', (e) => { e.preventDefault(); if (window.doLogout) window.doLogout(); });
    if (btnManageCategories) btnManageCategories.addEventListener('click', () => openCategoriesModal());
    if (btnAddProduct) btnAddProduct.addEventListener('click', () => openProductForm());

    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', (e) => { e.preventDefault(); if (window.handleAddCategory) window.handleAddCategory(e); });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = (contactForm.name && contactForm.name.value) || '';
            var email = (contactForm.email && contactForm.email.value) || '';
            var message = (contactForm.message && contactForm.message.value) || '';
            var subject = 'Contact from Mhmd Chamas';
            var body = 'Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message;
            var mailtoUrl = 'mailto:' + ORDER_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
            window.location.href = mailtoUrl;
            contactForm.reset();
            if (typeof showNotification === 'function') showNotification('Opening your email client. Send the message to reach us.');
        });
    }

    if (closeCategoriesModal) { /* already closed */ }
    function openCategoriesModal() {
        renderCategoryList();
        openModal(categoriesModal);
    }
    function renderCategoryList() {
        if (!categoryList) return;
        const categories = getCategories();
        categoryList.innerHTML = '';
        categories.forEach(cat => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${cat.charAt(0).toUpperCase() + cat.slice(1)}</span><button type="button" class="btn-remove-cat" data-cat="${cat}">Remove</button>`;
            const btn = li.querySelector('.btn-remove-cat');
            if (btn) btn.addEventListener('click', () => removeCategory(cat));
            categoryList.appendChild(li);
        });
    }
    window.openCategoriesModal = openCategoriesModal;

    async function removeCategory(cat) {
        const categories = getCategories().filter(c => c !== cat);
        if (categories.length === 0) {
            showNotification('Keep at least one category.', true);
            return;
        }
        const used = products.some(p => p.category === cat);
        if (used) {
            showNotification('Remove or reassign products in this category first.', true);
            return;
        }
        try {
            await apiRemoveCategory(cat);
            _categoriesCache = categories;
            renderFilterButtons();
            renderCategoryList();
            showNotification('Category removed.');
        } catch (err) {
            showNotification(err.message || 'Failed to remove category.', true);
        }
    }

    var btnSaveProduct = document.getElementById('btnSaveProduct');
    if (btnSaveProduct && productForm) {
        btnSaveProduct.addEventListener('click', function (e) {
            e.preventDefault();
            if (window.handleSaveProduct) window.handleSaveProduct(e);
        });
    }

    function openProductForm(editId) {
        const categories = getCategories();
        productFormCategory.innerHTML = '';
        categories.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
            productFormCategory.appendChild(opt);
        });
        window._productImageDataUrl = null;
        var previewEl = document.getElementById('productImagePreview');
        var fileInput = document.getElementById('productImageUpload');
        if (previewEl) { previewEl.innerHTML = ''; previewEl.style.minHeight = ''; }
        if (fileInput) fileInput.value = '';
        var imgLabel = document.getElementById('productImageRequiredLabel');
        if (editId) {
            const product = products.find(p => p.id === editId);
            if (product) {
                window._editingProductImageUrl = product.imageUrl || null;
                productFormModalTitle.textContent = 'Edit product';
                productFormId.value = product.id;
                if (imgLabel) imgLabel.textContent = '(optional — upload to replace)';
                var nameEl = productForm.elements && productForm.elements.name;
                var catEl = productForm.elements && productForm.elements.category;
                var priceEl = productForm.elements && productForm.elements.price;
                var descEl = productForm.elements && productForm.elements.description;
                if (nameEl) nameEl.value = product.name || '';
                if (catEl) catEl.value = product.category || '';
                if (priceEl) priceEl.value = product.price || '';
                if (descEl) descEl.value = product.description || '';
                if (previewEl && product.imageUrl) {
                    previewEl.innerHTML = '';
                    var img = document.createElement('img');
                    img.src = product.imageUrl;
                    img.alt = 'Preview';
                    img.className = 'product-form-preview-img';
                    previewEl.appendChild(img);
                    previewEl.style.minHeight = '120px';
                }
            }
        } else {
            window._editingProductImageUrl = null;
            productFormModalTitle.textContent = 'Add product';
            productFormId.value = '';
            if (imgLabel) imgLabel.textContent = '(required — upload from your computer)';
            productForm.reset();
        }
        openModal(productFormModal);
    }
    window.openProductForm = () => openProductForm(null);
    window._openEditProductImpl = function (id) {
        closeModal(productModal);
        openProductForm(id);
    };
    window._deleteProductImpl = async function (id) {
        if (!confirm('Delete this product?')) return;
        try {
            await apiDeleteProduct(id);
            products = products.filter(p => p.id !== id);
            const currentCat = filterButtonsContainer.querySelector('.filter-btn.active');
            filterProducts(currentCat ? currentCat.getAttribute('data-category') : 'all');
            showNotification('Product deleted.');
        } catch (err) {
            showNotification(err.message || 'Failed to delete.', true);
        }
    };
}

function filterProducts(category) {
    currentFilteredProducts = category === 'all' ? products : products.filter(p => p.category === category);
    currentPage = 1;
    displayProductsPage();
}

function addToCart(productId, quantity) {
    quantity = Math.max(1, parseInt(quantity, 10) || 1);
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.product.id === productId);
    if (existing) {
        existing.quantity += quantity;
        showNotification(`${product.name} (${existing.quantity} in cart)`);
    } else {
        cart.push({ product: product, quantity: quantity });
        showNotification(`${product.name} added to cart!`);
    }
    updateCartCount();
}


function getCartTotalItems() {
    return cart.reduce(function (s, item) { return s + (item.quantity || 1); }, 0);
}

function updateCartCount() {
    if (cartCountElement) cartCountElement.textContent = getCartTotalItems();
}

function showNotification(message, isError) {
    const notification = document.createElement('div');
    notification.className = 'toast' + (isError ? ' toast-error' : '');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${isError ? '#7f1d1d' : '#e8b86d'};
        color: ${isError ? '#fecaca' : '#0a0a0a'};
        padding: 14px 22px;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        z-index: 10000;
        font-weight: 600;
        font-size: 0.9rem;
        animation: toastIn 0.3s ease-out;
    `;
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `
            @keyframes toastIn {
                from { transform: translateX(120%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'toastIn 0.25s ease-out reverse';
        setTimeout(() => notification.remove(), 250);
    }, 3000);
}

window.doLogin = function () {
    try {
        var userEl = document.getElementById('loginUsername');
        var passEl = document.getElementById('loginPassword');
        var user = (userEl && userEl.value) ? String(userEl.value).trim() : '';
        var pass = (passEl && passEl.value) ? String(passEl.value) : '';
        if (user === 'admin' && pass === 'admin123') {
            sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
            var modal = document.getElementById('loginModal');
            if (modal) { modal.setAttribute('aria-hidden', 'true'); }
            document.body.style.overflow = '';
            if (userEl) userEl.value = '';
            if (passEl) passEl.value = '';
            if (typeof setAdmin === 'function') setAdmin(true);
            else { try { updateAdminUI(); } catch (_) {} }
            if (typeof showNotification === 'function') showNotification('Welcome back, admin.');
            else alert('Welcome back, admin.');
        } else {
            if (typeof showNotification === 'function') showNotification('Invalid username or password.', true);
            else alert('Invalid username or password.');
        }
    } catch (err) {
        alert('Login: ' + (err && err.message ? err.message : 'error'));
    }
};

window.handleAddCategory = async function (e) {
    if (e) e.preventDefault();
    var input = document.getElementById('categoryNameInput') || (document.getElementById('addCategoryForm') && document.getElementById('addCategoryForm').categoryName);
    var name = (input && input.value && input.value.trim()) ? input.value.trim().toLowerCase() : '';
    if (!name) {
        if (typeof showNotification === 'function') showNotification('Enter a category name.', true);
        return false;
    }
    var categories = getCategories();
    if (categories.indexOf(name) !== -1) {
        if (typeof showNotification === 'function') showNotification('Category already exists.', true);
        return false;
    }
    try {
        await apiAddCategory(name);
        _categoriesCache = [...categories, name];
        if (input) input.value = '';
        renderFilterButtons();
        if (typeof window.openCategoriesModal === 'function') window.openCategoriesModal();
        else {
            var listEl = document.getElementById('categoryList');
            if (listEl) {
                listEl.innerHTML = '';
                getCategories().forEach(function (c) {
                    var li = document.createElement('li');
                    li.innerHTML = '<span>' + (c.charAt(0).toUpperCase() + c.slice(1)) + '</span><button type="button" class="btn-remove-cat">Remove</button>';
                    listEl.appendChild(li);
                });
            }
        }
        if (typeof showNotification === 'function') showNotification('Category added.');
    } catch (err) {
        if (typeof showNotification === 'function') showNotification(err.message || 'Failed to add category.', true);
    }
    return false;
};

window._productImageDataUrl = null;
window._editingProductImageUrl = null; // fallback when editing without new upload

window.handleSaveProduct = async function (e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (window._savingProduct) return false;
    var form = document.getElementById('productForm');
    if (!form) return false;
    var idEl = document.getElementById('productFormId');
    var id = (idEl && idEl.value) ? parseInt(idEl.value, 10) : null;
    var name = (form.elements.name && form.elements.name.value) ? form.elements.name.value.trim() : '';
    var category = (form.elements.category && form.elements.category.value) ? form.elements.category.value.trim() : '';
    var price = parseFloat(form.elements.price && form.elements.price.value ? form.elements.price.value : 0) || 0;
    var description = (form.elements.description && form.elements.description.value) ? form.elements.description.value.trim() : '';
    var emoji = '📦';
    var imageUrl = '';
    var fileInput = document.getElementById('productImageUpload');
    var file = fileInput && fileInput.files && fileInput.files[0];
    if (window._productImageDataUrl) {
        imageUrl = window._productImageDataUrl;
    } else if (file && file.type && file.type.indexOf('image') === 0) {
        if (typeof showNotification === 'function') showNotification('Processing image...');
        var reader = new FileReader();
        reader.onload = function (ev) {
            var dataUrl = ev.target && ev.target.result;
            if (dataUrl) {
                window._productImageDataUrl = dataUrl;
                window.handleSaveProduct(e);
            } else {
                if (typeof showNotification === 'function') showNotification('Could not read image.', true);
            }
        };
        reader.onerror = function () { if (typeof showNotification === 'function') showNotification('Could not read image.', true); };
        reader.readAsDataURL(file);
        return false;
    } else {
        var previewEl = document.getElementById('productImagePreview');
        var previewImg = previewEl && previewEl.querySelector('img');
        if (previewImg && previewImg.src && (previewImg.src.indexOf('data:') === 0 || previewImg.src.indexOf('http') === 0)) {
            imageUrl = previewImg.src;
        } else if (id && window._editingProductImageUrl) {
            imageUrl = window._editingProductImageUrl;
        }
    }
    window._savingProduct = true;
    if (!name || !category) {
        window._savingProduct = false;
        if (typeof showNotification === 'function') showNotification('Fill name and category.', true);
        return false;
    }
    if (!id && !imageUrl) {
        window._savingProduct = false;
        if (typeof showNotification === 'function') showNotification('Please upload an image from your computer. Product image is required.', true);
        return false;
    }
    window._productImageDataUrl = null;
    window._editingProductImageUrl = null;
    try {
        if (id) {
            await apiUpdateProduct(id, { name, category, price, description, emoji, imageUrl: imageUrl || products.find(p => p.id === id)?.imageUrl });
            var idx = products.findIndex(function (p) { return p.id === id; });
            if (idx !== -1) {
                products[idx] = { id: products[idx].id, name, category, price, description, emoji, imageUrl: imageUrl || products[idx].imageUrl };
            }
            if (typeof showNotification === 'function') showNotification('Product updated.');
        } else {
            var newId = await apiAddProduct({ name, category, price, description, emoji, imageUrl });
            products.push({ id: newId, name, category, price, description, emoji, imageUrl });
            if (typeof showNotification === 'function') showNotification('Product added.');
        }
    } catch (err) {
        window._savingProduct = false;
        if (typeof showNotification === 'function') showNotification(err.message || 'Failed to save product.', true);
        return false;
    }
    closeModal(document.getElementById('productFormModal'));
    form.reset();
    if (idEl) idEl.value = '';
    window._productImageDataUrl = null;
    var previewEl = document.getElementById('productImagePreview');
    if (previewEl) previewEl.innerHTML = '';
    var fileInput = document.getElementById('productImageUpload');
    if (fileInput) fileInput.value = '';
    var activeBtn = document.querySelector('#filterButtons .filter-btn.active');
    var cat = (activeBtn && activeBtn.getAttribute('data-category')) || 'all';
    filterProducts(cat);
    window._savingProduct = false;
    return false;
};

// Cart icon click: optional open cart or checkout
document.querySelector('.cart-icon')?.addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('Your cart is empty.');
        return;
    }
    openCheckout(cart);
});

// Ensure Categories and Add product modals can open (work after login)
window.openCategoriesModal = window.openCategoriesModal || function () {
    var overlay = document.getElementById('categoriesModal');
    var listEl = document.getElementById('categoryList');
    function renderList() {
        if (!listEl) return;
        var cats = getCategories();
        listEl.innerHTML = '';
        cats.forEach(function (c) {
            var li = document.createElement('li');
            li.innerHTML = '<span>' + (c.charAt(0).toUpperCase() + c.slice(1)) + '</span><button type="button" class="btn-remove-cat">Remove</button>';
            var btn = li.querySelector('.btn-remove-cat');
            if (btn) btn.addEventListener('click', async function () {
                var categories = getCategories().filter(function (x) { return x !== c; });
                if (categories.length === 0) return;
                try {
                    await apiRemoveCategory(c);
                    _categoriesCache = categories;
                    renderFilterButtons();
                    renderList();
                } catch (err) {
                    if (typeof showNotification === 'function') showNotification(err.message || 'Failed to remove.', true);
                }
            });
            listEl.appendChild(li);
        });
    }
    renderList();
    if (overlay) openModal(overlay);
};

window.openProductForm = window.openProductForm || function (editId) {
    var overlay = document.getElementById('productFormModal');
    var select = document.getElementById('productFormCategory');
    var form = document.getElementById('productForm');
    var titleEl = document.getElementById('productFormModalTitle');
    var previewEl = document.getElementById('productImagePreview');
    var fileInput = document.getElementById('productImageUpload');
    window._productImageDataUrl = null;
    if (previewEl) previewEl.innerHTML = '';
    if (fileInput) fileInput.value = '';
    if (select) {
        select.innerHTML = '';
        getCategories().forEach(function (c) {
            var opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
            select.appendChild(opt);
        });
    }
    var imgLabel = document.getElementById('productImageRequiredLabel');
    if (editId && form) {
        var product = products.find(function (p) { return p.id === editId; });
        if (product) {
            window._editingProductImageUrl = product.imageUrl || null;
            if (titleEl) titleEl.textContent = 'Edit product';
            if (imgLabel) imgLabel.textContent = '(optional — upload to replace)';
            if (document.getElementById('productFormId')) document.getElementById('productFormId').value = product.id;
            if (form.name) form.name.value = product.name || '';
            if (form.category) form.category.value = product.category || '';
            if (form.price) form.price.value = product.price || '';
            if (form.description) form.description.value = product.description || '';
            if (form.emoji) form.emoji.value = product.imageUrl || product.emoji || '';
            if (previewEl && product.imageUrl) {
                previewEl.innerHTML = '';
                var img = document.createElement('img');
                img.src = product.imageUrl;
                img.alt = 'Preview';
                img.className = 'product-form-preview-img';
                previewEl.appendChild(img);
                previewEl.style.minHeight = '120px';
            }
        }
    } else if (form) {
        window._editingProductImageUrl = null;
        if (titleEl) titleEl.textContent = 'Add product';
        if (imgLabel) imgLabel.textContent = '(required — upload from your computer)';
        if (document.getElementById('productFormId')) document.getElementById('productFormId').value = '';
        form.reset();
    }
    if (overlay) openModal(overlay);
};

window.openEditProduct = window.openEditProduct || function (id) {
    closeModal(document.getElementById('productModal'));
    window.openProductForm(id);
};

window.deleteProduct = window.deleteProduct || async function (id) {
    if (!confirm('Delete this product?')) return;
    try {
        await apiDeleteProduct(id);
        products = products.filter(function (p) { return p.id !== id; });
        var activeBtn = document.querySelector('#filterButtons .filter-btn.active');
        filterProducts(activeBtn ? activeBtn.getAttribute('data-category') : 'all');
        if (typeof showNotification === 'function') showNotification('Product deleted.');
    } catch (err) {
        if (typeof showNotification === 'function') showNotification(err.message || 'Failed to delete.', true);
    }
};

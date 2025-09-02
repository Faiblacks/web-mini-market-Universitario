// StudiMarket - Sistema unificado optimizado
'use strict';

// ============================================================================
// CONFIGURACIÓN GLOBAL
// ============================================================================
const CONFIG = {
    IVA: 0.19,
    STORAGE_KEYS: {
        CART: 'cart',
        WISHLIST: 'wishlist'
    },
    SELECTORS: {
        PRODUCTS_GRID: '#products-grid',
        CART_BTN: '#cart-btn',
        CART_COUNT: '#cart-count',
        CART_MODAL: '#cart-modal',
        CART_MODAL_CONTENT: '#cart-modal-content',
        CLOSE_CART_MODAL: '#close-cart-modal',
        PRODUCT_MODAL: '#product-modal',
        CLOSE_PRODUCT_MODAL: '#close-product-modal',
        WISHLIST_BTN: '#wishlist-btn',
        WISHLIST_COUNT: '#wishlist-count',
        LOGO: '#logo'
    }
};

// ============================================================================
// UTILIDADES GLOBALES
// ============================================================================
class Utils {
    static formatPrice(price) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(price);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static createElement(tag, className, innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    static showNotification(message, type = 'info') {
        const notification = Utils.createElement('div', `notification notification-${type}`, message);
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// ============================================================================
// GESTOR DE PRODUCTOS
// ============================================================================
class ProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.cache = new Map();
    }

    async loadProducts() {
        try {
            const response = await fetch('assets/data/products.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.products = await response.json();
            this.filteredProducts = [...this.products];
            this.cacheProducts();
            return this.products;
        } catch (error) {
            console.error('Error cargando productos:', error);
            Utils.showNotification('Error al cargar productos', 'error');
            return [];
        }
    }

    cacheProducts() {
        this.products.forEach(product => {
            this.cache.set(product.id, product);
        });
    }

    getProduct(id) {
        return this.cache.get(id);
    }

    renderProducts() {
        const container = document.querySelector(CONFIG.SELECTORS.PRODUCTS_GRID);
        if (!container) return;

        if (this.filteredProducts.length === 0) {
            container.innerHTML = '<div class="no-products">No se encontraron productos</div>';
            return;
        }

        container.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image" data-id="${product.id}">
                    <img src="${product.imagenes?.[0] || ''}" 
                         alt="${product.titulo}" 
                         loading="lazy"
                         onerror="this.src='assets/images/placeholder.png'">
                    <button class="wishlist-heart-btn ${wishlistManager.isInWishlist(product.id) ? 'active' : ''}"
                            data-id="${product.id}" 
                            title="${wishlistManager.isInWishlist(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                        ❤️
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.marca}</div>
                    <h3 class="product-title">${product.titulo}</h3>
                    <div class="product-rating">
                        <span class="stars" data-id="${product.id}">${'⭐'.repeat(5)}</span>
                        <span class="rating-text">5.0</span>
                    </div>
                    <div class="product-price">${Utils.formatPrice(product.precio)}</div>
                    <div class="product-actions">
                        <button class="add-to-cart-btn" data-id="${product.id}">
                            🛒 Agregar al Carrito
                        </button>
                        <button class="view-details-btn" data-id="${product.id}">
                            👁️ Ver Detalles
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.assignEvents();
    }

    assignEvents() {
        const container = document.querySelector(CONFIG.SELECTORS.PRODUCTS_GRID);
        if (!container) return;

        // Event delegation para mejor rendimiento
        container.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            if (!productId) return;

            if (e.target.classList.contains('add-to-cart-btn')) {
                cartManager.addToCart(productId);
            } else if (e.target.classList.contains('view-details-btn') || 
                       e.target.closest('.product-image')) {
                modalManager.openProductModal(productId);
            } else if (e.target.classList.contains('wishlist-heart-btn')) {
                wishlistManager.toggle(productId);
            } else if (e.target.classList.contains('stars')) {
                modalManager.openProductModal(productId);
            }
        });
    }
}

// ============================================================================
// GESTOR DE CARRITO
// ============================================================================
class CartManager {
    constructor() {
        this.cart = this.getCart();
        this.init();
    }

    getCart() {
        const cartData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CART) || '[]');
        // Migración de formato legacy
        if (cartData.length > 0 && typeof cartData[0] === 'string') {
            const cartMap = new Map();
            cartData.forEach(id => cartMap.set(id, (cartMap.get(id) || 0) + 1));
            const newCart = Array.from(cartMap.entries()).map(([id, quantity]) => ({id, quantity}));
            this.setCart(newCart);
            return newCart;
        }
        return cartData;
    }

    setCart(cart) {
        this.cart = cart;
        localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(cart));
    }

    addToCart(productId) {
        const product = productManager.getProduct(productId);
        if (!product) return false;

        const existingIndex = this.cart.findIndex(item => item.id === productId);
        
        if (existingIndex !== -1) {
            this.cart[existingIndex].quantity += 1;
        } else {
            this.cart.push({id: productId, quantity: 1});
        }

        this.setCart(this.cart);
        this.updateCartCount();
        Utils.showNotification(`🛒 "${product.titulo}" agregado al carrito`, 'success');
        return true;
    }

    removeFromCart(productId) {
        const initialLength = this.cart.length;
        this.cart = this.cart.filter(item => item.id !== productId);
        
        if (this.cart.length !== initialLength) {
            this.setCart(this.cart);
            this.updateCartCount();
            Utils.showNotification('🗑️ Producto eliminado del carrito', 'remove');
            this.renderModal();
            return true;
        }
        return false;
    }

    updateQuantity(productId, delta) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return false;

        const newQuantity = item.quantity + delta;
        
        if (newQuantity <= 0) {
            return this.removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            this.setCart(this.cart);
            this.updateCartCount();
            this.renderModal();
            return true;
        }
    }

    calculateTotals() {
        let total = 0;
        const cartProducts = this.cart.map(cartItem => {
            const product = productManager.getProduct(cartItem.id);
            if (product) {
                total += product.precio * cartItem.quantity;
                return { ...product, quantity: cartItem.quantity };
            }
            return null;
        }).filter(Boolean);

        const iva = Math.round(total * CONFIG.IVA);
        const totalConIva = total + iva;

        return { cartProducts, total, iva, totalConIva };
    }

    updateCartCount() {
        const cartCountElement = document.querySelector(CONFIG.SELECTORS.CART_COUNT);
        if (cartCountElement) {
            const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = totalItems;
            cartCountElement.style.animation = 'pulse 0.3s ease-in-out';
        }
    }

    renderModal() {
        const modalContent = document.querySelector(CONFIG.SELECTORS.CART_MODAL_CONTENT);
        if (!modalContent) return;

        if (this.cart.length === 0) {
            modalContent.innerHTML = '<div class="empty-cart">No hay productos en el carrito.</div>';
            return;
        }

        const { cartProducts, total, iva, totalConIva } = this.calculateTotals();

        modalContent.innerHTML = `
            <div class="cart-products">
                ${cartProducts.map(p => `
                    <div class="cart-item">
                        <img src="${p.imagenes?.[0] || ''}" 
                             alt="${p.titulo}" 
                             class="cart-item-image" 
                             loading="lazy">
                        <div class="cart-item-info">
                            <div class="cart-item-brand">${p.marca}</div>
                            <div class="cart-item-title">${p.titulo}</div>
                            <div class="cart-item-price">${Utils.formatPrice(p.precio)}</div>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn-cart decrease" 
                                        data-id="${p.id}" 
                                        ${p.quantity <= 1 ? 'disabled' : ''}>−</button>
                                <span class="quantity-display">${p.quantity}</span>
                                <button class="quantity-btn-cart increase" 
                                        data-id="${p.id}">+</button>
                            </div>
                            <button class="cart-remove-btn" 
                                    data-id="${p.id}" 
                                    title="Eliminar producto">Eliminar</button>
                        </div>
                        <div class="cart-item-subtotal">${Utils.formatPrice(p.precio * p.quantity)}</div>
                    </div>
                `).join('')}
            </div>
            <div class='cart-summary'>
                <div class="cart-summary-line">Subtotal: <span>${Utils.formatPrice(total)}</span></div>
                <div class="cart-summary-line">IVA (19%): <span>${Utils.formatPrice(iva)}</span></div>
                <div class="cart-summary-total">Total: <span>${Utils.formatPrice(totalConIva)}</span></div>
                <button class="cart-checkout-btn">💳 PROCEDER AL PAGO</button>
            </div>
        `;

        this.assignModalEvents();
    }

    assignModalEvents() {
        const modalContent = document.querySelector(CONFIG.SELECTORS.CART_MODAL_CONTENT);
        if (!modalContent) return;

        modalContent.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            if (!productId) return;

            if (e.target.classList.contains('increase')) {
                this.updateQuantity(productId, 1);
            } else if (e.target.classList.contains('decrease')) {
                this.updateQuantity(productId, -1);
            } else if (e.target.classList.contains('cart-remove-btn')) {
                this.removeFromCart(productId);
            }
        });
    }

    showModal() {
        const modal = document.querySelector(CONFIG.SELECTORS.CART_MODAL);
        if (modal) {
            this.renderModal();
            modal.style.display = 'flex';
            modal.offsetHeight; // Force reflow
            modal.classList.add('show');
        }
    }

    hideModal() {
        const modal = document.querySelector(CONFIG.SELECTORS.CART_MODAL);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.updateCartCount();
        });
    }

    setupEventListeners() {
        const cartBtn = document.querySelector(CONFIG.SELECTORS.CART_BTN);
        const closeBtn = document.querySelector(CONFIG.SELECTORS.CLOSE_CART_MODAL);
        const modal = document.querySelector(CONFIG.SELECTORS.CART_MODAL);

        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModal();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('show')) {
                this.hideModal();
            }
        });
    }
}

// ============================================================================
// GESTOR DE WISHLIST
// ============================================================================
class WishlistManager {
    constructor() {
        this.wishlist = this.getWishlist();
        this.init();
    }

    getWishlist() {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.WISHLIST) || '[]');
    }

    setWishlist(wishlist) {
        this.wishlist = wishlist;
        localStorage.setItem(CONFIG.STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    }

    toggle(productId) {
        const product = productManager.getProduct(productId);
        if (!product) return false;

        if (this.isInWishlist(productId)) {
            this.remove(productId);
        } else {
            this.add(productId);
        }
        return true;
    }

    add(productId) {
        if (!this.isInWishlist(productId)) {
            this.wishlist.push(productId);
            this.setWishlist(this.wishlist);
            this.updateWishlistCount();
            this.updateWishlistButtons();
            
            const product = productManager.getProduct(productId);
            if (product) {
                Utils.showNotification(`❤️ "${product.titulo}" agregado a favoritos`, 'success');
            }
        }
    }

    remove(productId) {
        this.wishlist = this.wishlist.filter(id => id !== productId);
        this.setWishlist(this.wishlist);
        this.updateWishlistCount();
        this.updateWishlistButtons();
        
        const product = productManager.getProduct(productId);
        if (product) {
            Utils.showNotification(`💔 "${product.titulo}" eliminado de favoritos`, 'remove');
        }
    }

    isInWishlist(productId) {
        return this.wishlist.includes(productId);
    }

    updateWishlistCount() {
        const countElement = document.querySelector(CONFIG.SELECTORS.WISHLIST_COUNT);
        if (countElement) {
            countElement.textContent = this.wishlist.length;
            countElement.style.animation = 'pulse 0.3s ease-in-out';
        }
    }

    updateWishlistButtons() {
        document.querySelectorAll('.wishlist-heart-btn').forEach(btn => {
            const productId = btn.dataset.id;
            const isInWishlist = this.isInWishlist(productId);
            
            btn.classList.toggle('active', isInWishlist);
            btn.title = isInWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos';
        });
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateWishlistCount();
        });
    }
}

// ============================================================================
// GESTOR DE MODALES
// ============================================================================
class ModalManager {
    constructor() {
        this.currentProduct = null;
        this.init();
    }

    openProductModal(productId) {
        const product = productManager.getProduct(productId);
        if (!product) return;

        this.currentProduct = product;
        const modal = document.querySelector(CONFIG.SELECTORS.PRODUCT_MODAL);
        if (!modal) return;

        this.renderProductModal(product);
        modal.style.display = 'flex';
        modal.offsetHeight; // Force reflow
        modal.classList.add('show');
    }

    renderProductModal(product) {
        const modal = document.querySelector(CONFIG.SELECTORS.PRODUCT_MODAL);
        if (!modal) return;

        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${product.titulo}</h2>
                    <button id="close-product-modal" class="close-modal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="modal-image-section">
                        <div class="modal-image-wrapper">
                            <img src="${product.imagenes?.[0] || ''}" 
                                 alt="${product.titulo}" 
                                 class="modal-product-image">
                        </div>
                    </div>
                    <div class="modal-info-section">
                        <div class="modal-brand">${product.marca}</div>
                        <div class="modal-price">${Utils.formatPrice(product.precio)}</div>
                        <div class="modal-rating">
                            <div class="stars-clickable" id="modal-stars-clickable">${'⭐'.repeat(5)}</div>
                            <span class="rating-text">5.0 (Excelente)</span>
                        </div>
                        <div class="modal-description">
                            <p>${product.descripcion || 'Producto de excelente calidad.'}</p>
                        </div>
                        <div class="modal-actions">
                            <button class="add-to-cart-btn-modal" data-id="${product.id}">
                                🛒 Agregar al Carrito
                            </button>
                            <button class="wishlist-btn-modal ${wishlistManager.isInWishlist(product.id) ? 'active' : ''}" 
                                    data-id="${product.id}">
                                ❤️ ${wishlistManager.isInWishlist(product.id) ? 'En Favoritos' : 'Agregar a Favoritos'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupProductModalEvents();
    }

    setupProductModalEvents() {
        const modal = document.querySelector(CONFIG.SELECTORS.PRODUCT_MODAL);
        if (!modal) return;

        const closeBtn = modal.querySelector('#close-product-modal');
        const overlay = modal.querySelector('.modal-overlay');
        const addToCartBtn = modal.querySelector('.add-to-cart-btn-modal');
        const wishlistBtn = modal.querySelector('.wishlist-btn-modal');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeProductModal());
        }

        if (overlay) {
            overlay.addEventListener('click', () => this.closeProductModal());
        }

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const productId = addToCartBtn.dataset.id;
                cartManager.addToCart(productId);
            });
        }

        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', () => {
                const productId = wishlistBtn.dataset.id;
                wishlistManager.toggle(productId);
                // Actualizar texto del botón
                const isInWishlist = wishlistManager.isInWishlist(productId);
                wishlistBtn.textContent = `❤️ ${isInWishlist ? 'En Favoritos' : 'Agregar a Favoritos'}`;
                wishlistBtn.classList.toggle('active', isInWishlist);
            });
        }
    }

    closeProductModal() {
        const modal = document.querySelector(CONFIG.SELECTORS.PRODUCT_MODAL);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector(CONFIG.SELECTORS.PRODUCT_MODAL);
                if (modal?.classList.contains('show')) {
                    this.closeProductModal();
                }
            }
        });
    }
}

// ============================================================================
// GESTOR DE CARGA Y LOGO
// ============================================================================
class LoadingManager {
    constructor() {
        this.init();
    }

    showLoading() {
        const overlay = Utils.createElement('div', 'loading-overlay', `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Cargando StudiMarket...</p>
            </div>
        `);
        document.body.appendChild(overlay);
        return overlay;
    }

    hideLoading(overlay) {
        if (overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 500);
        }
    }

    setupLogoHandler() {
        const logo = document.querySelector(CONFIG.SELECTORS.LOGO);
        if (logo) {
            logo.addEventListener('click', () => {
                const overlay = this.showLoading();
                setTimeout(() => {
                    this.hideLoading(overlay);
                    window.location.reload();
                }, 1500);
            });
        }
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupLogoHandler();
        });
    }
}

// ============================================================================
// INICIALIZACIÓN DEL SISTEMA
// ============================================================================
class StudiMarketApp {
    constructor() {
        this.init();
    }

    async init() {
        // Mostrar loading inicial
        const loadingOverlay = loadingManager.showLoading();

        try {
            // Inicializar managers
            await productManager.loadProducts();
            
            // Renderizar productos
            productManager.renderProducts();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            console.log('🛍️ StudiMarket inicializado correctamente');
            
        } catch (error) {
            console.error('Error inicializando StudiMarket:', error);
            Utils.showNotification('Error al inicializar la aplicación', 'error');
        } finally {
            // Ocultar loading
            setTimeout(() => loadingManager.hideLoading(loadingOverlay), 1000);
        }
    }

    setupGlobalEvents() {
        // Gestión de eventos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl+K para abrir carrito
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                cartManager.showModal();
            }
        });

        // Gestión de cambios de tamaño de ventana
        window.addEventListener('resize', Utils.debounce(() => {
            // Reajustar elementos si es necesario
        }, 250));
    }
}

// ============================================================================
// INSTANCIAS GLOBALES
// ============================================================================
const productManager = new ProductManager();
const cartManager = new CartManager();
const wishlistManager = new WishlistManager();
const modalManager = new ModalManager();
const loadingManager = new LoadingManager();

// ============================================================================
// FUNCIONES GLOBALES PARA COMPATIBILIDAD
// ============================================================================
window.addToCartFunction = (productId) => cartManager.addToCart(productId);
window.toggleWishlist = (productId) => wishlistManager.toggle(productId);
window.openProductModal = (productId) => modalManager.openProductModal(productId);

// ============================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    new StudiMarketApp();
});

// Exportar para uso global
window.StudiMarket = {
    productManager,
    cartManager,
    wishlistManager,
    modalManager,
    loadingManager,
    Utils,
    CONFIG
};

// Carrito de compras optimizado con IVA chileno
class CartManager {
    constructor() {
        this.IVA = 0.19;
        this.cart = this.getCart();
        this.productCache = new Map(); // Cache para productos - O(1) lookup
        this.init();
    }

    // Optimización: Cache de productos para evitar búsquedas O(n) repetidas
    cacheProducts() {
        if (typeof allProducts !== 'undefined' && this.productCache.size === 0) {
            allProducts.forEach(product => {
                this.productCache.set(product.id, product);
            });
        }
    }

    getCart() {
        const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
        // Migración optimizada: solo una vez y con validación
        if (cartData.length > 0 && typeof cartData[0] === 'string') {
            const cartMap = new Map();
            cartData.forEach(id => {
                cartMap.set(id, (cartMap.get(id) || 0) + 1);
            });
            const newCart = Array.from(cartMap.entries()).map(([id, quantity]) => ({id, quantity}));
            this.setCart(newCart);
            return newCart;
        }
        return cartData;
    }

    setCart(cart) {
        this.cart = cart;
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Optimización: Operación O(1) en lugar de O(n) con Map
    addToCart(productId) {
        this.cacheProducts();
        const product = this.productCache.get(productId);
        if (!product) return false;
        
        const existingIndex = this.cart.findIndex(item => item.id === productId);
        
        if (existingIndex !== -1) {
            this.cart[existingIndex].quantity += 1;
        } else {
            this.cart.push({id: productId, quantity: 1});
        }
        
        this.setCart(this.cart);
        this.updateCartCount();
        
        if (typeof showNotification === 'function') {
            showNotification(`🛒 "${product.titulo}" agregado al carrito`, 'success');
        }
        
        // Solo un render al final
        this.renderCartModal();
        return true;
    }

    removeFromCart(productId) {
        const initialLength = this.cart.length;
        this.cart = this.cart.filter(item => item.id !== productId);
        
        if (this.cart.length !== initialLength) {
            this.setCart(this.cart);
            this.updateCartCount();
            
            if (typeof showNotification === 'function') {
                showNotification(`🗑️ Producto eliminado del carrito`, 'remove');
            }
            
            this.renderCartModal();
            return true;
        }
        return false;
    }

    // Optimización: Una sola función para actualizar cantidad
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
            this.renderCartModal();
            return true;
        }
    }

    increaseQuantity(productId) {
        return this.updateQuantity(productId, 1);
    }

    decreaseQuantity(productId) {
        return this.updateQuantity(productId, -1);
    }

    // Optimización: Cálculo eficiente con una sola pasada O(n)
    calculateTotals() {
        this.cacheProducts();
        let total = 0;
        
        const cartProducts = this.cart.map(cartItem => {
            const product = this.productCache.get(cartItem.id);
            if (product) {
                total += product.precio * cartItem.quantity;
                return { ...product, quantity: cartItem.quantity };
            }
            return null;
        }).filter(Boolean);
        
        const iva = Math.round(total * this.IVA);
        const totalConIva = total + iva;
        
        return { cartProducts, total, iva, totalConIva };
    }

    updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = totalItems;
            
            // Animación optimizada sin setTimeout anidados
            cartCountElement.style.animation = 'pulse 0.3s ease-in-out';
        }
    }

    // Función unificada para renderizar carrito modal
    renderCartModal() {
        const modalContent = document.getElementById('cart-modal-content');
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
                        <img src="${(p.imagenes && p.imagenes.length > 0) ? p.imagenes[0] : ''}" 
                             alt="${p.titulo}" class="cart-item-image" loading="lazy">
                        <div class="cart-item-info">
                            <div class="cart-item-brand">${p.marca}</div>
                            <div class="cart-item-title">${p.titulo}</div>
                            <div class="cart-item-price">$${p.precio.toLocaleString()}</div>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button onclick='cartManager.decreaseQuantity("${p.id}")' 
                                        class="quantity-btn-cart" ${p.quantity <= 1 ? 'disabled' : ''}>−</button>
                                <span class="quantity-display">${p.quantity}</span>
                                <button onclick='cartManager.increaseQuantity("${p.id}")' 
                                        class="quantity-btn-cart">+</button>
                            </div>
                            <button onclick='cartManager.removeFromCart("${p.id}")' 
                                    class="cart-remove-btn" title="Eliminar producto">Eliminar</button>
                        </div>
                        <div class="cart-item-subtotal">$${(p.precio * p.quantity).toLocaleString()}</div>
                    </div>
                `).join('')}
            </div>
            <div class='cart-summary'>
                <div class="cart-summary-line">Subtotal: <span>$${total.toLocaleString()}</span></div>
                <div class="cart-summary-line">IVA (19%): <span>$${iva.toLocaleString()}</span></div>
                <div class="cart-summary-total">Total: <span>$${totalConIva.toLocaleString()}</span></div>
                <button class="cart-checkout-btn">💳 PROCEDER AL PAGO</button>
            </div>
        `;
    }

    // Modal management optimizado
    showCartModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            this.renderCartModal();
            modal.style.display = 'flex';
            // Forzar reflow antes de la animación
            modal.offsetHeight;
            modal.classList.add('show');
        }
    }

    hideCartModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    // Inicialización optimizada con event delegation
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.updateCartCount();
            
            // Cache inicial de productos
            setTimeout(() => this.cacheProducts(), 100);
        });
    }

    setupEventListeners() {
        const cartBtn = document.getElementById('cart-btn');
        const closeCartModal = document.getElementById('close-cart-modal');
        const cartModal = document.getElementById('cart-modal');
        
        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCartModal();
            });
        }
        
        if (closeCartModal) {
            closeCartModal.addEventListener('click', () => this.hideCartModal());
        }
        
        // Event delegation para cerrar modal al hacer click fuera
        if (cartModal) {
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    this.hideCartModal();
                }
            });
        }
        
        // ESC key para cerrar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cartModal && cartModal.classList.contains('show')) {
                this.hideCartModal();
            }
        });
    }
}

// Instancia global del carrito
const cartManager = new CartManager();

// Funciones globales para compatibilidad (wrapper functions)
window.addToCartFunction = (productId) => cartManager.addToCart(productId);
window.increaseQuantity = (productId) => cartManager.increaseQuantity(productId);
window.decreaseQuantity = (productId) => cartManager.decreaseQuantity(productId);
window.removeFromCart = (productId) => cartManager.removeFromCart(productId);
function showCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (!cartModal) return;
    
    renderCartModal();
    cartModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal del carrito
function closeCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (!cartModal) return;
    
    cartModal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Renderizar carrito en modal
function renderCartModal() {
    const cartModalContent = document.getElementById('cart-modal-content');
    if (!cartModalContent) return;
    
    cart = getCart();
    if (cart.length === 0) {
        cartModalContent.innerHTML = '<div class="empty-cart">🛒 No hay productos en el carrito.<br><br>¡Explora nuestros productos y añade algunos!</div>';
        return;
    }
    
    // Crear array de productos con sus cantidades
    const cartProducts = cart.map(cartItem => {
        const product = (typeof allProducts !== 'undefined' ? allProducts : []).find(p => p.id === cartItem);
        return product ? { ...product, cartId: cartItem } : null;
    }).filter(Boolean);
    
    // Agrupar productos por ID y contar cantidades
    const groupedProducts = {};
    cartProducts.forEach(product => {
        if (groupedProducts[product.id]) {
            groupedProducts[product.id].quantity++;
        } else {
            groupedProducts[product.id] = { ...product, quantity: 1 };
        }
    });
    
    const productsArray = Object.values(groupedProducts);
    
    let total = 0;
    const productsHTML = productsArray.map(product => {
        const subtotal = product.precio * product.quantity;
        total += subtotal;
        
        return `
            <div class="cart-item">
                <img src="${(product.imagenes && product.imagenes.length > 0) ? product.imagenes[0] : 'placeholder.jpg'}" alt="${product.titulo}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-brand">${product.marca}</div>
                    <div class="cart-item-title">${product.titulo}</div>
                    <div class="cart-item-price">$${product.precio.toLocaleString()}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn-cart" onclick="decreaseQuantityModal('${product.id}')" ${product.quantity <= 1 ? 'disabled' : ''}>−</button>
                        <span class="quantity-display">${product.quantity}</span>
                        <button class="quantity-btn-cart" onclick="increaseQuantityModal('${product.id}')">+</button>
                    </div>
                    <button class="cart-remove-btn" onclick="removeAllFromCartModal('${product.id}')">Eliminar</button>
                </div>
                <div class="cart-item-subtotal">$${subtotal.toLocaleString()}</div>
            </div>
        `;
    }).join('');
    
    const iva = total * 0.19;
    const finalTotal = total + iva;
    
    cartModalContent.innerHTML = `
        <div class="cart-products">
            ${productsHTML}
        </div>
        <div class="cart-summary">
            <div class="cart-summary-line">
                <span>Subtotal:</span>
                <span>$${total.toLocaleString()}</span>
            </div>
            <div class="cart-summary-line">
                <span>IVA (19%):</span>
                <span>$${iva.toLocaleString()}</span>
            </div>
            <div class="cart-summary-total">
                <span>Total:</span>
                <span>$${finalTotal.toLocaleString()}</span>
            </div>
            <button class="cart-checkout-btn" onclick="proceedToCheckout()">
                💳 Proceder al Pago
            </button>
        </div>
    `;
}

// Aumentar cantidad en modal
function increaseQuantityModal(productId) {
    addToCart(productId);
    renderCartModal();
}

// Disminuir cantidad en modal
function decreaseQuantityModal(productId) {
    removeFromCart(productId);
    renderCartModal();
}

// Eliminar todos los productos de un tipo en modal
function removeAllFromCartModal(productId) {
    cart = getCart();
    cart = cart.filter(id => id !== productId);
    saveCart(cart);
    renderCartModal();
}

// Proceder al pago
function proceedToCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    alert('🎉 ¡Gracias por tu compra! Funcionalidad de pago próximamente...');
    closeCartModal();
}

// Funciones para compatibilidad con versiones anteriores
function renderCartInContainer() {
    // Redirigir al modal
    showCartModal();
}

function renderCartPopup() {
    // Redirigir al modal
    showCartModal();
}

function renderCart() {
    // Redirigir al modal
    showCartModal();
}

// Configurar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Inicializando carrito con modal...');
    
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCartModalBtn = document.getElementById('close-cart-modal');
    const modalOverlay = cartModal?.querySelector('.modal-overlay');
    
    // Evento para abrir modal del carrito
    if (cartBtn) {
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔍 Abriendo modal del carrito');
            showCartModal();
        });
    }
    
    // Evento para cerrar modal
    if (closeCartModalBtn) {
        closeCartModalBtn.addEventListener('click', closeCartModal);
    }
    
    // Cerrar modal al hacer click en overlay
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeCartModal);
    }
    
    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && cartModal?.classList.contains('show')) {
            closeCartModal();
        }
    });
    
    // Inicializar contador
    setTimeout(() => {
        updateCartCount();
    }, 500);
});

// Función global para agregar al carrito (para compatibilidad)
window.addToCartFunction = addToCart;

// Exportar funciones principales
window.showCartModal = showCartModal;
window.closeCartModal = closeCartModal;
window.renderCart = showCartModal;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.getCart = getCart;
window.updateCartCount = updateCartCount;

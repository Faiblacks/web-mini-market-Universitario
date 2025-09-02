// cart.js - Funcionalidad del carrito sin popup

// Variables globales
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// Obtener carrito
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Guardar carrito
function saveCart(cartData) {
    localStorage.setItem('cart', JSON.stringify(cartData));
    updateCartCount();
}

// Actualizar contador del carrito
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const cart = getCart();
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Agregar al carrito
function addToCart(productId) {
    cart = getCart();
    cart.push(productId);
    saveCart(cart);
    
    // Mostrar notificación si existe la función
    if (typeof showNotification === 'function') {
        const product = (typeof allProducts !== 'undefined' ? allProducts : []).find(p => p.id === productId);
        if (product) {
            showNotification(`🛒 "${product.titulo}" agregado al carrito`, 'success');
        }
    }
}

// Eliminar del carrito
function removeFromCart(productId) {
    cart = getCart();
    const index = cart.indexOf(productId);
    if (index > -1) {
        cart.splice(index, 1);
        saveCart(cart);
    }
}

// Renderizar carrito en contenedor (función principal)
function renderCartInContainer() {
    const cartContainer = document.getElementById('cart-container');
    if (!cartContainer) return;
    
    cart = getCart();
    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart">No hay productos en el carrito.</div>';
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
                        <button class="quantity-btn-cart" onclick="decreaseQuantity('${product.id}')" ${product.quantity <= 1 ? 'disabled' : ''}>−</button>
                        <span class="quantity-display">${product.quantity}</span>
                        <button class="quantity-btn-cart" onclick="increaseQuantity('${product.id}')">+</button>
                    </div>
                    <button class="cart-remove-btn" onclick="removeAllFromCart('${product.id}')">Eliminar</button>
                </div>
                <div class="cart-item-subtotal">$${subtotal.toLocaleString()}</div>
            </div>
        `;
    }).join('');
    
    const iva = total * 0.19;
    const finalTotal = total + iva;
    
    cartContainer.innerHTML = `
        <div class="cart-content">
            <h3>Carrito de Compras</h3>
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
                    Proceder al Pago
                </button>
            </div>
        </div>
    `;
}

// Aumentar cantidad
function increaseQuantity(productId) {
    addToCart(productId);
    renderCartInContainer();
}

// Disminuir cantidad
function decreaseQuantity(productId) {
    removeFromCart(productId);
    renderCartInContainer();
}

// Eliminar todos los productos de un tipo
function removeAllFromCart(productId) {
    cart = getCart();
    cart = cart.filter(id => id !== productId);
    saveCart(cart);
    renderCartInContainer();
}

// Proceder al pago
function proceedToCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    alert('Funcionalidad de pago aún no implementada');
}

// Función dummy para el popup (no hace nada)
function renderCartPopup() {
    // Popup deshabilitado - la funcionalidad está en renderCartInContainer()
    console.log('Popup deshabilitado - usar renderCartInContainer()');
}

// Función para renderizar carrito (alias para compatibilidad)
function renderCart() {
    renderCartInContainer();
}

// Configurar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando carrito (sin popup)...');
    const cartBtn = document.getElementById('cart-btn');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Click en carrito - mostrando en contenedor');
            renderCartInContainer();
        });
    }
    
    // Inicializar carrito
    setTimeout(() => {
        renderCartInContainer();
        updateCartCount();
    }, 500);
});

// Función global para agregar al carrito (para compatibilidad)
window.addToCartFunction = addToCart;

// Exportar funciones principales
window.renderCart = renderCartInContainer;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.getCart = getCart;
window.updateCartCount = updateCartCount;

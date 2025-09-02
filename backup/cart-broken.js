// Popup de carrito - DESHABILITADO
function renderCartPopup() {
    // Popup deshabilitado - no hace nada
    return;
}
    
    cart = getCart();
    if (cart.length === 0) {
        content.innerHTML = '<div class="empty-cart">No hay productos en el carrito.</div>';
        // Cerrar automáticamente el popup si está vacío
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.style.display = 'none';
            }, 300);
        }, 1000); // Esperar 1 segundo antes de cerrar
        return;
    }
    
    // Crear array de productos con sus cantidades
    const cartProducts = cart.map(cartItem => {
        const product = (typeof allProducts !== 'undefined' ? allProducts : []).find(p => p.id === cartItem.id);
        return product ? { ...product, quantity: cartItem.quantity } : null;
    }).filter(p => p !== null);
    
    let total = cartProducts.reduce((sum, p) => sum + (p.precio * p.quantity), 0);
    let iva = Math.round(total * IVA);
    let totalConIva = total + iva;
    
    content.innerHTML = `
        <div class="cart-products">
            ${cartProducts.map(p => `
                <div class="cart-item">
                    <img src="${(p.imagenes && p.imagenes.length > 0) ? p.imagenes[0] : ''}" alt="${p.titulo}" class="cart-item-image">
                    <div class="cart-item-info">
                        <div class="cart-item-brand">${p.marca}</div>
                        <div class="cart-item-title">${p.titulo}</div>
                        <div class="cart-item-price">$${p.precio.toLocaleString()} c/u</div>
                        <div class="cart-item-subtotal">Subtotal: $${(p.precio * p.quantity).toLocaleString()}</div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button onclick='decreaseQuantity("${p.id}")' class="quantity-btn-cart" ${p.quantity <= 1 ? 'disabled' : ''}>−</button>
                            <span class="quantity-display">${p.quantity}</span>
                            <button onclick='increaseQuantity("${p.id}")' class="quantity-btn-cart">+</button>
                        </div>
                        <button onclick='removeFromCartPopup("${p.id}")' class="cart-remove-btn" title="Eliminar producto">✕</button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class='cart-summary'>
            <div class="cart-summary-line">Subtotal: <span>$${total.toLocaleString()}</span></div>
            <div class="cart-summary-line">IVA (19%): <span>$${iva.toLocaleString()}</span></div>
            <div class="cart-summary-total">Total: <span>$${totalConIva.toLocaleString()}</span></div>
            <button class="cart-checkout-btn">Proceder al pago</button>
        </div>
    `;
}

window.removeFromCartPopup = function(productId) {
    cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    setCart(cart);
    updateCartCount();
    if (typeof showNotification === 'function') {
        showNotification(`🗑️ Producto eliminado del carrito`, 'remove');
    }
    renderCartPopup();
    renderCart();
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando carrito...');
    const cartBtn = document.getElementById('cart-btn');
    
    // POPUP DESHABILITADO - Solo funcionalidad básica del carrito
    console.log('Carrito configurado sin popup');
    
    if (cartBtn) {
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Click en carrito detectado - Popup deshabilitado');
            // Mostrar carrito en su contenedor normal
            renderCartInContainer();
        });
    }
    
    // FUNCIONES DEL POPUP DESHABILITADAS
    /*
    const cartPopup = document.getElementById('cart-popup');
    const closeCartPopup = document.getElementById('close-cart-popup');
    
    if (closeCartPopup && cartPopup) {
        closeCartPopup.addEventListener('click', function() {
            cartPopup.classList.remove('show');
            setTimeout(() => {
                cartPopup.style.display = 'none';
            }, 300);
        });
    }
    // Cerrar popup al hacer click fuera
    document.addEventListener('click', function(e) {
        if (cartPopup && cartPopup.classList.contains('show') && 
            !cartPopup.contains(e.target) && 
            e.target !== cartBtn &&
            !e.target.closest('.quantity-btn-cart') &&
            !e.target.closest('.cart-remove-btn') &&
            !e.target.closest('.quantity-controls')) {
            cartPopup.classList.remove('show');
            setTimeout(() => {
                cartPopup.style.display = 'none';
            }, 300);
        }
    });
    
    setTimeout(renderCart, 500);
});
// Carrito de compras con IVA chileno
let cart = [];
const IVA = 0.19;

function getCart() {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    // Migrar formato viejo a nuevo si es necesario
    if (cartData.length > 0 && typeof cartData[0] === 'string') {
        // Convertir array de IDs a array de objetos {id, quantity}
        const cartMap = {};
        cartData.forEach(id => {
            cartMap[id] = (cartMap[id] || 0) + 1;
        });
        const newCart = Object.entries(cartMap).map(([id, quantity]) => ({id, quantity}));
        setCart(newCart);
        return newCart;
    }
    return cartData;
}

function setCart(arr) {
    localStorage.setItem('cart', JSON.stringify(arr));
}

function addToCart(productId) {
    const product = (typeof allProducts !== 'undefined' ? allProducts : []).find(p => p.id === productId);
    if (!product) return;
    
    cart = getCart();
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({id: productId, quantity: 1});
    }
    
    setCart(cart);
    updateCartCount();
    if (typeof showNotification === 'function') {
        showNotification(`🛒 "${product.titulo}" agregado al carrito`, 'success');
    }
    renderCart();
}

// Hacer disponible la función globalmente
window.addToCartFunction = addToCart;

function removeFromCart(productId) {
    cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    setCart(cart);
    updateCartCount();
    if (typeof showNotification === 'function') {
        showNotification(`🗑️ Producto eliminado del carrito`, 'remove');
    }
    renderCart();
}

function updateCartQuantity(productId, newQuantity) {
    cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (newQuantity <= 0) {
            // Eliminar item si la cantidad es 0 o menor
            cart = cart.filter(item => item.id !== productId);
        } else {
            item.quantity = newQuantity;
        }
        setCart(cart);
        updateCartCount();
        renderCart();
        renderCartPopup();
    }
}

function increaseQuantity(productId) {
    cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        updateCartQuantity(productId, item.quantity + 1);
    }
}

function decreaseQuantity(productId) {
    cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item && item.quantity > 1) {
        updateCartQuantity(productId, item.quantity - 1);
    }
}

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cart = getCart();
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        
        // Trigger animation
        cartCountElement.style.animation = 'none';
        setTimeout(() => {
            cartCountElement.style.animation = 'pulse 0.3s ease-in-out';
        }, 10);
    }
}

// Hacer funciones disponibles globalmente
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.updateCartQuantity = updateCartQuantity;

function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    if (!cartContainer) return;
    
    cart = getCart();
    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart">No hay productos en el carrito.</div>';
        return;
    }
    
    // Crear array de productos con sus cantidades
    const cartProducts = cart.map(cartItem => {
        const product = (typeof allProducts !== 'undefined' ? allProducts : []).find(p => p.id === cartItem.id);
        return product ? { ...product, quantity: cartItem.quantity } : null;
    }).filter(p => p !== null);
    
    let total = cartProducts.reduce((sum, p) => sum + (p.precio * p.quantity), 0);
    let iva = Math.round(total * IVA);
    let totalConIva = total + iva;
    
    cartContainer.innerHTML = `
        <h3>Carrito de compras</h3>
        <ul>
            ${cartProducts.map(p => `
                <li>
                    ${p.titulo} - $${p.precio.toLocaleString()} x${p.quantity} = $${(p.precio * p.quantity).toLocaleString()}
                    <button onclick='removeFromCart("${p.id}")'>Eliminar</button>
                </li>
            `).join('')}
        </ul>
        <div class='cart-totals'>
            <div>Subtotal: $${total.toLocaleString()}</div>
            <div>IVA (19%): $${iva.toLocaleString()}</div>
            <div><strong>Total: $${totalConIva.toLocaleString()}</strong></div>
        </div>
    `;
}

window.renderCart = renderCart;
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        renderCart();
        updateCartCount();
    }, 500);
});

console.log('wishlist.js cargado');
// wishlist.js
// Lógica de favoritos (wishlist) para menú desplegable


function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
}

function setWishlist(arr) {
    localStorage.setItem('wishlist', JSON.stringify(arr));
}

// Función para obtener el nombre del producto por ID
function getProductName(productId) {
    // Intentar obtener el producto de la lista global si existe
    if (typeof allProducts !== 'undefined') {
        const product = allProducts.find(p => p.id === productId);
        return product ? product.titulo : `Producto ${productId}`;
    }
    
    // Si no está disponible, buscar en el DOM
    const productElement = document.querySelector(`[data-id="${productId}"]`);
    if (productElement) {
        const titleElement = productElement.closest('.product-card')?.querySelector('.product-title');
        if (titleElement) {
            return titleElement.textContent;
        }
    }
    
    return `Producto ${productId}`;
}

// Sistema de notificaciones personalizadas
function showNotification(message, type = 'add') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon;
    switch(type) {
        case 'add': icon = '❤️'; break;
        case 'remove': icon = '❌'; break;
        case 'success': icon = '✅'; break;
        case 'warning': icon = '⚠️'; break;
        default: icon = 'ℹ️';
    }
    
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-text">${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Función para comprar todos los productos de la wishlist
function buyAllWishlist() {
    const wishlist = getWishlist();
    if (wishlist.length === 0) {
        showNotification('No hay productos en tu lista de favoritos', 'warning');
        return;
    }
    
    let totalItems = 0;
    let outOfStockItems = 0;
    
    // Verificar disponibilidad y agregar al carrito
    wishlist.forEach(productId => {
        if (typeof allProducts !== 'undefined') {
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                if (product.stock > 0) {
                    // Simular agregar al carrito (aquí puedes llamar a tu función addToCart)
                    if (typeof addToCart === 'function') {
                        addToCart(productId);
                    }
                    totalItems++;
                } else {
                    outOfStockItems++;
                }
            }
        }
    });
    
    if (totalItems > 0) {
        showNotification(`🛒 ${totalItems} producto${totalItems > 1 ? 's' : ''} agregado${totalItems > 1 ? 's' : ''} al carrito`, 'success');
    }
    
    if (outOfStockItems > 0) {
        showNotification(`⚠️ ${outOfStockItems} producto${outOfStockItems > 1 ? 's' : ''} sin stock no ${outOfStockItems > 1 ? 'fueron agregados' : 'fue agregado'}`, 'warning');
    }
}

// Función para vaciar toda la wishlist
function clearAllWishlist() {
    const wishlist = getWishlist();
    if (wishlist.length === 0) {
        showNotification('La lista de favoritos ya está vacía', 'warning');
        return;
    }
    
    // Confirmar acción
    if (confirm(`¿Estás seguro de que quieres eliminar todos los ${wishlist.length} productos de tu lista de favoritos?`)) {
        setWishlist([]);
        renderWishlistMenu();
        
        // Actualizar estados visuales de corazones
        updateAllHeartStates();
        
        showNotification('🗑️ Lista de favoritos vaciada completamente', 'success');
    }
}

function toggleWishlist(productId) {
    let wishlist = getWishlist();
    const productName = getProductName(productId);
    
    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
        showNotification(`"${productName}" removido de favoritos`, 'remove');
    } else {
        wishlist.push(productId);
        showNotification(`"${productName}" agregado a favoritos`, 'add');
    }
    setWishlist(wishlist);
    
    // Actualizar estados visuales de todos los corazones
    updateAllHeartStates();
    
    // Actualizar menú solo si está visible
    updateWishlistMenuIfOpen();
}

// Función para actualizar estados visuales de todos los corazones
function updateAllHeartStates() {
    const wishlist = getWishlist();
    document.querySelectorAll('.wishlist-heart-btn').forEach(btn => {
        const productId = btn.getAttribute('data-id');
        if (wishlist.includes(productId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Función para actualizar el menú solo si está abierto
function updateWishlistMenuIfOpen() {
    const menu = document.getElementById('wishlist-menu');
    if (menu && menu.classList.contains('open')) {
        renderWishlistMenu();
    }
}

// Función específica para eliminar producto del menú wishlist
function removeFromWishlistMenu(productId) {
    let wishlist = getWishlist();
    
    // Verificar que el producto esté en la lista
    if (!wishlist.includes(productId)) {
        console.warn('Producto no encontrado en wishlist:', productId);
        return;
    }
    
    // Eliminar el producto
    wishlist = wishlist.filter(id => id !== productId);
    setWishlist(wishlist);
    
    // Obtener nombre del producto para notificación
    const productName = getProductName(productId);
    showNotification(`"${productName}" removido de favoritos`, 'remove');
    
    // Re-renderizar el menú inmediatamente
    setTimeout(() => {
        renderWishlistMenu();
        
        // Actualizar estados visuales de corazones
        updateAllHeartStates();
    }, 50); // Pequeño delay para evitar conflictos
}

function renderWishlistMenu() {
    const menu = document.getElementById('wishlist-menu');
    const list = document.getElementById('wishlist-list');
    const empty = menu.querySelector('.wishlist-empty');
    const actions = menu.querySelector('.wishlist-actions');
    const wishlist = getWishlist();
    
    if (!wishlist.length) {
        list.innerHTML = '';
        empty.style.display = 'block';
        if (actions) actions.style.display = 'none';
        return;
    }
    
    empty.style.display = 'none';
    if (actions) actions.style.display = 'flex';
    
    const favProducts = (typeof allProducts !== 'undefined' ? allProducts : []).filter(p => wishlist.includes(p.id));
    list.innerHTML = favProducts.map(product => {
        let imgSrc = (product.imagenes && product.imagenes.length > 0) ? product.imagenes[0] : '';
        return `
            <div class="wishlist-item">
                <img src="${imgSrc}" alt="${product.titulo}" class="wishlist-thumb">
                <div class="wishlist-info">
                    <div class="wishlist-title">${product.titulo}</div>
                    <div class="wishlist-brand">${product.marca}</div>
                    <div class="wishlist-price">$${product.precio.toLocaleString()}</div>
                </div>
                <button class="remove-wishlist" data-id="${product.id}" title="Quitar de favoritos">✕</button>
            </div>
        `;
    }).join('');
    
    // Quitar de favoritos desde el menú
    list.querySelectorAll('.remove-wishlist').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            const id = this.getAttribute('data-id');
            console.log('Intentando eliminar producto de wishlist:', id);
            removeFromWishlistMenu(id);
        });
    });
}

function assignWishlistEvents() {
    console.log('Asignando eventos de wishlist...');
    document.querySelectorAll('.wishlist-heart-btn').forEach(btn => {
        // Remover event listener existente para evitar duplicados
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Re-obtener los botones después de clonar
    document.querySelectorAll('.wishlist-heart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            console.log('Click en wishlist para producto:', productId);
            toggleWishlist(productId);
        });
    });
    
    // Actualizar estados iniciales
    updateAllHeartStates();
    
    console.log('Eventos de wishlist asignados a', document.querySelectorAll('.wishlist-heart-btn').length, 'botones');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Inicializando wishlist...');
    const wishlistBtn = document.getElementById('wishlist-btn');
    const wishlistMenu = document.getElementById('wishlist-menu');
    const closeWishlist = document.getElementById('close-wishlist');
    const buyAllBtn = document.getElementById('buy-all-wishlist');
    const clearAllBtn = document.getElementById('clear-all-wishlist');
    
    console.log('Elementos encontrados:', {
        wishlistBtn: !!wishlistBtn,
        wishlistMenu: !!wishlistMenu,
        closeWishlist: !!closeWishlist,
        buyAllBtn: !!buyAllBtn,
        clearAllBtn: !!clearAllBtn
    });
    
    if (wishlistBtn && wishlistMenu && closeWishlist) {
        console.log('✅ Asignando eventos del menú wishlist...');
        wishlistBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('👆 Click en botón wishlist');
            wishlistMenu.classList.toggle('open');
            renderWishlistMenu();
        });
        closeWishlist.addEventListener('click', function() {
            console.log('❌ Cerrando wishlist');
            wishlistMenu.classList.remove('open');
        });
        document.addEventListener('click', function(e) {
            if (!wishlistMenu.contains(e.target) && e.target !== wishlistBtn) {
                wishlistMenu.classList.remove('open');
            }
        });
    } else {
        console.error('❌ No se encontraron todos los elementos del wishlist');
    }
    
    // Event listeners para los botones de acción
    if (buyAllBtn) {
        buyAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            buyAllWishlist();
        });
    }
    
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            clearAllWishlist();
        });
    }
});

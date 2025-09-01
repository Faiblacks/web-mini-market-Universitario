// Variables globales del modal
let currentProduct = null;

// Función para abrir el modal con detalles del producto
function openProductModal(productId) {
    // Buscar el producto
    const product = (typeof allProducts !== 'undefined' ? allProducts : []).find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    
    // Obtener elementos del modal
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalImage = document.getElementById('modal-image');
    const modalCategory = document.getElementById('modal-category');
    const modalBrand = modal.querySelector('.modal-brand');
    const modalStars = modal.querySelector('.modal-stars');
    const modalRatingText = modal.querySelector('.modal-rating-text');
    const modalPrice = modal.querySelector('.modal-price');
    const modalDescription = modal.querySelector('.modal-description');
    const modalStock = document.getElementById('modal-stock');
    const modalQuantity = document.getElementById('modal-quantity');
    const modalAddToCart = document.getElementById('modal-add-to-cart');
    const modalAddToWishlist = document.getElementById('modal-add-to-wishlist');
    
    // Llenar información del producto
    modalTitle.textContent = product.titulo;
    modalImage.src = (product.imagenes && product.imagenes.length > 0) ? product.imagenes[0] : getDefaultImage(product.categoria);
    modalImage.alt = product.titulo;
    modalCategory.textContent = product.categoria;
    modalBrand.textContent = product.marca;
    modalStars.textContent = renderStars(product.rating);
    modalRatingText.textContent = `(${product.rating})`;
    modalPrice.textContent = `$${product.precio.toLocaleString()}`;
    modalDescription.textContent = product.descripcion;
    modalStock.textContent = product.stock;
    
    // Configurar cantidad inicial y límites
    modalQuantity.value = 1;
    modalQuantity.max = product.stock;
    
    // Configurar estado de botones
    updateModalButtons();
    
    // Mostrar modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Función para cerrar el modal
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    currentProduct = null;
}

// Función para actualizar el estado de los botones del modal
function updateModalButtons() {
    if (!currentProduct) return;
    
    const modalQuantity = document.getElementById('modal-quantity');
    const modalAddToCart = document.getElementById('modal-add-to-cart');
    const modalAddToWishlist = document.getElementById('modal-add-to-wishlist');
    const quantityMinus = document.getElementById('quantity-minus');
    const quantityPlus = document.getElementById('quantity-plus');
    
    const currentQuantity = parseInt(modalQuantity.value);
    
    // Botones de cantidad
    quantityMinus.disabled = currentQuantity <= 1;
    quantityPlus.disabled = currentQuantity >= currentProduct.stock;
    
    // Botón agregar al carrito
    if (currentProduct.stock === 0) {
        modalAddToCart.disabled = true;
        modalAddToCart.textContent = 'Sin stock';
    } else {
        modalAddToCart.disabled = false;
        modalAddToCart.innerHTML = '🛒 Agregar al carrito';
    }
    
    // Botón wishlist
    const wishlist = typeof getWishlist === 'function' ? getWishlist() : [];
    const isInWishlist = wishlist.includes(currentProduct.id);
    modalAddToWishlist.innerHTML = isInWishlist ? '❤️ En favoritos' : '♡ Agregar a favoritos';
    modalAddToWishlist.style.background = isInWishlist ? '#ff4757' : 'white';
    modalAddToWishlist.style.color = isInWishlist ? 'white' : '#4285f4';
}

// Función para cambiar cantidad
function changeQuantity(delta) {
    if (!currentProduct) return;
    
    const modalQuantity = document.getElementById('modal-quantity');
    const currentQuantity = parseInt(modalQuantity.value);
    const newQuantity = currentQuantity + delta;
    
    if (newQuantity >= 1 && newQuantity <= currentProduct.stock) {
        modalQuantity.value = newQuantity;
        updateModalButtons();
    }
}

// Función para agregar al carrito desde el modal
function addToCartFromModal() {
    if (!currentProduct) return;
    
    const modalQuantity = document.getElementById('modal-quantity');
    const quantity = parseInt(modalQuantity.value);
    
    // Agregar múltiples veces según la cantidad
    for (let i = 0; i < quantity; i++) {
        if (typeof addToCart === 'function') {
            addToCart(currentProduct.id);
        }
    }
    
    // Mostrar notificación
    if (typeof showNotification === 'function') {
        showNotification(`🛒 ${quantity} unidad${quantity > 1 ? 'es' : ''} de "${currentProduct.titulo}" agregado${quantity > 1 ? 's' : ''} al carrito`, 'success');
    }
    
    // Cerrar modal
    closeProductModal();
}

// Función para alternar wishlist desde el modal
function toggleWishlistFromModal() {
    if (!currentProduct) return;
    
    if (typeof toggleWishlist === 'function') {
        toggleWishlist(currentProduct.id);
        updateModalButtons();
        
        // Actualizar productos si es necesario
        if (typeof renderProducts === 'function' && typeof filteredProducts !== 'undefined') {
            renderProducts(filteredProducts);
        }
    }
}

// Asignar eventos a los botones de "Ver detalles"
function assignViewDetailsEvents() {
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            openProductModal(productId);
        });
    });
}

// Event listeners para el modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('product-modal');
    const modalOverlay = modal?.querySelector('.modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');
    const modalQuantity = document.getElementById('modal-quantity');
    const quantityMinus = document.getElementById('quantity-minus');
    const quantityPlus = document.getElementById('quantity-plus');
    const modalAddToCart = document.getElementById('modal-add-to-cart');
    const modalAddToWishlist = document.getElementById('modal-add-to-wishlist');
    
    // Cerrar modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeProductModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeProductModal);
    }
    
    // Cerrar con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal?.classList.contains('show')) {
            closeProductModal();
        }
    });
    
    // Controles de cantidad
    if (quantityMinus) {
        quantityMinus.addEventListener('click', () => changeQuantity(-1));
    }
    
    if (quantityPlus) {
        quantityPlus.addEventListener('click', () => changeQuantity(1));
    }
    
    if (modalQuantity) {
        modalQuantity.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (currentProduct && value >= 1 && value <= currentProduct.stock) {
                updateModalButtons();
            }
        });
    }
    
    // Botones de acción
    if (modalAddToCart) {
        modalAddToCart.addEventListener('click', addToCartFromModal);
    }
    
    if (modalAddToWishlist) {
        modalAddToWishlist.addEventListener('click', toggleWishlistFromModal);
    }
});

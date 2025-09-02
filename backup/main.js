// main.js extraído de paginainicio.html
// Variables globales
let allProducts = [];
let filteredProducts = [];

// Función para inicializar la aplicación después de la carga
function initializeApp() {
    console.log('🚀 Inicializando StudiMarket...');
    
    // Aquí puedes agregar cualquier lógica de inicialización adicional
    // Por ejemplo: cargar datos del usuario, configurar analytics, etc.
    
    // Mostrar mensaje de bienvenida en consola
    console.log('✅ StudiMarket inicializado correctamente');
}

// Cargar productos desde JSON
async function loadProducts() {
    try {
        console.log('📦 Cargando productos...');
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        console.log('✅ Productos cargados:', allProducts.length);
        renderProducts(filteredProducts);
        populateCategories();
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        showError('Error al cargar los productos. Verifica que el archivo products.json esté en la misma carpeta.');
    }
}

// Mostrar error
function showError(message) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = `<div class="error-message">${message}</div>`;
}

// Renderizar productos
function renderProducts(products) {
    console.log('🎨 Renderizando productos:', products.length);
    const productsGrid = document.getElementById('products-grid');
    if (products.length === 0) {
        productsGrid.innerHTML = '<div class="loading-message">No se encontraron productos.</div>';
        return;
    }
    
    const wishlist = typeof getWishlist === 'function' ? getWishlist() : [];
    
    const productsHTML = products.map(product => {
        let imgSrc = (product.imagenes && product.imagenes.length > 0) ? product.imagenes[0] : getDefaultImage(product.categoria);
        let imgFilter = product.stock > 0 ? '' : 'filter: grayscale(1); opacity: 0.7;';
        let featuredBadge = product.destacado ? '<span class="featured-badge">Destacado</span>' : '';
        let stockClass = product.stock > 0 ? '' : 'out-of-stock';
        let addToCartClass = product.stock > 0 ? '' : 'disabled';
        let addToCartText = product.stock > 0 ? 'Agregar al carrito' : 'Sin stock';
        let isFavorite = wishlist.includes(product.id);
        return `
        <article class="product-card" data-id="${product.id}">
            <div class="product-image ${stockClass}" style="background-image: url('${imgSrc}');">
                <img src="${imgSrc}" alt="${product.titulo}" style="width:100%;height:200px;object-fit:contain;${imgFilter};cursor:pointer;" onclick="openProductModal('${product.id}')">
                <span class="product-tag">${product.categoria}</span>
                ${featuredBadge}
            </div>
            <div class="product-info">
                <div class="product-brand"><small>${product.marca}</small></div>
                <h3 class="product-title">${product.titulo}</h3>
                <p class="product-description">${product.descripcion}</p>
                <div class="product-rating">
                    <span class="stars" onclick="openProductModal('${product.id}')" style="cursor:pointer;" title="Ver comentarios">${renderStars(product.rating)}</span>
                    <span class="rating-text">(${product.rating})</span>
                </div>
                <div class="product-footer">
                    <span class="price">$${product.precio.toLocaleString()}</span>
                    <div class="availability-wishlist">
                        <span class="availability ${stockClass}">${product.stock} disponibles</span>
                        <div class="product-actions">
                            <button class="wishlist-heart-btn ${isFavorite ? 'active' : ''}" data-id="${product.id}" title="Agregar a favoritos">
                                <span class="heart-icon">♡</span>
                            </button>
                        </div>
                    </div>
                </div>
                <button class="add-to-cart ${addToCartClass}" onclick="addToCart('${product.id}')" ${product.stock === 0 ? 'disabled' : ''}>${addToCartText}</button>
            </div>
        </article>
        `;
    }).join('');
    productsGrid.innerHTML = productsHTML;
    // Asignar eventos de wishlist a los botones de corazón
    setTimeout(() => {
        if (typeof assignWishlistEvents === 'function') {
            assignWishlistEvents();
        } else {
            console.error('assignWishlistEvents function not found');
        }
        // Asignar eventos a los botones de ver detalles
        if (typeof assignViewDetailsEvents === 'function') {
            assignViewDetailsEvents();
        } else {
            console.error('assignViewDetailsEvents function not found');
        }
    }, 100);
}

// Generar estrellas basadas en rating
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
}

// Imagen por defecto según categoría
function getDefaultImage(category) {
    const defaultImages = {
        'Cursos': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23f0f0f0" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%23666" font-size="14" font-family="Arial">Curso</text></svg>',
        'Útiles Escolares': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23e8f4f8" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%23666" font-size="14" font-family="Arial">Útiles</text></svg>',
        'Libros': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23fff3e0" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%23666" font-size="14" font-family="Arial">Libros</text></svg>',
        'Accesorios': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23f3e5f5" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%23666" font-size="14" font-family="Arial">Accesorios</text></svg>',
        'Tecnología': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23fff9c4" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%23666" font-size="14" font-family="Arial">Tecnología</text></svg>',
        'Electrónica': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23e0f7fa" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%23666" font-size="14" font-family="Arial">Electrónica</text></svg>',
        'Moda': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23fce4ec" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%23666" font-size="14" font-family="Arial">Moda</text></svg>',
        'Juguetes': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23fffde7" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%23666" font-size="14" font-family="Arial">Juguetes</text></svg>',
        'Hogar': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23e1bee7" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%23666" font-size="14" font-family="Arial">Hogar</text></svg>',
        'Deportes': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23c8e6c9" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%23666" font-size="14" font-family="Arial">Deportes</text></svg>'
    };
    return defaultImages[category] || defaultImages['Cursos'];
}

// Poblar categorías en el filtro
function populateCategories() {
    const categorySelect = document.querySelector('.filter-select');
    const categories = [...new Set(allProducts.map(p => p.categoria))];
    categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Función para agregar al carrito
function addToCart(productId) {
    const product = (typeof allProducts !== 'undefined' ? allProducts : []).find(p => p.id === productId);
    if (!product) return;
    
    const button = event.target;
    button.style.background = '#2d5aa0';
    button.textContent = '✓ Agregado';
    
    // Usar la función del carrito si existe
    if (typeof window.addToCartFunction === 'function') {
        window.addToCartFunction(productId);
    } else {
        // Lógica básica si no está disponible
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push(productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        if (typeof showNotification === 'function') {
            showNotification(`🛒 "${product.titulo}" agregado al carrito`, 'success');
        }
    }
    
    setTimeout(() => {
        button.style.background = '#4285f4';
        button.textContent = 'Agregar al carrito';
    }, 2000);
}

// Filtrar productos
function filterProducts() {
    const searchTerm = document.querySelector('.search-input').value.toLowerCase();
    const selectedCategory = document.querySelector('.filter-select').value;
    const sortBy = document.querySelector('.search-select').value;
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.titulo.toLowerCase().includes(searchTerm) ||
                            product.descripcion.toLowerCase().includes(searchTerm) ||
                            product.marca.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || product.categoria === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    // Ordenar productos
    switch (sortBy) {
        case 'Menor precio':
            filteredProducts.sort((a, b) => a.precio - b.precio);
            break;
        case 'Mayor precio':
            filteredProducts.sort((a, b) => b.precio - a.precio);
            break;
        case 'Mejor valorados':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'Más vendidos':
            filteredProducts.sort((a, b) => b.vendidos - a.vendidos);
            break;
        case 'Destacados':
            filteredProducts.sort((a, b) => (b.destacado === a.destacado) ? 0 : b.destacado ? 1 : -1);
            break;
        case 'Más recientes':
        default:
            // Mantener orden original
            break;
    }
    renderProducts(filteredProducts);
}

// Event listeners

// Esperar a que el DOM esté listo
window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando aplicación...');
    loadProducts();
    document.querySelector('.search-input').addEventListener('input', filterProducts);
    document.querySelector('.filter-select').addEventListener('change', filterProducts);
    document.querySelector('.search-select').addEventListener('change', filterProducts);
    document.querySelector('.price-slider').addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        console.log(`Filtro de precio ajustado a: ${percentage}%`);
        // Aquí puedes implementar el filtro de precio real
    });
});

// Evento cuando la carga está completa
document.addEventListener('loadingComplete', function() {
    console.log('🎉 Carga completa - Inicializando componentes adicionales...');
    
    // Pequeño delay para asegurar que todos los scripts estén listos
    setTimeout(() => {
        if (typeof allProducts !== 'undefined' && allProducts.length > 0) {
            console.log('🔄 Re-asignando eventos después de carga completa...');
            if (typeof assignWishlistEvents === 'function') {
                assignWishlistEvents();
            }
            if (typeof assignViewDetailsEvents === 'function') {
                assignViewDetailsEvents();
            }
        }
    }, 500);
});

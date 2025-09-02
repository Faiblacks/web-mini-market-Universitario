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
        // Agregar timestamp para evitar caché
        const timestamp = new Date().getTime();
        const response = await fetch(`products.json?v=${timestamp}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        console.log('✅ Productos cargados:', allProducts.length);
        
        // Generar comentarios adicionales aleatorios
        setTimeout(() => {
            if (typeof generateCommentsForAllProducts === 'function') {
                console.log('🎮 Generando comentarios adicionales...');
                // Agregar 1-3 comentarios aleatorios a cada producto
                allProducts.forEach(product => {
                    const numNewComments = Math.floor(Math.random() * 3) + 1;
                    if (typeof addRandomCommentsToProduct === 'function') {
                        addRandomCommentsToProduct(product, numNewComments);
                    }
                });
                // Actualizar productos filtrados
                filteredProducts = [...allProducts];
                renderProducts(filteredProducts);
                console.log('✅ Comentarios adicionales generados');
            }
        }, 500); // Pequeño delay para asegurar que el generador esté cargado
        
        renderProducts(filteredProducts);
        populateCategories();
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        
        // Mostrar mensaje de error al usuario
        const container = document.getElementById('products-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Error al cargar productos</h3>
                    <p>No se pudieron cargar los productos. Por favor, recarga la página.</p>
                    <button onclick="location.reload()" class="reload-btn">Recargar</button>
                </div>
            `;
        }
    }
}

// Función para renderizar productos
function renderProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) {
        console.error('❌ No se encontró el contenedor de productos');
        return;
    }

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar los filtros o buscar algo diferente.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => {
        const isOutOfStock = product.stock === 0;
        const stockClass = isOutOfStock ? 'out-of-stock' : '';
        const imgClass = isOutOfStock ? 'grayscale' : '';
        
        // Precio con descuento si existe
        let priceHTML = '';
        if (product.precio_original && product.descuento) {
            priceHTML = `
                <div class="price">
                    <span class="current-price">$${product.precio.toLocaleString()}</span>
                    <span class="original-price">$${product.precio_original.toLocaleString()}</span>
                    <span class="discount-badge">${product.descuento}% OFF</span>
                </div>
            `;
        } else {
            priceHTML = `<div class="price">$${product.precio.toLocaleString()}</div>`;
        }

        return `
            <div class="product-card ${stockClass}">
                <div class="product-image-container">
                    <img src="${getProductImage(product)}" 
                         alt="${product.titulo}" 
                         class="product-image clickable-image ${imgClass}" 
                         data-id="${product.id}">
                    ${!isOutOfStock ? '<div class="image-overlay">Ver detalles</div>' : '<div class="image-overlay out-of-stock-overlay">Sin stock - Ver detalles</div>'}
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.marca}</div>
                    <h3 class="product-title">${product.titulo}</h3>
                    <p class="product-description">${product.descripcion}</p>
                    <div class="product-rating">
                        <span class="stars clickable-grid-stars" data-id="${product.id}" title="Ver reseñas">${renderStars(product.rating)}</span>
                        <span class="rating-text">(${product.rating})</span>
                    </div>
                    ${priceHTML}
                    <div class="product-stock ${isOutOfStock ? 'no-stock' : ''}">
                        ${isOutOfStock ? 'Sin stock' : `${product.stock} disponibles`}
                    </div>
                    <div class="product-actions">
                        <button onclick="addToCart(${product.id})" 
                                class="add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}" 
                                ${isOutOfStock ? 'disabled' : ''}>
                            🛒 ${isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
                        </button>
                        <button onclick="toggleWishlist(${product.id})" 
                                class="wishlist-heart-btn ${isInWishlist(product.id) ? 'active' : ''}"
                                title="${isInWishlist(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                            ${isInWishlist(product.id) ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Reasignar eventos después de renderizar
    setTimeout(() => {
        assignImageClickEvents();
        assignGridStarsEvents();
    }, 100);
}

// Función para obtener imagen del producto
function getProductImage(product) {
    if (product.imagenes && product.imagenes.length > 0) {
        return product.imagenes[0];
    }
    
    // Imagen por defecto según categoría
    const defaultImages = {
        'Electrónica': 'imagenes/Audifonos.png',
        'Libros': 'imagenes/libroia.png',
        'Deportes': 'imagenes/pelotafutbol.png',
        'Ropa': 'imagenes/Polerasantaferia.png',
        'Juguetes': 'imagenes/setjuguetesjpg.jpg',
        'Hogar': 'imagenes/lampara.png'
    };
    
    return defaultImages[product.categoria] || 'imagenes/Audifonos.png';
}

// Función para renderizar estrellas
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Estrellas llenas
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '⭐';
    }
    
    // Media estrella
    if (hasHalfStar) {
        starsHTML += '⭐';
    }
    
    // Estrellas vacías
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '☆';
    }
    
    return starsHTML;
}

// Función para poblar categorías
function populateCategories() {
    const categorySelect = document.getElementById('category-filter');
    if (!categorySelect) return;
    
    const categories = [...new Set(allProducts.map(product => product.categoria))];
    
    categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Función para filtrar productos
function filterProducts() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const selectedCategory = document.getElementById('category-filter')?.value || '';
    const minPrice = parseInt(document.getElementById('min-price')?.value) || 0;
    const maxPrice = parseInt(document.getElementById('max-price')?.value) || Infinity;
    const minRating = parseInt(document.getElementById('rating-filter')?.value) || 0;
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.titulo.toLowerCase().includes(searchTerm) ||
                            product.descripcion.toLowerCase().includes(searchTerm) ||
                            product.marca.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || product.categoria === selectedCategory;
        const matchesPrice = product.precio >= minPrice && product.precio <= maxPrice;
        const matchesRating = product.rating >= minRating;
        
        return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });
    
    renderProducts(filteredProducts);
}

// Función para ordenar productos
function sortProducts() {
    const sortBy = document.getElementById('sort-by')?.value || 'relevance';
    
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.precio - b.precio);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.precio - a.precio);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.titulo.localeCompare(b.titulo));
            break;
        default:
            // Por defecto ordenar por relevancia (productos con stock primero)
            filteredProducts.sort((a, b) => {
                if (a.stock > 0 && b.stock === 0) return -1;
                if (a.stock === 0 && b.stock > 0) return 1;
                return b.rating - a.rating;
            });
    }
    
    renderProducts(filteredProducts);
}

// Eventos para imágenes clickeables
function assignImageClickEvents() {
    document.querySelectorAll('.clickable-image').forEach(img => {
        img.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            console.log('🖼️ Click en imagen para producto:', productId);
            
            if (typeof openProductModal === 'function') {
                openProductModal(productId);
            } else {
                console.error('❌ openProductModal no está definida');
            }
        });
    });
}

// Eventos para estrellas del grid
function assignGridStarsEvents() {
    document.querySelectorAll('.clickable-grid-stars').forEach(stars => {
        stars.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            console.log('⭐ Click en estrellas para producto:', productId);
            
            // Abrir modal y mostrar comentarios directamente
            if (typeof openProductModal === 'function') {
                openProductModal(productId, true); // Pasamos true para indicar que viene de las estrellas
            }
        });
    });
    console.log('⭐ Eventos de estrellas asignados a', document.querySelectorAll('.clickable-grid-stars').length, 'elementos');
}

// Hacer las funciones globales para debugging
window.assignGridStarsEvents = assignGridStarsEvents;
window.assignImageClickEvents = assignImageClickEvents;

// Evento cuando la carga está completa
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, iniciando aplicación...');
    initializeApp();
    
    // Cargar productos
    loadProducts();
    
    // Configurar eventos de filtros
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortBy = document.getElementById('sort-by');
    const priceSlider = document.getElementById('price-slider');
    const ratingFilter = document.getElementById('rating-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', sortProducts);
    }
    
    if (priceSlider) {
        priceSlider.addEventListener('input', filterProducts);
    }
    
    if (ratingFilter) {
        ratingFilter.addEventListener('change', filterProducts);
    }
    
    console.log('🎯 Eventos configurados correctamente');
});

// Verificación post-carga
window.addEventListener('load', function() {
    console.log('🌐 Página completamente cargada');
    
    // Verificar que todos los elementos estén en su lugar
    setTimeout(() => {
        const productsContainer = document.getElementById('products-container');
        const products = document.querySelectorAll('.product-card');
        
        console.log('📊 Estado de productos:');
        console.log('- Contenedor encontrado:', !!productsContainer);
        console.log('- Productos renderizados:', products.length);
        console.log('- Productos en memoria:', allProducts.length);
        
        if (products.length === 0 && allProducts.length > 0) {
            console.log('🔄 Re-renderizando productos...');
            renderProducts(allProducts);
        }
    }, 2000);
});

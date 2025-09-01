// main.js extraído de paginainicio.html
let allProducts = [];
let filteredProducts = [];

// Cargar productos desde products.json
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        renderProducts(filteredProducts);
        populateCategories();
    } catch (error) {
        console.error('Error cargando productos:', error);
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
    const productsGrid = document.getElementById('products-grid');
    if (products.length === 0) {
        productsGrid.innerHTML = '<div class="loading-message">No se encontraron productos.</div>';
        return;
    }
    productsGrid.innerHTML = products.map(product => {
        let imgSrc = (product.imagenes && product.imagenes.length > 0) ? product.imagenes[0] : getDefaultImage(product.categoria);
        let featuredBadge = product.destacado ? '<span class="featured-badge">Destacado</span>' : '';
        let stockClass = product.stock > 0 ? '' : 'out-of-stock';
        let addToCartClass = product.stock > 0 ? '' : 'disabled';
        let addToCartText = product.stock > 0 ? 'Agregar al carrito' : 'Sin stock';
        return `
        <article class="product-card">
            <div class="product-image ${stockClass}" style="background-image: url('${imgSrc}')">
                <span class="product-tag">${product.categoria}</span>
                ${featuredBadge}
            </div>
            <div class="product-info">
                <div class="product-brand"><small>${product.marca}</small></div>
                <h3 class="product-title">${product.titulo}</h3>
                <p class="product-description">${product.descripcion}</p>
                <div class="product-rating">
                    <span class="stars">${renderStars(product.rating)}</span>
                    <span class="rating-text">(${product.rating})</span>
                </div>
                <div class="product-footer">
                    <span class="price">$${product.precio.toLocaleString()}</span>
                    <span class="availability ${stockClass}">${product.stock} disponibles</span>
                </div>
                <button class="add-to-cart ${addToCartClass}" onclick="addToCart('${product.id}')" ${product.stock === 0 ? 'disabled' : ''}>${addToCartText}</button>
            </div>
        </article>
        `;
    }).join('');
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
    const button = event.target;
    button.style.background = '#2d5aa0';
    button.textContent = '✓ Agregado';
    // Aquí puedes agregar la lógica real del carrito
    console.log(`Producto ${productId} agregado al carrito`);
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

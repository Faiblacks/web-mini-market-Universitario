// Variables globales del modal
let currentProduct = null;

// Función para abrir el modal con detalles del producto
function openProductModal(productId) {
    console.log('Abriendo modal para producto:', productId);
    
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
    console.log('Asignando eventos de ver detalles...');
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            openProductModal(productId);
        });
    });
    console.log('Eventos de ver detalles asignados a', document.querySelectorAll('.view-details-btn').length, 'botones');
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
    
    // Zoom de imagen al pasar el mouse en el modal
    const modalImage = document.getElementById('modal-image');
    if (modalImage) {
        modalImage.addEventListener('mouseenter', function(e) {
            const imgSrc = this.src;
            if (!imgSrc) return;
            
            const zoomOverlay = document.createElement('div');
            zoomOverlay.id = 'zoom-overlay';
            zoomOverlay.style.position = 'fixed';
            zoomOverlay.style.top = '0';
            zoomOverlay.style.left = '0';
            zoomOverlay.style.width = '100vw';
            zoomOverlay.style.height = '100vh';
            zoomOverlay.style.background = 'rgba(0,0,0,0.85)';
            zoomOverlay.style.zIndex = '99999';
            zoomOverlay.style.display = 'flex';
            zoomOverlay.style.alignItems = 'center';
            zoomOverlay.style.justifyContent = 'center';
            zoomOverlay.style.pointerEvents = 'none';
            zoomOverlay.innerHTML = `<img src='${imgSrc}' style='max-width:90vw;max-height:90vh;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.5);transition:transform 0.3s ease;'>`;
            document.body.appendChild(zoomOverlay);
        });
        
        modalImage.addEventListener('mouseleave', function(e) {
            const zoomOverlay = document.getElementById('zoom-overlay');
            if (zoomOverlay) {
                document.body.removeChild(zoomOverlay);
            }
        });
    }
    
    // Manejo de comentarios con botón específico y filtrado
    const commentsBtn = document.getElementById('comments-btn');
    const modalStars = document.getElementById('modal-stars-clickable');
    const modalComments = document.getElementById('modal-comments');
    const commentsList = document.getElementById('comments-list');
    const starFilter = document.getElementById('star-filter');
    let allComments = []; // Variable global para almacenar todos los comentarios
    
    // Evento para botón de comentarios
    if (commentsBtn && modalComments) {
        commentsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (modalComments.style.display === 'none') {
                modalComments.style.display = 'block';
                generateComments(); // Generar comentarios cuando se abren
            } else {
                modalComments.style.display = 'none';
            }
        });
    }
    
    // Evento para estrellas clickeables
    if (modalStars && modalComments) {
        modalStars.addEventListener('click', function(e) {
            e.stopPropagation();
            if (modalComments.style.display === 'none') {
                modalComments.style.display = 'block';
                generateComments(); // Generar comentarios cuando se abren
            } else {
                modalComments.style.display = 'none';
            }
        });
    }
    
    // Filtrado por estrellas
    if (starFilter) {
        starFilter.addEventListener('change', function() {
            filterComments(this.value);
        });
    }
    
    function generateComments() {
        // SIEMPRE generar comentarios nuevos cada vez que se abren
                // Generar comentarios con usuarios más detallados
                const gamingUsers = [
                    {name:'Faker_LoL', verified: true, avatar:'🦊', game:'LoL'},
                    {name:'Thrall_Warchief', verified: false, avatar:'�', game:'WoW'},
                    {name:'s1mple_GOAT', verified: true, avatar:'🔫', game:'CS:GO'},
                    {name:'MarineKing', verified: true, avatar:'👨‍🚀', game:'StarCraft'},
                    {name:'xXNoobSlayerXx', verified: false, avatar:'⚔️', game:'General'},
                    {name:'ProGamer2024', verified: false, avatar:'🎮', game:'General'},
                    {name:'EliteMaster', verified: true, avatar:'👑', game:'General'},
                    {name:'CyberNinja', verified: false, avatar:'🥷', game:'General'}
                ];
                
                const allCommentTexts = [
                    'Increíble calidad, lo recomiendo totalmente!',
                    'Mejor de lo esperado, 5 estrellas merecidas',
                    'Excelente producto, llegó rápido y en perfecto estado',
                    'No me arrepiento de la compra, muy buena calidad',
                    'Superó mis expectativas, lo volvería a comprar',
                    'Producto de calidad premium, vale la pena',
                    'Muy satisfecho con la compra, recomendado',
                    'Excelente relación calidad-precio',
                    'Perfecto para gaming, muy cómodo',
                    'La calidad es increíble, lo uso todos los días',
                    'Muy buena inversión, durabilidad garantizada',
                    'Diseño espectacular y funcionalidad perfecta',
                    'Llegó antes de tiempo, empaque perfecto',
                    'Justo lo que necesitaba, cumple expectativas',
                    'Material resistente y bien acabado',
                    'Fácil de usar, interfaz intuitiva',
                    'Gran compra, funcionamiento excelente',
                    'Calidad profesional a buen precio',
                    'Recomiendo 100%, producto confiable',
                    'Sorprendente calidad por el precio',
                    'Funciona perfecto, sin problemas',
                    'Diseño elegante y funcional',
                    'Muy contento con esta adquisición',
                    'Producto sólido y duradero',
                    'Cumple todas mis expectativas',
                    'Excelente acabado y presentación',
                    'Vale cada peso gastado',
                    'Producto innovador y útil',
                    'Calidad excepcional, muy recomendado',
                    'Perfecto para uso diario',
                    'Supera a la competencia claramente',
                    'Funcionalidad impresionante',
                    'Diseño moderno y atractivo',
                    'Producto que realmente vale la pena',
                    'Calidad premium garantizada',
                    'No podría estar más satisfecho',
                    'Producto confiable y eficiente',
                    'Superó todas mis expectativas',
                    'Calidad y precio insuperables',
                    'Definitivamente lo recomiendo',
                    'Excelente inversión a largo plazo',
                    'Producto que marca la diferencia',
                    'Calidad superior en todos los aspectos',
                    'Funciona como se anuncia, perfecto',
                    'Producto revolucionario en su categoría'
                ];
                
                const comments = [];
                
                // Comentarios específicos para audifonos
                if (currentProduct && currentProduct.id === 'SKU-1001') {
                    comments.push({
                        user: 'pixel14',
                        verified: true,
                        avatar: '😭',
                        game: 'Estudiante',
                        stars: 5,
                        text: 'salvenme de la unab ayuda',
                        daysAgo: 2
                    });
                    comments.push({
                        user: 'Firedark',
                        verified: false,
                        avatar: '🔥',
                        game: 'Gamer',
                        stars: 1,
                        text: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                        daysAgo: 5
                    });
                }
                
                // Generar comentarios completamente aleatorios y únicos
                const numComments = Math.floor(Math.random() * 4) + 4; // 4-7 comentarios
                const usedUsers = []; // Para evitar usuarios duplicados
                const usedTexts = []; // Para evitar textos duplicados
                
                for(let i = 0; i < numComments; i++){
                    // Seleccionar usuario único
                    let user;
                    let attempts = 0;
                    do {
                        user = allGamers[Math.floor(Math.random() * allGamers.length)];
                        attempts++;
                    } while (usedUsers.includes(user.name) && attempts < 20);
                    
                    usedUsers.push(user.name);
                    
                    // Seleccionar texto único
                    let text;
                    let textAttempts = 0;
                    do {
                        text = allCommentTexts[Math.floor(Math.random() * allCommentTexts.length)];
                        textAttempts++;
                    } while (usedTexts.includes(text) && textAttempts < 20);
                    
                    usedTexts.push(text);
                    
                    // Generar calificación aleatoria (más variada)
                    const randomValue = Math.random();
                    let stars;
                    if (randomValue < 0.05) stars = 1;      // 5% probabilidad de 1 estrella
                    else if (randomValue < 0.15) stars = 2; // 10% probabilidad de 2 estrellas
                    else if (randomValue < 0.35) stars = 3; // 20% probabilidad de 3 estrellas
                    else if (randomValue < 0.70) stars = 4; // 35% probabilidad de 4 estrellas
                    else stars = 5;                         // 30% probabilidad de 5 estrellas
                    
                    const daysAgo = Math.floor(Math.random() * 60) + 1; // 1-60 días atrás
                    
                    comments.push({
                        user: user.name,
                        verified: user.verified,
                        avatar: user.avatar,
                        game: user.game,
                        stars,
                        text,
                        daysAgo
                    });
                }
                
                // Renderizar comentarios inicialmente
                allComments = comments;
                filterComments('all');
                
                // Calcular rating final y actualizar
                const avgRating = comments.reduce((a,c)=>a+c.stars,0)/comments.length;
                const modal = document.getElementById('product-modal');
                const modalStars = modal.querySelector('.modal-stars');
                const modalRatingText = modal.querySelector('.modal-rating-text');
                
                if(modalStars) modalStars.textContent = '★'.repeat(Math.round(avgRating))+'☆'.repeat(5-Math.round(avgRating));
                if(modalRatingText) modalRatingText.textContent = `(${avgRating.toFixed(1)} - ${comments.length} reseñas)`;
                
                // Actualizar el rating del producto actual
                if(currentProduct) {
                    currentProduct.rating = avgRating.toFixed(1);
                }
    }
    
    function filterComments(starValue) {
        if (!allComments || !commentsList) return;
        
        let filteredComments = allComments;
        if (starValue !== 'all') {
            filteredComments = allComments.filter(comment => comment.stars === parseInt(starValue));
        }
        
        // Renderizar comentarios filtrados
        commentsList.innerHTML = filteredComments.map(c =>
            `<div class='comment-item' style='margin-bottom:1.2em;padding:1em;background:#f8f9fa;border-radius:12px;border-left:4px solid #4285f4;'>
                <div style='display:flex;align-items:center;margin-bottom:0.5em;'>
                    <span style='font-size:1.5em;margin-right:0.5em;'>${c.avatar}</span>
                    <div style='flex:1;'>
                        <div style='display:flex;align-items:center;gap:0.5em;'>
                            <strong style='color:#333;'>${c.user}</strong>
                            ${c.verified ? '<span style="color:#1da1f2;font-size:0.9em;">✓ Verificado</span>' : '<span style="color:#666;font-size:0.8em;">No verificado</span>'}
                            <span style='color:#666;font-size:0.8em;'>• Hace ${c.daysAgo} día${c.daysAgo > 1 ? 's' : ''}</span>
                        </div>
                        <div style='color:#666;font-size:0.8em;'>${c.game} Player</div>
                    </div>
                </div>
                <div style='margin-bottom:0.5em;'>
                    <span style='color:#ffc107;font-size:1.1em;'>${'★'.repeat(c.stars)}${'☆'.repeat(5-c.stars)}</span>
                </div>
                <div style='color:#555;line-height:1.4;'>${c.text}</div>
            </div>`
        ).join('');
        
        // Mostrar mensaje si no hay comentarios con esa calificación
        if (filteredComments.length === 0) {
            commentsList.innerHTML = '<div style="text-align:center;padding:2em;color:#666;">No hay comentarios con esta calificación.</div>';
        }
    }
});

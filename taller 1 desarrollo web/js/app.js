// ======================================
// Cargar productos desde JSON
// ======================================
async function loadProductos() {
  try {
    // Ruta corregida: asume que productos.json está en la carpeta "data"
    const res = await fetch("./data/productos.json");
    if (!res.ok) throw new Error("No se pudo cargar productos.json");
    const productos = await res.json();
    renderCatalogo(productos);
    renderFavoritos(productos);
  } catch (error) {
    console.error("Error cargando productos:", error);
    alert("No se pudieron cargar los productos. Revisa la ruta o usa un servidor local.");
  }
}

// ======================================
// Renderizar catálogo con imagen y destacado
// ======================================
function renderCatalogo(lista) {
  const contenedor = document.getElementById("listaProductos");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  lista.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="card-container">
        ${p.destacado ? '<span class="destacado">DESTACADO</span>' : ''}
        <img src="${p.imagenes[0]}" alt="${p.titulo}">
      </div>
      <h3>${p.titulo}</h3>
      <p>Precio: $${p.precio}</p>
      <p>Rating: ${p.rating} ⭐</p>
      <p>Stock: ${p.stock > 0 ? p.stock : "Agotado"}</p>
      <div class="card-buttons">
        <button class="btn-carrito" onclick="addToCart('${p.id}')">Agregar</button>
        <button class="btn-favorito" onclick="toggleFavorito('${p.id}')">❤️</button>
      </div>
    `;
    contenedor.appendChild(card);
  });
}

// ======================================
// Carrito y favoritos
// ======================================
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

function addToCart(id) {
  const existing = carrito.find(p => p.id === id);
  if (existing) existing.qty += 1;
  else carrito.push({ id, qty: 1 });

  localStorage.setItem("carrito", JSON.stringify(carrito));
  alert("Producto agregado al carrito!");
}

function toggleFavorito(id) {
  if (favoritos.includes(id)) favoritos = favoritos.filter(f => f !== id);
  else favoritos.push(id);

  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  alert("Favoritos actualizado!");
  renderFavoritos();
}

// Renderizar favoritos simple
async function renderFavoritos(listaProductos = null) {
  const contenedor = document.getElementById("listaFavoritos");
  if (!contenedor) return;

  try {
    const productos = listaProductos || await fetch("./data/productos.json").then(r => r.json());
    contenedor.innerHTML = "";

    favoritos.forEach(favId => {
      const producto = productos.find(p => p.id === favId);
      if (!producto) return;
      const div = document.createElement("div");
      div.classList.add("card");
      div.innerHTML = `
        <h3>${producto.titulo}</h3>
        <p>Precio: $${producto.precio}</p>
      `;
      contenedor.appendChild(div);
    });
  } catch (error) {
    console.error("Error cargando favoritos:", error);
  }
}

// Inicialización
loadProductos();

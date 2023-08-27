let iniciarSesionBtn = document.getElementById('iniciarSesionBtn');
let mensajeBienvenida = document.getElementById('mensajeBienvenida');
let inicioSesionForm = document.getElementById('inicioSesionForm');
let usuarioInput = document.getElementById('usuarioInput');
let contrasenaInput = document.getElementById('contrasenaInput');

// Verificar si hay una sesión almacenada al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('sesionIniciada') === 'true') {
    mostrarMensajeBienvenida(localStorage.getItem('usuario'));
    ocultarFormularioInicioSesion();
  }
});

iniciarSesionBtn.addEventListener('click', () => {
  iniciarSesion();
});

function iniciarSesion() {
  let usuario = usuarioInput.value;
  let contrasena = contrasenaInput.value;

  if ((usuario === 'Ivan' || usuario === 'Invitado') && contrasena === '123') {
    // Ocultar el formulario de inicio de sesión
    ocultarFormularioInicioSesion();

    // Mostrar el mensaje de bienvenida
    mostrarMensajeBienvenida(usuario);

    // Guardar la sesión en el localStorage
    localStorage.setItem('sesionIniciada', 'true');
    localStorage.setItem('usuario', usuario);
  } else {
    Swal.fire('No es posible iniciar sesión. Verifica tus credenciales.');
  }
}

function ocultarFormularioInicioSesion() {
  inicioSesionForm.style.display = 'none';
}

function mostrarMensajeBienvenida(usuario) {
  mensajeBienvenida.style.display = 'block';
  mensajeBienvenida.textContent = `¡Bienvenido, ${usuario}!`;
}

//Evento boton Light y Dark mode
//dark light mode

let boton = document.getElementById('mode');
let contenedor = document.getElementById('main');
let currentMode = localStorage.getItem('mode') || 'light';
document.body.className = currentMode;
boton.innerText = currentMode === 'light' ? 'Dark Mode' : 'Light Mode';

boton.onclick = () => {
  if (currentMode === 'light') {
    contenedor.classList.replace('light', 'dark');
    document.body.className = 'dark';
    boton.innerText = 'Light Mode';
    currentMode = 'dark';
  } else {
    contenedor.classList.replace('dark', 'light');
    document.body.className = 'light';
    boton.innerText = 'Dark Mode';
    currentMode = 'light';
  }
  localStorage.setItem('mode', currentMode);
};


// Función para cargar el catálogo de productos desde el JSON

const catalogoURL = 'productos.json';

async function cargarCatalogo() {
  try {
    const response = await fetch(catalogoURL);
    if (!response.ok) {
      throw new Error('No se pudo cargar el catálogo de productos.');
    }
    const data = await response.json();
    catalogoProductos = data;
    generarCatalogo();
  } catch (error) {
    console.error('Error al cargar el catálogo:', error);
    mostrarErrorCatalogo();
  }
}

function mostrarErrorCatalogo() {
  let catalogoContainer = document.getElementById('catalogoProductos');
  catalogoContainer.innerHTML = '<p>Error al cargar el catálogo. Inténtalo de nuevo más tarde.</p>';
}

cargarCatalogo();

let carritoItems = [];



function generarCatalogo() {
  let catalogoContainer = document.getElementById('catalogoProductos');
  let catalogoHTML = '';

  // Obtener el valor seleccionado del filtro de tipo
  const filtroTipo = document.getElementById('filtroTipo').value;

  // Filtrar los productos según el tipo seleccionado
  let productosFiltrados = catalogoProductos;
  if (filtroTipo !== 'todos') {
    productosFiltrados = catalogoProductos.filter((producto) => producto.tipo === filtroTipo);
  }

  productosFiltrados.forEach((producto) => {
    let agregarBtn = '';
    if (producto.stock > 0) {
      agregarBtn = `<button data-product-id="${producto.id}" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>`;
    } else {
      agregarBtn = '<button disabled>Sin stock</button>';
    }

    catalogoHTML += `
      <div class="producto">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <p>${producto.nombre}</p>
        <p>Precio: $${producto.precio}</p>
        <p>Stock: ${producto.stock}</p>
        ${agregarBtn}
      </div>
    `;
  });

  catalogoContainer.innerHTML = catalogoHTML;
}


// Función para buscar un producto en el carrito
function agregarAlCarrito(id) {
  let producto = catalogoProductos.find((producto) => producto.id === id);

  if (!producto) {
    Swal.fire('Producto no encontrado en el catálogo');
    return;
  }

  let productoEnCarrito = carritoItems.find(
    (item) => item.id === producto.id
  );

  if (productoEnCarrito) {
    if (producto.stock > 0) {
      productoEnCarrito.cantidad++;
      producto.stock--;
    } else {
      Swal.fire('No hay stock disponible para este producto!');
    }
  } else {
    if (producto.stock > 0) {
      carritoItems.push({ ...producto, cantidad: 1 });
      producto.stock--;
    } else {
      Swal.fire('No hay stock disponible para este producto!');
    }
  }

  generarCatalogo();
  generarCarrito();
}
// Función para generar el contenido del carrito
function generarCarrito() {
  let carritoContainer = document.getElementById('carritoItems');
  carritoContainer.innerHTML = ''; 

  let subtotal = 0;
  let fragment = document.createDocumentFragment(); 

  carritoItems.forEach((producto) => {
    let itemDiv = document.createElement('div');
    itemDiv.classList.add('item');

    let nombre = document.createElement('p');
    nombre.textContent = producto.nombre;

    let precio = document.createElement('p');
    precio.textContent = `Precio: $${producto.precio}`;

    let cantidad = document.createElement('p');
    cantidad.textContent = `Cantidad: ${producto.cantidad}`;

    let eliminarBtn = document.createElement('button');
    eliminarBtn.textContent = 'Eliminar';
    eliminarBtn.addEventListener('click', () => eliminarDelCarrito(producto));

    itemDiv.appendChild(nombre);
    itemDiv.appendChild(precio);
    itemDiv.appendChild(cantidad);
    itemDiv.appendChild(eliminarBtn);

    fragment.appendChild(itemDiv); 

    subtotal += producto.precio * producto.cantidad;
  });

  carritoContainer.appendChild(fragment); 
  let cuotasSelect = document.getElementById('cuotas');
  let cuotasOptions = cuotasSelect.getElementsByTagName('option');
  cuotasOptions[0].selected = 'selected'; 

  if (subtotal >= 100000) {
    cuotasSelect.disabled = false;
  } else {
    cuotasSelect.disabled = true;
  }

  let subtotalElement = document.getElementById('subtotal');
  subtotalElement.textContent = `Subtotal: $${subtotal}`;
}

function eliminarDelCarrito(producto) {
  let index = carritoItems.findIndex(
    (item) => item.nombre === producto.nombre && item.precio === producto.precio
  );

  if (index > -1) {
    let productoEnCatalogo = catalogoProductos.find((p) => p.nombre === producto.nombre);
    if (productoEnCatalogo) {
      productoEnCatalogo.stock++;
    }

    carritoItems[index].cantidad--;
    if (carritoItems[index].cantidad <= 0) {
      carritoItems.splice(index, 1);
    }
    generarCatalogo();
    generarCarrito();
  }
}

// Función realizar la compra
function comprar() {
  let cuotasSelect = document.getElementById('cuotas');
  let cuotas = parseInt(cuotasSelect.value);

  let total = carritoItems.reduce((suma, producto) => suma + producto.precio * producto.cantidad, 0);

  if (total > 100000) {
    if (!isNaN(cuotas) && cuotas >= 1) {
      let valorCuota = total / cuotas;
      Swal.fire(`¡Compra exitosa!\nTotal de la compra: $${total}\nValor de cada cuota: $${valorCuota.toFixed(2)}`)
        .then((result) => {
          if (result.isConfirmed) {
            Toastify({
              text: "Gracias por tu compra, nos contactaremos para coordinar la entrega.",
              duration: 5000, 
              gravity: "top", 
              backgroundColor: "rgb(3, 2, 2)", 
              close: true, 
            }).showToast();

            carritoItems = [];
            generarCatalogo();
            generarCarrito();
          }
        });
    } else {
      Swal.fire("Seleccione una cantidad válida de cuotas.");
    }
  } else {
    Swal.fire(`¡Compra exitosa!\nMonto de la compra: $${total}`)
      .then((result) => {
        if (result.isConfirmed) {
          Toastify({
            text: "Gracias por tu compra, nos contactaremos para coordinar la entrega.",
            duration: 5000, 
            gravity: "top", 
            backgroundColor: "rgb(3, 2, 2)", 
            close: true, 
          }).showToast();

          carritoItems = [];
          generarCatalogo();
          generarCarrito();
        }
      });
  }
}
// Evento botón de comprar
let btnComprar = document.getElementById('btnComprar');
btnComprar.addEventListener('click', () => {
  if (carritoItems.length > 0) {
    comprar();
  } else {
    Swal.fire("No hay productos en el carrito. Agrega productos antes de comprar.");
  }
});

generarCatalogo();
generarCarrito();
document.addEventListener('DOMContentLoaded', () => {

    //Inicializar Productos
    if (!localStorage.getItem('products')) {
        const defaultProducts = [
            { id: Date.now().toString(), name: "Alitas Crujientes (x6)", price: 18.00, category: "pollo", status: "active", image: "/img/alitasBBQ.jpeg", description: "Acompañadas de papas fritas y cremas a elección." },
            { id: (Date.now() + 1).toString(), name: "Mounstrito Happy", price: 15.00, category: "combos", status: "active", image: "/img/mounstrito.jpg", description: "Arroz chaufa, 1/4 de pollo y papas nativas." },
            { id: (Date.now() + 2).toString(), name: "Coca Cola 500ml", price: 3.50, category: "bebidas", status: "active", image: "/img/coca-cola.jpeg", description: "Bebida gasificada bien helada." }
        ];
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }

    const productsContainer = document.getElementById('products-container');
    const searchBar = document.getElementById('search-bar');
    let currentCategory = 'todos';
    let currentSearch = '';

    function renderProducts() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        productsContainer.innerHTML = '';

        products.forEach(product => {
            // Filtrar productos inactivos y aplicar filtros de búsqueda/categoría
            if (product.status !== 'active') return;
            
            const matchCategory = currentCategory === 'todos' || product.category === currentCategory;
            const matchSearch = product.name.toLowerCase().includes(currentSearch.toLowerCase()) || 
                                (product.description && product.description.toLowerCase().includes(currentSearch.toLowerCase()));

            if (matchCategory && matchSearch) {
                const div = document.createElement('div');
                div.className = 'col product-item';
                div.setAttribute('data-category', product.category);

                div.innerHTML = `
                    <div class="card h-100 border-0 shadow-sm product-card">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height:200px; object-fit:cover;">
                        <div class="card-body text-center d-flex flex-column">
                            <h5 class="card-title fw-bold product-title">${product.name}</h5>
                            <p class="card-text text-muted small flex-grow-1">${product.description || ''}</p>
                            <h4 class="text-danger fw-bold mb-3 product-price">S/ ${parseFloat(product.price).toFixed(2)}</h4>
                            <button class="btn btn-danger w-100 fw-bold mt-auto add-to-cart-btn"><i class="bi bi-cart-plus"></i> Agregar</button>
                        </div>
                    </div>
                `;
                productsContainer.appendChild(div);
            }
        });

        // Re-asignar eventos de carrito a los nuevos botones
        attachCartEvents();
    }

    //Filtrado de Categorias
    const categoryItems = document.querySelectorAll('.custom-category-list .list-group-item');

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(i => i.classList.remove('active-category', 'bg-danger', 'text-white'));
            item.classList.add('active-category', 'bg-danger', 'text-white');

            currentCategory = item.getAttribute('data-filter');
            renderProducts();
        });
    });

    //Busqueda
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            renderProducts();
        });
    }

    //Carrito de Compras
    let cart = [];
    
    const cartBadge = document.getElementById('cart-badge');
    const emptyCartMsg = document.getElementById('empty-cart-msg');
    const cartItemList = document.getElementById('cart-item-list');
    const cartTotal = document.getElementById('cart-total');

    function attachCartEvents() {
        const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.target.closest('.card');
                const title = productCard.querySelector('.product-title').innerText;
                const priceText = productCard.querySelector('.product-price').innerText;
                const price = parseFloat(priceText.replace('S/', '').trim());

                const existingItem = cart.find(item => item.title === title);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({ title, price, quantity: 1 });
                }

                updateCartUI();

                // Mostrar notificación Toast de Bootstrap
                const toastEl = document.getElementById('cartToast');
                if (toastEl) {
                    const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
                    toast.show();
                }
            });
        });
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.innerText = totalItems;

        let totalPrecio = 0;
        cartItemList.innerHTML = '';

        if (cart.length > 0) {
            emptyCartMsg.classList.add('d-none');
            cartItemList.classList.remove('d-none');

            cart.forEach((item, index) => {
                totalPrecio += item.price * item.quantity;
                
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `
                    <div>
                        <h6 class="my-0">${item.title}</h6>
                        <small class="text-muted">S/ ${item.price.toFixed(2)} x ${item.quantity}</small>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="text-muted fw-bold me-2">S/ ${(item.price * item.quantity).toFixed(2)}</span>
                        <div class="btn-group btn-group-sm">
                            <button type="button" class="btn btn-outline-secondary decrease-btn" data-index="${index}"><i class="bi bi-dash"></i></button>
                            <button type="button" class="btn btn-outline-secondary disabled px-2">${item.quantity}</button>
                            <button type="button" class="btn btn-outline-secondary increase-btn" data-index="${index}"><i class="bi bi-plus"></i></button>
                        </div>
                        <button class="btn btn-sm btn-outline-danger remove-btn" data-index="${index}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `;
                cartItemList.appendChild(li);
            });

            document.querySelectorAll('.decrease-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.currentTarget.closest('.decrease-btn').getAttribute('data-index');
                    if (cart[index].quantity > 1) {
                        cart[index].quantity--;
                    } else {
                        cart.splice(index, 1);
                    }
                    updateCartUI();
                });
            });

            document.querySelectorAll('.increase-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.currentTarget.closest('.increase-btn').getAttribute('data-index');
                    cart[index].quantity++;
                    updateCartUI();
                });
            });

            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.currentTarget.closest('.remove-btn').getAttribute('data-index');
                    cart.splice(index, 1);
                    updateCartUI();
                });
            });

        } else {
            emptyCartMsg.classList.remove('d-none');
            cartItemList.classList.add('d-none');
        }

        cartTotal.innerText = `Total: S/ ${totalPrecio.toFixed(2)}`;
    }

    // Inicializar la vista
    renderProducts();

    //Enviar Pedido
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Tu carrito está vacío. Agrega productos antes de pagar.');
                return;
            }

            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            
            // Calcular total final
            const totalOrder = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            const newOrder = {
                id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
                customer: 'Cliente Web',
                items: [...cart], // Clonar el array
                total: totalOrder,
                status: 'Pendiente',
                date: new Date().toISOString()
            };
            
            // Guardar orden
            orders.push(newOrder);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Notificar
            alert('¡Tu pedido ha sido enviado con exito!\nCodigo de orden: ' + newOrder.id);

            // Vaciar carrito
            cart = [];
            updateCartUI();

            // Cerrar el modal de bootstrap
            const cartModalEl = document.getElementById('cartModal');
            if (cartModalEl) {
                const modal = bootstrap.Modal.getInstance(cartModalEl);
                if (modal) modal.hide();
            }
        });
    }
});

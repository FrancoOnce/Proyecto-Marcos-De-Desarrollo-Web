document.addEventListener('DOMContentLoaded', () => {

    // Categorías del select mappeados al data-filter para ser compatibles con el app.js del frontend
    const categoriesMap = {
        "1": "combos",
        "2": "pollo",
        "3": "bebidas"
    };

    const categoriesReverseMap = {
        "combos": "1",
        "pollo": "2",
        "bebidas": "3"
    };

    // Nombres para mostrar en tabla
    const categoriesNames = {
        "combos": "Combos & Especiales",
        "pollo": "Pollo a la Brasa",
        "bebidas": "Bebidas"
    };

    // Precargar productos en LocalStorage si no existen
    if (!localStorage.getItem('products')) {
        const defaultProducts = [
            {
                id: Date.now().toString(),
                name: "Alitas Crujientes (x6)",
                price: 18.00,
                category: "pollo",
                status: "active",
                image: "../../static/img/alitasBBQ.jpeg",
                description: "Acompañadas de papas fritas y cremas a elección."
            },
            {
                id: (Date.now() + 1).toString(),
                name: "Mounstrito Happy",
                price: 15.00,
                category: "combos",
                status: "active",
                image: "../../static/img/mounstrito.jpg",
                description: "Arroz chaufa, 1/4 de pollo y papas nativas."
            },
            {
                id: (Date.now() + 2).toString(),
                name: "Coca Cola 500ml",
                price: 3.50,
                category: "bebidas",
                status: "active",
                image: "../../static/img/coca-cola.jpeg",
                description: "Bebida gasificada bien helada."
            }
        ];
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }

    const productsTableBody = document.getElementById('productsTableBody');
    const addProductForm = document.getElementById('addProductForm');
    const productFormContainer = document.getElementById('productFormContainer');

    function loadProductsTable() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        productsTableBody.innerHTML = '';

        products.forEach(product => {
            const tr = document.createElement('tr');

            const statusBadgeClass = product.status === 'active' ? 'status-success' : 'status-danger';
            const statusText = product.status === 'active' ? 'Disponible' : 'Agotado';

            // Convierte ../static a ../../static/ internamente para la mejor compatibilidad
            let imgRenderPath = product.image;
            if (imgRenderPath.startsWith('../static/')) {
                imgRenderPath = '../' + imgRenderPath;
            }

            tr.innerHTML = `
                <td>
                    <img src="${imgRenderPath}" alt="${product.name}" class="product-thumbnail" style="width:50px; height:50px; object-fit:cover; border-radius:8px;">
                </td>
                <td class="fw-bold text-dark">${product.name}</td>
                <td>${categoriesNames[product.category] || 'Otros'}</td>
                <td class="fw-bold text-success">S/ ${parseFloat(product.price).toFixed(2)}</td>
                <td><span class="status-badge ${statusBadgeClass}">${statusText}</span></td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn-action bg-light text-primary border edit-btn" data-id="${product.id}" title="Editar"><i class="bi bi-pencil"></i></button>
                        <button class="btn-action bg-light text-danger border delete-btn" data-id="${product.id}" title="Eliminar"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            `;
            productsTableBody.appendChild(tr);
        });

        // Asignar eventos a los nuevos botones
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteProduct);
        });
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editProduct);
        });
    }

    // Agregar o Actualizar Producto
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const productIdNode = document.getElementById('productId');
        const isEditing = productIdNode.value !== "";

        // Normalizar entrada de imagen para no romper la tienda oficial
        let imageInput = document.getElementById('productImage').value;
        if (imageInput.startsWith('../../static/')) {
            imageInput = imageInput.substring(3);
        }

        const newProduct = {
            id: isEditing ? productIdNode.value : Date.now().toString(),
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            category: categoriesMap[document.getElementById('productCategory').value],
            status: document.getElementById('productStatus').value,
            image: imageInput,
            description: document.getElementById('productDescription').value
        };

        const products = JSON.parse(localStorage.getItem('products')) || [];

        if (isEditing) {
            const index = products.findIndex(p => p.id === newProduct.id);
            if (index !== -1) {
                products[index] = newProduct;
            }
        } else {
            products.push(newProduct);
        }

        localStorage.setItem('products', JSON.stringify(products));

        // Limpiar formulario y recargar
        addProductForm.reset();
        productIdNode.value = "";

        // Ocultar modal
        const bsCollapse = bootstrap.Collapse.getInstance(productFormContainer) || new bootstrap.Collapse(productFormContainer, { toggle: false });
        bsCollapse.hide();

        loadProductsTable();
    });

    function deleteProduct(e) {
        if (confirm('¿Estás seguro de que deseas eliminar este plato?')) {
            const id = e.currentTarget.getAttribute('data-id');
            let products = JSON.parse(localStorage.getItem('products')) || [];
            products = products.filter(p => p.id !== id);
            localStorage.setItem('products', JSON.stringify(products));
            loadProductsTable();
        }
    }

    function editProduct(e) {
        const id = e.currentTarget.getAttribute('data-id');
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id === id);

        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = categoriesReverseMap[product.category] || "";
            document.getElementById('productStatus').value = product.status;

            // Reajustar la imagen a la vista del usuario en el formulario
            let editImageInput = product.image;
            if (editImageInput.startsWith('../static/')) {
                editImageInput = '../' + editImageInput;
            }
            document.getElementById('productImage').value = editImageInput;

            document.getElementById('productDescription').value = product.description || "";

            // Mostrar el formulario
            const bsCollapse = bootstrap.Collapse.getInstance(productFormContainer) || new bootstrap.Collapse(productFormContainer, { toggle: false });
            bsCollapse.show();

            // Hacer scroll hacia el formulario
            productFormContainer.scrollIntoView({ behavior: "smooth" });
        }
    }

    // Inicializar la tabla al cargar
    loadProductsTable();

    // Resetear form al cancelar
    productFormContainer.addEventListener('hidden.bs.collapse', () => {
        addProductForm.reset();
        document.getElementById('productId').value = "";
    });

});

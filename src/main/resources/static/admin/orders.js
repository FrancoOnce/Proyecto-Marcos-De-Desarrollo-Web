document.addEventListener('DOMContentLoaded', () => {

    const ordersTableBody = document.getElementById('ordersTableBody');
    const orderDetailModal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    
    function loadOrders() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        ordersTableBody.innerHTML = '';

        if(orders.length === 0) {
            ordersTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No hay pedidos registrados en el sistema.</td></tr>`;
            return;
        }

        // Mostrar del mas nuevo al mas viejo
        orders.reverse().forEach(order => {
            const tr = document.createElement('tr');
            
            // Logica de colores segun estado
            let statusBadgeClass = 'status-warning';
            if (order.status === 'Entregado') statusBadgeClass = 'status-success';
            if (order.status === 'Cancelado') statusBadgeClass = 'text-bg-danger';

            // Armar texto resumen
            const itemsSummary = order.items.map(i => `${i.quantity}x ${i.title}`).join(', ');
            // Cortar texto si es muy largo
            const shortSummary = itemsSummary.length > 30 ? itemsSummary.substring(0, 30) + '...' : itemsSummary;

            const date = new Date(order.date);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            tr.innerHTML = `
                <td class="fw-bold">${order.id}</td>
                <td><small class="text-muted">${formattedDate}</small></td>
                <td>${order.customer}</td>
                <td title="${itemsSummary}">${shortSummary}</td>
                <td class="fw-bold text-success">S/ ${parseFloat(order.total).toFixed(2)}</td>
                <td><span class="status-badge ${statusBadgeClass}">${order.status}</span></td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-info view-btn" data-id="${order.id}" title="Ver Detalles"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-sm btn-outline-success complete-btn" data-id="${order.id}" title="Marcar Entregado"><i class="bi bi-check-lg"></i></button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${order.id}" title="Eliminar"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            `;
            ordersTableBody.appendChild(tr);
        });

        attachRowEvents();
    }

    function attachRowEvents() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const orders = JSON.parse(localStorage.getItem('orders')) || [];
                const order = orders.find(o => o.id === id);

                if(order) {
                    document.getElementById('modalOrderId').innerText = order.id;
                    document.getElementById('modalOrderTotal').innerText = `S/ ${parseFloat(order.total).toFixed(2)}`;
                    
                    const modalOrderItems = document.getElementById('modalOrderItems');
                    modalOrderItems.innerHTML = '';
                    
                    order.items.forEach(item => {
                        const li = document.createElement('li');
                        li.className = 'list-group-item d-flex justify-content-between align-items-center px-0';
                        li.innerHTML = `
                            <span>${item.quantity}x ${item.title}</span>
                            <span class="fw-bold">S/ ${(item.price * item.quantity).toFixed(2)}</span>
                        `;
                        modalOrderItems.appendChild(li);
                    });

                    orderDetailModal.show();
                }
            });
        });

        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const orders = JSON.parse(localStorage.getItem('orders')) || [];
                const orderIndex = orders.findIndex(o => o.id === id);

                if(orderIndex !== -1 && orders[orderIndex].status !== 'Entregado') {
                    orders[orderIndex].status = 'Entregado';
                    localStorage.setItem('orders', JSON.stringify(orders));
                    loadOrders(); // Recargar
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm('¿Estás seguro de que deseas eliminar históricamente este pedido?')) {
                    const id = e.currentTarget.getAttribute('data-id');
                    let orders = JSON.parse(localStorage.getItem('orders')) || [];
                    orders = orders.filter(o => o.id !== id);
                    localStorage.setItem('orders', JSON.stringify(orders));
                    loadOrders(); // Recargar
                }
            });
        });
    }

    // Inicializar la tabla al cargar
    loadOrders();
});

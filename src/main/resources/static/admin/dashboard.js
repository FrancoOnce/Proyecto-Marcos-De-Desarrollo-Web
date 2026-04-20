document.addEventListener('DOMContentLoaded', () => {
    const totalOrdersElement = document.getElementById('totalOrders');
    const totalSalesElement = document.getElementById('totalSales');
    const recentActivityTable = document.getElementById('recentActivityTable');

    //Estadísticas de Pedidos
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    const pendingOrders = orders.filter(o => o.status === 'Pendiente').length;
    totalOrdersElement.textContent = pendingOrders;

    const deliveredOrders = orders.filter(o => o.status === 'Entregado');
    const totalSales = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
    totalSalesElement.textContent = `S/ ${totalSales.toFixed(2)}`;

    //Cargar Ultima Actividad de Pedidos
    recentActivityTable.innerHTML = '';
    const recentOrders = [...orders].reverse().slice(0, 5);

    if (recentOrders.length === 0) {
        recentActivityTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">No hay actividad reciente. Aún no se han recibido pedidos.</td>
            </tr>
        `;
        return;
    }

    recentOrders.forEach(order => {
        const tr = document.createElement('tr');
        
        let statusBadge = '';
        if (order.status === 'Pendiente') {
            statusBadge = '<span class="status-badge bg-warning text-dark"><i class="bi bi-clock me-1"></i> Pendiente</span>';
        } else if (order.status === 'Entregado') {
            statusBadge = '<span class="status-badge bg-success text-white"><i class="bi bi-check-circle me-1"></i> Entregado</span>';
        } else {
            statusBadge = `<span class="status-badge bg-secondary text-white">${order.status}</span>`;
        }

        // Crear un resumen legible de lo comprado usando .title de app.js
        let detailSummary = order.items.map(item => `${item.quantity}x ${item.title}`).join(', ');
        if (detailSummary.length > 50) {
            detailSummary = detailSummary.substring(0, 47) + '...';
        }

        tr.innerHTML = `
            <td class="fw-bold">${order.id}</td>
            <td>Mostrador / Web</td>
            <td><small class="text-muted" title="${order.items.map(i => i.quantity + 'x ' + i.title).join(', ')}">${detailSummary}</small></td>
            <td class="fw-bold text-success">S/ ${parseFloat(order.total).toFixed(2)}</td>
            <td>${statusBadge}</td>
            <td>
                <a href="orders.html" class="btn-action bg-light text-primary border text-decoration-none px-2 py-1 rounded" title="Ver pedido">
                    <i class="bi bi-eye"></i> Ver
                </a>
            </td>
        `;
        recentActivityTable.appendChild(tr);
    });
});

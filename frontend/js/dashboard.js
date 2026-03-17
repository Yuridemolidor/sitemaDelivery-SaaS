// Check authentication
checkAuth();

// Variables
let currentUser = null;

// Load dashboard data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
});

async function loadDashboard() {
    try {
        // Get user data from localStorage or token
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');

        if (userData.tipo === 'admin') {
            // Load admin dashboard
            const adminData = await getAdminDashboard();
            document.getElementById('totalLojas').textContent = adminData.total_lojas || 0;
            document.getElementById('totalPedidos').textContent = adminData.total_pedidos || 0;
            document.getElementById('totalProdutos').textContent = adminData.total_produtos || 0;
        } else if (userData.tipo === 'loja') {
            // Load loja dashboard
            const lojas = await getLojas();
            document.getElementById('totalLojas').textContent = lojas.length || 0;

            let totalProdutos = 0;
            let totalPedidos = 0;
            let totalFaturamento = 0;

            for (let loja of lojas) {
                const stats = await getLojaStats(loja.id);
                totalProdutos += stats.total_produtos || 0;
                totalPedidos += stats.total_pedidos || 0;
                totalFaturamento += stats.total_vendas || 0;
            }

            document.getElementById('totalProdutos').textContent = totalProdutos;
            document.getElementById('totalPedidos').textContent = totalPedidos;
            document.getElementById('totalFaturamento').textContent = `R$ ${totalFaturamento.toFixed(2)}`;
        }

        // Load recent orders
        const pedidos = await getPedidos();
        loadPedidosTable(pedidos.slice(0, 5));

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

function loadPedidosTable(pedidos) {
    const tbody = document.querySelector('#pedidosTable tbody');
    tbody.innerHTML = '';

    pedidos.forEach(pedido => {
        const row = `
            <tr>
                <td>#${pedido.id}</td>
                <td>${pedido.cliente_nome}</td>
                <td>R$ ${parseFloat(pedido.total).toFixed(2)}</td>
                <td><span class="status-badge status-${pedido.status.replace(' ', '-')}">${pedido.status}</span></td>
                <td>${new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</td>
                <td>
                    <a href="pedidos.html" class="btn btn-sm btn-primary">Ver</a>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}
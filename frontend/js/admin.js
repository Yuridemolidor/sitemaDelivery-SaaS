// Check authentication
checkAuth();

// Charts
let faturamentoChart = null;
let statusChart = null;

// Load admin dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAdminDashboard();
});

async function loadAdminDashboard() {
    try {
        // Get dashboard data
        const dashboard = await getAdminDashboard();
        document.getElementById('totalLojas').textContent = dashboard.total_lojas || 0;
        document.getElementById('totalPedidos').textContent = dashboard.total_pedidos || 0;
        document.getElementById('totalUsuarios').textContent = dashboard.total_usuarios || 0;
        document.getElementById('faturamentoTotal').textContent = `R$ ${parseFloat(dashboard.receita_total).toFixed(2)}`;

        // Get detailed statistics
        const stats = await getEstatisticasGerais();

        // Load lojas mais vendidas
        const lojas = await getLojasMaisVendidas();
        displayLojasMaisVendidas(lojas);

        // Create charts
        createFaturamentoChart(stats.receita_mensal);
        createStatusChart(stats.pedidos_por_status);

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

function displayLojasMaisVendidas(lojas) {
    const tbody = document.querySelector('#lojasVendasTable tbody');
    tbody.innerHTML = '';

    lojas.forEach(loja => {
        const row = `
            <tr>
                <td>${loja.nome}</td>
                <td>${loja.total_pedidos || 0}</td>
                <td>R$ ${parseFloat(loja.receita_total || 0).toFixed(2)}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function createFaturamentoChart(data) {
    const ctx = document.getElementById('faturamentoChart').getContext('2d');

    const labels = data.map(d => {
        const date = new Date(d.mes);
        return date.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' });
    });

    const values = data.map(d => parseFloat(d.total) || 0);

    faturamentoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Faturamento (R$)',
                data: values,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

function createStatusChart(data) {
    const ctx = document.getElementById('statusChart').getContext('2d');

    const labels = data.map(d => d.status);
    const values = data.map(d => parseInt(d.total) || 0);

    const colors = [
        '#fff3cd',
        '#d4edda',
        '#d1ecf1',
        '#f8d7da',
        '#d4edda',
        '#e2e3e5'
    ];

    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, values.length),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}
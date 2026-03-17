// Check authentication
checkAuth();

// Global variables
let currentPedidoId = null;
let allPedidos = [];

// Load pedidos on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPedidos();
    loadLojas();
    setupAddPedidoForm();
    setupStatusFilter();
});

async function loadPedidos() {
    try {
        const pedidos = await getPedidos();
        allPedidos = pedidos;
        displayPedidos(pedidos);
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
}

async function loadLojas() {
    try {
        const lojas = await getLojas();
        const lojaSelect = document.getElementById('ped_loja');
        lojaSelect.innerHTML = lojas.map(loja => `<option value="${loja.id}">${loja.nome}</option>`).join('');
    } catch (error) {
        console.error('Erro ao carregar lojas:', error);
    }
}

function displayPedidos(pedidos) {
    const tbody = document.querySelector('#pedidosTable tbody');
    tbody.innerHTML = '';

    pedidos.forEach(pedido => {
        const row = `
            <tr>
                <td>#${pedido.id}</td>
                <td>${pedido.cliente_nome}</td>
                <td>${pedido.telefone}</td>
                <td>R$ ${parseFloat(pedido.total).toFixed(2)}</td>
                <td><span class="status-badge status-${pedido.status.replace(/ /g, '-')}">${pedido.status}</span></td>
                <td>${new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="openEditStatusModal(${pedido.id}, '${pedido.status}')">Alterar Status</button>
                    <button class="btn btn-sm btn-danger" onclick="deletePedido(${pedido.id})">Deletar</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function setupStatusFilter() {
    const filter = document.getElementById('statusFilter');
    filter.addEventListener('change', function(e) {
        if (e.target.value) {
            const filtered = allPedidos.filter(p => p.status === e.target.value);
            displayPedidos(filtered);
        } else {
            displayPedidos(allPedidos);
        }
    });
}

function setupAddPedidoForm() {
    const form = document.getElementById('addPedidoForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const data = {
                cliente_nome: document.getElementById('ped_cliente').value,
                telefone: document.getElementById('ped_telefone').value,
                endereco: document.getElementById('ped_endereco').value,
                total: parseFloat(document.getElementById('ped_total').value),
                loja_id: parseInt(document.getElementById('ped_loja').value)
            };

            try {
                const response = await createPedido(data);

                if (response.erro) {
                    alert('Erro: ' + response.erro);
                } else {
                    alert('Pedido criado com sucesso!');
                    form.reset();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addPedidoModal'));
                    modal.hide();
                    loadPedidos();
                }
            } catch (error) {
                alert('Erro ao criar pedido');
            }
        });
    }
}

function openEditStatusModal(pedidoId, currentStatus) {
    currentPedidoId = pedidoId;
    document.getElementById('edit_status').value = currentStatus;
    const modal = new bootstrap.Modal(document.getElementById('editStatusModal'));
    modal.show();
}

document.addEventListener('DOMContentLoaded', function() {
    const editStatusForm = document.getElementById('editStatusForm');
    if (editStatusForm) {
        editStatusForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const status = document.getElementById('edit_status').value;

            try {
                const response = await updatePedidoStatus(currentPedidoId, status);

                if (response.erro) {
                    alert('Erro: ' + response.erro);
                } else {
                    alert('Status atualizado com sucesso!');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editStatusModal'));
                    modal.hide();
                    loadPedidos();
                }
            } catch (error) {
                alert('Erro ao atualizar status');
            }
        });
    }
});

async function deletePedido(id) {
    if (confirm('Tem certeza que deseja deletar este pedido?')) {
        try {
            const response = await deletePedido(id);

            if (response.erro) {
                alert('Erro: ' + response.erro);
            } else {
                alert('Pedido deletado com sucesso!');
                loadPedidos();
            }
        } catch (error) {
            alert('Erro ao deletar pedido');
        }
    }
}
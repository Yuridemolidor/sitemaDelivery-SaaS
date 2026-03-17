// Check authentication
checkAuth();

// Load lojas on page load
document.addEventListener('DOMContentLoaded', function() {
    loadLojas();
    setupAddLojaForm();
});

async function loadLojas() {
    try {
        const lojas = await getLojas();
        displayLojas(lojas);
    } catch (error) {
        console.error('Erro ao carregar lojas:', error);
        alert('Erro ao carregar lojas');
    }
}

function displayLojas(lojas) {
    const tbody = document.querySelector('#lojasTable tbody');
    tbody.innerHTML = '';

    lojas.forEach(loja => {
        const row = `
            <tr>
                <td>${loja.nome}</td>
                <td>${loja.telefone}</td>
                <td>${loja.endereco}</td>
                <td>R$ ${parseFloat(loja.taxa_entrega || 0).toFixed(2)}</td>
                <td><a href="pedidos.html" class="btn btn-sm btn-info">Ver Pedidos</a></td>
                <td><a href="produtos.html" class="btn btn-sm btn-success">Ver Produtos</a></td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editLoja(${loja.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteLoja(${loja.id})">Deletar</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function setupAddLojaForm() {
    const form = document.getElementById('addLojaForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const data = {
                nome: document.getElementById('nome').value,
                descricao: document.getElementById('descricao').value,
                telefone: document.getElementById('telefone').value,
                endereco: document.getElementById('endereco').value,
                taxa_entrega: parseFloat(document.getElementById('taxa_entrega').value) || 0,
                pix: document.getElementById('pix').value,
                user_id: JSON.parse(localStorage.getItem('userData') || '{}').id,
                plano_id: 1 // Default plan
            };

            try {
                const response = await createLoja(data);

                if (response.erro) {
                    alert('Erro: ' + response.erro);
                } else {
                    alert('Loja criada com sucesso!');
                    form.reset();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addLojaModal'));
                    modal.hide();
                    loadLojas();
                }
            } catch (error) {
                alert('Erro ao criar loja');
            }
        });
    }
}

async function editLoja(id) {
    // You would implement edit functionality here
    alert('Funcionalidade de edição em desenvolvimento');
}

async function deleteLoja(id) {
    if (confirm('Tem certeza que deseja deletar esta loja?')) {
        try {
            const response = await deleteLoja(id);

            if (response.erro) {
                alert('Erro: ' + response.erro);
            } else {
                alert('Loja deletada com sucesso!');
                loadLojas();
            }
        } catch (error) {
            alert('Erro ao deletar loja');
        }
    }
}
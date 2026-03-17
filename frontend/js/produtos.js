// Check authentication
checkAuth();

// Global variables
let currentLojaId = null;

// Load produtos on page load
document.addEventListener('DOMContentLoaded', function() {
    loadLojas();
    setupAddProdutoForm();
    setupLojaSelect();
});

async function loadLojas() {
    try {
        const lojas = await getLojas();
        const lojaSelect = document.getElementById('lojaSelect');
        const prodLojaSelect = document.getElementById('prod_loja');

        lojaSelect.innerHTML += lojas.map(loja => `<option value="${loja.id}">${loja.nome}</option>`).join('');
        prodLojaSelect.innerHTML = lojas.map(loja => `<option value="${loja.id}">${loja.nome}</option>`).join('');

        if (lojas.length > 0) {
            currentLojaId = lojas[0].id;
            loadProdutos(lojas[0].id);
        }
    } catch (error) {
        console.error('Erro ao carregar lojas:', error);
    }
}

function setupLojaSelect() {
    const lojaSelect = document.getElementById('lojaSelect');
    lojaSelect.addEventListener('change', function(e) {
        currentLojaId = e.target.value;
        if (currentLojaId) {
            loadProdutos(currentLojaId);
        }
    });
}

async function loadProdutos(lojaId) {
    try {
        const produtos = await getProdutos(lojaId);
        displayProdutos(produtos);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

function displayProdutos(produtos) {
    const container = document.getElementById('produtosContainer');
    container.innerHTML = '';

    if (produtos.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center">Nenhum produto encontrado</p></div>';
        return;
    }

    produtos.forEach(produto => {
        const card = `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card product-card">
                    ${produto.imagem ? `<img src="${produto.imagem}" class="product-image" alt="${produto.nome}">` : '<div class="product-image" style="background-color: #f0f0f0;"></div>'}
                    <div class="product-info">
                        <h6 class="product-name">${produto.nome}</h6>
                        <p class="text-muted small">${produto.descricao || ''}</p>
                        <p class="text-muted small"><strong>Categoria:</strong> ${produto.categoria}</p>
                        <p class="product-price">R$ ${parseFloat(produto.preco).toFixed(2)}</p>
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-sm btn-warning" onclick="editProduto(${produto.id})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteProduto(${produto.id})">Deletar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

function setupAddProdutoForm() {
    const form = document.getElementById('addProdutoForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const data = {
                nome: document.getElementById('prod_nome').value,
                descricao: document.getElementById('prod_descricao').value,
                preco: parseFloat(document.getElementById('prod_preco').value),
                imagem: document.getElementById('prod_imagem').value,
                categoria: document.getElementById('prod_categoria').value,
                loja_id: parseInt(document.getElementById('prod_loja').value)
            };

            try {
                const response = await createProduto(data);

                if (response.erro) {
                    alert('Erro: ' + response.erro);
                } else {
                    alert('Produto criado com sucesso!');
                    form.reset();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addProdutoModal'));
                    modal.hide();
                    loadProdutos(data.loja_id);
                }
            } catch (error) {
                alert('Erro ao criar produto');
            }
        });
    }
}

function editProduto(id) {
    alert('Funcionalidade de edição em desenvolvimento');
}

async function deleteProduto(id) {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
        try {
            const response = await deleteProduto(id);

            if (response.erro) {
                alert('Erro: ' + response.erro);
            } else {
                alert('Produto deletado com sucesso!');
                if (currentLojaId) {
                    loadProdutos(currentLojaId);
                }
            }
        } catch (error) {
            alert('Erro ao deletar produto');
        }
    }
}
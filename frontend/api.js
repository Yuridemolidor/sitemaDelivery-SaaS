// ========================================
// API CLIENT - Delivery SaaS
// ========================================

const API_BASE_URL = "http://localhost:3000/api";

const api = {
    // TOKEN MANAGEMENT
    getToken: () => localStorage.getItem('token'),
    
    makeRequest: async (method, endpoint, data = null) => {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api.getToken()}`
            }
        };

        if (data) options.body = JSON.stringify(data);

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                throw new Error('Sessão expirada');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.erro || 'Erro na requisição');
            }

            return await response.json();
        } catch (error) {
            console.error(`Erro ao chamar ${endpoint}:`, error);
            throw error;
        }
    },

    // ========================================
    // AUTH
    // ========================================
    register: (email, senha, tipo, nome, telefone) => 
        api.makeRequest('POST', '/auth/register', { email, senha, tipo, nome, telefone }),
    
    login: (email, senha) => 
        api.makeRequest('POST', '/auth/login', { email, senha }),

    // ========================================
    // USERS
    // ========================================
    getAllUsers: () => 
        api.makeRequest('GET', '/users'),
    
    getUserById: (id) => 
        api.makeRequest('GET', `/users/${id}`),
    
    updateUser: (id, dados) => 
        api.makeRequest('PUT', `/users/${id}`, dados),
    
    changePassword: (id, senha_atual, senha_nova) => 
        api.makeRequest('POST', `/users/${id}/change-password`, { senha_atual, senha_nova }),

    // ========================================
    // LOJAS
    // ========================================
    createLoja: (dados) => 
        api.makeRequest('POST', '/lojas', dados),
    
    getLojas: () => 
        api.makeRequest('GET', '/lojas'),
    
    getLojaById: (id) => 
        api.makeRequest('GET', `/lojas/${id}`),
    
    getMyLoja: () => 
        api.makeRequest('GET', '/lojas/minha-loja'),
    
    updateLoja: (id, dados) => 
        api.makeRequest('PUT', `/lojas/${id}`, dados),
    
    deleteLoja: (id) => 
        api.makeRequest('DELETE', `/lojas/${id}`),
    
    getLojaStats: (id) => 
        api.makeRequest('GET', `/lojas/${id}/stats`),

    // ========================================
    // PRODUTOS
    // ========================================
    createProduto: (dados) => 
        api.makeRequest('POST', '/produtos', dados),
    
    getProdutos: (lojaId) => 
        api.makeRequest('GET', `/produtos?loja_id=${lojaId}`),
    
    getProdutoById: (id) => 
        api.makeRequest('GET', `/produtos/${id}`),
    
    updateProduto: (id, dados) => 
        api.makeRequest('PUT', `/produtos/${id}`, dados),
    
    deleteProduto: (id) => 
        api.makeRequest('DELETE', `/produtos/${id}`),
    
    searchProdutos: (termo, lojaId = null) => {
        let url = `/produtos/search?termo=${termo}`;
        if (lojaId) url += `&loja_id=${lojaId}`;
        return api.makeRequest('GET', url);
    },

    // ========================================
    // PEDIDOS
    // ========================================
    createPedido: (dados) => 
        api.makeRequest('POST', '/pedidos', dados),
    
    getPedidos: (lojaId = null) => {
        let url = '/pedidos';
        if (lojaId) url += `?loja_id=${lojaId}`;
        return api.makeRequest('GET', url);
    },
    
    getPedidoById: (id) => 
        api.makeRequest('GET', `/pedidos/${id}`),
    
    updateStatusPedido: (id, status) => 
        api.makeRequest('PUT', `/pedidos/${id}`, { status_pedido: status }),
    
    updatePedido: (id, dados) => 
        api.makeRequest('PUT', `/pedidos/${id}`, dados),
    
    deletePedido: (id) => 
        api.makeRequest('DELETE', `/pedidos/${id}`),
    
    getPedidoStats: (lojaId = null) => {
        let url = '/pedidos/stats';
        if (lojaId) url += `?loja_id=${lojaId}`;
        return api.makeRequest('GET', url);
    },

    // ========================================
    // ADMIN (Dashboard da Loja)
    // ========================================
    getAdminDashboard: () => 
        api.makeRequest('GET', '/admin/dashboard'),
    
    getRelatorioPedidos: () => 
        api.makeRequest('GET', '/admin/relatorio-pedidos'),
    
    getLojasMaisVendidas: () => 
        api.makeRequest('GET', '/admin/lojas-mais-vendidas'),
    
    getProdutosMaisVendidos: () => 
        api.makeRequest('GET', '/admin/produtos-mais-vendidos'),

    // ========================================
    // ADMIN MASTER (Gerenciamento da Plataforma)
    // ========================================
    getDashboardExecutivo: () => 
        api.makeRequest('GET', '/admin-master/dashboard'),
    
    getTodasAsLojas: (filters = {}) => {
        let url = '/admin-master/lojas';
        const params = new URLSearchParams();
        if (filters.status_loja) params.append('status_loja', filters.status_loja);
        if (filters.status_assinatura) params.append('status_assinatura', filters.status_assinatura);
        if (filters.search) params.append('search', filters.search);
        if (params.toString()) url += '?' + params.toString();
        return api.makeRequest('GET', url);
    },
    
    getDetalheLojaCompleto: (lojaId) => 
        api.makeRequest('GET', `/admin-master/lojas/${lojaId}`),
    
    alterarStatusLoja: (lojaId, status_loja, motivo_admin) => 
        api.makeRequest('PUT', `/admin-master/lojas/${lojaId}/status`, { status_loja, motivo_admin }),
    
    renovarAssinatura: (lojaId, dias_extensao = 30, plano_id = null) => 
        api.makeRequest('POST', `/admin-master/lojas/${lojaId}/renovar-assinatura`, { plano_id, dias_extensao }),
    
    getRelatorioReceita: (data_inicio = null, data_fim = null) => {
        let url = '/admin-master/receita/relatorio';
        const params = new URLSearchParams();
        if (data_inicio) params.append('data_inicio', data_inicio);
        if (data_fim) params.append('data_fim', data_fim);
        if (params.toString()) url += '?' + params.toString();
        return api.makeRequest('GET', url);
    },
    
    getProblemas: () => 
        api.makeRequest('GET', '/admin-master/problemas'),
};

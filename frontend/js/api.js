const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get token
function getToken() {
    return localStorage.getItem('token');
}

// Helper function to set token
function setToken(token) {
    localStorage.setItem('token', token);
}

// Helper function to remove token
function removeToken() {
    localStorage.removeItem('token');
}

// Helper function to check if user is authenticated
function isAuthenticated() {
    return getToken() != null;
}

// Helper function to get auth headers
function getAuthHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `${token}` : ''
    };
}

// API Functions

// Auth
async function login(email, senha) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, senha })
    });
    return await response.json();
}

async function register(nome, email, senha, tipo) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ nome, email, senha, tipo })
    });
    return await response.json();
}

async function logout() {
    removeToken();
    window.location.href = 'login.html';
}

// Users
async function getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function getUserById(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function updateUser(id, nome, email) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ nome, email })
    });
    return await response.json();
}

async function deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return await response.json();
}

// Lojas
async function getLojas() {
    const response = await fetch(`${API_BASE_URL}/lojas`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function getLojaById(id) {
    const response = await fetch(`${API_BASE_URL}/lojas/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function getLojasByUser(user_id) {
    const response = await fetch(`${API_BASE_URL}/lojas/user/${user_id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function createLoja(data) {
    const response = await fetch(`${API_BASE_URL}/lojas`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function updateLoja(id, data) {
    const response = await fetch(`${API_BASE_URL}/lojas/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function deleteLoja(id) {
    const response = await fetch(`${API_BASE_URL}/lojas/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function getLojaStats(id) {
    const response = await fetch(`${API_BASE_URL}/lojas/${id}/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

// Produtos
async function getProdutos(loja_id) {
    const response = await fetch(`${API_BASE_URL}/produtos/loja/${loja_id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function getProdutoById(id) {
    const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function searchProdutos(params) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/produtos/search?${queryString}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function createProduto(data) {
    const response = await fetch(`${API_BASE_URL}/produtos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function updateProduto(id, data) {
    const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function deleteProduto(id) {
    const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return await response.json();
}

// Pedidos
async function getPedidos() {
    const response = await fetch(`${API_BASE_URL}/pedidos`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function getPedidoById(id) {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function getPedidosByLoja(loja_id) {
    const response = await fetch(`${API_BASE_URL}/pedidos/loja/${loja_id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function createPedido(data) {
    const response = await fetch(`${API_BASE_URL}/pedidos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function updatePedido(id, data) {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function updatePedidoStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    return await response.json();
}

async function deletePedido(id) {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function getPedidoStats(loja_id) {
    const response = await fetch(`${API_BASE_URL}/pedidos/loja/${loja_id}/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

// Admin
async function getAdminDashboard() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function getRelatorioPedidos(data_inicio, data_fim) {
    const params = new URLSearchParams();
    if (data_inicio) params.append('data_inicio', data_inicio);
    if (data_fim) params.append('data_fim', data_fim);
    const response = await fetch(`${API_BASE_URL}/admin/relatorio/pedidos?${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function getLojasMaisVendidas() {
    const response = await fetch(`${API_BASE_URL}/admin/lojas/mais-vendidas`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function getProdutosMaisVendidos(limit = 10) {
    const response = await fetch(`${API_BASE_URL}/admin/produtos/mais-vendidos?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}

async function getEstatisticasGerais() {
    const response = await fetch(`${API_BASE_URL}/admin/estatisticas/gerais`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
}
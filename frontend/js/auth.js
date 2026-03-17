// Check if already logged in
window.addEventListener('DOMContentLoaded', function() {
    if (isAuthenticated() && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
});

// Handle login form
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const errorMessage = document.getElementById('errorMessage');

            try {
                const response = await login(email, senha);

                if (response.erro) {
                    errorMessage.textContent = response.erro;
                    errorMessage.style.display = 'block';
                } else {
                    setToken(response.token);
                    window.location.href = 'dashboard.html';
                }
            } catch (error) {
                errorMessage.textContent = 'Erro ao fazer login. Tente novamente.';
                errorMessage.style.display = 'block';
            }
        });
    }
});

// Redirect to login if not authenticated
function checkAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}
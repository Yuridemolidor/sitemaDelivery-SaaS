// Handle register form
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const tipo = document.getElementById('tipo').value;
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');

            // Hide both messages initially
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';

            try {
                const response = await register(nome, email, senha, tipo);

                if (response.erro) {
                    errorMessage.textContent = response.erro;
                    errorMessage.style.display = 'block';
                } else {
                    successMessage.textContent = 'Cadastro realizado com sucesso! Redirecionando...';
                    successMessage.style.display = 'block';
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                }
            } catch (error) {
                errorMessage.textContent = 'Erro ao criar conta. Tente novamente.';
                errorMessage.style.display = 'block';
            }
        });
    }
});
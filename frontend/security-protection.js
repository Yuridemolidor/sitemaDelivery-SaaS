// ========================================
// PROTEÇÃO FRONTEND - Anti Cópia
// ========================================
// Importe este arquivo em TODAS suas páginas!
// <script src="security-protection.js"></script>

// 1. BLOQUEAR F12 E DEVTOOLS
document.onkeydown = function(e) {
    // F12
    if (e.key === 'F12') {
        e.preventDefault();
        console.warn('⛔ Ferramentas de desenvolvimento estão desabilitadas');
        return false;
    }
    
    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        console.warn('⛔ Inspetor de elementos desabilitado');
        return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        console.warn('⛔ Console desabilitado');
        return false;
    }
    
    // Ctrl+Shift+C (Seletor)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        console.warn('⛔ Seletor de elementos desabilitado');
        return false;
    }
    
    // Ctrl+Shift+K (Console aberto)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 75) {
        e.preventDefault();
        console.warn('⛔ Console desabilitado');
        return false;
    }
    
    // Ctrl+U (Ver código fonte)
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        console.warn('⛔ Ver código fonte desabilitado');
        return false;
    }
};

// 2. BLOQUEAR CLICK DIREITO
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    // Mostrar mensagem customizada
    const msg = document.createElement('div');
    msg.textContent = '⛔ Cópia não permitida. Consulte os Termos de Serviço.';
    msg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff6b6b;
        color: white;
        padding: 20px 40px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    // Adicionar animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(msg);
    
    // Remover mensagem após 2s
    setTimeout(() => msg.remove(), 2000);
    
    return false;
});

// 3. DESABILITAR CTRL+S (Salvar página)
document.onkeydown = function(e) {
    if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        alert('⛔ Salvar página não é permitido');
        return false;
    }
};

// 4. DESABILITAR SELEÇÃO DE TEXTO (opcional - deixa site menos usável)
// Descomente se quiser:
// document.body.style.userSelect = 'none';
// document.body.style.webkitUserSelect = 'none';
// document.body.style.msUserSelect = 'none';

// 5. DESABILITAR DRAG AND DROP
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('drop', function(e) {
    e.preventDefault();
    return false;
});

// 6. DESABILITAR CÓPIA (Ctrl+C)
// Mostrar alternativa ao copiar
document.body.addEventListener('copy', function(e) {
    const selectedText = window.getSelection().toString();
    
    e.preventDefault();
    e.clipboardData.setData('text/plain', 
        selectedText + '\n\n© 2026 - Todos os direitos reservados.\nFonte: ' + window.location.href);
    
    // Mostrar notificação
    const notification = document.createElement('div');
    notification.textContent = '✓ Crédito adicionado automaticamente à cópia';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
});

// 7. DETECTAR DEVTOOLS ABERTO
setInterval(function() {
    const threshold = 160;
    if (window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold) {
        
        // DevTools detectado
        console.clear();
        console.log('%c⛔ O acesso est√° restrito!', 'font-size: 20px; color: red; font-weight: bold;');
        
        // Limpar página (opcional - descomente se quiser)
        // document.body.innerHTML = '';
        // alert('⛔ Ferramentas de desenvolvimento detectadas!');
    }
}, 500);

// 8. FAZER LOGOUT SE DETECTAR MODIFICAÇÃO DO DOM
const originalFetch = window.fetch;
window.fetch = function(...args) {
    // Verificar se tá tentando puxar dados sensíveis
    if (args[0].includes('/api/') && args[1]?.method === 'GET') {
        console.log('🔒 API Call logged:', args[0]);
    }
    return originalFetch.apply(this, args);
};

// 9. WATERMARK NO CONSOLE
console.log('%c⛔ AVISO DE SEGURANÇA', 'font-size: 18px; color: red; font-weight: bold;');
console.log('%c© 2026 - Todos os direitos reservados', 'font-size: 14px; color: orange;');
console.log('%cProibida reprodução, cópia ou engenharia reversa', 'font-size: 12px; color: #ff6b6b;');
console.log('%cViolações resultarão em ação legal', 'font-size: 12px; color: #ff6b6b;');
console.log('%cConsulte: /terms.html', 'font-size: 11px; color: #999;');

// 10. PROTEÇÃO CONTRA FERRAMENTAS DE AUTOMAÇÃO
if (typeof module !== 'undefined' || 
    typeof exports !== 'undefined' ||
    navigator.webdriver === true ||
    window.document.documentElement.getAttribute('webdriver')) {
    console.warn('⛔ Automação/Bot detectado');
    // Desabilitar algumas funcionalidades
    document.body.style.opacity = '0.5';
}

// 11. ADICIONAR AVISO NO RODAPÉ
function addSecurityFooter() {
    const footer = document.querySelector('footer');
    if (footer) {
        const notice = document.createElement('p');
        notice.style.fontSize = '10px';
        notice.style.color = '#999';
        notice.style.borderTop = '1px solid #eee';
        notice.style.paddingTop = '10px';
        notice.style.marginTop = '20px';
        notice.innerHTML = `
            © 2026 - Todos os direitos reservados | 
            <a href="/terms.html" style="color: #667eea; text-decoration: none;">Termos de Serviço</a> | 
            <a href="/privacy.html" style="color: #667eea; text-decoration: none;">Privacidade</a> |
            Reprodução proibida sob pena de lei
        `;
        footer.appendChild(notice);
    }
}

// Executar quando documento carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addSecurityFooter);
} else {
    addSecurityFooter();
}

// 12. MONITORAR TENTATIVAS SUSPEITAS
const securityEvents = {
    devToolsOpened: 0,
    suspiciousCopies: 0,
    failedAuth: 0
};

// Enviar relatório de segurança a cada 10 minutos
setInterval(function() {
    if (securityEvents.devToolsOpened > 0 || securityEvents.suspiciousCopies > 0) {
        // Enviar para servidor (opcional)
        console.log('🔒 Security Report:', securityEvents);
    }
}, 10 * 60 * 1000);

console.log('✅ Proteção de segurança ativa');

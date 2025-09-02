// Manejador del logo StudiMarket
document.addEventListener('DOMContentLoaded', function() {
    const logoBtn = document.getElementById('logo-btn');
    const loadingScreen = document.getElementById('loading-screen');
    
    if (logoBtn && loadingScreen) {
        logoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Mostrar pantalla de carga
            loadingScreen.style.display = 'flex';
            loadingScreen.classList.add('show');
            
            // Ocultar después de la animación y recargar página
            setTimeout(() => {
                loadingScreen.classList.remove('show');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    // Recargar la página para mostrar todos los productos
                    window.location.reload();
                }, 500);
            }, 2000); // Mostrar animación por 2 segundos
        });
        
        // Agregar efecto hover al logo
        logoBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.textShadow = '0 2px 4px rgba(66, 133, 244, 0.3)';
        });
        
        logoBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.textShadow = 'none';
        });
    }
});

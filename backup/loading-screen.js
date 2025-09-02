// Funciones para la pantalla de carga
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.minimumLoadTime = 2500; // Tiempo mínimo en milisegundos
        this.startTime = Date.now();
        this.resourcesLoaded = false;
        this.fadeOutDuration = 800; // Duración del fade-out en milisegundos
    }

    // Inicializar la pantalla de carga
    init() {
        // Prevenir scroll mientras carga
        document.body.style.overflow = 'hidden';
        
        // Simular carga de recursos
        this.simulateResourceLoading();
        
        // Escuchar cuando todo esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.onDOMReady();
            });
        } else {
            this.onDOMReady();
        }
    }

    // Simular carga de recursos adicionales
    simulateResourceLoading() {
        // Simular carga de productos, imágenes, etc.
        setTimeout(() => {
            this.resourcesLoaded = true;
            this.checkAndHide();
        }, 1500);
    }

    // Cuando el DOM está listo
    onDOMReady() {
        // Esperar a que las imágenes se carguen
        this.waitForImages().then(() => {
            this.checkAndHide();
        });
    }

    // Esperar a que se carguen las imágenes importantes
    waitForImages() {
        return new Promise((resolve) => {
            const images = document.querySelectorAll('img');
            let loadedImages = 0;
            const totalImages = images.length;

            if (totalImages === 0) {
                resolve();
                return;
            }

            const checkAllLoaded = () => {
                loadedImages++;
                if (loadedImages >= totalImages) {
                    resolve();
                }
            };

            images.forEach(img => {
                if (img.complete) {
                    checkAllLoaded();
                } else {
                    img.addEventListener('load', checkAllLoaded);
                    img.addEventListener('error', checkAllLoaded); // También contar errores
                }
            });

            // Timeout de seguridad
            setTimeout(resolve, 3000);
        });
    }

    // Verificar si se puede ocultar la pantalla
    checkAndHide() {
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minimumLoadTime - elapsedTime);

        if (this.resourcesLoaded) {
            setTimeout(() => {
                this.hide();
            }, remainingTime);
        }
    }

    // Ocultar la pantalla de carga
    hide() {
        if (!this.loadingScreen) return;

        // Agregar clase de fade-out
        this.loadingScreen.classList.add('fade-out');

        // Restaurar scroll después del fade-out
        setTimeout(() => {
            document.body.style.overflow = 'auto';
            
            // Remover completamente del DOM
            if (this.loadingScreen.parentNode) {
                this.loadingScreen.parentNode.removeChild(this.loadingScreen);
            }
            
            // Disparar evento personalizado para otros scripts
            document.dispatchEvent(new CustomEvent('loadingComplete'));
            
        }, this.fadeOutDuration);
    }

    // Método público para forzar el ocultamiento
    forceHide() {
        this.resourcesLoaded = true;
        this.checkAndHide();
    }
}

// Inicializar la pantalla de carga inmediatamente
const loadingScreen = new LoadingScreen();

// Inicializar tan pronto como se cargue el script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadingScreen.init();
    });
} else {
    loadingScreen.init();
}

// Hacer disponible globalmente para debugging
window.loadingScreen = loadingScreen;

// Opcional: Escuchar eventos personalizados para mostrar progreso
document.addEventListener('resourceLoaded', function(e) {
    console.log('Recurso cargado:', e.detail);
});

// Evento cuando la carga está completa
document.addEventListener('loadingComplete', function() {
    console.log('🎉 Carga completa - StudiMarket listo!');
    
    // Aquí puedes ejecutar código adicional después de la carga
    // Por ejemplo, inicializar animaciones, cargar datos, etc.
    if (typeof initializeApp === 'function') {
        initializeApp();
    }
});

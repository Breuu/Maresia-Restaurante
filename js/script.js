// ===== CONFIGURAÇÕES GLOBAIS =====
const CONFIG = {
    whatsappNumber: '5511999999999', // Número do WhatsApp (configurável)
    animationDelay: 100,
    scrollOffset: 80,
    lazyLoadOffset: 50
};

// ===== UTILITÁRIOS =====
const Utils = {
    // Debounce para otimizar performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle para scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Smooth scroll para links internos
    smoothScroll(target, offset = CONFIG.scrollOffset) {
        const element = document.querySelector(target);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    },

    // Verificar se elemento está visível
    isElementInViewport(el, offset = 0) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= -offset &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Formatar número para WhatsApp
    formatWhatsAppNumber(number) {
        return number.replace(/\D/g, '');
    }
};

// ===== NAVEGAÇÃO E MENU MOBILE =====
class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollEffect();
        this.setupActiveLink();
    }

    setupEventListeners() {
        // Toggle menu mobile
        this.navToggle?.addEventListener('click', () => this.toggleMobileMenu());

        // Fechar menu ao clicar em link
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                
                if (target.startsWith('#')) {
                    Utils.smoothScroll(target);
                    this.closeMobileMenu();
                }
            });
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!this.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Fechar menu com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        const isOpen = this.navMenu.classList.contains('active');
        
        this.navMenu.classList.toggle('active');
        this.navToggle.classList.toggle('active');
        
        // Atualiza atributos de acessibilidade
        this.navToggle.setAttribute('aria-expanded', !isOpen);
        this.navToggle.setAttribute('aria-label', isOpen ? 'Abrir menu de navegação' : 'Fechar menu de navegação');
        
        // Prevenir scroll do body quando menu está aberto
        document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    }

    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
        document.body.style.overflow = '';
    }

    setupScrollEffect() {
        const handleScroll = Utils.throttle(() => {
            if (window.scrollY > 100) {
                this.navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                this.navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                this.navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                this.navbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    setupActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        
        const handleScroll = Utils.throttle(() => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top;
                if (sectionTop <= 100) {
                    current = section.getAttribute('id');
                }
            });

            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }
}

// ===== FILTROS DO CARDÁPIO =====
class MenuFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll('.cardapio .filter-btn');
        this.menuItems = document.querySelectorAll('.cardapio-item');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                this.filterItems(filter);
                this.updateActiveButton(button);
            });
        });
    }

    filterItems(filter) {
        this.menuItems.forEach((item, index) => {
            const category = item.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                item.style.display = 'block';
                item.setAttribute('aria-hidden', 'false');
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.setAttribute('aria-hidden', 'true');
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
        
        // Anunciar mudança para leitores de tela
        const visibleCount = document.querySelectorAll('.cardapio-item[aria-hidden="false"]').length;
        const activeButton = document.querySelector('.cardapio .filter-btn.active');
        const announcement = `Filtro aplicado: ${activeButton.textContent}. ${visibleCount} itens visíveis.`;
        this.announceToScreenReader(announcement);
    }

    updateActiveButton(activeButton) {
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
            button.setAttribute('aria-selected', 'false');
        });
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-selected', 'true');
    }
    
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// ===== FILTROS DA GALERIA =====
class GalleryFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll('.galeria .filter-btn');
        this.galleryItems = document.querySelectorAll('.galeria-item');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                this.filterItems(filter);
                this.updateActiveButton(button);
            });
        });
    }

    filterItems(filter) {
        this.galleryItems.forEach((item, index) => {
            const category = item.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, index * 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }

    updateActiveButton(activeButton) {
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
}

// ===== LIGHTBOX DA GALERIA =====
class Lightbox {
    constructor() {
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightbox-img');
        this.lightboxCaption = document.getElementById('lightbox-caption');
        this.closeBtn = document.querySelector('.lightbox-close');
        this.galleryItems = document.querySelectorAll('.galeria-item');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Abrir lightbox ao clicar na imagem
        this.galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                this.openLightbox(img.src, img.alt);
            });
        });

        // Fechar lightbox
        this.closeBtn?.addEventListener('click', () => this.closeLightbox());
        
        this.lightbox?.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.lightbox.style.display === 'block') {
                this.closeLightbox();
            }
        });

        // Navegação com setas
        document.addEventListener('keydown', (e) => {
            if (this.lightbox.style.display === 'block') {
                if (e.key === 'ArrowLeft') {
                    this.previousImage();
                } else if (e.key === 'ArrowRight') {
                    this.nextImage();
                }
            }
        });
    }

    openLightbox(src, caption) {
        this.lightboxImg.src = src;
        this.lightboxCaption.textContent = caption;
        this.lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Animação de entrada
        this.lightbox.style.opacity = '0';
        setTimeout(() => {
            this.lightbox.style.opacity = '1';
        }, 10);
    }

    closeLightbox() {
        this.lightbox.style.opacity = '0';
        setTimeout(() => {
            this.lightbox.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    getCurrentImageIndex() {
        const currentSrc = this.lightboxImg.src;
        const images = Array.from(this.galleryItems).map(item => item.querySelector('img'));
        return images.findIndex(img => img.src === currentSrc);
    }

    previousImage() {
        const images = Array.from(this.galleryItems).map(item => item.querySelector('img'));
        const currentIndex = this.getCurrentImageIndex();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        const prevImg = images[prevIndex];
        
        this.lightboxImg.src = prevImg.src;
        this.lightboxCaption.textContent = prevImg.alt;
    }

    nextImage() {
        const images = Array.from(this.galleryItems).map(item => item.querySelector('img'));
        const currentIndex = this.getCurrentImageIndex();
        const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        const nextImg = images[nextIndex];
        
        this.lightboxImg.src = nextImg.src;
        this.lightboxCaption.textContent = nextImg.alt;
    }
}

// ===== INTEGRAÇÃO WHATSAPP =====
class WhatsAppIntegration {
    constructor() {
        this.whatsappButtons = document.querySelectorAll('.whatsapp-btn');
        this.whatsappNumber = CONFIG.whatsappNumber;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.whatsappButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const message = button.getAttribute('data-message') || 'Olá! Gostaria de entrar em contato.';
                this.openWhatsApp(message);
            });
        });
    }

    openWhatsApp(message) {
        const formattedNumber = Utils.formatWhatsAppNumber(this.whatsappNumber);
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
        
        // Abrir em nova aba
        window.open(whatsappUrl, '_blank');
        
        // Analytics (opcional)
        this.trackWhatsAppClick(message);
    }

    trackWhatsAppClick(message) {
        // Implementar tracking de analytics se necessário
        console.log('WhatsApp clicked:', message);
        
        // Exemplo com Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'whatsapp_click', {
                'event_category': 'engagement',
                'event_label': message
            });
        }
    }
}

// ===== ANIMAÇÕES DE SCROLL =====
class ScrollAnimations {
    constructor() {
        this.animatedElements = document.querySelectorAll('.cardapio-item, .galeria-item, .depoimento-item, .sobre-item');
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
}

// ===== LAZY LOADING DE IMAGENS =====
class LazyLoading {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        this.observerOptions = {
            rootMargin: `${CONFIG.lazyLoadOffset}px`
        };
        
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback para navegadores antigos
            this.loadAllImages();
        }
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.images.forEach(img => {
            observer.observe(img);
        });
    }

    loadImage(img) {
        img.classList.add('loading');
        
        img.addEventListener('load', () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
        });

        img.addEventListener('error', () => {
            img.classList.remove('loading');
            img.classList.add('error');
            // Implementar imagem de fallback se necessário
        });
    }

    loadAllImages() {
        this.images.forEach(img => this.loadImage(img));
    }
}

// ===== FORMULÁRIO NEWSLETTER =====
class Newsletter {
    constructor() {
        this.form = document.querySelector('.newsletter-form');
        this.input = this.form?.querySelector('input[type="email"]');
        this.button = this.form?.querySelector('button');
        
        this.init();
    }

    init() {
        if (this.form) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    async handleSubmit() {
        const email = this.input.value.trim();
        
        if (!this.validateEmail(email)) {
            this.showMessage('Por favor, insira um e-mail válido.', 'error');
            return;
        }

        this.setLoading(true);

        try {
            // Simular envio (implementar integração real conforme necessário)
            await this.simulateSubmission(email);
            this.showMessage('Obrigado! Você foi inscrito com sucesso.', 'success');
            this.input.value = '';
        } catch (error) {
            this.showMessage('Erro ao inscrever. Tente novamente.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async simulateSubmission(email) {
        // Simular delay de rede
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Newsletter subscription:', email);
                resolve();
            }, 1000);
        });
    }

    setLoading(isLoading) {
        this.button.disabled = isLoading;
        this.button.textContent = isLoading ? 'Inscrevendo...' : 'Inscrever';
    }

    showMessage(message, type) {
        // Remover mensagem anterior
        const existingMessage = this.form.querySelector('.newsletter-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Criar nova mensagem
        const messageElement = document.createElement('div');
        messageElement.className = `newsletter-message ${type}`;
        messageElement.textContent = message;
        
        this.form.appendChild(messageElement);

        // Remover mensagem após 5 segundos
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
}

// ===== PERFORMANCE E OTIMIZAÇÕES =====
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.preloadCriticalImages();
        this.setupServiceWorker();
        this.optimizeScrollPerformance();
    }

    preloadCriticalImages() {
        const criticalImages = [
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    optimizeScrollPerformance() {
        // Usar passive listeners para melhor performance
        const passiveEvents = ['scroll', 'touchstart', 'touchmove'];
        
        passiveEvents.forEach(event => {
            document.addEventListener(event, () => {}, { passive: true });
        });
    }
}

// ===== INICIALIZAÇÃO =====
class App {
    constructor() {
        this.components = [];
        this.init();
    }

    init() {
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Inicializar componentes principais
            this.components.push(new Navigation());
            this.components.push(new MenuFilter());
            this.components.push(new GalleryFilter());
            this.components.push(new Lightbox());
            this.components.push(new WhatsAppIntegration());
            this.components.push(new ScrollAnimations());
            this.components.push(new LazyLoading());
            this.components.push(new Newsletter());
            this.components.push(new PerformanceOptimizer());

            console.log('🌊 Maresia Restaurant - Site carregado com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar componentes:', error);
        }
    }
}

// ===== INICIALIZAR APLICAÇÃO =====
const app = new App();

// ===== EXPORTAR PARA TESTES (SE NECESSÁRIO) =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Navigation,
        MenuFilter,
        GalleryFilter,
        Lightbox,
        WhatsAppIntegration,
        Utils,
        CONFIG
    };
}
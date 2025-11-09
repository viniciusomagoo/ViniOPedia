// Configuração e constantes
const CONFIG = {
    animationDelay: 150
};

// Cache de elementos DOM
const DOM = {
    contributeBtn: null,
    feedbackBtn: null,
    modal: null,
    modalCloseBtn: null,
    closeModalBtn: null,
    
    init() {
        this.contributeBtn = document.getElementById('contribute-btn');
        this.feedbackBtn = document.getElementById('feedback-btn');
        this.modal = document.getElementById('feedback-modal');
        this.modalCloseBtn = this.modal?.querySelector('.modal-close');
        this.closeModalBtn = document.getElementById('close-modal-btn');
    }
};

// Gerenciador de Modal
const ModalManager = {
    open() {
        if (!DOM.modal) return;
        
        DOM.modal.hidden = false;
        document.body.style.overflow = 'hidden';
        
        // Focar no botão de fechar para acessibilidade
        setTimeout(() => {
            DOM.modalCloseBtn?.focus();
        }, 100);
    },

    close() {
        if (!DOM.modal) return;
        
        DOM.modal.hidden = true;
        document.body.style.overflow = '';
        
        // Retornar foco ao botão que abriu o modal
        DOM.feedbackBtn?.focus();
    },

    handleEscape(e) {
        if (e.key === 'Escape' && !DOM.modal.hidden) {
            this.close();
        }
    },

    handleClickOutside(e) {
        if (e.target === DOM.modal) {
            this.close();
        }
    }
};

// Gerenciador de Animações
const AnimationManager = {
    observeElements() {
        const sections = document.querySelectorAll('.content-section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * CONFIG.animationDelay);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        sections.forEach((section) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'all 0.6s ease';
            observer.observe(section);
        });
    },

    addHoverEffects() {
        const featureCards = document.querySelectorAll('.feature-card');
        const techBadges = document.querySelectorAll('.tech-badge');

        // Efeito parallax leve nos cards
        featureCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });

        // Efeito de pulsar nos badges
        techBadges.forEach(badge => {
            badge.addEventListener('mouseenter', () => {
                badge.style.animation = 'pulse 0.5s ease';
            });

            badge.addEventListener('animationend', () => {
                badge.style.animation = '';
            });
        });
    }
};

// Gerenciador de Eventos
const EventManager = {
    init() {
        this.setupButtonListeners();
        this.setupModalListeners();
        this.setupKeyboardNavigation();
    },

    setupButtonListeners() {
        // Botão de contribuir
        DOM.contributeBtn?.addEventListener('click', () => {
            ModalManager.open();
            this.trackEvent('contribute_button_clicked');
        });

        // Botão de feedback
        DOM.feedbackBtn?.addEventListener('click', () => {
            ModalManager.open();
            this.trackEvent('feedback_button_clicked');
        });
    },

    setupModalListeners() {
        // Fechar modal com X
        DOM.modalCloseBtn?.addEventListener('click', () => {
            ModalManager.close();
        });

        // Fechar modal com botão
        DOM.closeModalBtn?.addEventListener('click', () => {
            ModalManager.close();
        });

        // Fechar modal clicando fora
        DOM.modal?.addEventListener('click', (e) => {
            ModalManager.handleClickOutside(e);
        });
    },

    setupKeyboardNavigation() {
        // Escape para fechar modal
        document.addEventListener('keydown', (e) => {
            ModalManager.handleEscape(e);
        });

        // Trap focus dentro do modal quando aberto
        DOM.modal?.addEventListener('keydown', (e) => {
            if (DOM.modal.hidden) return;

            const focusableElements = DOM.modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    },

    trackEvent(eventName) {
        // Placeholder para analytics
        console.log(`Event tracked: ${eventName}`);
        
        // TODO: Integrar com Firebase Analytics
        // if (window.gtag) {
        //     gtag('event', eventName, {
        //         'event_category': 'engagement',
        //         'event_label': 'about_page'
        //     });
        // }
    }
};

// Gerenciador de Performance
const PerformanceManager = {
    init() {
        this.logPageLoadTime();
        this.setupPerformanceObserver();
    },

    logPageLoadTime() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.fetchStart;
                console.log(`⚡ Página carregada em: ${loadTime.toFixed(2)}ms`);
            });
        }
    },

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'largest-contentful-paint') {
                            console.log(`🎨 LCP: ${entry.renderTime || entry.loadTime}ms`);
                        }
                    }
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // Browser não suporta
            }
        }
    }
};

// Gerenciador de Scroll Suave
const ScrollManager = {
    init() {
        // Smooth scroll para âncoras (caso adicione no futuro)
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Adicionar classe quando rolar a página
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                document.getElementById('above')?.classList.add('scrolled');
            } else {
                document.getElementById('above')?.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });
    }
};

// Easter Egg - Konami Code
const EasterEgg = {
    sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
    current: 0,

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.key === this.sequence[this.current]) {
                this.current++;
                
                if (this.current === this.sequence.length) {
                    this.activate();
                    this.current = 0;
                }
            } else {
                this.current = 0;
            }
        });
    },

    activate() {
        console.log('🎮 Easter Egg Ativado!');
        document.body.style.animation = 'rainbow 2s infinite';
        
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
};

// Adicionar animação rainbow ao CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    DOM.init();
    EventManager.init();
    AnimationManager.observeElements();
    AnimationManager.addHoverEffects();
    ScrollManager.init();
    PerformanceManager.init();
    EasterEgg.init();
    
    console.log('✅ Página Sobre inicializada com sucesso!');
    console.log('💡 Dica: Tente o Konami Code! ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA');
});

// Exportar para uso global
window.ViniOpediaAbout = {
    ModalManager,
    AnimationManager,
    EventManager
};
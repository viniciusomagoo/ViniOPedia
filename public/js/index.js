// Configuração e constantes
const CONFIG = {
    debounceDelay: 300,
    minSearchLength: 2,
    maxResults: 10
};

// Cache de elementos DOM
const DOM = {
    searchBar: null,
    searchResults: null,
    init() {
        this.searchBar = document.getElementById('search-bar');
        this.searchResults = document.getElementById('search-results');
    }
};

// Utilidades
const Utils = {
    // Debounce para otimizar pesquisas
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

    // Sanitizar entrada do usuário
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    // Highlight de termos de busca
    highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    // Normalizar texto para busca
    normalizeText(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
};

// Gerenciador de busca
const SearchManager = {
    currentResults: [],
    
    // Dados de exemplo - integrar com Firebase depois
    mockData: [
        { id: 1, title: 'JavaScript', description: 'Linguagem de programação versátil' },
        { id: 2, title: 'Python', description: 'Linguagem de alto nível para múltiplos propósitos' },
        { id: 3, title: 'HTML', description: 'Linguagem de marcação para web' },
        { id: 4, title: 'CSS', description: 'Linguagem de estilos para web' },
        { id: 5, title: 'React', description: 'Biblioteca JavaScript para interfaces' },
        { id: 6, title: 'Node.js', description: 'Runtime JavaScript server-side' },
        { id: 7, title: 'Firebase', description: 'Plataforma de desenvolvimento Google' },
        { id: 8, title: 'Git', description: 'Sistema de controle de versão' },
        { id: 9, title: 'TypeScript', description: 'Superset tipado de JavaScript' },
        { id: 10, title: 'Vue.js', description: 'Framework JavaScript progressivo' }
    ],

    // Realizar busca
    search(query) {
        if (!query || query.length < CONFIG.minSearchLength) {
            this.currentResults = [];
            return [];
        }

        const normalizedQuery = Utils.normalizeText(query);
        
        this.currentResults = this.mockData.filter(item => {
            const normalizedTitle = Utils.normalizeText(item.title);
            const normalizedDesc = Utils.normalizeText(item.description);
            return normalizedTitle.includes(normalizedQuery) || 
                   normalizedDesc.includes(normalizedQuery);
        }).slice(0, CONFIG.maxResults);

        return this.currentResults;
    },

    // Integração futura com Firebase
    async searchFirebase(query) {
        // TODO: Implementar busca no Firebase
        // const db = firebase.firestore();
        // const results = await db.collection('articles')
        //     .where('title', '>=', query)
        //     .where('title', '<=', query + '\uf8ff')
        //     .limit(CONFIG.maxResults)
        //     .get();
        // return results.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};

// Gerenciador de UI
const UIManager = {
    // Renderizar resultados
    renderResults(results, query) {
        if (!results || results.length === 0) {
            this.showEmptyState(query);
            DOM.searchBar.setAttribute('aria-expanded', 'false');
            return;
        }

        const html = results.map((result, index) => `
            <div class="search-result-item" data-id="${result.id}" role="option" aria-selected="false" id="result-${index}">
                <div class="result-title">${Utils.highlightText(Utils.sanitizeInput(result.title), query)}</div>
                <div class="result-description">${Utils.highlightText(Utils.sanitizeInput(result.description), query)}</div>
            </div>
        `).join('');

        DOM.searchResults.innerHTML = html;
        DOM.searchResults.classList.add('active');
        DOM.searchBar.setAttribute('aria-expanded', 'true');
        this.attachResultListeners();
    },

    // Mostrar estado vazio
    showEmptyState(query) {
        if (!query || query.length < CONFIG.minSearchLength) {
            this.clearResults();
            return;
        }

        DOM.searchResults.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">Nenhum resultado encontrado para "${Utils.sanitizeInput(query)}"</div>
            </div>
        `;
        DOM.searchResults.classList.add('active');
    },

    // Limpar resultados
    clearResults() {
        DOM.searchResults.innerHTML = '';
        DOM.searchResults.classList.remove('active');
    },

    // Adicionar listeners aos resultados
    attachResultListeners() {
        const items = DOM.searchResults.querySelectorAll('.search-result-item');
        items.forEach(item => {
            item.addEventListener('click', this.handleResultClick.bind(this));
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.handleResultClick.call(this, e);
                }
            });
            item.setAttribute('tabindex', '0');
        });
    },

    // Lidar com clique em resultado
    handleResultClick(e) {
        const item = e.currentTarget;
        const id = item.dataset.id;
        const result = SearchManager.currentResults.find(r => r.id == id);
        
        if (result) {
            console.log('Resultado selecionado:', result);
            // TODO: Navegar para página do artigo
            // window.location.href = `artigo.html?id=${id}`;
            
            // Feedback visual
            item.style.backgroundColor = '#e8f4f8';
            setTimeout(() => {
                item.style.backgroundColor = '';
            }, 300);
        }
    },

    // Mostrar loading
    showLoading() {
        DOM.searchBar.classList.add('loading');
    },

    // Esconder loading
    hideLoading() {
        DOM.searchBar.classList.remove('loading');
    }
};

// Gerenciador de eventos
const EventManager = {
    init() {
        this.setupSearchListener();
        this.setupKeyboardNavigation();
        this.setupClickOutside();
    },

    // Configurar listener de busca
    setupSearchListener() {
        const debouncedSearch = Utils.debounce((query) => {
            UIManager.showLoading();
            
            // Simular delay de rede
            setTimeout(() => {
                const results = SearchManager.search(query);
                UIManager.renderResults(results, query);
                UIManager.hideLoading();
            }, 100);
        }, CONFIG.debounceDelay);

        DOM.searchBar.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            debouncedSearch(query);
        });

        // Limpar ao focar
        DOM.searchBar.addEventListener('focus', () => {
            if (DOM.searchBar.value.trim()) {
                const results = SearchManager.search(DOM.searchBar.value.trim());
                UIManager.renderResults(results, DOM.searchBar.value.trim());
            }
        });
    },

    // Navegação por teclado
    setupKeyboardNavigation() {
        DOM.searchBar.addEventListener('keydown', (e) => {
            const items = DOM.searchResults.querySelectorAll('.search-result-item');
            
            if (e.key === 'ArrowDown' && items.length > 0) {
                e.preventDefault();
                items[0].focus();
            } else if (e.key === 'Escape') {
                UIManager.clearResults();
                DOM.searchBar.blur();
            }
        });

        // Navegação entre resultados
        document.addEventListener('keydown', (e) => {
            const focused = document.activeElement;
            if (focused.classList.contains('search-result-item')) {
                const items = Array.from(DOM.searchResults.querySelectorAll('.search-result-item'));
                const currentIndex = items.indexOf(focused);

                if (e.key === 'ArrowDown' && currentIndex < items.length - 1) {
                    e.preventDefault();
                    items[currentIndex + 1].focus();
                } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                    e.preventDefault();
                    items[currentIndex - 1].focus();
                } else if (e.key === 'ArrowUp' && currentIndex === 0) {
                    e.preventDefault();
                    DOM.searchBar.focus();
                } else if (e.key === 'Escape') {
                    UIManager.clearResults();
                    DOM.searchBar.focus();
                }
            }
        });
    },

    // Fechar resultados ao clicar fora
    setupClickOutside() {
        document.addEventListener('click', (e) => {
            if (!DOM.searchBar.contains(e.target) && !DOM.searchResults.contains(e.target)) {
                UIManager.clearResults();
            }
        });
    }
};

// Performance monitoring (opcional)
const PerformanceMonitor = {
    init() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Tempo de carregamento:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
            });
        }
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    DOM.init();
    EventManager.init();
    PerformanceMonitor.init();
    
    console.log('ViniOPédia inicializada com sucesso! 🚀');
});

// Exportar para uso global se necessário
window.ViniOpedia = {
    SearchManager,
    UIManager,
    Utils
};
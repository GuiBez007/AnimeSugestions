import { CATEGORIES, MEDIA_DATA, placeholderX } from './data/index.js';
import { DEFAULT_ICONS, DEFAULT_LABELS, PT_LABELS, CATEGORY_FILTERS } from './data/config.js';
import { FullAnimeCard } from './FullAnimeCard.js';

let currentCategory = CATEGORIES.find(c => c.id === 'anime') || { id: 'anime', name: 'Recomendação de Animes', color: '#ff3131', shadow: 'rgba(255, 49, 49, 0.2)' };
let currentFilter = 'all';
const showColoredBorders = true;
const isStaggeredMode = true;
let currentLanguage = 'pt';
let collapsedSections = {};

window.toggleSection = (name) => {
    collapsedSections[name] = !collapsedSections[name];
    render();
};

const appContainer = document.getElementById('app');

function getStatusIcon(status) {
    return DEFAULT_ICONS[status] || '';
}

function getStatusLabel(status) {
    if (currentLanguage === 'pt') {
        return PT_LABELS[status] || status;
    }
    return DEFAULT_LABELS[status] || status;
}

function getFilterKeys(categoryId) {
    return CATEGORY_FILTERS[categoryId] || ['all', 'seen', 'to-watch', 'hyped'];
}


// Initialize
function init() {
    render();
}

function updateBordersUI() {
    const grids = document.querySelectorAll('.media-list');
    grids.forEach(grid => {
        grid.classList.remove('borders-off');
    });
}

function render() {
    renderDetailView();
    updateBordersUI();
}

function getColumnCount() {
    const width = window.innerWidth;
    if (width >= 1200) return 4;
    if (width >= 900) return 3;
    if (width >= 600) return 2;
    return 1;
}

function renderMediaCard(item) {
    const icon = getStatusIcon(item.status);
    const label = getStatusLabel(item.status);

    const card = document.createElement('div');
    // Set border color class based on recommender
    const recommenderClass = item.recommendedBy ? `border-${item.recommendedBy.toLowerCase()}` : '';
    card.className = `media-card ${recommenderClass}`;
    
    card.style.setProperty('--card-accent', currentCategory.color);
    card.style.setProperty('--card-accent-faint', currentCategory.shadow);
    card.onclick = () => {
        const fullCard = new FullAnimeCard(item);
        fullCard.render();
    };

    card.innerHTML = `
        <div class="thumb-container">
            <div class="badges-wrapper">
                ${item.favorite ? `<div class="status-badge favorite" title="Favorite">⭐</div>` : ''}
                ${item.status ? `<div class="status-badge ${item.status}" title="${label}">${icon}</div>` : ''}
            </div>
            <img src="${item.thumb || placeholderX}" alt="${item.title}" class="media-thumb" onerror="this.src='${placeholderX}'">
        </div>
        <h4>${item.title}</h4>
        <div class="media-info">
            <p class="media-synopsis">${currentLanguage === 'pt' ? (item.synopsisPT || item.synopsis) : item.synopsis}</p>
            <div class="media-link">Clique para ver detalhes</div>
            <p class="media-recommender" style="margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; font-size: 0.75rem;">
                Recomendado por: <strong>${item.recommendedBy || 'Ninguém'}</strong>
            </p>
        </div>
    `;
    return card;
}

function renderDetailView() {
    const allItems = MEDIA_DATA.anime.map(item => ({
        ...item,
        displayThumb: item.thumb || placeholderX
    }));

    // Global Status Filtering (applies across all groups)
    const filteredItems = allItems.filter(item => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'favorite') return item.favorite;
        return item.status === currentFilter;
    });

    const filterKeys = getFilterKeys('anime');
    const counts = {};
    
    filterKeys.forEach(key => {
        if (key === 'all') counts[key] = allItems.length;
        else if (key === 'favorite') counts[key] = allItems.filter(i => i.favorite).length;
        else counts[key] = allItems.filter(i => i.status === key).length;
    });

    // Grouping logic
    const recommenders = ['Bruno', 'Guilherme', 'Jhonas'];
    const groupedItems = filteredItems.reduce((acc, item) => {
        const rec = item.recommendedBy || 'Outros';
        if (!acc[rec]) acc[rec] = [];
        acc[rec].push(item);
        return acc;
    }, {});

    appContainer.innerHTML = `
        <section class="detail-view" style="--accent-color: ${currentCategory.color}">
            <div class="sticky-nav">
                <header class="view-header">
                    <div class="header-controls">
                        <button class="lang-toggle-btn" id="lang-toggle">
                            ${currentLanguage === 'en' ? 'Language: 🇺🇸 EN' : 'Idioma: 🇧🇷 PT'}
                        </button>
                        <button class="filter-btn ${currentFilter === 'favorite' ? 'active' : ''}" id="favorite-toggle" data-filter="favorite">
                            ⭐ ${currentLanguage === 'en' ? 'Favorites' : 'Favoritos'}
                            <span class="filter-count" style="margin-left: 5px;">${counts['favorite']}</span>
                        </button>
                    </div>
                    <h1 class="category-title">
                        Recomendação de Animes
                    </h1>
                </header>

                <div class="filter-bar">
                    <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                        ${getStatusIcon('all')} ${getStatusLabel('all')}
                        <span class="filter-count">${counts['all']}</span>
                    </button>
                    ${filterKeys.filter(k => k !== 'favorite' && k !== 'all').map(key => `
                        <button class="filter-btn ${currentFilter === key ? 'active' : ''}" data-filter="${key}">
                            ${getStatusIcon(key)} ${getStatusLabel(key)}
                            <span class="filter-count">${counts[key]}</span>
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="grouped-content">
                ${recommenders.map(rec => {
                    const items = groupedItems[rec] || [];
                    if (items.length === 0) return '';
                    const isCollapsed = collapsedSections[rec];
                    return `
                        <section class="recommender-section section-${rec.toLowerCase()} ${isCollapsed ? 'collapsed' : ''}">
                            <h2 class="recommender-title" onclick="window.toggleSection('${rec}')">
                                ${rec}
                                <span class="expand-icon">${isCollapsed ? '▼' : '▲'}</span>
                            </h2>
                            <div class="media-list ${rec.toLowerCase()}-grid ${!showColoredBorders ? 'borders-off' : ''} ${isStaggeredMode ? 'staggered' : ''}">
                                <!-- Masonry columns will be injected here -->
                            </div>
                        </section>
                    `;
                }).join('')}
                
                ${filteredItems.length === 0 ? `
                    <div class="empty-state" style="text-align: center; padding: 4rem; color: #64748b;">
                        <p style="font-size: 1.2rem;">Nenhum anime encontrado para este status.</p>
                    </div>
                ` : ''}
            </div>
        </section>
    `;

    // Inject Masonry for each recommender grid
    recommenders.forEach(rec => {
        const items = groupedItems[rec] || [];
        if (items.length === 0) return;
        
        const mediaList = appContainer.querySelector(`.${rec.toLowerCase()}-grid`);
        const columnsCount = getColumnCount();
        const columns = Array.from({ length: columnsCount }, () => document.createElement('div'));
        
        columns.forEach((col, i) => {
            col.className = 'masonry-column';
            col.setAttribute('data-col', i + 1);
            mediaList.appendChild(col);
        });

        items.forEach((item, index) => {
            columns[index % columnsCount].appendChild(renderMediaCard(item));
        });
    });

    // Event Listeners
    document.getElementById('lang-toggle').addEventListener('click', () => {
        currentLanguage = currentLanguage === 'en' ? 'pt' : 'en';
        render();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const newFilter = btn.getAttribute('data-filter');
            currentFilter = (currentFilter === newFilter) ? 'all' : newFilter;
            render();
        });
    });
}

window.addEventListener('resize', () => {
    render();
});

init();


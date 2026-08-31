let allTools = [];
let currentCategory = 'All';
let currentSort = 'name-asc';
let currentSearch = '';

// 1. Fetch Data
async function loadTools() {
    const loading = document.getElementById('loading');
    const errorMsg = document.getElementById('error-message');

    try {
        const response = await fetch('https://jsonguide.technologychannel.org/ai/aitoolstest.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        allTools = await response.json();
        loading.classList.add('d-none');
        
        setupCategoryFilters();
        applyFiltersAndRender();
        setupOverviewModal();

    } catch (error) {
        console.error('Error:', error);
        loading.classList.add('d-none');
        errorMsg.classList.remove('d-none');
    }
}

// 2. Setup Category Buttons
function setupCategoryFilters() {
    const categories = ['All', ...new Set(allTools.map(tool => tool.Category))];
    const container = document.getElementById('category-filters');
    
    container.innerHTML = categories.map(cat => `
        <button class="btn btn-sm btn-outline-primary filter-btn ${cat === 'All' ? 'active' : ''}" 
                data-category="${cat}">
            ${cat}
        </button>
    `).join('');

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            applyFiltersAndRender();
        });
    });
}

// 3. Master Filter & Sort
function applyFiltersAndRender() {
    let result = [...allTools];

    if (currentSearch) {
        result = result.filter(tool => 
            tool['Tool Name'].toLowerCase().includes(currentSearch) ||
            tool.Category.toLowerCase().includes(currentSearch) ||
            tool.Description.toLowerCase().includes(currentSearch) ||
            tool['Top 3 Features'].toLowerCase().includes(currentSearch)
        );
    }

    if (currentCategory !== 'All') {
        result = result.filter(tool => tool.Category === currentCategory);
    }

    result.sort((a, b) => {
        if (currentSort === 'name-asc') return a['Tool Name'].localeCompare(b['Tool Name']);
        if (currentSort === 'name-desc') return b['Tool Name'].localeCompare(a['Tool Name']);
        if (currentSort === 'category') return a.Category.localeCompare(b.Category);
        return 0;
    });

    renderTools(result);
}

// 4. Render Main Cards (3 per row on medium+ screens)
function renderTools(toolsToDisplay) {
    const container = document.getElementById('tools-container');
    container.innerHTML = ''; 

    if (toolsToDisplay.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <i class="bi bi-emoji-frown fs-1"></i>
                <p class="mt-2 fs-5">No tools found matching your criteria.</p>
            </div>
        `;
        return;
    }

    toolsToDisplay.forEach(tool => {
        const col = document.createElement('div');
        // FIXED: 3 per row on medium screens and up
        col.className = 'col-12 col-md-4';

        let mobileLinksHtml = '<div class="mt-3 d-flex gap-2">';
        if (tool['Android Link'] && tool['Android Link'] !== '–') {
            mobileLinksHtml += `<a href="${tool['Android Link']}" target="_blank" class="btn btn-sm btn-outline-success"><i class="bi bi-android2"></i> Android</a>`;
        }
        if (tool['IOS Link'] && tool['IOS Link'] !== '–') {
            mobileLinksHtml += `<a href="${tool['IOS Link']}" target="_blank" class="btn btn-sm btn-outline-secondary"><i class="bi bi-apple"></i> iOS</a>`;
        }
        mobileLinksHtml += '</div>';

        col.innerHTML = `
            <div class="card h-100 tool-card shadow-sm">
                <span class="badge bg-primary category-badge">${tool.Category}</span>
                <img src="${tool['Featured Image']}" class="card-img-top" alt="${tool['Tool Name']}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${tool['Tool Name']}</h5>
                    <p class="card-text text-muted small">${tool.Description}</p>
                    
                    <h6 class="fw-bold mt-2 small text-uppercase text-secondary">Top Features</h6>
                    <ul class="list-unstyled small mb-3">
                        ${tool['Top 3 Features'].split(';').map(f => `<li><i class="bi bi-check-circle-fill text-success me-1"></i>${f.trim()}</li>`).join('')}
                    </ul>
                    
                    <div class="mt-auto">
                        <a href="${tool['Web Link']}" target="_blank" class="btn btn-primary w-100 mb-2">
                            <i class="bi bi-globe"></i> Visit Website
                        </a>
                        ${mobileLinksHtml}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

// 5. Setup Overview Modal
function setupOverviewModal() {
    const overviewModal = document.getElementById('overviewModal');
    
    overviewModal.addEventListener('show.bs.modal', () => {
        // Update stats
        document.getElementById('total-tools-count').textContent = allTools.length;
        
        const uniqueCategories = [...new Set(allTools.map(t => t.Category))];
        document.getElementById('total-categories-count').textContent = uniqueCategories.length;
        
        const toolsWithApps = allTools.filter(t => 
            (t['Android Link'] && t['Android Link'] !== '–') || 
            (t['IOS Link'] && t['IOS Link'] !== '–')
        ).length;
        document.getElementById('tools-with-apps-count').textContent = toolsWithApps;

        // Render all tools in overview (3 per row on medium+ screens)
        const overviewContainer = document.getElementById('overview-tools-container');
        overviewContainer.innerHTML = allTools.map(tool => `
            <div class="col-12 col-md-4">
                <div class="card overview-tool-card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-2">
                            <img src="${tool['Featured Image']}" alt="${tool['Tool Name']}" 
                                 style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px; margin-right: 10px;">
                            <div>
                                <h6 class="mb-0 fw-bold">${tool['Tool Name']}</h6>
                                <small class="text-muted">${tool.Category}</small>
                            </div>
                        </div>
                        <p class="small text-muted mb-2">${tool.Description.substring(0, 80)}...</p>
                        <a href="${tool['Web Link']}" target="_blank" class="btn btn-sm btn-outline-primary w-100">
                            <i class="bi bi-box-arrow-up-right"></i> Visit
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    });
}

// 6. Event Listeners
document.getElementById('search-input').addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    applyFiltersAndRender();
});

document.getElementById('sort-select').addEventListener('change', (e) => {
    currentSort = e.target.value;
    applyFiltersAndRender();
});

// 7. Dark Mode
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-bs-theme', savedTheme);
updateThemeUI(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
});

function updateThemeUI(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'bi bi-sun-fill';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.className = 'bi bi-moon-stars-fill';
        themeText.textContent = 'Dark Mode';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', loadTools);

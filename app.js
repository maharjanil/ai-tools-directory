let allTools = [];
let currentCategory = 'All';
let currentSort = 'name-asc';
let currentSearch = '';

// 1. Fetch Data
async function loadTools() {
    const loading = document.getElementById('loading');
    const errorMsg = document.getElementById('error-message');

    try {
        // Cache buster included
        const response = await fetch('data.json?t=' + Date.now()); 
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        allTools = await response.json();
        loading.classList.add('d-none');
        
        setupCategoryFilters();
        applyFiltersAndRender();

    } catch (error) {
        console.error('Error:', error);
        loading.classList.add('d-none');
        errorMsg.classList.remove('d-none');
    }
}

// 2. Setup Category Buttons Dynamically
function setupCategoryFilters() {
    const categories = ['All', ...new Set(allTools.map(tool => tool.Category))];
    const container = document.getElementById('category-filters');
    
    container.innerHTML = categories.map(cat => `
        <button class="btn btn-sm btn-outline-primary filter-btn ${cat === 'All' ? 'active' : ''}" 
                data-category="${cat}">
            ${cat}
        </button>
    `).join('');

    // Add click listeners to new buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Update state and re-render
            currentCategory = e.target.dataset.category;
            applyFiltersAndRender();
        });
    });
}

// 3. Master Filter & Sort Function
function applyFiltersAndRender() {
    let result = [...allTools];

    // A. Filter by Search
    if (currentSearch) {
        result = result.filter(tool => 
            tool['Tool Name'].toLowerCase().includes(currentSearch) ||
            tool.Category.toLowerCase().includes(currentSearch) ||
            tool.Description.toLowerCase().includes(currentSearch) ||
            tool['Top 3 Features'].toLowerCase().includes(currentSearch)
        );
    }

    // B. Filter by Category
    if (currentCategory !== 'All') {
        result = result.filter(tool => tool.Category === currentCategory);
    }

    // C. Sort
    result.sort((a, b) => {
        if (currentSort === 'name-asc') return a['Tool Name'].localeCompare(b['Tool Name']);
        if (currentSort === 'name-desc') return b['Tool Name'].localeCompare(a['Tool Name']);
        if (currentSort === 'category') return a.Category.localeCompare(b.Category);
        return 0;
    });

    renderTools(result);
}

// 4. Render Cards (NOW INCLUDING ANDROID/iOS LINKS!)
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
        col.className = 'col-md-6 col-lg-4';

        // Build Mobile Links HTML conditionally
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

// 5. Event Listeners for Search and Sort
document.getElementById('search-input').addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    applyFiltersAndRender();
});

document.getElementById('sort-select').addEventListener('change', (e) => {
    currentSort = e.target.value;
    applyFiltersAndRender();
});

// 6. Dark Mode Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');
const htmlElement = document.documentElement;

// Check for saved user preference
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

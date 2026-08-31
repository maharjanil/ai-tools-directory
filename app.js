// 1. Create a global variable to hold all the fetched data
let allTools = [];

// 2. Function to fetch data
async function loadTools() {
    const loading = document.getElementById('loading');
    const errorMsg = document.getElementById('error-message');

    try {
        // Change this to your GitHub jsDelivr URL if needed!
        const response = await fetch('data.json'); 
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        allTools = await response.json(); // Save data to global variable
        loading.classList.add('d-none');  // Hide spinner
        
        renderTools(allTools); // Initial render of all tools

    } catch (error) {
        console.error('Error:', error);
        loading.classList.add('d-none');
        errorMsg.classList.remove('d-none');
    }
}

// 3. Reusable function to draw the cards
function renderTools(toolsToDisplay) {
    const container = document.getElementById('tools-container');
    container.innerHTML = ''; // Clear existing cards first!

    // Handle "No results found"
    if (toolsToDisplay.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <i class="bi bi-emoji-frown fs-1"></i>
                <p class="mt-2 fs-5">No tools found matching your search.</p>
            </div>
        `;
        return;
    }

    // Loop through the provided array and create cards
    toolsToDisplay.forEach(tool => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';

        col.innerHTML = `
            <div class="card h-100 tool-card shadow-sm">
                <span class="badge bg-primary category-badge">${tool.Category}</span>
                <img src="${tool['Featured Image']}" class="card-img-top" alt="${tool['Tool Name']}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${tool['Tool Name']}</h5>
                    <p class="card-text text-muted small">${tool.Description}</p>
                    
                    <h6 class="fw-bold mt-2">Top Features:</h6>
                    <ul class="list-unstyled small text-secondary">
                        ${tool['Top 3 Features'].split(';').map(f => `<li>✔️ ${f.trim()}</li>`).join('')}
                    </ul>
                    
                    <div class="mt-auto pt-3">
                        <a href="${tool['Web Link']}" target="_blank" class="btn btn-primary w-100">
                            Visit Website <i class="bi bi-box-arrow-up-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

// 4. Setup the Search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    
    // Listen for every keystroke
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        // Filter the global array
        const filteredTools = allTools.filter(tool => {
            return (
                tool['Tool Name'].toLowerCase().includes(searchTerm) ||
                tool.Category.toLowerCase().includes(searchTerm) ||
                tool.Description.toLowerCase().includes(searchTerm) ||
                tool['Top 3 Features'].toLowerCase().includes(searchTerm)
            );
        });
        
        // Re-render the page with only the matching tools
        renderTools(filteredTools);
    });
}

// Run everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTools();
    setupSearch();
});

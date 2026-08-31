// Function to fetch and display data
async function loadTools() {
    const container = document.getElementById('tools-container');
    const loading = document.getElementById('loading');
    const errorMsg = document.getElementById('error-message');

    try {
        // 1. Fetch the JSON file
        const response = await fetch('data.json');
        
        // 2. Check if the response is OK (status 200)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 3. Parse the JSON data
        const tools = await response.json();

        // 4. Hide loading spinner
        loading.classList.add('d-none');

        // 5. Loop through the data and create HTML for each tool
        tools.forEach(tool => {
            // Create a column div
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';

            // Build the card HTML
            col.innerHTML = `
                <div class="card h-100 tool-card shadow-sm">
                    <span class="badge bg-primary category-badge">${tool.Category}</span>
                    <img src="${tool['Featured Image']}" class="card-img-top" alt="${tool['Tool Name']}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${tool['Tool Name']}</h5>
                        <p class="card-text text-muted small">${tool.Description}</p>
                        
                        <h6 class="fw-bold mt-2">Top Features:</h6>
                        <ul class="list-unstyled small text-secondary">
                            ${tool['Top 3 Features'].split(';').map(feature => `<li>✔️ ${feature.trim()}</li>`).join('')}
                        </ul>
                        
                        <div class="mt-auto pt-3">
                            <a href="${tool['Web Link']}" target="_blank" class="btn btn-primary w-100">
                                Visit Website <i class="bi bi-box-arrow-up-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;

            // Append the card to the container
            container.appendChild(col);
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        loading.classList.add('d-none');
        errorMsg.classList.remove('d-none');
        errorMsg.textContent = `Error: ${error.message}. (Make sure you are using a local server, not just opening the file directly).`;
    }
}

// Run the function when the page loads
document.addEventListener('DOMContentLoaded', loadTools);
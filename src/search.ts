import { listTrails } from './trails';

export function initializeSearch() {
    const searchInput = document.getElementById('page-search') as HTMLInputElement;
    const searchIcon = document.querySelector('.fa-search') as HTMLElement;

    if (!searchInput || !searchIcon) {
        console.error('Search input or icon not found.');
        return;
    }

    const searchResultsContainer = document.createElement('div');
    searchResultsContainer.id = 'search-results';

    const navSearch = document.querySelector('.nav-search');
    if (navSearch) {
        navSearch.appendChild(searchResultsContainer);
    } else {
        console.error('Could not find nav-search element to attach search results.');
        return;
    }

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        searchResultsContainer.innerHTML = '';

        if (query) {
            const results = listTrails.filter(
                trail =>
                    trail.name.toLowerCase().includes(query) ||
                    trail.area.toLowerCase().includes(query) ||
                    trail.municipality.toLowerCase().includes(query)
            );

            if (results.length > 0) {
                results.forEach(trail => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.innerHTML = `
                        <div class="name">${trail.name}</div><div class="area">${trail.area}, ${trail.municipality}</div>
                    `;

                    resultItem.addEventListener('click', () => {
                        window.location.href = `/MTB-NT/trail.html?name=${trail.name}`;
                    });

                    searchResultsContainer.appendChild(resultItem);
                });
            } else {
                const noResultItem = document.createElement('div');
                noResultItem.className = 'search-result-item no-result';
                noResultItem.innerText = 'Ingen treff';
                searchResultsContainer.appendChild(noResultItem);
            }
        }
    }

    searchInput.addEventListener('input', performSearch);

    searchIcon.addEventListener('click', performSearch);

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            performSearch();
        }
    });

    document.addEventListener('click', (event) => {
        if (!navSearch?.contains(event.target as Node)) {
            searchResultsContainer.innerHTML = '';
        }
    });
}
import { initializeSearch } from "./search";

function loadHTML(selector: string, url: string): Promise<void> {
    return fetch(url)
        .then(response => response.text())
        .then(data => {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = data;
            } else {
                console.error(`No element found with selector: ${selector}`);
            }
        })
        .catch(error => {
            console.error('Error loading HTML:', error);
        });
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadHTML('.top-nav', './components/nav.html');
    await loadHTML('.bottom-footer', './components/footer.html');

    initializeSearch();
});

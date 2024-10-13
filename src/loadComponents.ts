function loadHTML(selector: string, url: string) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = data;
            } else {
                console.error(`No element found with selector: ${selector}`);
            }
        })
        .catch(error => console.error('Error loading HTML:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    loadHTML('.top-nav', './src/components/nav.html');
    loadHTML('.bottom-footer', './src/components/footer.html');
});
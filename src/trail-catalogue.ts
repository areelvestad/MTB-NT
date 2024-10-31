import { listTrails } from './trails';

document.addEventListener('DOMContentLoaded', () => {
  const catalogueContainer = document.getElementById('catalogue-items');

  if (!catalogueContainer) {
    console.error('Catalogue container not found.');
    return;
  }

  listTrails.forEach((trail) => {
    const trailDiv = document.createElement('div');
    trailDiv.className = 'trail-item';

    trailDiv.innerHTML = `
      <div class="image">
        <img src="./img/${trail.name}/01/${trail.name}_930.jpg" alt="${trail.name}">
      </div>
      <div class="content">
        <div class="header">
            <h3>${trail.name}</h3>
            <span><i class="fa-solid fa-map-pin"></i> ${trail.area}, ${trail.municipality}</span>
        </div>
        <p>${trail.description}</p>
        <div class="trail-info">
            <a href="/MTB-NT/trail.html?name=${trail.name}" class="details-link"><i class="fa-solid fa-circle-info"></i> Mer om stien</a>
        </div>
      </div>
    `;

    catalogueContainer.appendChild(trailDiv);
  });
});

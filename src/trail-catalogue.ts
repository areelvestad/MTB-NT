import { listTrails } from './trails';
import { calculateStatisticsForTrail } from './trail-stats';

document.addEventListener('DOMContentLoaded', () => {
  const catalogueContainer = document.getElementById('catalogue-items');
  const filterContainer = document.getElementById('trail-filter');

  type Trail = typeof listTrails[number];

  async function createTrailItem(trail: Trail): Promise<HTMLAnchorElement> {
    const stats = await calculateStatisticsForTrail(trail.name);

    if (!stats) {
      console.error(`Statistics for trail '${trail.name}' could not be calculated.`);
      throw new Error(`Statistics not available for trail '${trail.name}'`);
    }
    
    const trailDiv = document.createElement('a');
    trailDiv.className = 'trail-item';
    trailDiv.href = `/MTB-NT/trail.html?name=${trail.name}`;

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
            <div class="grade ${trail.grade} tooltip">
              <i class="fa-solid fa-stairs"></i>
              <span class="tooltip-text trail-grade"></span>
            </div>
            <div class="tooltip">
              <i class="fa-solid fa-ruler"></i> ${stats.totalKm.toFixed(1)} km
              <span class="tooltip-text" data-tooltip="Distanse"></span>
            </div>
        </div>
      </div>
    `;

    return trailDiv;
  }

  async function renderCatalogueItems(trails: Trail[]) {
    if (!catalogueContainer) return;
    catalogueContainer.innerHTML = '';

    for (const trail of trails) {
      try {
        const trailElement = await createTrailItem(trail);
        catalogueContainer.appendChild(trailElement);
      } catch (error) {
        console.error(`Failed to create trail item for ${trail.name}:`, error);
      }
    }
  }

  function createFilterUI() {
    if (filterContainer) {
      filterContainer.innerHTML = `
        <i class="fa-solid fa-filter"></i>
        <select id="grade-filter">
          <option value="">Vanskelighetsgrad</option>
          <option value="">Alle grader</option>
          <option value="white">Trimtur</option>
          <option value="green">For de fleste</option>
          <option value="blue">Utfordrende</option>
          <option value="red">Erfaren</option>
          <option value="black">Wohoo / Auch!</option>
        </select>
        <select id="municipality-filter">
          <option value="">Kommune</option>
          <option value="">Alle kommuner</option>
          ${[...new Set(listTrails.map((trail: Trail) => trail.municipality))]
            .map(municipality => `<option value="${municipality}">${municipality}</option>`).join('')}
        </select>
        <select id="type-filter">
          <option value="">Velg stil</option>
          <option value="">Alle stiler</option>
          <option value="Enduro">Beint ned</option>
          <option value="XC">Rett fram</option>
        </select>
      `;

      document.getElementById('grade-filter')?.addEventListener('change', applyFilters);
      document.getElementById('municipality-filter')?.addEventListener('change', applyFilters);
      document.getElementById('type-filter')?.addEventListener('change', applyFilters);
    }
  }

  function applyFilters() {
    const gradeFilter = (document.getElementById('grade-filter') as HTMLSelectElement).value;
    const municipalityFilter = (document.getElementById('municipality-filter') as HTMLSelectElement).value;
    const typeFilter = (document.getElementById('type-filter') as HTMLSelectElement).value;

    let filteredTrails = listTrails;

    if (gradeFilter) {
      filteredTrails = filteredTrails.filter((trail: Trail) => trail.grade === gradeFilter);
    }
    if (municipalityFilter) {
      filteredTrails = filteredTrails.filter((trail: Trail) => trail.municipality === municipalityFilter);
    }
    if (typeFilter) {
      filteredTrails = filteredTrails.filter((trail: Trail) => trail.type === typeFilter);
    }

    renderCatalogueItems(filteredTrails.sort((a, b) => a.name.localeCompare(b.name)));
  }

  createFilterUI();
  renderCatalogueItems(listTrails.sort((a, b) => a.name.localeCompare(b.name)));
});

import { listTrails } from './trails';
import { calculateStatisticsForTrail } from './trail-stats';

document.addEventListener('DOMContentLoaded', async () => {

  const params = new URLSearchParams(window.location.search);
  const trailName = params.get('name');


  const trail = listTrails.find(trail => trail.name === trailName);

  if (trail) {

    const stats = await calculateStatisticsForTrail(trail.name);
    const mainTrailElement = document.querySelector('main.trail');

    if (mainTrailElement && stats) {

      mainTrailElement.innerHTML = `

        <section class="header">
          <h1>${trail.name}</h1>
          <h3>${trail.area}, ${trail.municipality}</h3>
          <div class="info">
            <div><i class="fa-solid fa-stairs"></i> Grade: ${trail.grade}</div>
            <div><i class="fa-solid fa-ruler"></i> ${stats.totalKm.toFixed(1)} km</div>
            <div><i class="fa-solid fa-arrow-trend-down"></i> ${stats.totalDescent.toFixed(0)} m</div>
            <div><i class="fa-solid fa-arrow-trend-up"></i> ${stats.totalAscent.toFixed(0)} m</div>
          </div>
        </section>

        <section class="image-gallery">
          <div id="gallery"><img src="./img/${trail.name}/01/${trail.name}_930.jpg"></div>
        </section>
      
        <section class="trail-info">
          <p>${trail.description}</p>
        </section>

        <section class="trail-map">
            <div id="map" class="map"></div>
        </section>
      `;
    }
  } else {
    console.error('Trail not found');
  }
});




import { listTrails } from './trails';
import { parseGPX } from '@we-gold/gpxjs';
import { calculateStatisticsForTrail } from './trail-stats';

async function calculateTrailStats() {
  let totalKm = 0;
  let totalDescent = 0;
  let numberOfTrails = listTrails.length;

  for (const trail of listTrails) {
    const gpxPath = `./trails/${trail.name}.gpx`;

    try {
      const response = await fetch(gpxPath);
      const gpxText = await response.text();

      const [parsedGpx, error] = parseGPX(gpxText);
      if (error) {
        throw error;
      }

      totalKm += parsedGpx.tracks.reduce((distance, track) => distance + (track.distance.total / 1000), 0);
      totalDescent += parsedGpx.tracks.reduce((descent, track) => descent + (track.elevation?.negative || 0), 0);
    } catch (error) {
      console.error(`Failed to load GPX data for trail: ${trail.name}`, error);
    }
  }

  const descriptionStatsElement = document.getElementById('description-stats');
  if (descriptionStatsElement) {
    descriptionStatsElement.innerHTML = `
      <div>Her finner du ${numberOfTrails} stier med til sammen ${totalKm.toFixed(0)} kilometer som har ${totalDescent.toFixed(0)} meter med nedoverbakke</div>`;
  }
}

async function addTrailStatsToPreview(trailName: string) {
  try {
    const stats = await calculateStatisticsForTrail(trailName);
    if (!stats) {
      throw new Error(`Statistics for trail ${trailName} could not be retrieved.`);
    }

    const previewStatsContainer = document.getElementById('preview-stats');
    if (previewStatsContainer) {
      previewStatsContainer.innerHTML = `
        <div class="info">
          <div><i class="fa-solid fa-ruler"></i> ${stats.totalKm.toFixed(1)} km fra topp til bunn</div>
          <div><i class="fa-solid fa-arrow-trend-down"></i> ${stats.totalDescent.toFixed(0)} m med nedoverbakke</div>
          <div><i class="fa-solid fa-arrow-trend-up"></i> ${stats.totalAscent.toFixed(0)} m med motbakke</div>
        </div>
      `;
    } else {
      console.warn(`Container with id="preview-stats" not found.`);
    }
  } catch (error) {
    console.error(`Failed to add statistics to preview for trail: ${trailName}`, error);
  }
}

addTrailStatsToPreview('Riehppegáisá');

calculateTrailStats();
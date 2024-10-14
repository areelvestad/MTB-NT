import { listTrails } from './trails';
import { parseGPX } from '@we-gold/gpxjs';

async function calculateStatisticsForTrail(trailName: string) {
  let totalKm = 0;
  let totalAscent = 0;
  let totalDescent = 0;
  let totalTime = 0;
  const trail = listTrails.find(t => t.name === trailName);

  if (!trail) {
    console.error(`Trail with name '${trailName}' not found.`);
    return null;
  }

  const gpxPath = `./trails/${trail.name}.gpx`;

  try {
    const response = await fetch(gpxPath);
    const gpxText = await response.text();

    const [parsedGpx, error] = parseGPX(gpxText);
    if (error) {
      throw error;
    }

    totalKm = parsedGpx.tracks.reduce((distance, track) => distance + (track.distance.total / 1000), 0); // Convert meters to km
    totalAscent = parsedGpx.tracks.reduce((ascent, track) => ascent + (track.elevation?.positive || 0), 0);
    totalDescent = parsedGpx.tracks.reduce((descent, track) => descent + (track.elevation?.negative || 0), 0);
    totalTime = parsedGpx.tracks.reduce((time, track) => {
      if (track.points.length > 1) {
        const startTime = track.points[0]?.time;
        const endTime = track.points[track.points.length - 1]?.time;
        if (startTime && endTime) {
          const diff = new Date(endTime).getTime() - new Date(startTime).getTime();
          return time + diff / (1000 * 60); // Convert to minutes
        }
      }
      return time;
    }, 0);

    return {
      totalKm,
      totalAscent,
      totalDescent,
      totalTime,
    };
  } catch (error) {
    console.error(`Failed to load GPX data for trail: ${trail.name}`, error);
    return null;
  }
}

export { calculateStatisticsForTrail };

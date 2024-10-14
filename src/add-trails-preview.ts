import { listTrails } from './trails';
import { parseGPX } from '@we-gold/gpxjs';
import mapboxgl from 'mapbox-gl';
import { map } from './map';

async function addTrailsToMap(map: mapboxgl.Map) {
  for (const trail of listTrails) {
    const gpxPath = `./trails/${trail.name}.gpx`;

    try {
      const response = await fetch(gpxPath);
      const gpxText = await response.text();
      const [parsedGpx, error] = parseGPX(gpxText);
      if (error) {
        throw error;
      }

      const geoJSON = parsedGpx.toGeoJSON();

      map.addSource(trail.name, {
        type: 'geojson',
        data: geoJSON as GeoJSON.FeatureCollection,
      });

      map.addLayer({
        id: `${trail.name}-border`,
        type: 'line',
        source: trail.name,
        paint: {
            'line-color': 'rgb(20, 20, 20)',
            'line-width': 3,
        },
        layout: {
            'line-cap': 'round', 
            'line-join': 'round',
            'line-sort-key': 1
        }
    });

    map.addLayer({
        id: trail.name,
        type: 'line',
        source: trail.name,
        paint: {
            'line-color': 'rgb(240, 49, 49)',
            'line-width': 1,
        },
        layout: {
            'line-cap': 'round',
            'line-join': 'round',
            'line-sort-key': 2
        }
    });

      if (parsedGpx.tracks.length > 0 && parsedGpx.tracks[0].points.length > 0) {
        const firstPoint = parsedGpx.tracks[0].points[0];

        const markerElement = document.createElement('div');
        markerElement.className = 'trail-marker-preview';
        markerElement.innerHTML = `${trail.name}`;

        new mapboxgl.Marker({
            element: markerElement,
            anchor: 'bottom-left'
          })
            .setLngLat([firstPoint.longitude, firstPoint.latitude])
            .addTo(map);
        }
      } catch (error) {
        console.error(`Failed to load GPX data for trail: ${trail.name}`, error);
      }
  }
}

function startRotateAnimation(map: mapboxgl.Map) {
  function rotateCamera(timestamp: number) {
    map.rotateTo((timestamp / 360) % 360, { duration: 0 });
    requestAnimationFrame(rotateCamera);
  }
  requestAnimationFrame(rotateCamera);
}

map.on('load', () => {
  startRotateAnimation(map);
});

addTrailsToMap(map);
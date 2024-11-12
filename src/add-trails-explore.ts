import { listTrails } from './trails';
import { parseGPX } from '@we-gold/gpxjs';
import mapboxgl from 'mapbox-gl';
import { calculateStatisticsForTrail } from './trail-stats';
import { trailCanvas } from './add-canvas-explore';

mapboxgl.accessToken = 'pk.eyJ1IjoiYXJlZWx2ZXN0YWQiLCJhIjoiY20xZ3UydHVyMDc3NzJtc2V3bnR5MXF2YSJ9.1GGwHsMIhkaYlwL5vMahGg';

/* mapbox://styles/mapbox/outdoors-v12 Rart kart*/
/* mapbox://styles/mapbox/satellite-v9 Satelittkart*/

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-v9',
    projection: 'globe',
    zoom: 8.5,
    center: [21.2, 69.72],
    pitch: 0,
    bearing: 0,
    antialias: true,
    interactive: true,
    attributionControl: false
});

map.on('load', () => {
    map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
    });

    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1 });

    map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
        }
    });

    map.setFog({
        'range': [0.1, 20],
        'color': 'rgb(168, 202, 230)',
        'horizon-blend': 0.1,
        'high-color': '#fff',
        'space-color': '#d8f2ff',
        'star-intensity': 0.0
    });

    map.addControl(
        new mapboxgl.AttributionControl({
            compact: true,
        }),
        'bottom-right'
    );
});

let distanceMarker: mapboxgl.Marker | null = null;

async function addTrailsToMap(map: mapboxgl.Map, trailNameFilter?: string) {
    let activeTrail: string | null = null;

    for (const trail of listTrails) {
        if (trailNameFilter && trail.name !== trailNameFilter) {
            continue;
        }

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
                    'line-width': 5,
                },
                layout: {
                    'line-cap': 'round',
                    'line-join': 'round',
                    'line-sort-key': 5,
                }
            });

            map.addLayer({
                id: trail.name,
                type: 'line',
                source: trail.name,
                paint: {
                    'line-color': 'rgb(240, 49, 49)',
                    'line-width': 2,
                },
                layout: {
                    'line-cap': 'round',
                    'line-join': 'round',
                    'line-sort-key': 6,
                }
            });

            if (parsedGpx.tracks.length > 0 && parsedGpx.tracks[0].points.length > 0) {
                const firstPoint = parsedGpx.tracks[0].points[0];

                const markerElement = document.createElement('div');
                markerElement.className = `trail-marker-explore`;
                markerElement.innerHTML = `
                    <input type="radio" id="cb-${trail.name}" name="start-marker" class="${trail.grade}" style="background: color-mix(in srgb, white 20%, ${trail.grade} 80%);">
                `;

                new mapboxgl.Marker({
                    element: markerElement,
                    anchor: 'bottom'
                })
                    .setLngLat([firstPoint.longitude, firstPoint.latitude])
                    .addTo(map);

                markerElement.addEventListener('click', async () => {

                    const container = document.getElementById('trail-info');
                    if (container) {
                        const stats = await calculateStatisticsForTrail(trail.name);
                        if (stats) {
                            container.innerHTML = `
                                <div id="close">&times;</div>
                                <h4>${trail.name}
                                    <span id="grade-mark" class="${trail.grade}">
                                        <i class="fa-solid fa-triangle-exclamation" style="display:none;"></i>
                                    </span>
                                </h4>
                                <div class="location">
                                    <span>
                                        <i class="fa-solid fa-map-pin"></i>${trail.area}, ${trail.municipality}
                                    </span>
                                    <div class="tooltip">
                                        <i class="fa-solid fa-mountain"></i> ${stats.elevationHigh.toFixed(0)} moh
                                        <span class="tooltip-text" data-tooltip="Høyeste punkt"></span>
                                    </div>
                                </div>
                                <div class="img-info">
                                    <div class="images">
                                        <img src="./img/${trail.name}/01/${trail.name}_930.jpg">
                                    </div>
                                    <div class="info">
                                        <div class="tooltip">
                                            <i class="fa-solid fa-ruler"></i> ${stats.totalKm.toFixed(1)} km
                                            <span class="tooltip-text" data-tooltip="Distanse"></span>
                                        </div>
                                        <div class="tooltip">
                                            <i class="fa-solid fa-arrow-trend-down"></i> ${stats.totalDescent.toFixed(0)} m
                                            <span class="tooltip-text" data-tooltip="Nedstigning"></span>
                                        </div>
                                        <div class="tooltip">
                                            <i class="fa-solid fa-arrow-trend-up"></i> ${stats.totalAscent.toFixed(0)} m
                                            <span class="tooltip-text" data-tooltip="Oppstigning"></span>
                                        </div>
                                    </div>
                                </div>
                                <p class="trail-desc">${trail.description}</p>
                                <div class="canvas-container">
                                    <div id="canvas"></div>
                                </div>
                                <div class="info-bottom">
                                    <a class="trail-page" href="/MTB-NT/trail.html?name=${trail.name}&area=${trail.area}">
                                        <i class="fa-solid fa-circle-info"></i>
                                        Mer om stien
                                    </a>
                                </div>
                            `;
                            container.style.display = 'flex';

                            const canvasContainer = document.getElementById('canvas');
                            if (canvasContainer) {
                                canvasContainer.addEventListener('mouseenter', () => {
                                    if (distanceMarker) {
                                        distanceMarker.getElement().style.display = 'flex';
                                    }
                                });

                                canvasContainer.addEventListener('mouseleave', () => {
                                    if (distanceMarker) {
                                        distanceMarker.getElement().style.display = 'none';
                                    }
                                });
                            }

                            await trailCanvas(trail.name, (distance, lat, lon) => {
                                distance = distance;
                                if (lat !== undefined && lon !== undefined) {
                                    if (!distanceMarker) {
                                        const distanceMarkerDiv = document.createElement('div');
                                        distanceMarkerDiv.className = `distance-marker`;
                                        distanceMarkerDiv.innerHTML = ``;

                                        distanceMarker = new mapboxgl.Marker({
                                            element: distanceMarkerDiv,
                                            anchor: 'center',
                                        })
                                            .setLngLat([lon, lat])
                                            .addTo(map);
                                    } else {
                                        distanceMarker.setLngLat([lon, lat]);
                                    }
                                }
                            });

                            document.getElementById('close')?.addEventListener('click', () => {
                                container.style.display = 'none';
                                const radioInput = document.getElementById(`cb-${trail.name}`) as HTMLInputElement;
                                if (radioInput) {
                                    radioInput.checked = false;
                                }
                                map.setPaintProperty(`${trail.name}-border`, 'line-color', 'rgba(0, 0, 0, 1)');
                                activeTrail = null;
                            });

                            makeElementDraggable(container);
                        }
                    }
                });

                function makeElementDraggable(element: HTMLElement) {
                    let offsetX = 0, offsetY = 0, isDragging = false;

                    element.addEventListener('mousedown', (event) => {
                        isDragging = true;
                        offsetX = event.clientX - element.getBoundingClientRect().left;
                        offsetY = event.clientY - element.getBoundingClientRect().top;
                        document.body.style.userSelect = 'none';
                    });

                    document.addEventListener('mousemove', (event) => {
                        if (isDragging) {
                            const newX = event.clientX - offsetX;
                            const newY = event.clientY - offsetY;

                            element.style.left = `${newX}px`;
                            element.style.top = `${newY}px`;
                        }
                    });

                    document.addEventListener('mouseup', () => {
                        if (isDragging) {
                            isDragging = false;
                            document.body.style.userSelect = '';
                        }
                    });
                }

                const radioInput = markerElement.querySelector(`#cb-${trail.name}`) as HTMLInputElement;
                radioInput.addEventListener('change', () => {
                    if (radioInput.checked) {
                        if (activeTrail && activeTrail !== trail.name) {
                            map.setPaintProperty(`${activeTrail}-border`, 'line-color', 'rgba(0, 0, 0, 1)');
                        }

                        map.setPaintProperty(`${trail.name}-border`, 'line-color', 'rgba(255, 255, 255, 1)');

                        activeTrail = trail.name;
                    }
                });

            }
        } catch (error) {
            console.error(`Failed to load GPX data for trail: ${trail.name}`, error);
        }
    }
}

function addMapControls(map: mapboxgl.Map) {
    map.addControl(new mapboxgl.NavigationControl());
}

map.on('load', () => {
    addMapControls(map);
    addTrailsToMap(map);
});

export { addTrailsToMap };
export { map };
export { distanceMarker };

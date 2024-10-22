import { listTrails } from './trails';
import { calculateStatisticsForTrail } from './trail-stats';
import { addTrailsToMap } from './add-trails-explore';
import mapboxgl from 'mapbox-gl';
import { trailCanvas } from './add-canvas-explore';


document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const trailName = params.get('name');

    const trail = listTrails.find(trail => trail.name === trailName);

    if (trail) {
        const stats = await calculateStatisticsForTrail(trail.name);
        const mainTrailElement = document.querySelector('main.trail');

        if (mainTrailElement && stats) {
            const images: { src: string; description: string }[] = await fetchImages(trail.name);
            const imagesHtml = images.map((image: { src: string; description: string }, index: number) => `
                <div class="trail-image ${index === 0 ? 'active' : ''}">
                    <img src="./img/${trail.name}/${image.src}/${trail.name}_930.jpg" alt="${trail.name}">
                    <div class="image-description">${image.description}</div>
                </div>
            `).join('');

            mainTrailElement.innerHTML = `
                <section class="header">
                    <h1>${trail.name}</h1>
                    <h3>${trail.area}, ${trail.municipality}</h3>
                    <div class="info">
                        <div class="grade ${trail.grade}"><i class="fa-solid fa-stairs"></i></div>
                        <div><i class="fa-solid fa-ruler"></i> ${stats.totalKm.toFixed(1)} km</div>
                        <div><i class="fa-solid fa-arrow-trend-down"></i>${stats.totalDescent.toFixed(0)} m</div>
                        <div><i class="fa-solid fa-arrow-trend-up"></i>${stats.totalAscent.toFixed(0)} m</div>
                    </div>
                </section>

                <section class="image-gallery">
                    <div id="gallery">
                        ${imagesHtml}
                        <div class="gallery-navigation length-${images.length}">
                            <button id="prevSlide" class="gallery-button"><i class="fa-solid fa-chevron-left"></i></button>
                            <button id="nextSlide" class="gallery-button"><i class="fa-solid fa-chevron-right"></i></button>
                        </div>
                        <div id="image-counter" class="image-counter length-${images.length}">
                            1 / ${images.length}
                        </div>
                    </div>
                </section>

                <section class="trail-info">
                    <p>${trail.description}</p>
                    <div class="info">
                        <div class="type"><i class="fa-solid fa-bicycle"></i><div class="${trail.type}"></div></div>
                        <div><i class="fa-solid fa-clock"></i><div>${trail.time}</div></div>
                        <div><i class="fa-solid fa-mountain"></i> ${stats.elevationHigh.toFixed(0)} moh</div>
                        <div><i class="fa-solid fa-arrows-split-up-and-left"></i> Flere ruter</div>
                        <div class="${trail.hikingTrail} hikingTrail"><i class="fa-solid fa-person-hiking"></i> Tursti</div>
                        <div class="${trail.tags} tags"><i class="fa-solid fa-tree"></i> Naturreservat</div>
                        <div class="${trail.tags} tags"><i class="fa-solid fa-seedling"></i> Beitemark</div>
                    </div>

                    <div class="turbeskrivelse">
                        <h4>Turbeskrivelse</h4>
                        <p>${trail.turbeskrivelse}</p>
                    </div>
                </section>

                <div class="map-canvas">
                    <section class="canvas-container">
                        <div id="canvas"></div>
                    </section>

                    <section class="trail-map">
                        <div id="map" class="map"></div>
                    </section>
                </div>
                
                <iframe src="https://www.yr.no/nb/innhold/${trail.yrid}/card.html?mode=dark"></iframe>
            `;

            let currentSlideIndex = 0;

            function showSlide(index: number) {
                const slides = document.querySelectorAll('.trail-image');
                if (index >= slides.length) {
                    currentSlideIndex = 0;
                } else if (index < 0) {
                    currentSlideIndex = slides.length - 1;
                } else {
                    currentSlideIndex = index;
                }

                slides.forEach((slide, i) => {
                    slide.classList.toggle('active', i === currentSlideIndex);
                });

                const counterElement = document.getElementById('image-counter');
                if (counterElement) {
                    counterElement.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
                }
            }

            document.getElementById('prevSlide')?.addEventListener('click', () => {
                showSlide(currentSlideIndex - 1);
            });

            document.getElementById('nextSlide')?.addEventListener('click', () => {
                showSlide(currentSlideIndex + 1);
            });


            setTimeout(() => {
                const mapElement = document.getElementById('map');
                if (mapElement) {

                    mapboxgl.accessToken = 'pk.eyJ1IjoiYXJlZWx2ZXN0YWQiLCJhIjoiY20xZ3UydHVyMDc3NzJtc2V3bnR5MXF2YSJ9.1GGwHsMIhkaYlwL5vMahGg';

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

                    map.on('load', async () => {
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

                        await addTrailsToMap(map, trail.name);

                        const source = map.getSource(trail.name) as mapboxgl.GeoJSONSource;
                        if (source) {
                            const geojson = source._data as GeoJSON.FeatureCollection;
                            const bounds = new mapboxgl.LngLatBounds();

                            geojson.features.forEach((feature) => {
                                if (feature.geometry.type === "LineString") {
                                    feature.geometry.coordinates.forEach((coord) => {
                                        bounds.extend(coord as [number, number]);
                                    });
                                } else if (feature.geometry.type === "Point") {
                                    bounds.extend(feature.geometry.coordinates as [number, number]);
                                }
                            });

                            map.fitBounds(bounds, {
                                padding: 80,
                                maxZoom: 14,
                                linear: true,
                            });

                            map.addControl(new mapboxgl.NavigationControl());
                        }

                        let distanceMarker: mapboxgl.Marker | null = null;
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
                    });

                    showSlide(currentSlideIndex);
                } else {
                    console.error('Map element not found');
                }
            }, 0);
        }


    } else {
        console.error('Trail not found');
    }
});

async function fetchImages(trailName: string): Promise<{ src: string; description: string }[]> {
    const images: { src: string; description: string }[] = [];

    const metadataPath = `./img/metadata.json`;
    try {
        const metadataResponse = await fetch(metadataPath);
        if (metadataResponse.ok) {
            const metadata = await metadataResponse.json();

            if (metadata.trails[trailName]) {
                metadata.trails[trailName].forEach((image: { folder: string; description: string }) => {
                    images.push({
                        src: image.folder,
                        description: '<p>' + image.description + '</p>',
                    });
                });
            } else {
                console.error(`Metadata for trail "${trailName}" not found.`);
            }
        } else {
            console.error('Metadata file not found:', metadataPath);
        }
    } catch (error) {
        console.error('Error fetching metadata file:', error);
    }

    return images;
}



import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoiYXJlZWx2ZXN0YWQiLCJhIjoiY20xZ3UydHVyMDc3NzJtc2V3bnR5MXF2YSJ9.1GGwHsMIhkaYlwL5vMahGg';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-v9',
    projection: 'globe',
    zoom: 11,
    center: [21.0263, 69.76],
    pitch: 75,
    bearing: 10,
    antialias: true,
    interactive: false,
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

export { map };
import { parseGPX } from '@we-gold/gpxjs';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

async function trailCanvas(trailName: string) {
  const gpxPath = `/trails/${trailName}.gpx`;

  try {
    const response = await fetch(gpxPath);
    const gpxText = await response.text();
    const [parsedGpx, error] = parseGPX(gpxText);

    if (error) {
      throw error;
    }

    const elevationData: number[] = [];
    const distanceData: number[] = [];
    let cumulativeDistance = 0;

    parsedGpx.tracks.forEach(track => {
      track.points.forEach((point, index) => {
        if (index > 0) {
          const prevPoint = track.points[index - 1];
          const distance = calculateDistance(
            prevPoint.latitude,
            prevPoint.longitude,
            point.latitude,
            point.longitude
          );
          cumulativeDistance += distance;
        }

        elevationData.push(point.elevation ?? 0);
        distanceData.push(cumulativeDistance / 1000);
      });
    });

    const canvasContainer = document.getElementById('canvas');
    if (canvasContainer) {
      canvasContainer.innerHTML = '';

      const canvasElement = document.createElement('canvas');
      canvasElement.style.width = '100%';
      canvasElement.style.height = '100%';
      canvasContainer.appendChild(canvasElement);

      new Chart(canvasElement, {
        type: 'line',
        data: {
          labels: distanceData,
          datasets: [
            {
              label: 'Høyde (m)',
              data: elevationData,
              borderColor: 'rgb(167, 182, 166)',
              borderWidth: 3,
              fill: false,
              tension: 0.5,
              pointBackgroundColor: 'rgb(167, 182, 166)',
              pointBorderColor: 'rgba(0, 0, 0, .0)',
              pointRadius: 0,
              pointHoverRadius: 6,
              pointStyle: 'circle',
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                animation: false,
                usePointStyle: false,
                backgroundColor: '#27272779',
                borderColor: '#444',
                borderWidth: 1,
                callbacks: {
                  title: (context) => {
                    const labelIndex = context[0].dataIndex;
                    const distance = distanceData[labelIndex];
                    return `Distanse: ${distance.toFixed(2)} km`;
                  },
                  label: (context) => {
                    const elevation = context.raw as number;
                    return ` Høyde: ${Math.round(elevation)} moh`;
                  },
                }
              },
            legend: {
              display: false
            }
          },
          layout: {
            padding: 0
          },
          scales: {
            x: {
              type: 'linear',
              display: true,
              min: 0,
              max: distanceData[distanceData.length - 1]
            },
            y: {
              type: 'linear',
              display: true,
              min: 0
            }
          }
        }
      });
    }
  } catch (error) {
    console.error(`Failed to load GPX data for trail: ${trailName}`, error);
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

trailCanvas('Riehppegáisá');

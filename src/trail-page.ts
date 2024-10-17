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
              <div><i class="fa-solid fa-stairs"></i>${trail.grade}</div>
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
          </section>
  
          <section class="trail-map">
            <div id="map" class="map"></div>
          </section>
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

        showSlide(currentSlideIndex);
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
  

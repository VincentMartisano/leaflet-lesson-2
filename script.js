// 1. KINAHANGLAN: Usba kini! Paghimo og libreng account sa ://maptiler.com ug ipuli imong key dire.
const MAPTILER_KEY = 'YOUR_MAPTILER_API_KEY'; 

maptilersdk.config.apiKey = MAPTILER_KEY;

// 2. I-initialize ang Map gamit ang Hybrid (Satellite + Labels)
const map = new maptilersdk.Map({
    container: 'map', 
    style: maptilersdk.MapStyle.HYBRID, 
    center: [121.7740, 12.8797], // Coordinates sa Pilipinas
    zoom: 5.5,
    terrain: true // Gi-enable ang 3D ground structure
});

// 3. Paghimo sa 3D / 2D Switcher Button sa unahan sa mapa
const button = document.createElement('button');
button.textContent = '📦 Ibalhin sa 3D';
button.className = 'map-toggle-btn'; // Gigamit ang class gikan sa imong style.css

// I-append ang button direkta sa sudlanan sa map aron makita dayon
document.getElementById('map').appendChild(button);

let is3D = false;
button.addEventListener('click', () => {
    if (!is3D) {
        // I-tilt ug i-rotate ang cam para sa 3D perspective view
        map.easeTo({ pitch: 60, bearing: -20, duration: 1000 });
        button.textContent = '🗺️ Ibalhin sa 2D';
        is3D = true;
    } else {
        // Ibalik sa flat standard 2D view
        map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
        button.textContent = '📦 Ibalhin sa 3D';
        is3D = false;
    }
});

// Array container para sa markers aron sayon i-clear sa sunod nga search
let currentMarkers = [];

const form = document.getElementById('searchForm');
const input = document.getElementById('cityInput');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const city = input.value.trim();
    if (city.length < 2) return;

    // I-clear ang miaging mga marker sa mapa
    currentMarkers.forEach(marker => marker.remove());
    currentMarkers = [];

    const url = 'https://geocoding-api.open-meteo.com/v1/search?' + 
    new URLSearchParams({
        name: city,
        count: '5',
        language: 'en',
        format: 'json'
    });

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Request failed');
        const data = await response.json();
        const locations = data.results ?? [];
        
        if (locations.length === 0) {
            alert('Wala may nakit-an nga siyudad/lugar.');
            return;
        }

        const bounds = new maptilersdk.LngLatBounds();

        locations.forEach((place) => {
            const coords = [place.longitude, place.latitude];
            bounds.extend(coords);

            const popup = new maptilersdk.Popup({ offset: 25 })
                .setText(`${place.name}, ${place.country ?? ''}`);

            const marker = new maptilersdk.Marker({ color: '#ff0000' }) // Pula nga marker
                .setLngLat(coords)
                .setPopup(popup)
                .addTo(map);

            currentMarkers.push(marker);
        });

        // Dynamic positioning base sa gidaghanon sa nakit-an
        if (locations.length === 1) {
            map.flyTo({ center: [locations[0].longitude, locations[0].latitude], zoom: 11, duration: 2000 });
        } else {
            map.fitBounds(bounds, { padding: 50, duration: 2000 });
        }

    } catch (error) {
        console.error("Error sa pag-fetch sa lokasyon:", error);
    }
});

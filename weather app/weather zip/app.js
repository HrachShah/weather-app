// API Key
const API_KEY = '9fe1ff896625297f6e506793620d3378';

// Three.js variables
let scene, camera, renderer, sphere;

// Leaflet map
let map;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initMap();
    // Default city
    fetchWeather('London');
});

// Initialize Three.js
function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('threejs-canvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create glass sphere
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshPhysicalMaterial({
        transmission: 1,
        opacity: 0.5,
        metalness: 0,
        roughness: 0,
        ior: 1.45,
        thickness: 0.1,
        envMapIntensity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0,
        transmission: 1,
        side: THREE.DoubleSide
    });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 3;

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.01;
    renderer.render(scene, camera);
}

// Initialize Leaflet map
function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Fetch weather data
async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (data.cod === 200 || data.cod === "200") {
            updateUI(data);
            updateMap(data.coord.lat, data.coord.lon);
            updateSphere(data.main.temp);
        } else {
            showError('City not found');
        }
    } catch (error) {
        console.error('Error fetching weather:', error);
        showError('Error fetching weather data');
    }
}

// Update UI
function updateUI(data) {
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind').textContent = `Wind: ${data.wind.speed} m/s`;
}

// Update map
function updateMap(lat, lon) {
    map.setView([lat, lon], 13);
    L.marker([lat, lon]).addTo(map);
}

// Update sphere based on temperature
function updateSphere(temp) {
    // Change color based on temp
    let color;
    if (temp < 0) color = 0x87CEEB; // Cold blue
    else if (temp < 20) color = 0xFFD700; // Warm yellow
    else color = 0xFF4500; // Hot red
    sphere.material.color.setHex(color);

    // Add pulsating scale effect for excitement
    const scale = 1 + 0.1 * Math.sin(Date.now() * 0.005);
    sphere.scale.set(scale, scale, scale);
}

const errorMessage = document.getElementById('error-message');

// Clear error message
function clearError() {
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
}

// Show error message
function showError(message) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
}

// Clear UI
function clearUI() {
    document.getElementById('city-name').textContent = 'Select a city';
    document.getElementById('temperature').textContent = '--°C';
    document.getElementById('description').textContent = '--';
    document.getElementById('humidity').textContent = 'Humidity: --%';
    document.getElementById('wind').textContent = 'Wind: -- m/s';
    map.setView([51.505, -0.09], 13);
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    updateSphere(0);
}

let searchBtn = document.getElementById('search-btn');
let clearBtn = document.getElementById('clear-btn');
let cityInput = document.getElementById('city-input');

searchBtn.addEventListener('click', () => {
    clearError();
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        showError('Please enter a city name');
    }
});

clearBtn.addEventListener('click', () => {
    cityInput.value = '';
    clearError();
    clearUI();
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        clearError();
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        } else {
            showError('Please enter a city name');
        }
    }
});

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

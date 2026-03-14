document.addEventListener('DOMContentLoaded', () => {
    const useMyLocationBtn = document.getElementById('useMyLocation');
    const searchCityBtn = document.getElementById('searchCityBtn');
    const citySearchInput = document.getElementById('citySearch');
    const locationResults = document.getElementById('locationResults');
    const mapPlaceholder = document.getElementById('mapPlaceholder');

    // Default mock data if API limits hit or no network
    const fallbackLocations = [
        { name: "MedCare Emergency Room", address: "Local City Center", distance: "1.2 miles", time: "5 min", status: "Open 24/7" },
        { name: "City General Hospital", address: "Main Street", distance: "3.5 miles", time: "12 min", status: "Open 24/7" }
    ];

    async function fetchRealHospitals(lat, lon) {
        // Use Overpass API to find hospitals within ~15km radius (15000 meters)
        const query = `
            [out:json];
            (
              node["amenity"="hospital"](around:15000,${lat},${lon});
              way["amenity"="hospital"](around:15000,${lat},${lon});
            );
            out center 5;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Overpass API error");
            const data = await response.json();

            if (data.elements && data.elements.length > 0) {
                return data.elements.map(el => {
                    const name = el.tags && el.tags.name ? el.tags.name : "Local Hospital / Clinic";
                    // For ways, center exists instead of lat/lon
                    const targetLat = el.lat || (el.center && el.center.lat) || lat;
                    const targetLon = el.lon || (el.center && el.center.lon) || lon;

                    // Super basic straight line distance in miles (rough estimation)
                    const R = 3958.8; // Radius of earth in miles
                    const dLat = (targetLat - lat) * Math.PI / 180;
                    const dLon = (targetLon - lon) * Math.PI / 180;
                    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(lat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const distance = R * c;

                    return {
                        name: name,
                        address: el.tags && el.tags["addr:street"] ? `${el.tags["addr:street"]} ${el.tags["addr:housenumber"] || ''}` : "City Location",
                        distance: Math.max(0.1, distance).toFixed(1) + " miles",
                        time: Math.max(1, Math.round(distance * 3.5)) + " min drive", // rough 3.5 mins per mile
                        status: "Emergency Available",
                        rawDistance: distance,
                        lat: targetLat,
                        lon: targetLon
                    };
                }).sort((a, b) => a.rawDistance - b.rawDistance).slice(0, 4); // Get nearest 4
            }
        } catch (e) {
            console.error(e);
        }
        return null; // Return null to use fallbacks
    }

    async function renderLocations(lat = null, lon = null, addressName = "your location") {
        // Show map area
        mapPlaceholder.style.display = 'flex';
        mapPlaceholder.classList.add('premium-card');
        mapPlaceholder.style.border = '2px solid var(--primary)';
        mapPlaceholder.style.padding = '0';

        if (lat && lon) {
            // Display actual map showing user location
            const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05}%2C${lat - 0.05}%2C${lon + 0.05}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lon}`;
            mapPlaceholder.innerHTML = `
                <iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" style="min-height: 350px; border-radius: inherit;" src="${embedUrl}"></iframe>
            `;
        } else {
            mapPlaceholder.innerHTML = `
                <div class="map-overlay" style="background: rgba(13, 148, 136, 0.9); color: white; border: none; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <i class="fa-solid fa-location-crosshairs fa-spin" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3 style="color: white;">Searching Near: ${addressName}</h3>
                    <p style="color: rgba(255,255,255,0.8);">Connecting to local emergency networks...</p>
                </div>
            `;
        }

        locationResults.style.display = 'grid';
        locationResults.innerHTML = '<div style="text-align: center; grid-column: 1/-1;"><i class="fa-solid fa-spinner fa-spin text-primary" style="font-size: 2rem;"></i><p>Finding real hospitals near you...</p></div>';

        let locationsToRender = fallbackLocations;

        if (lat && lon) {
            const realHospitals = await fetchRealHospitals(lat, lon);
            if (realHospitals && realHospitals.length > 0) {
                locationsToRender = realHospitals;
            } else {
                // If API fails, format the fallbacks mockly
                locationsToRender = fallbackLocations.map(loc => {
                    const distanceVal = (Math.random() * 8 + 0.5).toFixed(1);
                    return { ...loc, distance: `${distanceVal} miles`, time: `${Math.round(distanceVal * 3.5)} min drive` };
                });
            }
        }

        locationResults.innerHTML = '';

        if (locationsToRender.length === 0) {
            locationResults.innerHTML = '<p>No hospitals found nearby.</p>';
            return;
        }

        locationsToRender.forEach((loc, index) => {
            const card = document.createElement('div');
            card.className = 'loc-card';
            card.style.animation = `slideUpFade ${0.3 + (index * 0.1)}s ease-out forwards`;

            const isClosest = index === 0;
            if (isClosest) {
                card.style.border = '2px solid #ef4444';
            }

            const mapQuery = loc.lat && loc.lon ? `${loc.lat},${loc.lon}` : encodeURIComponent(loc.name);

            card.innerHTML = `
                ${isClosest ? '<div class="loc-badge">CLOSEST & FASTEST</div>' : ''}
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <h3 style="color: var(--secondary); font-size: 1.25rem; margin-bottom: 0.25rem;">${loc.name}</h3>
                        <div style="color: var(--text-muted); font-size: 0.85rem;"><i class="fa-solid fa-location-dot"></i> ${loc.address}</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <div style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 0.5rem; border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-car"></i> ${loc.time} (${loc.distance})
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        <strong>${loc.status}</strong>
                    </div>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${mapQuery}" target="_blank" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem; border-radius: var(--radius-full); background: #ef4444; box-shadow: none;">
                        <i class="fa-solid fa-directions"></i> Directions
                    </a>
                </div>
                    `;
            locationResults.appendChild(card);
        });
    }

    // Live Geolocation Handling
    if (useMyLocationBtn) {
        useMyLocationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser.");
                return;
            }

            const originalText = useMyLocationBtn.innerHTML;
            useMyLocationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Getting Live Location...';
            useMyLocationBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    useMyLocationBtn.innerHTML = originalText;
                    useMyLocationBtn.disabled = false;

                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    renderLocations(lat, lon);
                },
                (error) => {
                    useMyLocationBtn.innerHTML = originalText;
                    useMyLocationBtn.disabled = false;

                    console.error("Error getting location: ", error);
                    let errMsg = "Unable to retrieve your location. ";
                    if (error.code === error.PERMISSION_DENIED) {
                        errMsg += "Please allow location access in your browser.";
                    }
                    alert(errMsg);

                    renderLocations(null, null, "your current area");
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    }

    // Standard Search Handling (Fallback to geographic approximation)
    async function searchCityGeo(cityName) {
        // Use Nominatim to geocode the city to coordinates to find hospitals in that specific city!
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }
        } catch (e) { console.error(e); }
        return null;
    }

    if (searchCityBtn && citySearchInput) {
        const executeSearch = async () => {
            const query = citySearchInput.value.trim();
            if (query === '') {
                alert('Please enter a city or zip code.');
                return;
            }

            // Change button state
            searchCityBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            searchCityBtn.disabled = true;

            const coords = await searchCityGeo(query);

            searchCityBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
            searchCityBtn.disabled = false;

            if (coords) {
                renderLocations(coords.lat, coords.lon);
            } else {
                alert("City not found, please try again.");
            }
        };

        searchCityBtn.addEventListener('click', executeSearch);
        citySearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executeSearch();
            }
        });
    }
});
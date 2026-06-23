// ── STATE & CONFIGURATION ─────────────────────────────────────────────────────────────
 
let markerCount = 0;
let  routingMarkers = []
const satelliteOfficeCoords = [14.7385201, 121.0602773];
const markers = [
    {
        id: "marker1",
        type: "house",
        coords: [14.7399741, 121.0694429],
        info: "House Information<br>Address: Block 17 Lot 4, Romans St. Corner Palau St., Sacred Heart Village<br>Lot Size: 326 sqm<br>House Size: 210 sqm<br>Number of Residents: 6 (Adult: 6 Child: 0)"
    },
    {
        id: "marker2",
        type: "house",
        coords: [14.7373541, 121.0682915],
        info: "House Information<br>Address: 6A St Andrew, Sacred Heart Village<br>Lot Size: -- sqm<br>House Size: -- sqm<br>Number of Residents: -- (Adult: -- Child: --)"
    },

    {
        id: "evacMarker1",
        type: "evacCenter",
        coords: [14.7415, 121.0578],
        info: "Evacuation Center Information<br>Address: Champaca Covered Court, Champaca St., Maligaya Park Subd."
    },
    {
        id: "evacMarker2",
        type: "evacCenter",
        coords: [14.7164, 121.0302],
        info: "Evacuation Center Information<br>Address: Vargas Multi-Purpose Hall, Narra St."
    },
    {
        id: "evacMarker3",
        type: "evacCenter",
        coords: [14.7386, 121.0590],
        info: "Evacuation Center Information<br>Address: Feliciano Covered Court, Maligaya Park Subd." 
    }
];
 

// ── ICONS ──────────────────────────────────────────────────────────────────────
 
const markerTypes = {
    house: {
        name: "House",
        icon: L.icon({
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        }),
        image: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
    },
    evacCenter: {
        name: "Evacuation Center",
        icon: L.icon({
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        }),
        image: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
    },

    office:  {
        name: "Satellite Office",
        icon: L.icon({
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        }),
        image: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    },
    hospital: {
        name: "Hospital",
        image: 'assets/hospital.svg.png'
    },
    police: {
        name: "Police Station",
        image: 'assets/policeStation.svg.png'
    },
    fire: {
        name: "Fire Station",
        image: 'assets/fireStation.svg.png'
    }
};
 
 
// ── MAP & LAYERS ───────────────────────────────────────────────────────────────
 
const map = L.map('map').setView([14.735, 121.060], 15);
 
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const floodLayer = L.esri.dynamicMapLayer({
    url:'https://ulap-hazards.georisk.gov.ph/arcgis/rest/services/MGBPublic/Flood/MapServer',
    layers:[0],
    opacity:0.6,
    disableKeepLevels: true,
    updateInterval: 250,
    useCors: true
}).addTo(map);

const faultLayer = L.esri.dynamicMapLayer({
    url: 'https://ulap-hazards.georisk.gov.ph/arcgis/rest/services/PHIVOLCSPublic/ActiveFault/MapServer',
    layers: [0],
    opacity: 1,
    disableKeepLevels: true,
    updateInterval: 250,
    useCors: true
}).addTo(map);

var legend = L.control({ position: 'bottomleft' });

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');

    var html = '<strong>Legend</strong>';
    
    for (var key in markerTypes) {
        html += `<img style="height:16px; width:16px; margin-right: 4px; " src="${markerTypes[key].image}"></img>` + markerTypes[key].name + '<br>';
    }

    div.innerHTML = html;
    return div;
};

legend.addTo(map);

// ── CONTROLLERS ───────────────────────────────────────────────────────────────────
 
const routingControl = L.Routing.control({
    waypoints: [],
    createMarker: function() { return null; },
    show: true,
    lineOptions: {
        styles: [{ color: '#007bff', weight: 5, opacity: 0.7 }]
    }
}).addTo(map);
 
document.querySelector('.leaflet-routing-container').style.display = 'none';
 
const geocoderControl = L.Control.geocoder({
    defaultMarkGeocode: false,
    placeholder: "Search streets or buildings...",
    collapsed: false
}).addTo(map);
 
 
// ── FUNCTIONS ──────────────────────────────────────────────────────────────────
 
function addRoutingMarker(coords) {
    
    if ((!routingMarkers.includes(coords)) && routingMarkers.length < 2) routingMarkers.push(coords);

    if (routingMarkers.length == 2) {
        routingControl.setWaypoints([
            L.latLng(routingMarkers[0]),
            L.latLng(routingMarkers[1])
        ]);
    }
}
 
function endRouting() {
    document.querySelector('.leaflet-routing-container').style.display = 'none';
    routingMarkers = [];
    routingControl.setWaypoints([]);
    document.getElementById('end-button').style.display = 'none';
    document.getElementById('routing-info').style.display ='none';
}
 
function saveTaskState(checkbox) {
    localStorage.setItem(checkbox.id, checkbox.checked);
}
 
function setupTaskRestore(marker, taskIds) {
    marker.on('popupopen', function() {
        taskIds.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = localStorage.getItem(id) === 'true';
            }
        });
    });
}
 
function addMarker(type, coords, info, id) {
    marker = L.marker(coords, { icon: markerTypes[type].icon }).addTo(map);

    switch (type) {
        case "house":
            const taskIDs = [
                `${id}-resident-count`,
                `${id}-safety-notice`
            ]
        
            marker.bindPopup(`
                <div style="font-family: Arial, sans-serif; padding: 5px; min-width: 200px;">
                    <h4 style="margin: 0 0 8px 0;">Inspection Tasks</h4>
                    <label style="display: block; margin: 6px 0; cursor: pointer;">
                        <input type="checkbox" id="${taskIDs[0]}" onchange="saveTaskState(this)"> Verify resident count
                    </label>
                    <label style="display: block; margin: 6px 0; cursor: pointer;">
                        <input type="checkbox" id="${taskIDs[1]}" onchange="saveTaskState(this)"> Deliver safety notice
                    </label>
                </div>`);
        
            setupTaskRestore(marker, taskIDs);
        
            break;

        case "evacCenter":
            break;
    }

    marker.bindTooltip(info);

    marker.on('click', function() {
        addRoutingMarker(coords);
    });
    
    return marker;
}

function toggleFloodLayer() {
    if(map.hasLayer(floodLayer)) {
        map.removeLayer(floodLayer);
    } else {
        map.addLayer(floodLayer);
    }
}

function toggleFaultLayer() {
    if(map.hasLayer(faultLayer)) {
        map.removeLayer(faultLayer);
    } else {
        map.addLayer(faultLayer);
    }
}

// ── EVENT LISTENERS ────────────────────────────────────────────────────────────
 
routingControl.on('routesfound', function(e) {
    const summary = e.routes[0].summary;
    const distanceKm = (summary.totalDistance / 1000).toFixed(2);
    const timeMinutes = Math.round(summary.totalTime / 60);
 
    document.querySelector('.leaflet-routing-container').style.display = 'block';
    document.getElementById('end-button').style.display = 'inline';
 
    const infoPanel = document.getElementById('routing-info');
    const metricsDiv = document.getElementById('route-metrics');
    infoPanel.style.display = 'block';
    metricsDiv.innerHTML = `
        <b>Distance:</b> ${distanceKm} km<br>
        <b>Est. Travel Time:</b> ${timeMinutes} mins
    `;
});
 
geocoderControl.on('markgeocode', function(e) {
    const geocodeResult = e.geocode;
 
    if (geocoderControl._customGeocodeMarker) {
        map.removeLayer(geocoderControl._customGeocodeMarker);
    }
 
    geocoderControl._customGeocodeMarker = L.marker(geocodeResult.center)
        .addTo(map)
        .bindPopup(`<b>Searched Location:</b><br>${geocodeResult.name}`)
        .openPopup();
 
    map.setView(geocodeResult.center, 16);
    routingMarkers = [];
    
    addRoutingMarker(geocodeResult.center);
    addRoutingMarker(satelliteOfficeCoords)
});
 
const searchInput = document.querySelector('.leaflet-control-geocoder-form input');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        if (this.value.trim() === "") {
            if (geocoderControl._customGeocodeMarker) {
                map.removeLayer(geocoderControl._customGeocodeMarker);
                geocoderControl._customGeocodeMarker = null;
            }
            document.getElementById('routing-info').style.display = 'none';
            routingControl.setWaypoints([]);
        }
    });
}
 
 
// ── MARKERS ────────────────────────────────────────────────────────────────────
 
const satelliteOffice = L.marker(satelliteOfficeCoords, { icon: markerTypes.office.icon })
    .addTo(map)
    .bindPopup("<b>Barangay Satellite Office</b><br>Sampaguita St. (Across Station 16, at the back of Fairview Terraces)");
 
satelliteOffice.on('click', function() {
        addRoutingMarker(satelliteOfficeCoords);
    });

for (let i = 0; i < markers.length; i++) {
    addMarker(markers[i].type, markers[i].coords, markers[i].info, markers[i].id);
}
 
 
// ── DATA LAYERS ────────────────────────────────────────────────────────────────
 
fetch('export.geojson')
    .then(res => res.json())
    .then(data => {
        const layer = L.geoJSON(data, {
            style: {
                color: 'red',
                weight: 2,
                fillOpacity: 0.1
            }
        }).addTo(map);
        map.fitBounds(layer.getBounds());
    })
    .catch(err => console.log("GeoJSON layout configuration payload skipped. Continuing runtime render layer setup."));
 

fetch('mrt.geojson')
    .then(res => res.json())
    .then(data => {
        const layer = L.geoJSON(data, {
            style: {
                color: 'blue',
                weight: 6,
                fillOpacity: 0
            }
        }).addTo(map);
        map.fitBounds(layer.getBounds());
    })
    .catch(err => console.log("GeoJSON layout configuration payload skipped. Continuing runtime render layer setup."));

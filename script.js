// API-endpoint en sleutel voor opgeslagen favorieten
const API_URL =
    "https://bruxellesdata.opendatasoft.com/api/explore/v2.1/catalog/datasets/" +
    "fontaines-d-eau-potable-gerees-par-la-ville-de-bruxelles/records/?lang=nl&limit=100";
const FAVORITES_KEY = "brussels-explorer-favorites";

// HTML-elementen die in de code worden gebruikt
const elements = {
    body: document.querySelector("#results-body"),
    search: document.querySelector("#search-input"),
    accessFilter: document.querySelector("#access-filter"),
    sort: document.querySelector("#sort-select"),
    locate: document.querySelector("#locate-button"),
    count: document.querySelector("#result-count"),
    locationStatus: document.querySelector("#location-status"),
    status: document.querySelector("#status-message"),
    favoritesPanel: document.querySelector("#favorites-panel"),
    favoritesContainer: document.querySelector("#favorites-container"),
    favoritesMenu: document.querySelector("#favorites-menu-button"),
    closeFavorites: document.querySelector("#close-favorites"),
    backdrop: document.querySelector("#panel-backdrop")
};

// Applicatiestatus met fonteinen, favorieten en gebruikerslocatie
const state = {
    fountains: [],
    favorites: readFavorites(),
    userLocation: null
};

document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    loadFountains();
});

// Eventlisteners voor zoekopdrachten, filters, sortering, locatiebepaling en favorieten
function bindEvents() {
    elements.search.addEventListener("input", renderResults);
    elements.accessFilter.addEventListener("change", renderResults);
    elements.sort.addEventListener("change", renderResults);
    elements.locate.addEventListener("click", findNearbyFountains);
    elements.body.addEventListener("click", handleResultClick);
    elements.favoritesContainer.addEventListener("click", handleFavoritePanelClick);
    elements.favoritesMenu.addEventListener("click", () => setFavoritesPanel(true));
    elements.closeFavorites.addEventListener("click", () => setFavoritesPanel(false));
    elements.backdrop.addEventListener("click", () => setFavoritesPanel(false));
}


//  Fonteinen ophalen van de API
async function loadFountains() {
    showStatus("De fonteinen worden geladen…");

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`API-fout (${response.status})`);

        const data = await response.json();
        state.fountains = Array.isArray(data.results) ? data.results : [];
        populateAccessFilter();
        hideStatus();
        renderResults();
        renderFavorites();
    } catch (error) {
        showStatus(`De gegevens konden niet geladen worden. ${error.message}`, true);
    }
}

// Unieke toegangstypen uit de API toevoegen aan filter
function populateAccessFilter() {
    const accessTypes = [...new Set(
        state.fountains.map((fountain) => fountain.access_type_nl).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "nl"));

    elements.accessFilter.insertAdjacentHTML(
        "beforeend",
        accessTypes.map((access) =>
            `<option value="${escapeHtml(access)}">${escapeHtml(access)}</option>`
        ).join("")
    );
}

// Resultaten filteren en sorteren 
function getFilteredFountains() {
    const query = elements.search.value.trim().toLocaleLowerCase("nl-BE");
    const access = elements.accessFilter.value;
    const sort = elements.sort.value;

    return state.fountains
        .filter((fountain) => {
            const text = [
                fountain.name_nl,
                fountain.address_nl,
                fountain.location_nl,
                fountain.municipality_nl
            ].filter(Boolean).join(" ").toLocaleLowerCase("nl-BE");

            return text.includes(query) &&
                (access === "all" || fountain.access_type_nl === access);
        })
        .sort((first, second) => {
            if (sort.startsWith("distance")) {
                const difference = getDistance(first) - getDistance(second);
                return sort === "distance-asc" ? difference : -difference;
            }

            const firstName = String(first.name_nl || "");
            const secondName = String(second.name_nl || "");
            const comparison = firstName.localeCompare(secondName, "nl");
            return sort === "name-asc" ? comparison : -comparison;
        });
}


// Gefilterde fonteinen weergeven in de tabel
function renderResults() {
    const fountains = getFilteredFountains();
    elements.count.textContent =
        `${fountains.length} ${fountains.length === 1 ? "tappunt" : "tappunten"}`;

    elements.body.innerHTML = fountains.length
        ? fountains.map(createResultRow).join("")
        : `<tr><td class="empty" colspan="5">Geen fonteinen gevonden. Pas je zoekterm of filter aan.</td></tr>`;
}

// Fontein omzetten naar een HTML tabelrij
function createResultRow(fountain) {
    const id = fountain.id_opendata;
    const isFavorite = state.favorites.includes(id);
    const point = fountain.geo_point_2d;
    const mapLink = fountain.google_maps ||
        `https://www.google.com/maps/search/?api=1&query=${point?.lat || ""},${point?.lon || ""}`;

    return `
        <tr data-id="${escapeHtml(id)}">
            <td>
                <strong>${escapeHtml(fountain.name_nl || "Drinkwaterfontein")}</strong>
                <span class="location">${escapeHtml(fountain.address_nl || fountain.location_nl || "Adres onbekend")}</span>
                <span class="municipality">${escapeHtml(fountain.municipality_nl || "Brussel")}</span>
            </td>
            <td><span class="access-status"><i></i>${escapeHtml(fountain.access_type_nl || "Onbekend")}</span></td>
            <td>${formatDistance(getDistance(fountain))}</td>
            <td><a class="action-link" href="${escapeHtml(mapLink)}" target="_blank" rel="noopener">Route </a></td>
            <td><button class="favorite-button ${isFavorite ? "is-favorite" : ""}" type="button"
                data-action="favorite" aria-label="${isFavorite ? "Verwijder favoriet" : "Voeg toe aan favorieten"}"
                aria-pressed="${isFavorite}">${isFavorite ? "♥" : "♡"}</button></td>
        </tr>
    `;
}
 
function handleResultClick(event) {
    const button = event.target.closest("[data-action='favorite']");
    if (!button) return;
    toggleFavorite(button.closest("[data-id]")?.dataset.id);
}

function toggleFavorite(id) {
    if (!id) return;
    state.favorites = state.favorites.includes(id)
        ? state.favorites.filter((favoriteId) => favoriteId !== id)
        : [...state.favorites, id];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorites));
    renderResults();
    renderFavorites();
}

function renderFavorites() {
    const favorites = state.fountains.filter((fountain) =>
        state.favorites.includes(fountain.id_opendata)
    );

    elements.favoritesContainer.innerHTML = favorites.length
        ? favorites.map((fountain) => `
            <div class="favorite-item" data-id="${escapeHtml(fountain.id_opendata)}">
                <div>
                    <strong>${escapeHtml(fountain.name_nl || "Drinkwaterfontein")}</strong>
                    <span>${escapeHtml(fountain.address_nl || "Adres onbekend")}</span>
                </div>
                <button type="button" data-action="remove-favorite" aria-label="Verwijder favoriet">×</button>
            </div>
        `).join("")
        : `<p class="muted">Je hebt nog geen favorieten opgeslagen.</p>`;
}

function handleFavoritePanelClick(event) {
    const button = event.target.closest("[data-action='remove-favorite']");
    if (button) toggleFavorite(button.closest("[data-id]")?.dataset.id);
}

// Huidige locatie ophalen en fonteinen op afstand sorteren
function findNearbyFountains() {
    if (!navigator.geolocation) {
        showStatus("Je browser ondersteunt geen locatiebepaling.", true);
        return;
    }

    elements.locate.disabled = true;
    elements.locate.textContent = "Locatie zoeken…";
    navigator.geolocation.getCurrentPosition(
        (position) => {
            state.userLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            elements.locationStatus.textContent = "Gesorteerd op afstand van jouw locatie.";
            elements.locate.disabled = false;
            elements.locate.textContent = "Opnieuw zoeken";
            elements.sort.value = "distance-asc";
            renderResults();
        },
        () => {
            elements.locate.disabled = false;
            elements.locate.textContent = "Fonteinen in mijn buurt";
            showStatus("Locatietoegang werd geweigerd. Geef toestemming en probeer opnieuw.", true);
        }
    );
}

function getDistance(fountain) {
    if (!state.userLocation || !fountain.geo_point_2d) return Number.POSITIVE_INFINITY;
    return calculateDistance(
        state.userLocation.lat,
        state.userLocation.lon,
        fountain.geo_point_2d.lat,
        fountain.geo_point_2d.lon
    );
}

// De afstand tussen twee geografische locaties berekenen
function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371;
    const latitudeDifference = degreesToRadians(lat2 - lat1);
    const longitudeDifference = degreesToRadians(lon2 - lon1);
    const a = Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(degreesToRadians(lat1)) *
        Math.cos(degreesToRadians(lat2)) *
        Math.sin(longitudeDifference / 2) ** 2;
    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function formatDistance(distance) {
    return Number.isFinite(distance) ? `${distance.toFixed(1)} km` : "—";
}

function setFavoritesPanel(isOpen) {
    elements.favoritesPanel.classList.toggle("is-open", isOpen);
    elements.favoritesPanel.setAttribute("aria-hidden", String(!isOpen));
    elements.favoritesMenu.setAttribute("aria-expanded", String(isOpen));
    elements.backdrop.hidden = !isOpen;
}

function readFavorites() {
    try {
        const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
        return Array.isArray(favorites) ? favorites : [];
    } catch {
        return [];
    }
}

function showStatus(message, isError = false) {
    elements.status.hidden = false;
    elements.status.textContent = message;
    elements.status.classList.toggle("error", isError);
}

function hideStatus() {
    elements.status.hidden = true;
}

// HTML-tekst in een veilige vorm plaatsen voor het voorkomen van XSS-aanvallen
function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

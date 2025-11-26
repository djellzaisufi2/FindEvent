// Kosovo Cities Data
const kosovoCities = [
    {
        name: "Prishtinë",
        nameEn: "Pristina",
        description: "The capital and largest city of Kosovo, known for its vibrant culture, modern architecture, and rich history.",
        characteristics: ["Capital City", "Cultural Hub", "Modern Architecture", "Educational Center"]
    },
    {
        name: "Mitrovicë",
        nameEn: "Mitrovica",
        description: "A historic city in northern Kosovo, known for its industrial heritage and cultural diversity.",
        characteristics: ["Historic City", "Industrial Heritage", "Cultural Diversity", "Northern Kosovo"]
    },
    {
        name: "Pejë",
        nameEn: "Peja",
        description: "A beautiful city in western Kosovo, famous for its natural beauty, the Rugova Gorge, and traditional architecture.",
        characteristics: ["Natural Beauty", "Rugova Gorge", "Traditional Architecture", "Tourism"]
    },
    {
        name: "Prizren",
        nameEn: "Prizren",
        description: "One of Kosovo's most beautiful cities, known for its Ottoman architecture, historic old town, and cultural festivals.",
        characteristics: ["Historic Old Town", "Ottoman Architecture", "Cultural Festivals", "Tourism"]
    },
    {
        name: "Gjakovë",
        nameEn: "Gjakova",
        description: "A city with rich cultural heritage, known for its traditional crafts, historic bazaar, and warm hospitality.",
        characteristics: ["Traditional Crafts", "Historic Bazaar", "Cultural Heritage", "Handicrafts"]
    },
    {
        name: "Gjilan",
        nameEn: "Gjilani",
        description: "An important economic center in eastern Kosovo, known for its commerce and growing development.",
        characteristics: ["Economic Center", "Commerce", "Eastern Kosovo", "Development"]
    },
    {
        name: "Ferizaj",
        nameEn: "Ferizaj",
        description: "A strategic city in central Kosovo, known for its location and growing urban development.",
        characteristics: ["Strategic Location", "Central Kosovo", "Urban Development", "Transport Hub"]
    },
    {
        name: "Rahovec",
        nameEn: "Rahovec",
        description: "Known as the wine capital of Kosovo, famous for its vineyards and wine production.",
        characteristics: ["Wine Capital", "Vineyards", "Wine Production", "Agriculture"]
    },
    {
        name: "Suharekë",
        nameEn: "Suhareka",
        description: "A charming city in southern Kosovo, known for its peaceful atmosphere and traditional values.",
        characteristics: ["Peaceful Atmosphere", "Traditional Values", "Southern Kosovo", "Community"]
    },
    {
        name: "Lipjan",
        nameEn: "Lipjani",
        description: "A city near the capital, known for its proximity to Prishtinë and growing residential development.",
        characteristics: ["Near Capital", "Residential Development", "Suburban", "Accessibility"]
    },
    {
        name: "Podujevë",
        nameEn: "Podujeva",
        description: "A city in northern Kosovo, known for its strategic location and agricultural activities.",
        characteristics: ["Strategic Location", "Agriculture", "Northern Kosovo", "Trade"]
    },
    {
        name: "Vushtrri",
        nameEn: "Vushtrri",
        description: "A historic city with ancient roots, known for its archaeological sites and cultural heritage.",
        characteristics: ["Historic City", "Archaeological Sites", "Cultural Heritage", "Ancient Roots"]
    },
    {
        name: "Skenderaj",
        nameEn: "Skenderaj",
        description: "A city with significant historical importance, known for its role in Kosovo's history.",
        characteristics: ["Historical Importance", "Cultural Significance", "Community", "Heritage"]
    },
    {
        name: "Malishevë",
        nameEn: "Malisheva",
        description: "A city in western Kosovo, known for its natural surroundings and community spirit.",
        characteristics: ["Natural Surroundings", "Community Spirit", "Western Kosovo", "Rural Charm"]
    },
    {
        name: "Deçan",
        nameEn: "Deçani",
        description: "A city known for the famous Visoki Dečani Monastery, a UNESCO World Heritage site.",
        characteristics: ["UNESCO Site", "Visoki Dečani Monastery", "Religious Heritage", "Tourism"]
    }
];

// Selected city for filtering
let selectedCity = "all";

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    displayCities();
    setupCityFilters();
    loadAllEvents();
});

// Display all cities in the grid
function displayCities() {
    const citiesGrid = document.getElementById('citiesGrid');
    if (!citiesGrid) return;

    citiesGrid.innerHTML = kosovoCities.map(city => `
        <div class="city-card" data-city="${city.name}">
            <h3 class="city-name">${city.name}</h3>
            <div class="city-content">
                <p class="city-description">${city.description}</p>
                <div class="city-characteristics">
                    <h4 class="city-characteristics-title">Key Features</h4>
                    <ul class="city-characteristics-list">
                        ${city.characteristics.map(char => `<li>${char}</li>`).join('')}
                    </ul>
                </div>
                <button class="select-city-btn" data-city="${city.name}">
                    View Events in ${city.name}
                </button>
            </div>
        </div>
    `).join('');

    // Add click handlers to city cards and buttons
    document.querySelectorAll('.city-card, .select-city-btn').forEach(element => {
        element.addEventListener('click', function(e) {
            const city = this.getAttribute('data-city') || this.closest('.city-card')?.getAttribute('data-city');
            if (city) {
                selectCity(city);
            }
        });
    });
}

// Setup city filter buttons
function setupCityFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const city = this.getAttribute('data-city');
            selectCity(city);
        });
    });
}

// Select a city and filter events
function selectCity(cityName) {
    selectedCity = cityName;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.getAttribute('data-city') === cityName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Scroll to events section
    const eventsSection = document.getElementById('cityEventsSection');
    if (eventsSection) {
        eventsSection.style.display = 'block';
        eventsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Load and display filtered events
    loadFilteredEvents(cityName);
}

// Load all events
function loadAllEvents() {
    fetch('../api/get-events.php')
        .then(response => response.json())
        .then(events => {
            // Store events globally for filtering
            window.allEvents = events || [];
        })
        .catch(error => {
            console.error('Error loading events:', error);
            window.allEvents = [];
        });
}

// Load and display filtered events by city
function loadFilteredEvents(cityName) {
    const eventsGrid = document.getElementById('cityEventsGrid');
    const eventsTitle = document.getElementById('cityEventsTitle');
    
    if (!eventsGrid || !eventsTitle) return;

    // Show loading state
    eventsGrid.innerHTML = '<div class="loading-events">Loading events...</div>';

    // Load events from server
    fetch('../api/get-events.php')
        .then(response => response.json())
        .then(events => {
            let filteredEvents = events || [];

            // Filter by city if not "all"
            if (cityName !== 'all') {
                filteredEvents = filteredEvents.filter(event => {
                    const location = event.location || '';
                    // Check if location contains the city name (case insensitive)
                    return location.toLowerCase().includes(cityName.toLowerCase());
                });
            }

            // Update title
            if (cityName === 'all') {
                eventsTitle.textContent = 'All Events in Kosovo';
            } else {
                eventsTitle.textContent = `Events in ${cityName}`;
            }

            // Display events
            displayFilteredEvents(filteredEvents, eventsGrid);
        })
        .catch(error => {
            console.error('Error loading events:', error);
            eventsGrid.innerHTML = '<div class="no-events">Error loading events. Please try again later.</div>';
        });
}

// Display filtered events
function displayFilteredEvents(events, container) {
    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="no-events">
                <p>No events found for this city.</p>
                <p class="no-events-hint">Be the first to create an event in ${selectedCity === 'all' ? 'Kosovo' : selectedCity}!</p>
            </div>
        `;
        return;
    }

    // Sort events by date (earliest first)
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = events.map(event => `
        <div class="event-card" data-event-id="${event.id}">
            <div class="event-card-header">
                <h3 class="event-card-title">${escapeHtml(event.title || 'Untitled Event')}</h3>
            </div>
            <div class="event-card-body">
                <div class="event-info">
                    <span class="event-icon">📅</span>
                    <span>${formatDate(event.date)} at ${formatTime(event.time)}</span>
                </div>
                <div class="event-info">
                    <span class="event-icon">📍</span>
                    <span>${escapeHtml(event.location || 'Location TBA')}</span>
                </div>
                <div class="event-info">
                    <span class="event-icon">👤</span>
                    <span>Organized by ${escapeHtml(event.organizer || 'Unknown')}</span>
                </div>
                ${event.price > 0 ? `
                <div class="event-info">
                    <span class="event-icon">💶</span>
                    <span>${event.price.toFixed(2)} EUR</span>
                </div>
                ` : '<div class="event-info"><span class="event-icon">🆓</span><span>Free</span></div>'}
                ${event.capacity ? `
                <div class="event-info">
                    <span class="event-icon">👥</span>
                    <span>Max ${event.capacity} participants</span>
                </div>
                ` : ''}
            </div>
            <div class="event-card-footer">
                <p class="event-description-preview">${escapeHtml((event.description || '').substring(0, 100))}${(event.description || '').length > 100 ? '...' : ''}</p>
                <button class="view-event-btn" onclick="viewEventDetails('${event.id}')">View Details</button>
            </div>
        </div>
    `).join('');

    // Add click handlers to event cards
    container.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('view-event-btn')) {
                const eventId = this.getAttribute('data-event-id');
                if (eventId) {
                    viewEventDetails(eventId);
                }
            }
        });
    });
}

// View event details
function viewEventDetails(eventId) {
    window.location.href = `../event-details/event-details.html?id=${eventId}`;
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'Date TBA';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    if (!timeString) return 'Time TBA';
    return timeString;
}


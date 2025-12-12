// Event Details Page
document.addEventListener('DOMContentLoaded', function() {
    // Check if city parameter exists
    const urlParams = new URLSearchParams(window.location.search);
    const city = urlParams.get('city');
    
    if (city) {
        // Display city events message
        displayCityEvents(city);
    } else {
        // Load event details by ID (existing functionality)
        loadEventDetails();
    }
});

function displayCityEvents(city) {
    const detailsCard = document.getElementById('eventDetailsCard');
    
    // Show loading state
    detailsCard.innerHTML = `
        <div class="city-events-header">
            <h1 class="city-events-title">Eventet për qytetin: ${escapeHtml(city)}</h1>
            <div class="loading">Duke ngarkuar eventet...</div>
        </div>
    `;
    
    // Load events from server and localStorage
    loadCityEvents(city);
}

function loadCityEvents(city) {
    const allEvents = [];
    
    // Try to load from server first
    loadEventsFromServer()
        .then(serverEvents => {
            if (serverEvents && Array.isArray(serverEvents)) {
                allEvents.push(...serverEvents);
            }
            
            // Also load from localStorage (all categories)
            const categories = ['kidsEvents', 'sportsEvents', 'musicEvents'];
            categories.forEach(category => {
                const localEvents = JSON.parse(localStorage.getItem(category) || '[]');
                if (Array.isArray(localEvents)) {
                    allEvents.push(...localEvents);
                }
            });
            
            // Filter events by city (case-insensitive)
            const cityEvents = allEvents.filter(event => {
                if (!event.location) return false;
                const location = event.location.toLowerCase().trim();
                const cityLower = city.toLowerCase().trim();
                // Check if location contains the city name or matches exactly
                return location === cityLower || 
                       location.includes(cityLower) || 
                       cityLower.includes(location) ||
                       location.startsWith(cityLower) ||
                       location.endsWith(cityLower);
            });
            
            // Display filtered events
            displayCityEventsList(city, cityEvents);
        })
        .catch(error => {
            console.log('Server load failed, using localStorage only:', error);
            
            // Fallback to localStorage only
            const categories = ['kidsEvents', 'sportsEvents', 'musicEvents'];
            const allEvents = [];
            
            categories.forEach(category => {
                const localEvents = JSON.parse(localStorage.getItem(category) || '[]');
                if (Array.isArray(localEvents)) {
                    allEvents.push(...localEvents);
                }
            });
            
            // Filter events by city
            const cityEvents = allEvents.filter(event => {
                if (!event.location) return false;
                const location = event.location.toLowerCase().trim();
                const cityLower = city.toLowerCase().trim();
                // Check if location contains the city name or matches exactly
                return location === cityLower || 
                       location.includes(cityLower) || 
                       cityLower.includes(location) ||
                       location.startsWith(cityLower) ||
                       location.endsWith(cityLower);
            });
            
            // Display filtered events
            displayCityEventsList(city, cityEvents);
        });
}

function loadEventsFromServer() {
    return fetch('../api/get-events.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load events');
            }
            return response.json();
        })
        .catch(error => {
            console.log('Error loading from server:', error);
            throw error;
        });
}

function displayCityEventsList(city, events) {
    const detailsCard = document.getElementById('eventDetailsCard');
    
    if (events.length === 0) {
        detailsCard.innerHTML = `
            <div class="city-events-header">
                <h1 class="city-events-title">Eventet për qytetin: ${escapeHtml(city)}</h1>
                <p class="city-events-subtitle">(ende s'ka evente të shtuar)</p>
            </div>
        `;
        return;
    }
    
    // Sort events by date (earliest first)
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get category icon
    function getCategoryIcon(category) {
        const icons = {
            'kids': '👶',
            'sports': '⚽',
            'music': '🎵',
            'art': '🎨',
            'bakery': '🍰',
            'reading': '📚'
        };
        return icons[category] || '📅';
    }
    
    detailsCard.innerHTML = `
        <div class="city-events-header">
            <h1 class="city-events-title">Eventet për qytetin: ${escapeHtml(city)}</h1>
            <p class="city-events-count">Gjithsej ${events.length} ${events.length === 1 ? 'event' : 'evente'}</p>
        </div>
        <div class="city-events-grid">
            ${events.map(event => `
                <div class="city-event-card" data-event-id="${event.id}">
                    <div class="city-event-card-header">
                        <h3 class="city-event-card-title">${escapeHtml(event.title)}</h3>
                        <span class="city-event-category">${getCategoryIcon(event.category || 'kids')} ${event.category || 'Event'}</span>
                    </div>
                    <div class="city-event-card-body">
                        <div class="city-event-info">
                            <span class="city-event-icon">📅</span>
                            <span>${formatDate(event.date)} në ${formatTime(event.time)}</span>
                        </div>
                        <div class="city-event-info">
                            <span class="city-event-icon">📍</span>
                            <span>${escapeHtml(event.location)}</span>
                        </div>
                        <div class="city-event-info">
                            <span class="city-event-icon">👤</span>
                            <span>Organizuar nga ${escapeHtml(event.organizer)}</span>
                        </div>
                        ${event.price > 0 ? `
                        <div class="city-event-info">
                            <span class="city-event-icon">💶</span>
                            <span>${event.price.toFixed(2)} EUR</span>
                        </div>
                        ` : '<div class="city-event-info"><span class="city-event-icon">🆓</span><span>Falas</span></div>'}
                        ${event.capacity ? `
                        <div class="city-event-info">
                            <span class="city-event-icon">👥</span>
                            <span>Maksimumi ${event.capacity} pjesëmarrës</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="city-event-card-footer">
                        <p class="city-event-description">${escapeHtml(event.description.substring(0, 120))}${event.description.length > 120 ? '...' : ''}</p>
                        <div class="city-event-card-actions">
                            <button class="view-city-event-btn" onclick="viewEventDetails('${event.id}')">Shiko Detajet</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function viewEventDetails(eventId) {
    window.location.href = `event-details.html?id=${eventId}`;
}

function loadEventDetails() {
    // Get event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
        showError('Event not found');
        return;
    }

    // Try to load from server first, fallback to localStorage
    loadEventFromServer(eventId)
        .then(event => {
            if (!event) {
                // Fallback to localStorage - check all categories
                const categories = ['kidsEvents', 'sportsEvents', 'musicEvents', 'readingEvents'];
                for (const category of categories) {
                    const events = JSON.parse(localStorage.getItem(category) || '[]');
                    event = events.find(e => e.id === eventId);
                    if (event) break;
                }
            }
            
            if (!event) {
                showError('Event not found');
                return;
            }

            // Display event details
            displayEventDetails(event);
        })
        .catch(error => {
            console.log('Server load failed, using localStorage:', error);
            // Check all categories in localStorage
            const categories = ['kidsEvents', 'sportsEvents', 'musicEvents', 'readingEvents'];
            let event = null;
            for (const category of categories) {
                const events = JSON.parse(localStorage.getItem(category) || '[]');
                event = events.find(e => e.id === eventId);
                if (event) break;
            }
            
            if (!event) {
                showError('Event not found');
                return;
            }

            displayEventDetails(event);
        });
}

// Load single event from PHP backend
function loadEventFromServer(eventId) {
    return fetch(`api/get-events.php?id=${eventId}`)
        .then(response => {
            if (response.status === 404) {
                return null;
            }
            return response.json();
        });
}

function displayEventDetails(event) {
    const detailsCard = document.getElementById('eventDetailsCard');
    
    // Get category info
    const categoryInfo = getCategoryInfo(event.category || 'music');
    
    // Get event image
    const eventImage = event.image || event.imageUrl || '../images/gjakovamusicevent.jpg';
    const imageHtml = eventImage ? 
        `<div class="event-details-image">
            <img src="${escapeHtml(eventImage)}" alt="${escapeHtml(event.title)}" class="event-img">
        </div>` : '';
    
    // Determine back link based on category
    let backLink = '../cities/cities.html';
    let backLinkText = '← Kthehu te Qytetet';
    
    if (event.category === 'music') {
        backLink = '../music/music.html';
        backLinkText = '← Back to Music Events';
    } else if (event.category === 'sports') {
        backLink = '../sports/sports.html';
        backLinkText = '← Back to Events';
    }
    
    detailsCard.innerHTML = `
        ${imageHtml}
        <div class="event-details-header">
            <h1 class="event-details-title">${escapeHtml(event.title)}</h1>
        </div>
        <div class="event-details-info">
            <div class="event-info-simple">
                <span class="info-label">Date:</span>
                <span class="info-value">${formatDate(event.date)} • ${formatTime(event.time)}</span>
            </div>
            <div class="event-info-simple">
                <span class="info-label">Location:</span>
                <span class="info-value">${escapeHtml(event.location)}</span>
            </div>
        </div>
        <div class="event-description-section">
            <p class="event-description-full">${escapeHtml(event.description)}</p>
        </div>
        <div class="event-location-section">
            <h2 class="section-title">Event Location</h2>
            <div id="eventMap" class="event-map-container">
                <!-- Google Maps will be loaded here -->
            </div>
        </div>
        <div class="back-link-container">
            <a href="${backLink}" class="back-link">${backLinkText}</a>
        </div>
    `;
    
    
    // Initialize Google Maps
    setTimeout(() => {
        initEventMap(event.location);
    }, 200);
}

function getCategoryInfo(category) {
    const categories = {
        'music': { icon: '🎵', name: 'Music Event' },
        'kids': { icon: '👶', name: 'Kids Event' },
        'sports': { icon: '⚽', name: 'Sports Event' },
        'art': { icon: '🎨', name: 'Art Event' },
        'reading': { icon: '📚', name: 'Reading Event' },
        'bakery': { icon: '🍰', name: 'Bakery Event' }
    };
    return categories[category] || { icon: '📅', name: 'Event' };
}

function initEventMap(location) {
    const mapContainer = document.getElementById('eventMap');
    if (!mapContainer || !location) return;
    
    // Encode location for Google Maps embed (using search instead of place API)
    const encodedLocation = encodeURIComponent(location + ', Kosovo');
    const mapUrl = `https://www.google.com/maps?q=${encodedLocation}&output=embed`;
    
    mapContainer.innerHTML = `<iframe 
        width="100%" 
        height="100%" 
        style="border:0" 
        loading="lazy" 
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        src="${mapUrl}">
    </iframe>`;
}

function contactOrganizer(email, phone) {
    const message = `Hi, I'm interested in your event. Please contact me.`;
    
    // Open email client
    window.location.href = `mailto:${email}?subject=Event Inquiry&body=${encodeURIComponent(message)}`;
}

function shareEvent(eventId) {
    const eventUrl = window.location.href;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'Check out this event!',
            text: 'I found an interesting event you might like.',
            url: eventUrl
        }).catch(err => {
            console.log('Error sharing:', err);
            copyToClipboard(eventUrl);
        });
    } else {
        // Fallback: Copy to clipboard
        copyToClipboard(eventUrl);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Event link copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Delete event from details page
function deleteEventFromDetails(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }

    // Remove from localStorage
    let events = JSON.parse(localStorage.getItem('kidsEvents') || '[]');
    events = events.filter(event => event.id !== eventId);
    localStorage.setItem('kidsEvents', JSON.stringify(events));

    // Try to delete from server
    deleteEventFromServer(eventId);

    // Show success message
    showNotification('Event deleted successfully!', 'success');

    // Redirect back to kids page
    setTimeout(() => {
        window.location.href = 'kids.html';
    }, 1000);
}

// Delete event from PHP backend
function deleteEventFromServer(eventId) {
    fetch(`api/delete-event.php?id=${eventId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Event deleted from server:', data);
    })
    .catch(error => {
        console.log('Server delete failed:', error);
    });
}

function showError(message) {
    const detailsCard = document.getElementById('eventDetailsCard');
    detailsCard.innerHTML = `
        <div class="error-message">
            <h2>${escapeHtml(message)}</h2>
            <a href="kids.html" class="back-link">← Back to Events</a>
        </div>
    `;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


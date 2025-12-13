// Home Page Events Loader - New Design
// Loads and displays events from all categories on the home page

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    return timeString || '';
}

// Load events from all categories
async function loadAllEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;

    try {
        // Try to load from server
        // Check if we're in index/index.html or root index.html
        const currentPath = window.location.pathname;
        const apiPath = currentPath.includes('/index/') 
            ? '../api/get-events.php'
            : './api/get-events.php';
        const response = await fetch(apiPath);
        if (response.ok) {
            const allEvents = await response.json();
            if (allEvents && Array.isArray(allEvents) && allEvents.length > 0) {
                displayEvents(allEvents);
                return;
            }
        }
    } catch (error) {
        console.log('Server load failed, using localStorage:', error);
    }

    // Fallback to localStorage - combine events from all categories
    const categories = ['kids', 'music', 'sports', 'art', 'bakery', 'reading'];
    let allEvents = [];

    categories.forEach(category => {
        // Try both naming conventions
        const categoryEvents1 = JSON.parse(localStorage.getItem(`${category}Events`) || '[]');
        const categoryEvents2 = JSON.parse(localStorage.getItem(`${category}-events`) || '[]');
        const categoryEvents = categoryEvents1.length > 0 ? categoryEvents1 : categoryEvents2;
        
        categoryEvents.forEach(event => {
            if (!event.category) {
                event.category = category; // Add category to event if not present
            }
        });
        allEvents = allEvents.concat(categoryEvents);
    });

    // Also check for events stored directly in localStorage with different keys
    const allLocalStorageKeys = Object.keys(localStorage);
    allLocalStorageKeys.forEach(key => {
        if (key.includes('event') || key.includes('Event')) {
            try {
                const storedData = JSON.parse(localStorage.getItem(key) || '[]');
                if (Array.isArray(storedData) && storedData.length > 0) {
                    storedData.forEach(event => {
                        // Only add if not already in allEvents
                        if (!allEvents.find(e => e.id === event.id)) {
                            allEvents.push(event);
                        }
                    });
                }
            } catch (e) {
                // Ignore invalid JSON
            }
        }
    });

    displayEvents(allEvents);
}

// Display events
function displayEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;

    if (!events || events.length === 0) {
        eventsGrid.innerHTML = '<div class="no-events"><p>No events yet. Check out our categories to find events!</p></div>';
        return;
    }

    // Filter out events that don't have enough data
    const validEvents = events.filter(event => {
        return event && 
               event.title && 
               event.title.trim() !== '' &&
               event.date &&
               event.location &&
               event.organizer;
    });

    if (validEvents.length === 0) {
        eventsGrid.innerHTML = '<div class="no-events"><p>No events yet. Check out our categories to find events!</p></div>';
        return;
    }

    // Sort events by date (upcoming first)
    validEvents.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });

    eventsGrid.innerHTML = validEvents.map(event => {
        // Determine category icon
        const categoryIcons = {
            'kids': '👶',
            'music': '🎵',
            'sports': '⚽',
            'art': '🎨',
            'bakery': '🍰',
            'reading': '📚'
        };
        const categoryIcon = categoryIcons[event.category] || '📅';

        // Get image if available
        let eventImage = event.image || event.imageUrl || event.photo || event.photoUrl || '';
        
        // If image exists but is relative path, make sure it's correct
        if (eventImage && !eventImage.startsWith('http') && !eventImage.startsWith('/') && !eventImage.startsWith('./')) {
            if (!eventImage.includes('/')) {
                eventImage = `images/${eventImage}`;
            }
        }
        
        const imageHtml = eventImage ? 
            `<div class="event-card-image">
                <img src="${escapeHtml(eventImage)}" alt="${escapeHtml(event.title)}" onerror="this.parentElement.style.display='none'">
            </div>` : '';

        // Determine category badge color
        const categoryColors = {
            'kids': '#ff6b9d',
            'music': '#764ba2',
            'sports': '#667eea',
            'art': '#f093fb',
            'bakery': '#ffa500',
            'reading': '#4ecdc4'
        };
        const badgeColor = categoryColors[event.category] || '#667eea';
        
        return `
            <div class="event-card" data-event-id="${event.id}" data-category="${event.category || ''}">
                ${imageHtml}
                <div class="event-card-header">
                    <span class="event-category-badge" style="background: ${badgeColor}">${categoryIcon} ${(event.category || 'event').toUpperCase()}</span>
                    <h3 class="event-card-title">${escapeHtml(event.title)}</h3>
                </div>
                <div class="event-card-body">
                    <div class="event-info">
                        <span class="event-icon">📅</span>
                        <span>${formatDate(event.date)} at ${formatTime(event.time)}</span>
                    </div>
                    <div class="event-info">
                        <span class="event-icon">📍</span>
                        <span>${escapeHtml(event.location)}</span>
                    </div>
                    <div class="event-info">
                        <span class="event-icon">👤</span>
                        <span>${escapeHtml(event.organizer)}</span>
                    </div>
                    ${event.price > 0 ? `
                    <div class="event-info">
                        <span class="event-icon">💶</span>
                        <span>${event.price.toFixed(2)} EUR</span>
                    </div>
                    ` : '<div class="event-info"><span class="event-icon">🆓</span><span>Free</span></div>'}
                </div>
                <div class="event-card-footer">
                    <p class="event-description-preview">${escapeHtml((event.description || '').substring(0, 80))}${(event.description || '').length > 80 ? '...' : ''}</p>
                    <div class="event-card-actions">
                        <button class="view-event-btn" onclick="viewEventDetails('${event.id}', '${event.category || ''}')">View Details</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// View event details - navigate directly to event details page
function viewEventDetails(eventId, category) {
    // Use relative path that works with both Live Server and regular server
    // Check if we're in index/index.html or root index.html
    const currentPath = window.location.pathname;
    const eventDetailsPath = currentPath.includes('/index/') 
        ? `../event-details/event-details.html?id=${eventId}`
        : `./event-details/event-details.html?id=${eventId}`;
    window.location.href = eventDetailsPath;
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllEvents);
} else {
    loadAllEvents();
}


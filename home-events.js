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
        const response = await fetch('api/get-events.php');
        if (response.ok) {
            const allEvents = await response.json();
            displayEvents(allEvents);
            return;
        }
    } catch (error) {
        console.log('Server load failed, using localStorage:', error);
    }

    // Fallback to localStorage - combine events from all categories
    const categories = ['kids', 'music', 'sports', 'art', 'bakery', 'reading'];
    let allEvents = [];

    categories.forEach(category => {
        const categoryEvents = JSON.parse(localStorage.getItem(`${category}Events`) || '[]');
        categoryEvents.forEach(event => {
            event.category = category; // Add category to event
        });
        allEvents = allEvents.concat(categoryEvents);
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

    // Sort events by date (upcoming first)
    events.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });

    eventsGrid.innerHTML = events.map(event => {
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

        return `
            <div class="event-card" data-event-id="${event.id}" data-category="${event.category || ''}">
                ${imageHtml}
                <div class="event-card-header">
                    <span class="event-category-badge">${categoryIcon} ${(event.category || 'event').toUpperCase()}</span>
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
    window.location.href = `../event-details/event-details.html?id=${eventId}`;
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllEvents);
} else {
    loadAllEvents();
}


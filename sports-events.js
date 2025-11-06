// Sports Events Management System
document.addEventListener('DOMContentLoaded', function() {
    // Initialize events system
    if (document.getElementById('createEventBtn')) {
        initializeEventSystem();
    }
    if (document.getElementById('eventsGrid')) {
        loadEvents();
    }
});

// Initialize event creation system
function initializeEventSystem() {
    const createBtn = document.getElementById('createEventBtn');
    const modal = document.getElementById('eventFormModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const eventForm = document.getElementById('eventForm');

    // Open modal
    createBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        eventForm.reset();
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        eventForm.reset();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            eventForm.reset();
        }
    });

    // Handle form submission
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createEvent();
    });

    // Set minimum date to today
    const dateInput = document.getElementById('eventDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

// Create new event
function createEvent() {
    const formData = {
        id: Date.now().toString(), // Simple ID generation
        title: document.getElementById('eventTitle').value,
        organizer: document.getElementById('organizerName').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        price: parseFloat(document.getElementById('eventPrice').value) || 0,
        capacity: parseInt(document.getElementById('eventCapacity').value) || null,
        email: document.getElementById('organizerEmail').value,
        phone: document.getElementById('organizerPhone').value || null,
        category: 'sports',
        createdAt: new Date().toISOString()
    };

    // Try to save to PHP backend first
    saveEventToServer(formData);
    
    // Also save to localStorage as backup
    let events = JSON.parse(localStorage.getItem('sportsEvents') || '[]');
    events.push(formData);
    localStorage.setItem('sportsEvents', JSON.stringify(events));

    // Close modal and reset form
    document.getElementById('eventFormModal').style.display = 'none';
    document.getElementById('eventForm').reset();

    // Reload events
    loadEvents();

    // Show success message
    showNotification('Event created successfully!', 'success');
}

// Save event to PHP backend
function saveEventToServer(eventData) {
    fetch('api/save-event.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Event saved to server:', data);
    })
    .catch(error => {
        console.log('Server save failed, using localStorage only:', error);
    });
}

// Load and display events
function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;

    // Try to load from server first, fallback to localStorage
    loadEventsFromServer()
        .then(events => {
            if (!events || events.length === 0) {
                // Fallback to localStorage
                events = JSON.parse(localStorage.getItem('sportsEvents') || '[]');
            }
            displayEvents(events);
            // Update background opacity when events are loaded
            updateBackgroundOpacity(events.length);
        })
        .catch(error => {
            console.log('Server load failed, using localStorage:', error);
            const events = JSON.parse(localStorage.getItem('sportsEvents') || '[]');
            displayEvents(events);
            updateBackgroundOpacity(events.length);
        });
}

// Update background opacity based on number of events
function updateBackgroundOpacity(eventCount) {
    const background = document.querySelector('.sports-background');
    if (background) {
        if (eventCount > 0) {
            background.style.opacity = '0.25';
            background.classList.add('has-events');
        } else {
            background.style.opacity = '0.6';
            background.classList.remove('has-events');
        }
    }
}

// Load events from PHP backend
function loadEventsFromServer() {
    return fetch('api/get-events.php?category=sports')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                return data;
            }
            return [];
        });
}

// Display events in the grid
function displayEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    if (events.length === 0) {
        eventsGrid.innerHTML = '<div class="no-events"><p>No events yet. Create the first event!</p></div>';
        return;
    }

    // Sort events by date (earliest first)
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    eventsGrid.innerHTML = events.map(event => `
        <div class="event-card" data-event-id="${event.id}">
            <div class="event-card-header">
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
                    <span>Organized by ${escapeHtml(event.organizer)}</span>
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
                <p class="event-description-preview">${escapeHtml(event.description.substring(0, 100))}${event.description.length > 100 ? '...' : ''}</p>
                <div class="event-card-actions">
                    <button class="view-event-btn" onclick="viewEventDetails('${event.id}')">View Details</button>
                    <button class="delete-event-btn" onclick="deleteEvent('${event.id}')">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// View event details
function viewEventDetails(eventId) {
    window.location.href = `event-details.html?id=${eventId}`;
}

// Delete event
function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }

    // Remove from localStorage
    let events = JSON.parse(localStorage.getItem('sportsEvents') || '[]');
    events = events.filter(event => event.id !== eventId);
    localStorage.setItem('sportsEvents', JSON.stringify(events));

    // Try to delete from server
    deleteEventFromServer(eventId);

    // Reload events
    loadEvents();

    // Show success message
    showNotification('Event deleted successfully!', 'success');
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

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
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

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}


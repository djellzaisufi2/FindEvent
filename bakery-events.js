// Bakery Events Management System
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('createEventBtn')) {
        initializeEventSystem();
    }
    if (document.getElementById('eventsGrid')) {
        loadEvents();
    }
});

function initializeEventSystem() {
    const createBtn = document.getElementById('createEventBtn');
    const modal = document.getElementById('eventFormModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const eventForm = document.getElementById('eventForm');

    createBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        eventForm.reset();
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        eventForm.reset();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            eventForm.reset();
        }
    });

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createEvent();
    });

    const dateInput = document.getElementById('eventDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

function createEvent() {
    const formData = {
        id: Date.now().toString(),
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
        category: 'bakery',
        createdAt: new Date().toISOString()
    };

    saveEventToServer(formData);

    const existing = JSON.parse(localStorage.getItem('bakeryEvents') || '[]');
    existing.push(formData);
    localStorage.setItem('bakeryEvents', JSON.stringify(existing));

    document.getElementById('eventFormModal').style.display = 'none';
    document.getElementById('eventForm').reset();

    loadEvents();
    showNotification('Bakery event created successfully!', 'success');
}

function saveEventToServer(eventData) {
    fetch('api/save-event.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => console.log('Bakery event saved to server:', data))
    .catch(error => console.log('Server save failed, using localStorage only:', error));
}

function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;

    loadEventsFromServer()
        .then(events => {
            if (!events || events.length === 0) {
                events = JSON.parse(localStorage.getItem('bakeryEvents') || '[]');
            }
            displayEvents(events);
            updateBackgroundOpacity(events.length);
        })
        .catch(error => {
            console.log('Server load failed, using localStorage:', error);
            const events = JSON.parse(localStorage.getItem('bakeryEvents') || '[]');
            displayEvents(events);
            updateBackgroundOpacity(events.length);
        });
}

function updateBackgroundOpacity(eventCount) {
    const background = document.querySelector('.bakery-background');
    if (background) {
        if (eventCount > 0) {
            background.style.opacity = '0.25';
            background.classList.add('has-events');
        } else {
            background.style.opacity = '0.8';
            background.classList.remove('has-events');
        }
    }
}

function loadEventsFromServer() {
    return fetch('api/get-events.php?category=bakery')
        .then(response => response.json())
        .then(data => Array.isArray(data) ? data : []);
}

function displayEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;

    if (events.length === 0) {
        eventsGrid.innerHTML = '<div class="no-events"><p>No bakery events yet. Share the first one!</p></div>';
        return;
    }

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
                    <span class="event-icon">🧁</span>
                    <span>Hosted by ${escapeHtml(event.organizer)}</span>
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
                    <span>Max ${event.capacity} guests</span>
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

function viewEventDetails(eventId) {
    window.location.href = `event-details.html?id=${eventId}`;
}

function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }

    let events = JSON.parse(localStorage.getItem('bakeryEvents') || '[]');
    events = events.filter(event => event.id !== eventId);
    localStorage.setItem('bakeryEvents', JSON.stringify(events));

    deleteEventFromServer(eventId);
    loadEvents();
    showNotification('Bakery event deleted successfully!', 'success');
}

function deleteEventFromServer(eventId) {
    fetch(`api/delete-event.php?id=${eventId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => console.log('Bakery event deleted from server:', data))
    .catch(error => console.log('Server delete failed:', error));
}

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
    if (!timeString) return 'All day';
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours, 10) % 12 || 12;
    const ampm = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}


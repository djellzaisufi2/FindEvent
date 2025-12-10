// Art Events Management System

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
        category: 'art',
        createdAt: new Date().toISOString()
    };
    saveEventToServer(formData);
    let events = JSON.parse(localStorage.getItem('artEvents') || '[]');
    events.push(formData);
    localStorage.setItem('artEvents', JSON.stringify(events));
    document.getElementById('eventFormModal').style.display = 'none';
    document.getElementById('eventForm').reset();
    loadEvents();
    showNotification('Event created successfully!', 'success');
}
function saveEventToServer(eventData) {
    fetch('../api/save-event.php', {
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
function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    loadEventsFromServer()
        .then(events => {
            if (!events || events.length === 0) {
                events = JSON.parse(localStorage.getItem('artEvents') || '[]');
            }
            displayEvents(events);
        })
        .catch(error => {
            console.log('Server load failed, using localStorage:', error);
            const events = JSON.parse(localStorage.getItem('artEvents') || '[]');
            displayEvents(events);
        });
}
function loadEventsFromServer() {
    return fetch('../api/get-events.php?category=art')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                return data;
            }
            return [];
        });
}
function displayEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    if (events.length === 0) {
        eventsGrid.innerHTML = '';
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
                    <span class="event-icon">🎨</span>
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
                </div>
            </div>
        </div>
    `).join('');
}
function viewEventDetails(eventId) {
    window.location.href = `../event-details/event-details.html?id=${eventId}`;
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
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
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
            if (notification.parentNode) notification.parentNode.removeChild(notification);
        }, 300);
    }, 3000);
}

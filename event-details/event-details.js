// Event Details Page
document.addEventListener('DOMContentLoaded', function() {
    loadEventDetails();
});

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
                // Fallback to localStorage
                const events = JSON.parse(localStorage.getItem('kidsEvents') || '[]');
                event = events.find(e => e.id === eventId);
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
            const events = JSON.parse(localStorage.getItem('kidsEvents') || '[]');
            const event = events.find(e => e.id === eventId);
            
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
    
    detailsCard.innerHTML = `
        <div class="event-details-header">
            <h1 class="event-details-title">${escapeHtml(event.title)}</h1>
            <span class="event-details-category">👶 Kids Event</span>
        </div>
        
        <div class="event-details-body">
            <div class="event-details-section">
                <h2 class="section-title">Event Information</h2>
                <div class="event-detail-item">
                    <span class="detail-icon">📅</span>
                    <div class="detail-content">
                        <span class="detail-label">Date & Time</span>
                        <span class="detail-value">${formatDate(event.date)} at ${formatTime(event.time)}</span>
                    </div>
                </div>
                <div class="event-detail-item">
                    <span class="detail-icon">📍</span>
                    <div class="detail-content">
                        <span class="detail-label">Location</span>
                        <span class="detail-value">${escapeHtml(event.location)}</span>
                    </div>
                </div>
                <div class="event-detail-item">
                    <span class="detail-icon">💶</span>
                    <div class="detail-content">
                        <span class="detail-label">Price</span>
                        <span class="detail-value">${event.price > 0 ? `${event.price.toFixed(2)} EUR` : 'Free'}</span>
                    </div>
                </div>
                ${event.capacity ? `
                <div class="event-detail-item">
                    <span class="detail-icon">👥</span>
                    <div class="detail-content">
                        <span class="detail-label">Capacity</span>
                        <span class="detail-value">${event.capacity} participants</span>
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="event-details-section">
                <h2 class="section-title">Description</h2>
                <p class="event-description-full">${escapeHtml(event.description)}</p>
            </div>

            <div class="event-details-section">
                <h2 class="section-title">Organizer Information</h2>
                <div class="event-detail-item">
                    <span class="detail-icon">👤</span>
                    <div class="detail-content">
                        <span class="detail-label">Organizer</span>
                        <span class="detail-value">${escapeHtml(event.organizer)}</span>
                    </div>
                </div>
                <div class="event-detail-item">
                    <span class="detail-icon">📧</span>
                    <div class="detail-content">
                        <span class="detail-label">Email</span>
                        <a href="mailto:${escapeHtml(event.email)}" class="detail-link">${escapeHtml(event.email)}</a>
                    </div>
                </div>
                ${event.phone ? `
                <div class="event-detail-item">
                    <span class="detail-icon">📞</span>
                    <div class="detail-content">
                        <span class="detail-label">Phone</span>
                        <a href="tel:${escapeHtml(event.phone)}" class="detail-link">${escapeHtml(event.phone)}</a>
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="event-details-actions">
                <button class="contact-organizer-btn" onclick="contactOrganizer('${escapeHtml(event.email)}', '${escapeHtml(event.phone || '')}')">Contact Organizer</button>
                <button class="share-event-btn" onclick="shareEvent('${event.id}')">Share Event</button>
                <button class="delete-event-details-btn" onclick="deleteEventFromDetails('${event.id}')">🗑️ Delete Event</button>
            </div>
        </div>
    `;
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


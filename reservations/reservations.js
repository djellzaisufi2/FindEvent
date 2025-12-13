// Load and display reservations
function loadReservations() {
    const reservations = JSON.parse(localStorage.getItem('eventReservations') || '[]');
    displayReservations(reservations);
}

// Display reservations
function displayReservations(reservations) {
    const reservationsList = document.getElementById('reservationsList');
    if (!reservationsList) return;
    
    if (reservations.length === 0) {
        reservationsList.innerHTML = `
            <div class="no-reservations">
                <h2>No reservations yet</h2>
                <p>Reserve your spot at events to see them here!</p>
                <a href="../index/index.html">Browse Events</a>
            </div>
        `;
        return;
    }
    
    // Get event details for each reservation
    const categories = ['kidsEvents', 'sportsEvents', 'musicEvents', 'readingEvents', 'artEvents', 'bakeryEvents'];
    const allEvents = [];
    
    categories.forEach(category => {
        const events = JSON.parse(localStorage.getItem(category) || '[]');
        allEvents.push(...events);
    });
    
    // Sort reservations by event date (upcoming first)
    reservations.sort((a, b) => {
        const eventA = allEvents.find(e => e.id === a.eventId);
        const eventB = allEvents.find(e => e.id === b.eventId);
        if (!eventA || !eventB) return 0;
        return new Date(eventA.date) - new Date(eventB.date);
    });
    
    reservationsList.innerHTML = reservations.map(reservation => {
        const event = allEvents.find(e => e.id === reservation.eventId);
        
        if (!event) {
            return `
                <div class="reservation-card">
                    <div class="reservation-info">
                        <h3 class="reservation-title">Event Not Found</h3>
                        <div class="reservation-details">
                            <div class="reservation-detail">Reservation ID: ${reservation.reservationId}</div>
                        </div>
                    </div>
                    <div class="reservation-actions">
                        <button class="cancel-reservation-btn" onclick="cancelReservation('${reservation.reservationId}')">Cancel</button>
                    </div>
                </div>
            `;
        }
        
        // Get event image
        let eventImage = event.image || event.imageUrl || event.photo || event.photoUrl || '';
        if (eventImage && !eventImage.startsWith('http') && !eventImage.startsWith('/') && !eventImage.startsWith('./')) {
            if (!eventImage.includes('/')) {
                eventImage = `../images/${eventImage}`;
            } else if (!eventImage.startsWith('../')) {
                eventImage = `../${eventImage}`;
            }
        }
        
        const imageHtml = eventImage ? 
            `<div class="reservation-card-image">
                <img src="${escapeHtml(eventImage)}" alt="${escapeHtml(event.title)}" onerror="this.parentElement.style.display='none'">
            </div>` : '';
        
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
        
        const reservedDate = new Date(reservation.reservedAt);
        const formattedDate = reservedDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Check if event is upcoming or past
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate >= new Date();
        
        return `
            <div class="reservation-card">
                ${imageHtml}
                <div class="reservation-card-content">
                    <div class="reservation-info">
                        <div class="reservation-header">
                            <span class="reservation-category-badge">${categoryIcon} ${(event.category || 'event').toUpperCase()}</span>
                            ${isUpcoming ? '<span class="reservation-status upcoming">Upcoming</span>' : '<span class="reservation-status past">Past Event</span>'}
                        </div>
                        <h3 class="reservation-title">${escapeHtml(event.title)}</h3>
                        <div class="reservation-details">
                            <div class="reservation-detail">
                                <span class="reservation-icon">📅</span>
                                <span>${formatDate(event.date)} at ${formatTime(event.time)}</span>
                            </div>
                            <div class="reservation-detail">
                                <span class="reservation-icon">📍</span>
                                <span>${escapeHtml(event.location)}</span>
                            </div>
                            <div class="reservation-detail">
                                <span class="reservation-icon">👤</span>
                                <span>${escapeHtml(event.organizer || 'N/A')}</span>
                            </div>
                            <div class="reservation-detail">
                                <span class="reservation-icon">💶</span>
                                <span>${event.price > 0 ? event.price.toFixed(2) + ' EUR' : 'Free'}</span>
                            </div>
                            <div class="reservation-detail">
                                <span class="reservation-icon">🕐</span>
                                <span>Reserved on: ${formattedDate}</span>
                            </div>
                        </div>
                    </div>
                    <div class="reservation-actions">
                        <button class="view-event-btn" onclick="viewEventDetails('${event.id}')">View Event</button>
                        <button class="cancel-reservation-btn" onclick="cancelReservation('${reservation.reservationId}')">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// View event details
function viewEventDetails(eventId) {
    window.location.href = `../event-details/event-details.html?id=${eventId}`;
}

// Cancel reservation
function cancelReservation(reservationId) {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
        return;
    }
    
    let reservations = JSON.parse(localStorage.getItem('eventReservations') || '[]');
    reservations = reservations.filter(res => res.reservationId !== reservationId);
    localStorage.setItem('eventReservations', JSON.stringify(reservations));
    
    // Reload reservations
    loadReservations();
    
    // Show notification
    showNotification('Reservation cancelled', 'success');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format time
function formatTime(timeString) {
    if (!timeString) return '';
    return timeString.substring(0, 5);
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Load reservations when page loads
document.addEventListener('DOMContentLoaded', loadReservations);


// Load and display favorite events
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favoriteEvents') || '[]');
    displayFavorites(favorites);
}

// Display favorite events
function displayFavorites(favorites) {
    const favoritesGrid = document.getElementById('favoritesGrid');
    if (!favoritesGrid) return;
    
    if (favorites.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="no-favorites">
                <h2>No favorite events yet</h2>
                <p>Start exploring events and add them to your favorites!</p>
                <a href="../index/index.html">Browse Events</a>
            </div>
        `;
        return;
    }
    
    // Sort events by date (earliest first)
    favorites.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    favoritesGrid.innerHTML = favorites.map(event => {
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
        
        // Get event image
        let eventImage = event.image || event.imageUrl || event.photo || event.photoUrl || '';
        
        // If image exists but is relative path, make sure it's correct
        if (eventImage && !eventImage.startsWith('http') && !eventImage.startsWith('/') && !eventImage.startsWith('./')) {
            if (!eventImage.includes('/')) {
                eventImage = `../images/${eventImage}`;
            } else if (!eventImage.startsWith('../')) {
                eventImage = `../${eventImage}`;
            }
        }
        
        const imageHtml = eventImage ? 
            `<div class="event-card-image">
                <img src="${escapeHtml(eventImage)}" alt="${escapeHtml(event.title)}" onerror="this.parentElement.style.display='none'">
            </div>` : '';
        
        return `
            <div class="event-card" data-event-id="${event.id}">
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
                        <span>${escapeHtml(event.organizer || 'N/A')}</span>
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
                        <button class="view-event-btn" onclick="viewEventDetails('${event.id}')">View Details</button>
                        <button class="remove-favorite-btn" onclick="removeFromFavorites('${event.id}')">Remove</button>
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

// Remove from favorites
function removeFromFavorites(eventId) {
    let favorites = JSON.parse(localStorage.getItem('favoriteEvents') || '[]');
    favorites = favorites.filter(fav => fav.id !== eventId);
    localStorage.setItem('favoriteEvents', JSON.stringify(favorites));
    
    // Reload favorites
    loadFavorites();
    
    // Show notification
    showNotification('Removed from favorites', 'success');
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

// Load favorites when page loads
document.addEventListener('DOMContentLoaded', loadFavorites);


// Kids Events Management System
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
        category: 'kids',
        createdAt: new Date().toISOString()
    };

    // Try to save to PHP backend first
    saveEventToServer(formData);
    
    // Also save to localStorage as backup
    let events = JSON.parse(localStorage.getItem('kidsEvents') || '[]');
    events.push(formData);
    localStorage.setItem('kidsEvents', JSON.stringify(events));

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

// Load and display events
function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;

    // Try to load from server first, fallback to localStorage
    loadEventsFromServer()
        .then(events => {
            if (!events || events.length === 0) {
                // Fallback to localStorage
                events = JSON.parse(localStorage.getItem('kidsEvents') || '[]');
            }
            
            // Ensure sample events exist (add if missing)
            const sampleEvent1 = {
                id: 'kids-activity-day-2025',
                title: 'Kids Activity Day',
                organizer: 'RIT Kosovo',
                date: '2025-11-10',
                time: '10:00',
                location: 'Prishtina, Kosovo',
                description: 'Join us for a fun-filled day of activities designed especially for kids! This event features interactive games, creative workshops, educational activities, and plenty of opportunities for children to learn, play, and make new friends. Our experienced team will ensure a safe and engaging environment where kids can explore their creativity and have an amazing time. Perfect for children of all ages looking for an exciting day of adventure and learning.',
                price: 5.00,
                capacity: 50,
                email: 'info@rit.edu',
                phone: '+383 38 200 300',
                category: 'kids',
                image: 'https://www.rit.edu/kosovo/sites/rit.edu.kosovo/files/inline-images/Photo%204-4.jpg',
                createdAt: new Date().toISOString()
            };
            
            const sampleEvent2 = {
                id: 'kids-workshop-2025',
                title: 'Creative Kids Workshop',
                organizer: 'Kosovo Youth Center',
                date: '2025-12-05',
                time: '14:00',
                location: 'Prishtina, Kosovo',
                description: 'An engaging and creative workshop designed for children to explore their artistic talents. Kids will participate in various hands-on activities including painting, drawing, crafting, and storytelling. This workshop encourages creativity, imagination, and self-expression in a fun and supportive environment. All materials are provided, and children will take home their beautiful creations. Perfect for young artists and creative minds!',
                price: 7.00,
                capacity: 30,
                email: 'info@kosovoyouth.com',
                phone: '+383 38 300 400',
                category: 'kids',
                image: 'https://cijm.org.gr/wp-content/uploads/2021/07/205281512_5700016840070308_6141789382687542383_n-1024x683.jpg',
                createdAt: new Date().toISOString()
            };
            
            // Check if events exist, if not add them
            const hasEvent1 = events.some(e => e.id === 'kids-activity-day-2025');
            const hasEvent2 = events.some(e => e.id === 'kids-workshop-2025');
            
            if (!hasEvent1) {
                events.push(sampleEvent1);
            }
            if (!hasEvent2) {
                events.push(sampleEvent2);
            }
            
            // Save updated events
            localStorage.setItem('kidsEvents', JSON.stringify(events));
            displayEvents(events);
        })
        .catch(error => {
            console.log('Server load failed, using localStorage:', error);
            let events = JSON.parse(localStorage.getItem('kidsEvents') || '[]');
            
            // Ensure sample events exist (add if missing)
            const sampleEvent1 = {
                id: 'kids-activity-day-2025',
                title: 'Kids Activity Day',
                organizer: 'RIT Kosovo',
                date: '2025-11-10',
                time: '10:00',
                location: 'Prishtina, Kosovo',
                description: 'Join us for a fun-filled day of activities designed especially for kids! This event features interactive games, creative workshops, educational activities, and plenty of opportunities for children to learn, play, and make new friends. Our experienced team will ensure a safe and engaging environment where kids can explore their creativity and have an amazing time. Perfect for children of all ages looking for an exciting day of adventure and learning.',
                price: 5.00,
                capacity: 50,
                email: 'info@rit.edu',
                phone: '+383 38 200 300',
                category: 'kids',
                image: 'https://www.rit.edu/kosovo/sites/rit.edu.kosovo/files/inline-images/Photo%204-4.jpg',
                createdAt: new Date().toISOString()
            };
            
            const sampleEvent2 = {
                id: 'kids-workshop-2025',
                title: 'Creative Kids Workshop',
                organizer: 'Kosovo Youth Center',
                date: '2025-12-05',
                time: '14:00',
                location: 'Prishtina, Kosovo',
                description: 'An engaging and creative workshop designed for children to explore their artistic talents. Kids will participate in various hands-on activities including painting, drawing, crafting, and storytelling. This workshop encourages creativity, imagination, and self-expression in a fun and supportive environment. All materials are provided, and children will take home their beautiful creations. Perfect for young artists and creative minds!',
                price: 7.00,
                capacity: 30,
                email: 'info@kosovoyouth.com',
                phone: '+383 38 300 400',
                category: 'kids',
                image: 'https://cijm.org.gr/wp-content/uploads/2021/07/205281512_5700016840070308_6141789382687542383_n-1024x683.jpg',
                createdAt: new Date().toISOString()
            };
            
            // Check if events exist, if not add them
            const hasEvent1 = events.some(e => e.id === 'kids-activity-day-2025');
            const hasEvent2 = events.some(e => e.id === 'kids-workshop-2025');
            
            if (!hasEvent1) {
                events.push(sampleEvent1);
            }
            if (!hasEvent2) {
                events.push(sampleEvent2);
            }
            
            // Save updated events
            localStorage.setItem('kidsEvents', JSON.stringify(events));
            displayEvents(events);
        });
}

// Load events from PHP backend
function loadEventsFromServer() {
    return fetch('../api/get-events.php?category=kids')
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

    eventsGrid.innerHTML = events.map(event => {
        // Get event image
        const eventImage = event.image || event.imageUrl || '';
        const imageHtml = eventImage ? `<div class="event-card-image">
            <img src="${eventImage}" alt="${escapeHtml(event.title)}" style="display: block; width: 100%; height: 100%; object-fit: cover;">
        </div>` : '';
        
        return `
        <div class="event-card" data-event-id="${event.id}">
            ${imageHtml}
            <div class="event-card-header">
                <h3 class="event-card-title">${escapeHtml(event.title)}</h3>
            </div>
            <div class="event-card-body">
                <div class="event-info">
                    <span>Location: ${escapeHtml(event.location)}</span>
                </div>
                <div class="event-info">
                    <span>Date: ${formatDate(event.date)} • ${formatTime(event.time)}</span>
                </div>
            </div>
            <div class="event-card-footer">
                <p class="event-description-preview">${escapeHtml(event.description.substring(0, 100))}${event.description.length > 100 ? '...' : ''}</p>
                <div class="event-card-actions">
                    <button class="view-event-btn" onclick="viewEventDetails('${event.id}')">View Details</button>
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

// Delete event
function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }

    // Remove from localStorage
    let events = JSON.parse(localStorage.getItem('kidsEvents') || '[]');
    events = events.filter(event => event.id !== eventId);
    localStorage.setItem('kidsEvents', JSON.stringify(events));

    // Try to delete from server
    deleteEventFromServer(eventId);

    // Reload events
    loadEvents();

    // Show success message
    showNotification('Event deleted successfully!', 'success');
}

// Delete event from PHP backend
function deleteEventFromServer(eventId) {
    fetch(`../api/delete-event.php?id=${eventId}`, {
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
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
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


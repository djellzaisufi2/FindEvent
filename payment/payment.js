// Load payment page
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    
    if (!eventId) {
        showError('Event ID is missing');
        return;
    }
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        showError('Please sign in to complete your reservation');
        return;
    }
    
    // Load event data
    loadEventData(eventId);
});

function loadEventData(eventId) {
    const categories = ['kidsEvents', 'sportsEvents', 'musicEvents', 'readingEvents', 'artEvents', 'bakeryEvents'];
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
    
    // Check if already reserved
    const reservations = JSON.parse(localStorage.getItem('eventReservations') || '[]');
    if (reservations.some(res => res.eventId === eventId)) {
        showError('You have already reserved a spot for this event');
        return;
    }
    
    // Display payment form
    displayPaymentForm(event);
}

function displayPaymentForm(event) {
    const paymentContent = document.getElementById('paymentContent');
    
    paymentContent.innerHTML = `
        <div class="event-summary">
            <h2>${escapeHtml(event.title)}</h2>
            <div class="event-summary-info">
                <div class="event-summary-item">
                    <span class="event-summary-label">Date:</span>
                    <span>${formatDate(event.date)} at ${formatTime(event.time)}</span>
                </div>
                <div class="event-summary-item">
                    <span class="event-summary-label">Location:</span>
                    <span>${escapeHtml(event.location)}</span>
                </div>
                <div class="event-summary-item">
                    <span class="event-summary-label">Organizer:</span>
                    <span>${escapeHtml(event.organizer || 'N/A')}</span>
                </div>
            </div>
        </div>
        
        <form class="payment-form" id="paymentForm">
            <div class="form-group">
                <label for="cardNumber">Card Number</label>
                <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" required maxlength="19">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label for="expiryDate">Expiry Date</label>
                    <input type="text" id="expiryDate" placeholder="MM/YY" required maxlength="5">
                </div>
                
                <div class="form-group">
                    <label for="cvv">CVV</label>
                    <input type="text" id="cvv" placeholder="123" required maxlength="3">
                </div>
            </div>
            
            <div class="form-group">
                <label for="cardName">Cardholder Name</label>
                <input type="text" id="cardName" placeholder="John Doe" required>
            </div>
            
            <div class="payment-total">
                <div class="payment-total-row">
                    <span>Ticket Price:</span>
                    <span>${event.price.toFixed(2)} EUR</span>
                </div>
                <div class="payment-total-row">
                    <span>Service Fee:</span>
                    <span>0.00 EUR</span>
                </div>
                <div class="payment-total-row total">
                    <span>Total:</span>
                    <span>${event.price.toFixed(2)} EUR</span>
                </div>
            </div>
            
            <button type="submit" class="pay-btn">Pay ${event.price.toFixed(2)} EUR</button>
        </form>
    `;
    
    // Add form validation
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryDateInput = document.getElementById('expiryDate');
    const cvvInput = document.getElementById('cvv');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // Handle form submission
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment(event.id);
        });
    }
}

function processPayment(eventId) {
    // Get event data
    const categories = ['kidsEvents', 'sportsEvents', 'musicEvents', 'readingEvents', 'artEvents', 'bakeryEvents'];
    let event = null;
    
    for (const category of categories) {
        const events = JSON.parse(localStorage.getItem(category) || '[]');
        event = events.find(e => e.id === eventId);
        if (event) break;
    }
    
    if (!event) {
        alert('Event not found');
        return;
    }
    
    // Check capacity
    const reservations = JSON.parse(localStorage.getItem('eventReservations') || '[]');
    const reservedCount = reservations.filter(res => res.eventId === eventId).length;
    if (event.capacity && reservedCount >= event.capacity) {
        alert('No spots available');
        return;
    }
    
    // Add reservation
    const reservation = {
        eventId: eventId,
        eventTitle: event.title,
        reservedAt: new Date().toISOString(),
        reservationId: Date.now().toString(),
        amount: event.price,
        paymentStatus: 'completed'
    };
    
    reservations.push(reservation);
    localStorage.setItem('eventReservations', JSON.stringify(reservations));
    
    // Show success message and redirect
    alert('Payment successful! Your reservation is confirmed.');
    window.location.href = `../event-details/event-details.html?id=${eventId}`;
}

function showError(message) {
    const paymentContent = document.getElementById('paymentContent');
    paymentContent.innerHTML = `
        <div class="error-message">
            <h2>${escapeHtml(message)}</h2>
            <a href="../index/index.html">Go to Home</a>
        </div>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(timeString) {
    if (!timeString) return '';
    return timeString.substring(0, 5);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


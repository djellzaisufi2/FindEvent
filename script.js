// City selection
document.querySelectorAll('.city-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.city-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const selectedCity = btn.getAttribute('data-city');
        console.log('Selected city:', selectedCity);
    });
});

// Category selection
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.getAttribute('data-category');
        console.log('Selected category:', category);
    });
});

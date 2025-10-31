// Category selection
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        // Only prevent default if it's a link with # or no valid href
        const href = link.getAttribute('href');
        if (!href || href === '#' || href === '') {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            console.log('Selected category:', category);
        }
        // Otherwise, let the link work normally to navigate to other pages
    });
});

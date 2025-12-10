// Hero Slideshow - Auto-rotating images with swipe support
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevButton = document.querySelector('.slideshow-prev');
    const nextButton = document.querySelector('.slideshow-next');
    let currentSlide = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let slideshowInterval;

    function updateIndicators() {
        indicators.forEach((indicator, index) => {
            if (index === currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    function showNextSlide() {
        // Hide current slide
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        
        // Move to next slide
        currentSlide = (currentSlide + 1) % slides.length;
        
        // Show next slide
        slides[currentSlide].classList.add('active');
        updateIndicators();
    }

    function showPreviousSlide() {
        // Hide current slide
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        
        // Move to previous slide
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        
        // Show previous slide
        slides[currentSlide].classList.add('active');
        updateIndicators();
    }

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        updateIndicators();
        resetSlideshow();
    }

    // Navigation buttons
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            showPreviousSlide();
            resetSlideshow();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function() {
            showNextSlide();
            resetSlideshow();
        });
    }

    // Indicator clicks
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            goToSlide(index);
        });
    });

    // Touch/Swipe support
    const slideshowContainer = document.querySelector('.slideshow-container');
    
    slideshowContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slideshowContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    // Mouse drag support
    let isDragging = false;
    let startX = 0;

    slideshowContainer.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.pageX;
        e.preventDefault();
    });

    slideshowContainer.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
    });

    slideshowContainer.addEventListener('mouseup', function(e) {
        if (!isDragging) return;
        const endX = e.pageX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) { // Minimum swipe distance
            if (diff > 0) {
                showNextSlide();
            } else {
                showPreviousSlide();
            }
        }
        
        isDragging = false;
        e.preventDefault();
    });

    slideshowContainer.addEventListener('mouseleave', function() {
        isDragging = false;
    });

    function handleSwipe() {
        const swipeDistance = touchStartX - touchEndX;
        const minSwipeDistance = 50; // Minimum distance for swipe

        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swipe left - next slide
                showNextSlide();
            } else {
                // Swipe right - previous slide
                showPreviousSlide();
            }
            // Reset interval after manual swipe
            resetSlideshow();
        }
    }

    // Initialize indicators
    updateIndicators();

    function resetSlideshow() {
        clearInterval(slideshowInterval);
        slideshowInterval = setInterval(showNextSlide, 4000); // 4 seconds
    }

    // Start slideshow - change image every 4 seconds (4000ms)
    slideshowInterval = setInterval(showNextSlide, 4000);
});


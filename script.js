document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // 2. Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Auto-scrolling gallery with manual drag/swipe
    const gallery = document.querySelector('.gallery-scroll-container');
    const galleryTrack = document.querySelector('.gallery-track');

    if (gallery && galleryTrack) {
        const originalItems = Array.from(galleryTrack.children);
        originalItems.forEach((item) => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            galleryTrack.appendChild(clone);
        });

        let isDragging = false;
        let dragStartX = 0;
        let scrollStart = 0;
        let animationFrame;
        let pauseAutoScrollUntil = 0;

        const getLoopPoint = () => galleryTrack.scrollWidth / 2;

        const resetGalleryStart = () => {
            pauseAutoScrollUntil = Date.now() + 1200;
            gallery.scrollLeft = 1;
        };

        const normalizeScroll = () => {
            const loopPoint = getLoopPoint();
            if (loopPoint <= 0) return;

            if (gallery.scrollLeft >= loopPoint) {
                gallery.scrollLeft -= loopPoint;
            } else if (gallery.scrollLeft <= 0) {
                gallery.scrollLeft += loopPoint;
            }
        };

        const animateGallery = () => {
            if (!isDragging && Date.now() > pauseAutoScrollUntil) {
                gallery.scrollLeft += 1.8;
                normalizeScroll();
            }

            animationFrame = requestAnimationFrame(animateGallery);
        };

        animationFrame = requestAnimationFrame(animateGallery);

        gallery.addEventListener('pointerdown', (event) => {
            isDragging = true;
            dragStartX = event.clientX;
            scrollStart = gallery.scrollLeft;
            gallery.setPointerCapture(event.pointerId);
        });

        gallery.addEventListener('dragstart', (event) => {
            event.preventDefault();
        });

        gallery.addEventListener('pointermove', (event) => {
            if (!isDragging) return;
            gallery.scrollLeft = scrollStart - (event.clientX - dragStartX);
            normalizeScroll();
        });

        const stopDragging = (event) => {
            if (!isDragging) return;
            isDragging = false;
            normalizeScroll();
            if (gallery.hasPointerCapture(event.pointerId)) {
                gallery.releasePointerCapture(event.pointerId);
            }
        };

        gallery.addEventListener('pointerup', stopDragging);
        gallery.addEventListener('pointercancel', stopDragging);

        window.addEventListener('beforeunload', () => {
            cancelAnimationFrame(animationFrame);
        });

        const galleryLinks = document.querySelectorAll('a[href="#gallery"]');
        const gallerySection = document.querySelector('#gallery');

        const scrollToGallery = () => {
            if (!gallerySection) return;

            resetGalleryStart();
            gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        galleryLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                scrollToGallery();

                const url = new URL(window.location.href);
                url.hash = 'gallery';
                window.history.pushState(null, '', url);
            });
        });

        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#gallery') {
                resetGalleryStart();
            }
        });

        if (window.location.hash === '#gallery') {
            resetGalleryStart();
        }
    }
});

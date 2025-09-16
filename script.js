// Current year
document.getElementById('y').textContent = new Date().getFullYear();

// Floating Action Button functionality
const fab = document.getElementById('fab');
const form = document.getElementById('join');
const emailField = document.getElementById('email');

function checkFormVisibility() {
    if (!form || !fab) return;

    const formRect = form.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Check if form is visible in viewport
    const isFormVisible = formRect.top < windowHeight && formRect.bottom > 0;

    // Show FAB if form is not visible
    if (!isFormVisible) {
        fab.classList.add('visible');
    } else {
        fab.classList.remove('visible');
    }
}

// Check form visibility on scroll and resize
window.addEventListener('scroll', checkFormVisibility);
window.addEventListener('resize', checkFormVisibility);

// Initial check
checkFormVisibility();

// FAB click handler - scroll to form and focus email field
if (fab && form && emailField) {
    fab.addEventListener('click', () => {
        form.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        // Focus email field after scroll animation
        setTimeout(() => {
            emailField.focus();
        }, 500);
    });
}

// Optional: graceful inline success state for static hosting demos.
// If you connect a real endpoint, you may remove this handler.
const iframe = document.getElementById('join_target');
const thankyou = document.getElementById('thankyou');
const againBtn = document.getElementById('again');
const submitBtn = form.querySelector('.submit');
const submitOriginalText = submitBtn ? submitBtn.textContent : 'Submit';

function setFormDisabled(disabled) {
    if (submitBtn) submitBtn.disabled = disabled;
    if (disabled && submitBtn) submitBtn.textContent = 'Submitting…';
    if (!disabled && submitBtn) submitBtn.textContent = submitOriginalText;
    form.setAttribute('aria-busy', disabled ? 'true' : 'false');
}

let submissionPending = false;
let submissionTimeoutId = null;

form.addEventListener('submit', async (e) => {
    if (submissionPending) { e.preventDefault(); return; }
    const emailEl = form.querySelector('#email');
    const phoneEl = form.querySelector('#phone');
    const hasEmail = emailEl && emailEl.value && emailEl.value.trim().length > 0;
    const hasPhone = phoneEl && phoneEl.value && phoneEl.value.trim().length > 0;
    const hasAnyValue = hasEmail || hasPhone;

    const errorEl = document.getElementById('form-error');
    if (!hasAnyValue) {
        e.preventDefault();
        if (errorEl) {
            errorEl.style.display = 'block';
        }
        const firstField = form.querySelector('#name') || form.querySelector('input');
        firstField && firstField.focus();
        return;
    } else if (errorEl) {
        errorEl.style.display = 'none';
    }

    // Populate hidden metadata fields before submission
    const refField = form.querySelector('#ref');
    const uaField = form.querySelector('#ua');
    if (refField) refField.value = location.href;
    if (uaField) uaField.value = navigator.userAgent;

    // Prevent double submit
    setFormDisabled(true);

    const endpointIsConfigured = !form.action.includes('FORM_ENDPOINT');
    if (endpointIsConfigured) {
        // Submit into hidden iframe; show success on iframe load
        submissionPending = true;
        if (submissionTimeoutId) { clearTimeout(submissionTimeoutId); submissionTimeoutId = null; }
        // Fallback: if no iframe load within 12s, re-enable and show error
        submissionTimeoutId = setTimeout(() => {
            if (!submissionPending) return;
            submissionPending = false;
            setFormDisabled(false);
            if (errorEl) {
                errorEl.style.display = 'block';
                errorEl.textContent = 'We could not reach the server. Please try again.';
            }
        }, 12000);
        return; // allow normal submission
    }

    // Demo success state when no real endpoint is configured
    e.preventDefault();
    form.reset();
    form.style.display = 'none';
    if (thankyou) thankyou.style.display = 'block';
});

// When the hidden iframe finishes loading after a real submission, show success
if (iframe) {
    iframe.addEventListener('load', () => {
        if (!submissionPending) return;
        if (submissionTimeoutId) { clearTimeout(submissionTimeoutId); submissionTimeoutId = null; }
        submissionPending = false;
        form.reset();
        form.style.display = 'none';
        if (thankyou) thankyou.style.display = 'block';
    });
}

// Allow starting a new submission
if (againBtn) {
    againBtn.addEventListener('click', () => {
        if (thankyou) thankyou.style.display = 'none';
        form.style.display = 'grid';
        setFormDisabled(false);
        const errorEl = document.getElementById('form-error');
        if (errorEl) errorEl.style.display = 'none';
        const firstField = form.querySelector('#name') || form.querySelector('input');
        firstField && firstField.focus();
    });
}

// Initialize Swiper gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Early return if Swiper is not available
    if (typeof Swiper === 'undefined') return;

    // Early return if carousel element doesn't exist
    const carouselElement = document.querySelector('.gallery-swiper');
    if (!carouselElement) return;

    // Initialize Swiper with minimal configuration
    new Swiper('.gallery-swiper', {
        // Enable navigation arrows and pagination
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        // Enable loop for infinite scrolling
        loop: true,
    });
});

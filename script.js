// Event content is authored in HTML so navigation never depends on JavaScript.

// The ambient background is static; no continuous canvas repaint loop.

// Current year
document.getElementById("y").textContent = new Date().getFullYear();

// Floating Action Button functionality
const fab = document.getElementById("fab");
const form = document.getElementById("join");
const emailField = document.getElementById("email");

function checkFormVisibility() {
  if (!form || !fab) return;

  const formRect = form.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // Check if form is visible in viewport
  const isFormVisible = formRect.top < windowHeight && formRect.bottom > 0;

  // Show FAB if form is not visible
  if (!isFormVisible) {
    fab.classList.add("visible");
  } else {
    fab.classList.remove("visible");
  }
}

// Check form visibility on scroll and resize
window.addEventListener("scroll", checkFormVisibility);
window.addEventListener("resize", checkFormVisibility);

// Initial check
checkFormVisibility();

// FAB click handler - scroll to form and focus email field
if (fab && form && emailField) {
  fab.addEventListener("click", () => {
    form.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // Focus email field after scroll animation
    setTimeout(() => {
      emailField.focus();
    }, 500);
  });
}

// Optional: graceful inline success state for static hosting demos.
// If you connect a real endpoint, you may remove this handler.
const iframe = document.getElementById("join_target");
const thankyou = document.getElementById("thankyou");
const againBtn = document.getElementById("again");
const submitBtn = form.querySelector(".submit");
const submitOriginalText = submitBtn ? submitBtn.textContent : "Submit";

function setFormDisabled(disabled) {
  if (submitBtn) submitBtn.disabled = disabled;
  if (disabled && submitBtn) submitBtn.textContent = "Submitting…";
  if (!disabled && submitBtn) submitBtn.textContent = submitOriginalText;
  form.setAttribute("aria-busy", disabled ? "true" : "false");
}

let submissionPending = false;
let submissionTimeoutId = null;

form.addEventListener("submit", async (e) => {
  if (submissionPending) {
    e.preventDefault();
    return;
  }
  const emailEl = form.querySelector("#email");
  const phoneEl = form.querySelector("#phone");
  const hasEmail = emailEl && emailEl.value && emailEl.value.trim().length > 0;
  const hasPhone = phoneEl && phoneEl.value && phoneEl.value.trim().length > 0;
  const hasAnyValue = hasEmail || hasPhone;

  const errorEl = document.getElementById("form-error");
  if (!hasAnyValue) {
    e.preventDefault();
    if (errorEl) {
      errorEl.style.display = "block";
    }
    const firstField =
      form.querySelector("#name") || form.querySelector("input");
    firstField && firstField.focus();
    return;
  } else if (errorEl) {
    errorEl.style.display = "none";
  }

  // Populate hidden metadata fields before submission
  const refField = form.querySelector("#ref");
  const uaField = form.querySelector("#ua");
  if (refField) refField.value = location.href;
  if (uaField) uaField.value = navigator.userAgent;

  // Prevent double submit
  setFormDisabled(true);

  const endpointIsConfigured = !form.action.includes("FORM_ENDPOINT");
  if (endpointIsConfigured) {
    // Submit into hidden iframe; show success on iframe load
    submissionPending = true;
    if (submissionTimeoutId) {
      clearTimeout(submissionTimeoutId);
      submissionTimeoutId = null;
    }
    // Fallback: if no iframe load within 12s, re-enable and show error
    submissionTimeoutId = setTimeout(() => {
      if (!submissionPending) return;
      submissionPending = false;
      setFormDisabled(false);
      if (errorEl) {
        errorEl.style.display = "block";
        errorEl.textContent =
          "We could not reach the server. Please try again.";
      }
    }, 12000);
    return; // allow normal submission
  }

  // Demo success state when no real endpoint is configured
  e.preventDefault();
  form.reset();
  form.style.display = "none";
  if (thankyou) {
    thankyou.style.display = "block";
  }
});

// When the hidden iframe finishes loading after a real submission, show success
if (iframe) {
  iframe.addEventListener("load", () => {
    if (!submissionPending) return;
    if (submissionTimeoutId) {
      clearTimeout(submissionTimeoutId);
      submissionTimeoutId = null;
    }
    submissionPending = false;
    form.reset();
    form.style.display = "none";
    if (thankyou) {
      thankyou.style.display = "block";
      celebrateThankyou(thankyou);
    }
  });
}

// ✦ Celebration: when someone joins the list, fan brand-colored sparkles around the ✦ mark
function celebrateThankyou(container) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  container.classList.add("celebrate");

  const colors = ["var(--ocher)", "var(--terracotta)", "var(--lavender)", "var(--stone)"];
  const count = 14;
  const burst = document.createElement("div");
  burst.className = "celebrate-burst";
  burst.setAttribute("aria-hidden", "true");

  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "celebrate-sparkle";
    sparkle.textContent = "✦";
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const distance = 60 + Math.random() * 80;
    sparkle.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    sparkle.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
    sparkle.style.setProperty("--rot", `${(Math.random() - 0.5) * 180}deg`);
    sparkle.style.setProperty("--delay", `${Math.random() * 0.15}s`);
    sparkle.style.setProperty("--size", `${10 + Math.random() * 12}px`);
    sparkle.style.color = colors[i % colors.length];
    burst.appendChild(sparkle);
  }

  container.appendChild(burst);
  // Clean up after animation finishes
  setTimeout(() => burst.remove(), 1800);
}

// Allow starting a new submission
if (againBtn) {
  againBtn.addEventListener("click", () => {
    if (thankyou) thankyou.style.display = "none";
    form.style.display = "grid";
    setFormDisabled(false);
    const errorEl = document.getElementById("form-error");
    if (errorEl) errorEl.style.display = "none";
    const firstField =
      form.querySelector("#name") || form.querySelector("input");
    firstField && firstField.focus();
  });
}

// Event details and RSVP live in the page; there is no timed modal.

// Sticky announcement bar with live countdown to the next show
function initAnnouncementBar() {
  const bar = document.getElementById("annBar");
  const countdowns = document.querySelectorAll(".ann-bar-countdown");
  if (!bar || countdowns.length === 0) return;

  const first = countdowns[0];
  const startTime = new Date(first.dataset.eventStart);
  const endTime = new Date(first.dataset.eventEnd);

  function setText(text) {
    countdowns.forEach((el) => {
      el.textContent = text;
    });
  }

  function update() {
    const now = new Date();

    if (now >= endTime) {
      // Event over — keep the ticker, but strip show info so only genre tags scroll
      bar.classList.add("ann-bar-ended");
      return false;
    }

    if (now >= startTime) {
      setText("Today");
      return true;
    }

    const diff = startTime - now;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);

    if (days > 0) {
      setText(`In ${days}d ${hours}h`);
    } else if (hours > 0) {
      setText(`In ${hours}h ${mins}m`);
    } else if (mins > 0) {
      setText(`In ${mins}m`);
    } else {
      setText("Starts soon");
    }
    return true;
  }

  if (update()) {
    setInterval(update, 60 * 1000);
  }
}

// Initialize Swiper gallery when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Sticky announcement bar countdown
  initAnnouncementBar();

  // Early return if Swiper is not available
  if (typeof Swiper === "undefined") return;

  // Early return if carousel element doesn't exist
  const carouselElement = document.querySelector(".gallery-swiper");
  if (!carouselElement) return;

  // Initialize Swiper with minimal configuration
  new Swiper(".gallery-swiper", {
    // Enable navigation arrows and pagination
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    // Enable loop for infinite scrolling
    loop: true,
  });
});

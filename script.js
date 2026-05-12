// Mark JS-on so the reveal styles only kick in when JS is available (no FOUC)
document.documentElement.classList.add("js-on");

// Animated film-grain noise — vanilla canvas, brand-colored, throttled to ~24fps for subtler shimmer
(function () {
  const canvas = document.getElementById("noiseCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let particleCount = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    // Density scales with viewport area but caps for perf
    particleCount = Math.min(5000, Math.floor((width * height) / 420));
  }
  resize();
  window.addEventListener("resize", resize);

  function paintFrame() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(237, 229, 207, 0.7)"; // stone, more present per dot
    for (let i = 0; i < particleCount; i++) {
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        1.6,
        1.6
      );
    }
  }

  if (reduced) {
    // Single static frame so there's still some texture, no animation
    paintFrame();
    return;
  }

  const FRAME_INTERVAL = 42; // ~24fps for filmic shimmer
  let last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (now - last < FRAME_INTERVAL) return;
    last = now;
    paintFrame();
  }
  requestAnimationFrame(loop);
})();

// Current year
document.getElementById("y").textContent = new Date().getFullYear();

// ISO date marker at the bottom of the footer
(function () {
  const el = document.getElementById("footerIso");
  if (!el) return;
  el.textContent = new Date().toISOString().slice(0, 10);
})();

// Scroll reveal — fade-up sections as they enter the viewport
(function () {
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) return;

  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((el) => io.observe(el));
})();

// ✦ A small hello for the curious souls who open the console.
(function () {
  const css = "color:#D08639;font:600 14px/1.2 'Bricolage Grotesque',sans-serif;letter-spacing:.18em;text-transform:uppercase;";
  const sub = "color:#C2B5E9;font:400 12px/1.5 'Bricolage Grotesque',sans-serif;";
  console.log("%c✦  Temporal  ✦", css);
  console.log(
    "%cAlooOoo. Curious about how this was put together?\nWe play in Portland. Come find us.\n→ instagram.com/temporal_sound  ·  soundcloud.com/temporal_sound",
    sub
  );
})();

// Time-of-day flavor for the footer tag — a subtle, shifting nod to the hour
(function () {
  const tag = document.querySelector(".footer-tag");
  if (!tag) return;
  const h = new Date().getHours();
  let line;
  if (h < 5)        line = "Still dancing in Portland";
  else if (h < 10)  line = "Drifting home in Portland";
  else if (h < 16)  line = "Resting in Portland";
  else if (h < 19)  line = "Warming up in Portland";
  else if (h < 22)  line = "The night is young in Portland";
  else              line = "Tonight, in Portland";
  tag.textContent = line;
})();

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
    const link = thankyou.querySelector("a");
    if (link) {
      console.log("Following link:", link.href);
      window.location.href = link.href;
    }
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
      const link = thankyou.querySelector("a");
      if (link) {
        console.log("Following link:", link.href);
        window.location.href = link.href;
      }
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

// Event Modal functionality
function initEventModal() {
  const modal = document.getElementById("eventModal");
  const closeBtn = modal?.querySelector(".modal-close");
  const dismissBtn = modal?.querySelector(".modal-dismiss");
  const backdrop = modal?.querySelector(".modal-backdrop");

  if (!modal) return;

  // Event date - Saturday, May 16th, 2026 at 9pm PT
  // Modal shows until event ends at 3am the next day (May 17th)
  // For testing: uncomment the line below and comment the line above to test modal
  // const eventDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
  const eventDate = new Date("2026-05-17T03:00:00-07:00");
  const currentDate = new Date();

  // Check if we should show the modal (before event date)
  const shouldShowModal = currentDate < eventDate;

  if (shouldShowModal) {
    // Show modal after a short delay for better UX
    setTimeout(() => {
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
      // Focus management for accessibility
      const firstFocusable = modal.querySelector(".modal-cta");
      firstFocusable?.focus();
    }, 1000);
  }

  // Close modal function
  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    // Return focus to body
    document.body.focus();
  }

  // Dismiss modal
  function dismissModal() {
    closeModal();
  }

  // Event listeners
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (dismissBtn) {
    dismissBtn.addEventListener("click", dismissModal);
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeModal);
  }

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });

  // Trap focus within modal when open
  modal.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("show")) return;

    if (e.key === "Tab") {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  });
}

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
  // Initialize event modal
  initEventModal();

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

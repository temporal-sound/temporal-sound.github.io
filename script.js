// Mark JS-on so the reveal styles only kick in when JS is available (no FOUC)
document.documentElement.classList.add("js-on");

// =====================================================================
// Shows — single source of truth for the homepage event UI.
// Add a new show at the top; the featured card, past strip, modal, and
// ticker auto-roll based on today's date. Once a show's endISO passes,
// it moves from "Next show" to the past strip automatically.
// =====================================================================
const SHOWS = [
  {
    id: "just-emma-2026",
    title: "Just Emma",
    titleLong: "Temporal Presents: Just Emma",
    startISO: "2026-09-26T20:00:00-07:00",
    endISO: "2026-09-27T04:00:00-07:00",
    dateLabel: "Sep 26, 2026",
    dateShort: "Sat Sep 26, 8pm–4am",
    timeLabel: "8pm–4am",
    location: "Secret location · Portland",
    flyer: "img/just-emma.jpg",
    flyerAlt:
      "Temporal Presents: Just Emma with Tyrus and Tarbouch Soundsystem — Saturday, September 26 at 8pm in Portland",
    flyerFit: "contain",
    pastImage: "img/just-emma.jpg",
    pastLineup: "Just Emma · Tyrus · Tarbouch Soundsystem",
    partifulUrl: "https://partiful.com/e/RJJt30kPEbTTuusebF3L",
    archiveUrl: null,
    blurb:
      "Berlin duo Just Emma bring their dark, playful and melancholic sound back to Portland, with support from Tyrus and Tarbouch Soundsystem.",
    modalBlurb:
      "As summer melts into autumn, Just Emma return to guide us deep into the night. The Berlin-based duo behind Underyourskin and Trippin Tigers are joined by Tyrus and Tarbouch Soundsystem.",
    tags: ["$30 per person", "130 cap", "RSVP required"],
  },
  {
    id: "temporal-on-the-beach-2026",
    title: "Temporal on the Beach",
    titleLong: "Temporal on the Beach",
    startISO: "2026-08-15T14:00:00-07:00",
    endISO: "2026-08-15T22:00:00-07:00",
    dateLabel: "Aug 15, 2026",
    dateShort: "Sat Aug 15, 2–10pm",
    timeLabel: "2–10pm",
    location: "Columbia River · Location after RSVP",
    flyer: "img/temporal-on-the-beach.jpg",
    flyerAlt:
      "Temporal on the Beach — open-air day party on Saturday, August 15 from 2pm to 10pm",
    flyerFit: "contain",
    pastImage: "img/temporal-on-the-beach.jpg",
    pastLineup: "Hanndres · Martin Blech · MORO & Tyrus · Oshin · Sebakhy",
    partifulUrl: "https://partiful.com/e/mvmLPqtElsUuZCi4ZElw",
    archiveUrl: null,
    blurb:
      "A free midsummer day party on the banks of the Columbia River, with Hanndres, Martin Blech, MORO & Tyrus, Oshin, and Sebakhy.",
    modalBlurb:
      "Come dance, bask in the sun, and settle into a beautiful groove with us on the banks of the Columbia River. Bring drinks, snacks, a blanket, and your favorite river accoutrements.",
    tags: ["Free", "Open-air day party", "RSVP for location"],
  },
  {
    id: "may16-2026",
    title: "Antaares · Bawab · Samaha",
    titleLong: "Temporal Presents: Antaares, Bawab & Samaha",
    startISO: "2026-05-16T21:00:00-07:00",
    endISO: "2026-05-17T03:00:00-07:00",
    dateLabel: "May 16, 2026",
    dateShort: "Sat May 16, 9pm",
    location: "Secret Location, Portland",
    flyer: "img/flyer-may16.jpg",
    flyerAlt:
      "Temporal Presents: Antaares, Bawab & Samaha — Sat May 16, 9pm to late",
    pastImage: "img/flyer-may16.jpg",
    pastLineup: "Antaares · Bawab · Samaha",
    partifulUrl: "https://partiful.com/e/MT7tOg8oq3GxbgAypDLC",
    archiveUrl: null,
    blurb:
      "Inaugural night of a new artist series — deep, hypnotic, groovy, psychedelic, percussive, emotional. Antaares brings trippy textured grooves; Bawab leans into rhythm-driven club; Samaha opens warm.",
    modalBlurb:
      "We're launching a new series, bringing in artists from farther afield who are helping shape the deep, hypnotic, groovy, psychedelic sound we love. Antaares joins from CDMX, Bawab from LA, and Samaha from Seattle.",
    tags: ["$30 sliding", "120 cap", "RSVP required"],
  },
  {
    id: "sonido-iv",
    title: "Sonido IV",
    startISO: "2026-04-04T21:00:00-07:00",
    endISO: "2026-04-05T03:00:00-07:00",
    dateLabel: "Apr 4, 2026",
    pastImage: "img/sonido-iv.jpg",
    pastLineup: "Sebakhy · MORO · Hannounah · A-Kintero",
    partifulUrl: "https://partiful.com/e/cOZuUSU5e2WDSzHCkX9o",
    archiveUrl: null,
  },
  {
    id: "sonido-iii",
    title: "Sonido III",
    startISO: "2026-01-31T21:00:00-08:00",
    dateLabel: "Jan 31, 2026",
    pastImage: "img/sonido-iii.jpg?v=2",
    pastLineup: "Ale Vizio · Martin · MORO",
    partifulUrl: "https://partiful.com/e/4eA6ajWobnp2v8MOCEsF",
    archiveUrl: null,
  },
  {
    id: "sonido-ii",
    title: "Sonido II",
    startISO: "2025-12-06T21:00:00-08:00",
    dateLabel: "Dec 6, 2025",
    pastImage: "img/sonido-ii.jpg?v=3",
    pastLineup: "Resident DJs · Live opener",
    partifulUrl: null,
    archiveUrl: "sonido/",
  },
  {
    id: "caleesi-kreis",
    title: "Caleesi b2b Kreis",
    startISO: "2025-11-15T21:00:00-08:00",
    dateLabel: "Nov 2025",
    pastImage: "img/caleesi-kreis.jpg",
    pastLineup: "Special b2b set",
    partifulUrl: null,
    archiveUrl: "caleesi/",
  },
];

const EVENT_TIME_ZONE = "America/Los_Angeles";

function getFeaturedAndPast() {
  const now = Date.now();
  const upcoming = SHOWS.filter(
    (s) => new Date(s.endISO || s.startISO).getTime() > now
  ).sort((a, b) => new Date(a.startISO) - new Date(b.startISO));

  const past = SHOWS.filter(
    (s) => new Date(s.endISO || s.startISO).getTime() <= now
  ).sort((a, b) => new Date(b.startISO) - new Date(a.startISO));

  if (upcoming.length > 0) {
    return { featured: upcoming[0], pastList: past, isUpcoming: true };
  }
  return {
    featured: past[0] || null,
    pastList: past.slice(1),
    isUpcoming: false,
  };
}

function formatTimeOfDay(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: EVENT_TIME_ZONE,
  })
    .format(date)
    .replace(/:00\s/, "")
    .replace(/\s/, "")
    .toLowerCase();
}

function renderFeaturedCard(show, isUpcoming) {
  const article = document.querySelector(".event-featured");
  if (!article || !show) return;

  const href = show.partifulUrl || show.archiveUrl || "#";
  const isExternal = !!show.partifulUrl;

  const flyerLink = article.querySelector(".event-featured-flyer");
  if (flyerLink) {
    flyerLink.href = href;
    if (isExternal) {
      flyerLink.target = "_blank";
      flyerLink.rel = "noopener";
    } else {
      flyerLink.removeAttribute("target");
      flyerLink.removeAttribute("rel");
    }
    flyerLink.setAttribute(
      "aria-label",
      `View flyer for ${show.title}${isExternal ? " on Partiful" : ""}`
    );
    const img = flyerLink.querySelector("img");
    if (img) {
      img.src = show.flyer || show.pastImage;
      img.alt = show.flyerAlt || show.title;
      img.style.objectFit = show.flyerFit || "";
    }
  }

  const label = article.querySelector(".event-featured-label");
  if (label) {
    const labelText = isUpcoming ? "Next show" : "Latest";
    label.innerHTML = `${labelText} <span class="sep">·</span> ${show.dateLabel}`;
  }

  const title = article.querySelector(".event-featured-title");
  if (title) {
    title.innerHTML = show.title.replace(
      / · /g,
      ' <span class="sep">·</span> '
    );
  }

  const meta = article.querySelector(".event-featured-meta");
  if (meta) {
    const d = new Date(show.startISO);
    const day = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: EVENT_TIME_ZONE,
    }).format(d);
    const time = show.timeLabel || formatTimeOfDay(d);
    const parts = [day, time, show.location].filter(Boolean);
    meta.innerHTML = parts.join(' <span class="sep">·</span> ');
  }

  const blurb = article.querySelector(".event-featured-blurb");
  if (blurb) {
    if (show.blurb) {
      blurb.textContent = show.blurb;
      blurb.style.display = "";
    } else {
      blurb.style.display = "none";
    }
  }

  const tags = article.querySelector(".event-featured-tags");
  if (tags) {
    if (isUpcoming && Array.isArray(show.tags) && show.tags.length) {
      tags.innerHTML = show.tags.map((t) => `<li>${t}</li>`).join("");
      tags.style.display = "";
    } else {
      tags.style.display = "none";
    }
  }

  const cta = article.querySelector(".btn-primary");
  if (cta) {
    if (show.partifulUrl) {
      cta.href = show.partifulUrl;
      cta.target = "_blank";
      cta.rel = "noopener";
      cta.innerHTML = `${isUpcoming ? "RSVP" : "View"} on Partiful <span class="btn-glyph" aria-hidden="true">→</span>`;
      cta.style.display = "";
    } else if (show.archiveUrl) {
      cta.href = show.archiveUrl;
      cta.removeAttribute("target");
      cta.removeAttribute("rel");
      cta.innerHTML = `See archive <span class="btn-glyph" aria-hidden="true">→</span>`;
      cta.style.display = "";
    } else {
      cta.style.display = "none";
    }
  }
}

function renderPastStrip(shows) {
  const track = document.querySelector(".past-strip-track");
  if (!track) return;

  track.innerHTML = shows
    .map((show) => {
      const href = show.partifulUrl || show.archiveUrl || "#";
      const external = !!show.partifulUrl;
      const titleHtml = show.title.replace(
        / · /g,
        ' <span class="sep">·</span> '
      );
      return `
            <a class="past-card" href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>
              <div class="past-card-image" aria-hidden="true">
                <img src="${show.pastImage}" alt="" />
              </div>
              <div class="past-card-text">
                <span class="past-card-date">${show.dateLabel}</span>
                <h4 class="past-card-title">${titleHtml} <span class="past-card-glyph" aria-hidden="true">↗</span></h4>
                <p class="past-card-lineup">${show.pastLineup || ""}</p>
              </div>
            </a>`;
    })
    .join("");
}

function renderTicker(show) {
  const bar = document.getElementById("annBar");
  if (!bar) return;

  const tags =
    "deep · driving · soulful · hypnotic · groovy · psychedelic · percussive · emotional · warm · textured · ritual · cosmic";

  if (!show) {
    bar.classList.add("ann-bar-ended");
    bar.removeAttribute("href");
    bar.removeAttribute("target");
    bar.removeAttribute("rel");
    bar.setAttribute("aria-label", "Temporal — Portland artist collective");

    const chunkHtml = (ariaHidden) => `
          <div class="ann-bar-chunk"${ariaHidden ? ' aria-hidden="true"' : ""}>
            <span class="ann-bar-tags">${tags}</span>
            <span class="ann-bar-sep ann-bar-tail-sep" aria-hidden="true">✦</span>
          </div>`;
    const track = bar.querySelector(".ann-bar-track");
    if (track) {
      track.innerHTML = chunkHtml(false) + chunkHtml(true) + chunkHtml(true);
    }
    return;
  }

  if (show.partifulUrl) {
    bar.href = show.partifulUrl;
    bar.target = "_blank";
    bar.rel = "noopener";
  } else if (show.archiveUrl) {
    bar.href = show.archiveUrl;
    bar.removeAttribute("target");
    bar.removeAttribute("rel");
  }
  bar.setAttribute(
    "aria-label",
    `Next show: ${show.title}${show.partifulUrl ? " — RSVP on Partiful" : ""}`
  );

  const d = new Date(show.startISO);
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: EVENT_TIME_ZONE,
  }).format(d);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: EVENT_TIME_ZONE,
  }).format(d);
  const dayNum = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: EVENT_TIME_ZONE,
  }).format(d);
  const time = formatTimeOfDay(d);
  const dateText = show.dateShort || `${day} ${month} ${dayNum}, ${time}`;

  const chunkHtml = (ariaHidden) => `
        <div class="ann-bar-chunk"${ariaHidden ? ' aria-hidden="true"' : ""}>
          <span class="ann-bar-title">${show.title}</span>
          <span class="ann-bar-sep" aria-hidden="true">✦</span>
          <span class="ann-bar-date">${dateText}</span>
          <span class="ann-bar-sep" aria-hidden="true">✦</span>
          <span class="ann-bar-date">${show.location || ""}</span>
          <span class="ann-bar-sep" aria-hidden="true">✦</span>
          <span class="ann-bar-countdown" data-event-start="${show.startISO}" data-event-end="${show.endISO || show.startISO}">In —</span>
          <span class="ann-bar-sep" aria-hidden="true">✦</span>
          <span class="ann-bar-tags">${tags}</span>
          <span class="ann-bar-sep ann-bar-tail-sep" aria-hidden="true">✦</span>
        </div>`;

  const track = bar.querySelector(".ann-bar-track");
  if (track) {
    track.innerHTML = chunkHtml(false) + chunkHtml(true) + chunkHtml(true);
  }
}

function renderModal(show, isUpcoming) {
  const modal = document.getElementById("eventModal");
  if (!modal) return;
  if (!isUpcoming || !show) {
    modal.style.display = "none";
    modal.dataset.suppress = "1";
    return;
  }
  modal.style.display = "";
  delete modal.dataset.suppress;

  const flyerLink = modal.querySelector(".modal-flyer");
  if (flyerLink && show.partifulUrl) {
    flyerLink.href = show.partifulUrl;
    flyerLink.setAttribute(
      "aria-label",
      `RSVP for ${show.title} on Partiful`
    );
    const img = flyerLink.querySelector("img");
    if (img) {
      img.src = show.flyer || show.pastImage;
      img.alt = show.flyerAlt || show.title;
      img.style.objectFit = show.flyerFit || "";
    }
  }

  const title = modal.querySelector(".modal-event-title");
  if (title) title.textContent = show.titleLong || show.title;

  const date = modal.querySelector(".modal-event-date");
  if (date) {
    const d = new Date(show.startISO);
    const weekday = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: EVENT_TIME_ZONE,
    }).format(d);
    const month = new Intl.DateTimeFormat("en-US", {
      month: "long",
      timeZone: EVENT_TIME_ZONE,
    }).format(d);
    const dayNum = Number(
      new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        timeZone: EVENT_TIME_ZONE,
      }).format(d)
    );
    const ord = ((n) => {
      if (n >= 11 && n <= 13) return "th";
      switch (n % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    })(dayNum);
    const time =
      show.timeLabel ||
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: EVENT_TIME_ZONE,
      })
        .format(d)
        .replace(" ", "")
        .toLowerCase();
    date.innerHTML = `${weekday}, ${month} ${dayNum}${ord} <span class="sep">·</span> ${time} <span class="sep">·</span> ${show.location || ""}`;
  }

  const desc = modal.querySelector(".modal-event-description");
  if (desc) desc.textContent = show.modalBlurb || show.blurb || "";

  const cta = modal.querySelector(".modal-cta");
  if (cta && show.partifulUrl) {
    cta.href = show.partifulUrl;
    cta.textContent = "RSVP on Partiful";
  }
}

function renderEvents() {
  const { featured, pastList, isUpcoming } = getFeaturedAndPast();
  renderFeaturedCard(featured, isUpcoming);
  renderPastStrip(pastList);
  renderTicker(isUpcoming ? featured : null);
  renderModal(featured, isUpcoming);
}

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
  let animationFrameId = null;
  let last = 0;

  function loop(now) {
    animationFrameId = null;
    if (document.hidden) return;

    if (now - last >= FRAME_INTERVAL) {
      last = now;
      paintFrame();
    }

    animationFrameId = requestAnimationFrame(loop);
  }

  function startAnimation() {
    if (animationFrameId === null && !document.hidden) {
      animationFrameId = requestAnimationFrame(loop);
    }
  }

  function stopAnimation() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  startAnimation();
})();

// Current year
document.getElementById("y").textContent = new Date().getFullYear();

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

// Event Modal functionality
function initEventModal() {
  const modal = document.getElementById("eventModal");
  const closeBtn = modal?.querySelector(".modal-close");
  const dismissBtn = modal?.querySelector(".modal-dismiss");
  const backdrop = modal?.querySelector(".modal-backdrop");
  let openTimerId = null;

  if (!modal) return;

  function cancelPendingOpen() {
    if (openTimerId !== null) {
      clearTimeout(openTimerId);
      openTimerId = null;
    }
  }

  function closeModal({ restoreFocus = true } = {}) {
    cancelPendingOpen();
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    if (restoreFocus) {
      document.body.focus();
    }
  }

  // renderModal() suppresses the dialog when no upcoming show remains,
  // so this reuses the same end-time gate as the featured card and ticker.
  if (modal.dataset.suppress !== "1") {
    // Show after a short delay so the page can settle first.
    openTimerId = setTimeout(() => {
      openTimerId = null;

      // Safari can stall if a composited modal opens and steals focus while
      // an external link is moving this page into the background.
      if (
        modal.dataset.suppress === "1" ||
        document.visibilityState !== "visible"
      ) {
        return;
      }

      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
      modal.querySelector(".modal-cta")?.focus();
    }, 1000);
  }

  // Event listeners
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (dismissBtn) {
    dismissBtn.addEventListener("click", closeModal);
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
  // Populate featured card / past strip / ticker / modal from SHOWS data
  // before any of the dependent inits run.
  renderEvents();

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

/* =========================================================
  ARCFIELD — SCRIPT
   Lightweight vanilla JS. No dependencies.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Sticky header shadow state ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var mobileNav = document.getElementById("mobileNav");

  function closeMenu() {
    mobileNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }

  menuToggle.addEventListener("click", function () {
    var isOpen = mobileNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  mobileNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* Close menu when clicking outside the header */
  document.addEventListener("click", function (e) {
    var header = document.getElementById("siteHeader");
    if (!header.contains(e.target) && mobileNav.classList.contains("is-open")) {
      closeMenu();
    }
  });

  /* Close menu on Escape key */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
      closeMenu();
      menuToggle.focus();
    }
  });

  /* ---------- Scroll reveal: sections fade/slide in once ----------
     Progressive enhancement: sections are visible by default (see
     styles.css — the hidden state only exists under html.js, and
     is scoped off entirely for prefers-reduced-motion). This block
     only ever ADDS a subtle animation on top of already-visible
     content; it can never be the reason content stays hidden. */
  try {
    var revealTargets = document.querySelectorAll(
      ".services, .why, .process, .showcase, .contact, .capability-strip"
    );
    var revealList = Array.prototype.slice.call(revealTargets);
    revealList.forEach(function (el) { el.classList.add("reveal"); });

    function revealAll() {
      revealList.forEach(function (el) { el.classList.add("is-visible"); });
    }

    var prefersReducedMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      // No IO support, or the user asked for reduced motion:
      // show everything immediately, no animation.
      revealAll();
    } else {
      // threshold: 0 fires as soon as a single pixel is visible, so a
      // section a visitor lands directly on (e.g. via #services, or a
      // section taller than the viewport) is revealed immediately
      // rather than waiting for a scroll-driven intersection ratio
      // that may never be reached.
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0, rootMargin: "0px 0px -5% 0px" }
      );
      revealList.forEach(function (el) { io.observe(el); });

      // Safety net: if for any reason a section hasn't been marked
      // visible shortly after load (slow IO callback, an element
      // that never technically "intersects" due to layout edge
      // cases, etc.), force it visible. Sections must never be
      // permanently hidden.
      window.addEventListener("load", function () {
        setTimeout(revealAll, 1200);
      });
    }

    // Belt-and-suspenders: if anything else on the page throws after
    // this point, make sure no section is left invisible because of it.
    window.addEventListener("error", revealAll);
  } catch (err) {
    // If the reveal setup itself failed, strip the "js" hook so the
    // plain-CSS "visible by default" state applies everywhere.
    document.documentElement.classList.remove("js");
  }

  /* ---------- Analytics / Pixel event hook ----------
     Wire this up once GA_MEASUREMENT_ID and META_PIXEL_ID
     are live (see placeholders in index.html <head>). */
  function trackEvent(eventName, detail) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, detail || {});
    }
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", eventName, detail || {});
    }
    // console.log("[track]", eventName, detail);
  }

  document.querySelectorAll("[data-track]").forEach(function (el) {
    el.addEventListener("click", function () {
      trackEvent(el.getAttribute("data-track"), {
        label: el.getAttribute("data-track-label") || undefined
      });
    });
  });

  /* ---------- Lead form ---------- */
  var form = document.getElementById("leadForm");
  var status = document.getElementById("formStatus");

  function openWhatsApp(formData) {
    var name = (formData.fullName || "").trim();
    var email = (formData.email || "").trim();
    var phone = (formData.phone || "").trim();
    var projectType = (formData.projectType || "").trim();
    var projectLocation = (formData.projectLocation || "").trim();
    var message = (formData.message || "").trim();

    var whatsappMessage = [
      "Hello ARCFIELD,",
      "",
      "I would like to discuss a construction project.",
      "",
      "Name: " + name,
      "Email: " + (email || "Not provided"),
      "Phone: " + phone,
      "Project Type: " + projectType,
      "Project Location: " + projectLocation,
      "",
      "Project Details:",
      message,
      "",
      "Please get in touch with me regarding the project."
    ].join("\n");

    var encodedMessage = encodeURIComponent(whatsappMessage);
    var whatsappUrl = "https://wa.me/918919168598?text=" + encodedMessage;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var formData = {
      fullName: form.fullName.value,
      email: form.email.value,
      phone: form.phone.value,
      projectType: form.projectType.value,
      projectLocation: form.projectLocation.value,
      message: form.message.value
    };

    trackEvent("form_submit", { form: "consultation_request" });
    openWhatsApp(formData);

    status.textContent = "Your enquiry is ready to send via WhatsApp.";
    status.className = "form-status success";
    form.reset();
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }
})();

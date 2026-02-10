document.addEventListener("DOMContentLoaded", () => {
  // ─── Dynamic Year Calculations ───────────────────────────────
  const currentYear = new Date().getFullYear();
  document.querySelectorAll("[data-years-since]").forEach((el) => {
    const startYear = parseInt(el.dataset.yearsSince, 10);
    const years = currentYear - startYear;
    const suffix = el.dataset.suffix || "";
    el.textContent = years + suffix;
  });

  // ─── Hero Canvas Particle Background ─────────────────────────
  const canvas = document.getElementById("heroCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animId;
    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 150;
    const MOUSE_RADIUS = 200;
    let mouse = { x: -9999, y: -9999 };

    function resize() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.offsetWidth;
        this.y = Math.random() * canvas.offsetHeight;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Mouse interaction — gentle push
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * 0.01;
          this.vx += dx * force;
          this.vy += dy * force;
        }

        // Dampen velocity
        this.vx *= 0.999;
        this.vy *= 0.999;

        // Wrap around
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        if (this.x < -10) this.x = w + 10;
        if (this.x > w + 10) this.x = -10;
        if (this.y < -10) this.y = h + 10;
        if (this.y > h + 10) this.y = -10;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 106, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    function init() {
      resize();
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124, 106, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawConnections();
      animId = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", () => {
      cancelAnimationFrame(animId);
      init();
      animate();
    });

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener("mouseleave", () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    init();
    animate();
  }

  // ─── Navigation ──────────────────────────────────────────────
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  // Scroll — add background
  let lastScroll = 0;
  window.addEventListener(
    "scroll",
    () => {
      const scrollY = window.scrollY;
      nav.classList.toggle("is-scrolled", scrollY > 60);
      lastScroll = scrollY;
    },
    { passive: true },
  );

  // Mobile toggle
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("is-active");
    navLinks.classList.toggle("is-open");
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("is-active");
      navLinks.classList.remove("is-open");
    });
  });

  // ─── Scroll Animations (Intersection Observer) ──────────────
  const animElements = document.querySelectorAll(".anim-fade-up");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    animElements.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 0.1}s`;
      observer.observe(el);
    });
  } else {
    // Fallback: show all
    animElements.forEach((el) => el.classList.add("is-visible"));
  }

  // ─── Video Modal ─────────────────────────────────────────────
  const modal = document.getElementById("videoModal");
  const modalIframe = document.getElementById("modalIframe");
  const modalClose = document.getElementById("modalClose");
  const modalOverlay = modal.querySelector(".modal__overlay");

  function openVideo(videoId) {
    modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeVideo() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    // Delay clearing src to allow fade-out
    setTimeout(() => {
      modalIframe.src = "";
    }, 400);
  }

  document.querySelectorAll(".btn-play-video").forEach((btn) => {
    btn.addEventListener("click", () => {
      const videoId = btn.dataset.video;
      if (videoId) openVideo(videoId);
    });
  });

  modalClose.addEventListener("click", closeVideo);
  modalOverlay.addEventListener("click", closeVideo);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeVideo();
    }
  });

  // ─── Smooth Scroll for Anchor Links ─────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top =
          target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  // ─── Active Nav Link Highlight ──────────────────────────────
  const sections = document.querySelectorAll(".section, .hero");
  const navAnchors = document.querySelectorAll(".nav__links a");

  function updateActiveNav() {
    let current = "";
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute("id");
      }
    });
    navAnchors.forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("href") === `#${current}`);
    });
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();
});

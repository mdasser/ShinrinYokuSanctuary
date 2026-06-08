/* =============================================
   SYS — Main JavaScript
   ============================================= */

// ---- NAV scroll behavior ----
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ---- Mobile nav ----
const hamburger = document.querySelector('.nav-hamburger');
const mobileNav = document.querySelector('.nav-mobile');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ---- Active nav link ----
(function setActiveLink() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ---- Intersection Observer fade-in ----
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ---- Lightbox ----
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox img');
if (lightbox) {
  document.querySelectorAll('.masonry-item[data-src]').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.src;
      if (lightboxImg && src) {
        lightboxImg.src = src;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });
  const closeBtn = lightbox.querySelector('.lightbox-close');
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

// ---- Gallery filter ----
const filterBtns = document.querySelectorAll('.filter-btn');
if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      document.querySelectorAll('.masonry-item').forEach(item => {
        if (cat === 'all' || item.dataset.category === cat) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// ---- Video helpers (sound toggle) ----
function attachVideoEvents(item) {
  const video = item.querySelector('video');
  if (!video) return;

  const soundBtn = item.querySelector('.sound-btn');

  function startVideo() {
    video.muted = true;
    video.play().catch(() => {});
    item.classList.add('playing');
  }

  function stopVideo() {
    // Only stop if user hasn't manually unmuted — unmuted means watching intentionally
    if (video.muted) {
      video.pause();
      item.classList.remove('playing');
      if (soundBtn) soundBtn.textContent = '🔇';
    }
  }

  // Desktop: hover to play
  item.addEventListener('mouseenter', startVideo);
  item.addEventListener('mouseleave', stopVideo);

  // Mobile / click to play (tap the tile itself, not the button)
  item.addEventListener('click', e => {
    if (soundBtn && soundBtn.contains(e.target)) return;
    if (video.paused) {
      startVideo();
    }
  });

  // Sound button: toggle mute, works on both desktop and mobile
  if (soundBtn) {
    soundBtn.addEventListener('click', e => {
      e.stopPropagation();
      video.muted = !video.muted;
      soundBtn.textContent = video.muted ? '🔇' : '🔊';
      // Start playing if not already (needed on mobile first tap)
      if (video.paused) video.play().catch(() => {});
    });
  }
}

// Attach to any pre-existing video tiles
document.querySelectorAll('.masonry-item').forEach(item => {
  if (item.querySelector('video')) attachVideoEvents(item);
});

// ---- Upload zone ----
const uploadZone = document.querySelector('.upload-zone');
const fileInput = document.querySelector('.upload-zone input[type="file"]');
const masonry = document.querySelector('.masonry');

if (uploadZone && fileInput && masonry) {
  uploadZone.addEventListener('click', () => fileInput.click());

  uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', () => handleFiles(fileInput.files));

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      // Accept image types + video types including .mov
      const isVideo = file.type.startsWith('video/') ||
                      file.name.toLowerCase().endsWith('.mov');
      const isImage = file.type.startsWith('image/');
      if (!isImage && !isVideo) return;

      const url = URL.createObjectURL(file);
      const item = document.createElement('div');
      item.className = 'masonry-item';
      item.dataset.category = isVideo ? 'video' : 'photo';

      if (isImage) {
        item.dataset.src = url;
        item.innerHTML = `
          <img src="${url}" alt="${file.name}" loading="lazy">
          <div class="overlay"><span>Photo</span></div>`;
      } else {
        // Live Photo / video — muted autoplay on hover, click to unmute
        item.innerHTML = `
          <video src="${url}" muted loop playsinline preload="metadata"></video>
          <div class="video-badge">Live Photo</div>
          <button class="sound-btn" title="Toggle sound">🔇</button>
          <div class="overlay"><span>Video</span></div>`;
        attachVideoEvents(item);
      }
      masonry.prepend(item);
    });
  }
}

// ---- Contact form ----
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Sent ✓';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      contactForm.reset();
    }, 3000);
  });
}

// ---- Smooth number counter (stats) ----
function animateCount(el) {
  const target = parseFloat(el.dataset.target || el.textContent);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = (target % 1 === 0
      ? Math.round(target * ease)
      : (target * ease).toFixed(1)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCount(e.target);
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num[data-target]').forEach(el => statObserver.observe(el));

function updateActiveSlide(slide) {
  const block = slide.closest('.video-carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll('.video-carousel-slide').forEach((s, idx) => {
    s.setAttribute('aria-hidden', idx !== slideIndex);
  });

  block.querySelectorAll('.video-carousel-indicator').forEach((ind, idx) => {
    if (idx !== slideIndex) {
      ind.querySelector('button').removeAttribute('disabled');
    } else {
      ind.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function showSlide(block, slideIndex, behavior = 'smooth') {
  const slides = block.querySelectorAll('.video-carousel-slide');
  let idx = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (idx >= slides.length) idx = 0;
  block.querySelector('.video-carousel-slides').scrollTo({
    top: 0,
    left: slides[idx].offsetLeft,
    behavior,
  });
}

function buildIframe(url) {
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.loading = 'lazy';
  return iframe;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Video Carousel');
  block.dataset.activeSlide = '0';

  const container = document.createElement('div');
  container.classList.add('video-carousel-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('video-carousel-slides');

  const indicators = document.createElement('ol');
  indicators.classList.add('video-carousel-indicators');

  rows.forEach((row, i) => {
    const link = row.querySelector('a');
    const url = link ? link.href : '';

    const slide = document.createElement('li');
    slide.classList.add('video-carousel-slide');
    slide.dataset.slideIndex = i;
    slide.setAttribute('aria-hidden', i !== 0);

    if (url) slide.appendChild(buildIframe(url));
    slidesWrapper.appendChild(slide);

    const ind = document.createElement('li');
    ind.classList.add('video-carousel-indicator');
    ind.dataset.targetSlide = i;
    ind.innerHTML = `<button type="button" aria-label="Show Video ${i + 1} of ${rows.length}"${i === 0 ? ' disabled' : ''}></button>`;
    indicators.appendChild(ind);

    row.remove();
  });

  const nav = document.createElement('div');
  nav.classList.add('video-carousel-nav');
  nav.innerHTML = `
    <button type="button" class="slide-prev" aria-label="Previous Video"></button>
    <button type="button" class="slide-next" aria-label="Next Video"></button>
  `;

  container.appendChild(nav);
  container.appendChild(slidesWrapper);
  block.appendChild(container);

  const indicatorsNav = document.createElement('nav');
  indicatorsNav.setAttribute('aria-label', 'Video Slide Controls');
  indicatorsNav.appendChild(indicators);
  block.appendChild(indicatorsNav);

  // Events
  nav.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  nav.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });
  indicators.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      showSlide(block, parseInt(e.currentTarget.parentElement.dataset.targetSlide, 10));
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.video-carousel-slide').forEach((s) => observer.observe(s));
}

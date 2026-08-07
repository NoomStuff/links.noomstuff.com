document.addEventListener('DOMContentLoaded', () => {
  const arrow = document.getElementById('banner-arrow');
  if (!arrow) return;

  const distance = window.innerHeight * 0.9;

  const updateArrowOpacity = () => {
    const scrollProgress = Math.min(window.scrollY / distance, 1);
    const opacity = 1 - scrollProgress;
    arrow.style.opacity = Math.max(opacity, 0);
  };

  updateArrowOpacity();
  window.addEventListener('scroll', updateArrowOpacity, { passive: true });

  arrow.addEventListener('click', (element) => {
    element.preventDefault();
    window.scrollTo({ top: distance, left: 0, behavior: 'smooth' });
  });
});
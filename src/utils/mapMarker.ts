import type { Station } from '../types/station';

export function createMarkerElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.style.backgroundColor = '#3b82f6';
  el.style.width = '12px';
  el.style.height = '12px';
  el.style.borderRadius = '50%';
  el.style.border = '2px solid white';
  el.style.cursor = 'pointer';
  el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  el.style.transition = 'transform 0.2s';

  el.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.5)';
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'scale(1)';
  });

  return el;
}


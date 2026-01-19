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

export function createPopupHTML(station: Station): string {
  return `
    <div style="padding: 12px; min-width: 220px; background: #1a1a1a; border-radius: 8px;">
      <h3 style="font-weight: bold; font-size: 14px; margin: 0 0 8px 0; color: white;">${station.station_name}</h3>
      <p style="font-size: 12px; color: #d1d5db; margin: 4px 0;">ID: ${station.station_id}</p>
      <p style="font-size: 12px; color: #d1d5db; margin: 4px 0;">Network: ${station.station_network}</p>
      <p style="font-size: 12px; color: #d1d5db; margin: 4px 0;">Elevation: ${station.elevation}m</p>
      <p style="font-size: 12px; color: #d1d5db; margin: 4px 0;">Timezone: ${station.timezone}</p>
    </div>
  `;
}

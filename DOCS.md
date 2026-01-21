# ASOS Stations Map — UI/UX Overview

## UI/UX Features (User-Facing)

### Core Flow
- Full-screen map experience with a left sidebar station list.
- Selecting a station highlights it on the map, flies the camera to it, and opens the weather card.
- Clicking the map clears the selected station (card closes).

### Search & Discovery
- Sidebar auto-opens when the user starts typing a search query.
- Search supports station name and station ID.
- Sort options: name, distance (if geolocation available), network, elevation, favorites-only.
- Infinite scroll in the station list (loads more as you approach the bottom).

### Favorites
- Star icon toggles favorites without selecting the station.
- Favorites filter shows only starred stations.

### Weather Card
- Appears only when a station is selected.
- Top-right controls: weather icon + close (X) button.
- Station name and star icon are grouped to avoid overlap for long names.
- Coordinates are clickable and copy to clipboard with a “copied!” hint.
- Timeline section is labeled; the slider includes ticked strokes on the track.
- Timeline slider lets users scrub across historical time points.
- Color-coded temperature bar based on Celsius bands:
  - Dark blue (< 0°C)
  - Light blue (0–15°C)
  - Green (15–20°C)
  - Yellow (20–25°C)
  - Orange (25–30°C)
  - Red (≥ 30°C)

### Map Experience
- Mapbox GL with custom marker icons (default, selected, favorite).
- Station clustering with click-to-zoom behavior.
- Custom map controls (zoom in/out + geolocate) instead of Mapbox defaults.
- Theme-aware styling (light/dark).
- 2D/3D projection toggle.

### Settings & Persistence
- Settings menu toggles:
  - Theme (light/dark)
  - Map mode (2D/3D)
  - Units: temperature, wind, pressure, precipitation
- Preferences and favorites persist in localStorage.

### Desktop & Mobile Behaviors
- Desktop:
  - Search bar appears in the top-left toolbar.
  - Sidebar shifts the top-left stack to the right when open.
  - Hover cursor changes on map clusters/points.
- Mobile:
  - Sidebar is full-width and slides in/out.
  - Swipe-to-close gesture on sidebar (left swipe).
  - Search input appears inside the sidebar header.
  - Sidebar auto-closes after station selection.
  - Map controls respect the safe-area inset.

### Keyboard
- ESC closes settings, weather card, and sidebar.

---

# Technical Overview

## Stack
- Astro + React
- Tailwind CSS v4
- Mapbox GL JS (loaded via CDN)
- TanStack React Query with persistence

## App Structure
- Page entry: `src/pages/index.astro` → `QueryProvider` → `WeatherStationsMap`.
- Layout: `src/layouts/main.astro` (injects global styles + head).
- Global styles: `src/styles/global.css` (theme tokens + fonts).

## Data & API
- Base API: `https://sfc.windbornesystems.com`
- `GET /stations` → list of stations
- `GET /historical_weather?station={station_id}` → historical observations
- Defensive parsing to handle occasional corrupted responses.
- API rate limited: 20 requests/min.

## State & Persistence
- React Query caches stations and weather data.
- User preferences + favorites stored in localStorage.

## Deployment Notes
- Kubernetes manifests in `k8s/`.
- `k8s/secrets.yaml` is gitignored; use `k8s/secrets.example.yaml`.
- Requires `PUBLIC_MAPBOX_TOKEN`.

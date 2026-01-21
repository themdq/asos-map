# Project Docs: ASOS Stations Map

## Overview
- Single-page Astro app that visualizes ASOS weather stations on a Mapbox map.
- Main UI: map canvas + left sidebar list + top bar controls + station weather card.
- Data sources: WindBorne Systems API for station list and historical weather.

## Tech Stack
- Astro + React (client-only app mounted on `index.astro`).
- Tailwind CSS v4 with custom theme tokens and global CSS.
- Mapbox GL JS (loaded from CDN in runtime).
- TanStack React Query with localStorage persistence.
- Icons: `lucide-react`.

## Entry Points
- Page: `src/pages/index.astro` -> `QueryProvider` -> `WeatherStationsMap`.
- Layout: `src/layouts/main.astro` includes `src/styles/global.css` and HTML head.

## Data & API
- Base URL: `https://sfc.windbornesystems.com`.
- Stations: `GET /stations` -> `Station[]`.
- Historical weather: `GET /historical_weather?station=<id>` -> `{ points: WeatherPoint[] }`.
- Error handling includes JSON repair for occasionally truncated responses.
- React Query caches stations for 5 min, weather for 1 min, with persistence in localStorage.

## Core UX Flows
- App loads with full-screen map and collapsed sidebar.
- User opens sidebar, searches, filters, and selects a station.
- Selecting a station:
  - Sidebar highlights station.
  - Map flies to station with a selected marker.
  - Weather card appears in top-left with latest/historical metrics.
- Clicking the map closes the station card (if open).
- Mobile: sidebar supports swipe-to-close gesture and auto-closes after station selection.

## Map Behavior
- Mapbox GL initialized after script load + settings hydration.
- Default center: `[-122.2, 37.43]`, zoom 10.
- Theme-based style switch:
  - Light: `mapbox://styles/mapbox/standard`
  - Dark: `mapbox://styles/mapbox/dark-v11`
- 2D/3D toggle uses `mercator`/`globe` projections.
- Stations clustered with custom HTML count markers.
- Custom markers: default, selected, and favorite.
- Custom map controls are in UI (not Mapbox default controls):
  - Zoom in/out buttons
  - Geolocate button

## Interaction Details (Desktop + Mobile)
- Top-left menu button toggles the sidebar. When sidebar is open, the top-left search bar shifts right on desktop.
- Search bar:
  - Desktop: visible in top bar.
  - Mobile: hidden in top bar, shown in sidebar header.
- Clicking outside:
  - Clicking map closes the weather card if a station is selected.
  - Clicking outside the settings menu closes it.
- Pressing Escape closes settings, weather card, and sidebar.
- Settings menu (top-right):
  - Single button toggles a fixed-position dropdown.
  - Clicking the settings icon again closes it.
- Weather card:
  - Only appears when a station is selected.
  - Coordinates are clickable and copy to clipboard with a “copied!” hint.
  - Timeline slider changes the timepoint shown.
  - Top-right controls include a weather icon and a close (X) button to dismiss the card.
  - Timeline section is labeled and includes ticked strokes on the slider track.
  - Temperature bars use a color ramp by Celsius bands (dark blue → light blue → green → yellow → orange → red).
- Station list:
  - Infinite scroll loads more items as you approach the bottom.
  - Favorite star toggles without selecting the station (event propagation is stopped).
- Map clustering:
  - Clicking a cluster zooms into the cluster bounds.
  - Hover cursor changes on clusters and points (desktop).

## Mobile-Specific Behavior
- Sidebar is full-width (100%) and slides in/out from the left.
- Swipe-to-close gesture on sidebar:
  - Leftward swipe closes the sidebar.
  - Gesture only activates on screens narrower than 768px.
- After selecting a station on mobile, the sidebar auto-closes to reveal the map.
- The top bar search is hidden on mobile; search is inside the sidebar header.
- Map control buttons are positioned above the safe-area inset (`env(safe-area-inset-bottom)`).
- All panels and buttons use large tap targets and short transitions for perceived responsiveness.

## Sidebar Details
- Sidebar auto-opens when the user starts typing a search query.
- The “Stations” heading sits above the count/sort row to clarify the list context.

## Sidebar (Station List)
- Search by station name or ID.
- Sort options: name, distance (if geolocation available), network, elevation, favorites-only.
- Infinite scroll with pagination (50 items per batch).
- Each station card shows:
  - Name, ID, lat/long, elevation, network tag.
  - Favorite star toggle.

## Weather Card
- Shows current metrics from selected station’s historical dataset.
- Includes:
  - Station header + favorite toggle
  - Coordinates (click to copy)
  - Date/time in station timezone
  - Metrics: temperature, humidity, wind, pressure, precipitation
  - Mini timeline slider across historical points
- Weather icon derived from current conditions.
- Unit conversions based on user settings.

## Settings Menu
- Theme: light/dark.
- Map: 2D/3D projection.
- Units: temperature (C/F), wind (kts/mph), pressure (mb/inHg), precip (mm/in).
- Settings persist in localStorage.

## Styling System
- Custom CSS tokens defined in `src/styles/global.css`.
- Font: `PPNeue Montreal` (loaded from `/public/fonts`).
- Color direction:
  - Light background: pale green/gray surfaces with graphite text.
  - Dark background: deep blue/green with light text.
- Inputs and buttons are rounded with small radius (`~10px`).
- Mapbox default UI is restyled to match theme.

## Components (UI Building Blocks)
- `WeatherStationsMap`: orchestrates UI + map + data.
- `MapContainer`: Mapbox map, layers, clustering, marker icons.
- `Sidebar`: searchable, sortable station list.
- `WeatherCard`: station details + metrics + timeline slider.
- `SettingsMenu`: unit/theme/map toggles.
- `SearchBar`, `MenuButton`, `ToggleGroup`, `MetricRow`, `WeatherIcon`, `LoadingOverlay`.

## Assets
- Logos: `/public/logo.svg`, `/public/logo-white.svg`.
- Markers: `/public/marker.svg`, `/public/marker-selected.svg`, `/public/marker-selected-dark.svg`, `/public/marker-favorite.svg`.
- Favicons and Apple touch icon in `/public/`.
- Fonts: `PPNeue Montreal` weights in `/public/fonts/PPNeue-Montreal/`.

## Environment Variables
- `PUBLIC_MAPBOX_TOKEN` required for Mapbox.
- Add to `.env` locally; do not commit real secrets.

## Run & Build
- `npm install`
- `npm run dev` (Astro dev server)
- `npm run build` (outputs to `dist/`)
- `npm run preview` (serves production build on `http://localhost:4321`)

## Notes for Design Review
- Primary UX surfaces: map canvas, left sidebar list, top-left weather card.
- Emphasis on dense data presentation with soft, muted palettes.
- Layout is full-screen, with panel overlays and floating controls.
- Design patterns: cards, soft shadows, subtle transitions, minimal iconography.

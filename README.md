# ASOS Stations Map

Interactive map experience for exploring ASOS weather stations and historical observations.

## Overview
- Full-screen Mapbox map with clustering and custom markers.
- Searchable, sortable station list with favorites.
- Weather card with time-series slider and unit toggles.
- Desktop-first UI with mobile-friendly gestures.

More details: see [DOCS.md](https://github.com/themdq/asos-map/blob/master/DOCS.md).

## Tech Stack
- Astro + React
- Tailwind CSS
- Mapbox GL JS
- TanStack React Query (with persistence)

## Local Development
```sh
npm install
npm run dev
```

## Build / Preview
```sh
npm run build
npm run preview
```

## Environment
Create a `.env` file with:
```
PUBLIC_MAPBOX_TOKEN=your_token_here
```

## Data Sources
- Stations: `https://sfc.windbornesystems.com/stations`
- Historical: `https://sfc.windbornesystems.com/historical_weather?station={station_id}`

Notes:
- API is rate-limited (20/min).
- Responses may be corrupted; client includes repair logic.

## Deployment Notes
- Kubernetes manifests are in `k8s/`.
- `k8s/secrets.yaml` is gitignored; use `k8s/secrets.example.yaml` as a template.

## License
Unspecified.

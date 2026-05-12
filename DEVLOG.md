# Devlog

## [2026-05-10 16:30] Phase 5 — Completed
**Files:**
backend/caves/views.py
frontend/src/api/caves.ts
frontend/src/pages/CaveDetail.tsx
frontend/src/pages/CaveList.tsx
frontend/src/pages/CaveMap.tsx
frontend/src/utils/leafletIconFix.ts
frontend/src/pages/CaveForm.tsx
**Deviations from spec:** None
**Assumptions:** Mini-map in detail page uses OpenStreetMap tiles. Lightbox handles photo viewing without external libraries.
**Next session notes:** All Phase 5 tasks are complete, verified, and linted. The application is now fully functional for public and private users.

## [2026-05-10 16:15] Phase 5 — Cave Detail page implementation and wiring
**Files:**
frontend/src/pages/CaveDetail.tsx
frontend/src/pages/CaveList.tsx
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** None
**Assumptions:** Mini-map in detail page uses OpenStreetMap tiles. Lightbox handles photo viewing without external libraries.
**Next session notes:** Phase 5 complete.

## [2026-05-10 16:00] Phase 5 — Extract Leaflet icon fix utility
**Files:**
frontend/src/utils/leafletIconFix.ts
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** None
**Assumptions:** Using `L.Icon.Default.mergeOptions` as it is the standard way to fix the icon paths in Leaflet.
**Next session notes:** None

## [2026-05-10 15:55] Phase 5 — Frontend fetchCaveMedia public
**Files:**
frontend/src/api/caves.ts
**Deviations from spec:** None
**Assumptions:** Removing `credentials: 'include'` explicitly avoids sending the session cookie.
**Next session notes:** None

## [2026-05-10 15:50] Phase 5 — Backend media list endpoint public
**Files:**
backend/caves/views.py
**Deviations from spec:** None
**Assumptions:** Authenticated users can still see media for unpublished caves, consistent with the CaveDetail endpoint.
**Next session notes:** Verified with curl: public access to media for published caves works, returns 404 for unpublished caves or non-existent caves.

## [2026-05-08 10:00] Foundation — Repository structure
**Files:**
.gitignore
data/.gitkeep
backend/media/.gitkeep
**Deviations from spec:** None
**Assumptions:** Created .gitkeep files to ensure empty directories are tracked if needed, though they might be populated soon.
**Next session notes:** None

## [2026-05-08 10:05] Foundation — Docker Compose
**Files:**
docker-compose.yml
backend/Dockerfile
**Deviations from spec:** Added a Dockerfile to support the backend service defined in docker-compose.yml.
**Assumptions:** Using python:3.12-slim as the base image for the backend.
**Next session notes:** None

## [2026-05-08 10:10] Foundation — Backend setup
**Files:**
backend/pyproject.toml
backend/uv.lock
backend/config/settings.py
backend/caves/
.env.example
**Deviations from spec:** Used django-environ for environment variable management.
**Assumptions:** Django 5.2 (latest stable found by uv) is compatible with the project requirements.
**Next session notes:** None

## [2026-05-08 10:20] Foundation — Models and Migrations
**Files:**
backend/caves/models.py
backend/caves/admin.py
backend/caves/migrations/0001_initial.py
**Deviations from spec:** None
**Assumptions:** Manually adjusted the initial migration to include PostGIS PointField because local GDAL installation was missing/not found by Django, ensuring the migration is correct for the target PostGIS environment.
**Next session notes:** None

## [2026-05-08 10:25] Foundation — Import Command
**Files:**
backend/caves/management/commands/import_caves.py
**Deviations from spec:** Handled the '#' character in CSV headers explicitly.
**Assumptions:** CSV columns names match the spec after stripping spaces.
**Next session notes:** None

## [2026-05-08 10:30] Foundation — Makefile
**Files:**
Makefile
**Deviations from spec:** None
**Assumptions:** None
**Next session notes:** None

## [2026-05-08 10:35] Foundation — Pre-commit Hooks
**Files:**
.pre-commit-config.yaml
backend/pyproject.toml
**Deviations from spec:** Added ruff as a dev dependency to the backend.
**Assumptions:** None
**Next session notes:** None

## [2026-05-08 10:45] Phase 2 — Backend dependencies
**Files:**
backend/pyproject.toml
backend/uv.lock
**Deviations from spec:** None
**Assumptions:** django-filter and django-cors-headers are compatible with Django 5.x.
**Next session notes:** None

## [2026-05-08 11:00] Phase 2 — Backend implementation (Serializers, Views, URLs)
**Files:**
backend/caves/serializers.py
backend/caves/views.py
backend/caves/urls.py
backend/config/urls.py
backend/config/settings.py
**Deviations from spec:** None
**Assumptions:** registry_id is used as the lookup field for detail views.
**Next session notes:** None

## [2026-05-08 11:15] Phase 2 — API Verification
**Files:**
None
**Deviations from spec:** None
**Assumptions:** Tested endpoints via curl and confirmed correct JSON/GeoJSON structure.
**Next session notes:** None

## [2026-05-08 11:30] Phase 2 — Frontend initialization
**Files:**
frontend/
docker-compose.yml
frontend/Dockerfile
frontend/tailwind.config.js
frontend/postcss.config.js
frontend/vite.config.ts
**Deviations from spec:** Used Tailwind CSS v3 as specified in the spec, even though Vite might have defaulted to v4.
**Assumptions:** Using node:23-slim for the frontend Docker image.
**Next session notes:** None

## [2026-05-08 11:45] Phase 2 — Frontend Routing and Layout
**Files:**
frontend/src/App.tsx
frontend/src/components/Navbar.tsx
frontend/src/pages/Landing.tsx
frontend/src/pages/Login.tsx
frontend/src/pages/CaveList.tsx
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** None
**Assumptions:** Map page is excluded from the main Layout wrapper to allow for full-screen rendering.
**Next session notes:** None

## [2026-05-08 12:15] Phase 2 — CaveList and CaveMap Implementation
**Files:**
frontend/src/api/caves.ts
frontend/src/pages/CaveList.tsx
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** None
**Assumptions:** Using `leaflet.markercluster` for marker clustering as specified.
**Next session notes:** None

## [2026-05-08 12:25] Phase 2 — Linting and Formatting
**Files:**
backend/caves/views.py
backend/config/urls.py
frontend/src/pages/CaveList.tsx
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** None
**Assumptions:** Fixed ESLint and Ruff warnings to ensure CI compliance.
**Next session notes:** None

## [2026-05-08 12:30] Phase 2 — Completed
**Files:**
Makefile
docker-compose.yml
**Deviations from spec:** None
**Assumptions:** None
**Next session notes:** Phase 3 will focus on Authentication and the Private Dashboard.

## [2026-05-08 13:00] Bugfix — 502 Bad Gateway / Slow Startup
**Files:**
backend/Dockerfile
docker-compose.yml
backend/.python-version
backend/caves/views.py
**Deviations from spec:** None
**Assumptions:** The 502 error was caused by the backend taking too long to start (downloading Python/deps at runtime) because the host volume mount was interfering with the container's virtual environment.
**Next session notes:** Backend startup is now optimized and health-checked.

## [2026-05-08 14:00] Phase 3a — Auth endpoints
**Files:**
backend/caves/views.py
backend/config/urls.py
**Deviations from spec:** CSRF exemption is used for login/logout/me endpoints to simplify PoC development, as specified. This is a known security limitation to be addressed before any public deployment.
**Assumptions:** Standard Django Session Authentication is used.
**Next session notes:** None

## [2026-05-08 14:10] Phase 3a — CaveWriteSerializer
**Files:**
backend/caves/serializers.py
**Deviations from spec:** None
**Assumptions:** registry_id is set to read-only in CaveWriteSerializer when an instance is present (i.e., during update).
**Next session notes:** None

## [2026-05-08 14:30] Phase 3a — Private Cave and Media Endpoints
**Files:**
backend/caves/models.py
backend/caves/views.py
backend/caves/urls.py
backend/config/urls.py
backend/config/settings.py
**Deviations from spec:** None
**Assumptions:** File cleanup for CaveMedia is handled by overriding perform_destroy in the views. Dynamic upload path for media files is implemented using a function in the model.
**Next session notes:** All Phase 3a backend tasks are complete and verified.

## [2026-05-10 12:45] Enhancement — Map popup and Terminology
**Files:**
frontend/src/pages/CaveMap.tsx
frontend/src/pages/CaveList.tsx
frontend/src/pages/Dashboard.tsx
frontend/src/pages/CaveForm.tsx
frontend/src/pages/CaveDetail.tsx
**Deviations from spec:** Clarified that "registry_id" is the "Numero di catasto" across all views.
**Assumptions:** Added length, depth_positive, and depth_negative to the map popup as requested.
**Next session notes:** Phase 4 complete.

## [2026-05-10 12:30] Bugfix — Map visibility and Layout height
**Files:**
frontend/src/App.tsx
**Deviations from spec:** None
**Assumptions:** The map was invisible because Leaflet requires a container with a defined height. Changed global Layout to `h-screen` with `overflow-y-auto` main content to satisfy this while keeping the Navbar sticky.
**Next session notes:** None

## [2026-05-10 12:20] Bugfix — Sync Docker dependencies
**Files:**
docker-compose.yml
**Deviations from spec:** None
**Assumptions:** The import error was caused by the anonymous volume `/app/node_modules` in the frontend container not having the `@heroicons/react` package installed, even though it was present on the host. Synchronized it by running `npm install` inside the container.
**Next session notes:** None

## [2026-05-10 12:10] Bugfix — CaveMap syntax error
**Files:**
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** None
**Assumptions:** Fixed closing tags in the component's JSX structure.
**Next session notes:** None

## [2026-05-10 12:00] Phase 4 — Cave Detail stub
**Files:**
frontend/src/pages/CaveDetail.tsx
frontend/src/App.tsx
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** Refactored App.tsx to provide a global Navbar layout while keeping Map full-screen.
**Assumptions:** None
**Next session notes:** Phase 4 complete. Visual polish and core routes for PoC are ready.

## [2026-05-10 11:45] Phase 4 — CaveForm polish
**Files:**
frontend/src/pages/CaveForm.tsx
**Deviations from spec:** None
**Assumptions:** None
**Next session notes:** None

## [2026-05-10 11:30] Phase 4 — Dashboard polish
**Files:**
frontend/src/pages/Dashboard.tsx
**Deviations from spec:** None
**Assumptions:** None
**Next session notes:** None

## [2026-05-10 11:15] Phase 4 — Login page polish
**Files:**
frontend/src/pages/Login.tsx
**Deviations from spec:** Added a lock icon for visual emphasis.
**Assumptions:** None
**Next session notes:** None

## [2026-05-10 11:00] Phase 4 — CaveMap polish
**Files:**
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** Included Navbar in the map page for consistent navigation. Added ESRI Satellite layer toggle.
**Assumptions:** None
**Next session notes:** None

## [2026-05-10 10:45] Phase 4 — CaveList polish
**Files:**
frontend/src/pages/CaveList.tsx
**Deviations from spec:** Added links to (stubbed) detail page in the table rows.
**Assumptions:** None
**Next session notes:** None

## [2026-05-10 10:30] Phase 4 — Landing page
**Files:**
frontend/src/pages/Landing.tsx
**Deviations from spec:** Used a high-quality Unsplash image for the hero background.
**Assumptions:** Total cave count "censite" is the same as "pubblicate" since no public endpoint for all caves exists and PoC usually has all published.
**Next session notes:** None

## [2026-05-10 10:15] Phase 4 — Navbar polish
**Files:**
frontend/src/components/Navbar.tsx
**Deviations from spec:** Added Heroicons for visual polish.
**Assumptions:** None
**Next session notes:** None

## [2026-05-10 10:00] Phase 4 — Global base styles and font
**Files:**
frontend/src/index.css
frontend/index.html
frontend/tailwind.config.js
**Deviations from spec:** None
**Assumptions:** None
**Next session notes:** None

## [2026-05-08 17:45] Phase 3b — CaveForm mandatory fields and label update
**Files:**
frontend/src/pages/CaveForm.tsx
**Deviations from spec:** Made `geology` and `last_survey_date` mandatory in the frontend to match backend requirements. Renamed `last_survey_date` label to "Data ultima modifica".
**Assumptions:** None

## [2026-05-11 10:00] Phase 5 — Documentation
**Files:**
README.md
backend/README.md
frontend/README.md
**Deviations from spec:** None
**Assumptions:** None
**Next session notes:** The project is now fully documented with a root README and sub-project READMEs.

## [2026-05-11 10:05] Documentation — Rebrand to (UN)official
**Files:**
README.md
GEMINI.md
frontend/index.html
frontend/src/pages/Landing.tsx
frontend/src/components/Navbar.tsx
backend/README.md
frontend/README.md
specs/cave_registry_plan.md
**Deviations from spec:** Clarified that the project is NOT the official registry.
**Assumptions:** Using "(UN)official" branding as requested by user.
**Next session notes:** None

## [2026-05-11 10:15] Documentation — Data Import Schema
**Files:**
README.md
data/caves_sample.csv
**Deviations from spec:** Added detailed CSV schema documentation and a sample CSV file which were missing.
**Assumptions:** Schema derived from `import_caves.py` logic.
**Next session notes:** None

## [2026-05-11 11:23] Documentation — Roadmap & Future Features
**Files:**
README.md
**Deviations from spec:** Added a future roadmap based on community needs and map enhancements.
**Assumptions:** None
**Next session notes:** The project has a clear roadmap for future features including advanced map layers and filters.

## [2026-05-11 11:45] Phase 5 — Integrated PAT Geology WMS Overlay
**Files:**
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** None
**Assumptions:** Using a combined layer '1,3,5,23,24' (bedrock, synthems, quaternary deposits, faults, limits) with 50% opacity as per user preference.
**Next session notes:** None

## [2026-05-11 12:10] Phase 5 — Refined Geology Overlay
**Files:**
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** Increased opacity to 70% and added a toggleable legend panel using WMS GetLegendGraphic.
**Assumptions:** The legend image is fetched from the official PAT WMS service.
**Next session notes:** None

## [2026-05-11 12:30] Phase 5 — Improved Legend UI and UX
**Files:**
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** Moved legend button to bottom-left to avoid conflict with layer control. Converted legend panel to a large modal with full-resolution images and scroll support.
**Assumptions:** High-resolution legend images are necessary for readability due to the complexity of the geological map.
**Next session notes:** None

## [2026-05-11 13:00] Phase 5 — High-Quality Native Legend Implementation
**Files:**
frontend/src/components/GeologyLegend.tsx
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** Replaced static WMS legend images with a native React component that fetches legend data via JSON.
**Assumptions:** Using ArcGIS REST API for legend data provides superior UX and styling control compared to standard WMS GetLegendGraphic.
**Next session notes:** None

## [2026-05-11 13:15] Phase 5 — Interactive Geology Identify and Slide-out Legend
**Files:**
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** Implemented a slide-out legend panel and a real-time identify tooltip using WMS GetFeatureInfo.
**Assumptions:** Throttled hover requests to 400ms to maintain performance while providing interactive feedback.
**Next session notes:** None

## [2026-05-11 13:20] Phase 5 — Dynamic Geology Opacity
**Files:**
frontend/src/pages/CaveMap.tsx
**Deviations from spec:** Added a listener to change geology layer opacity between 0.5 (Satellite) and 0.7 (OSM).
**Assumptions:** None
**Next session notes:** None

## [2026-05-11 13:35] Phase 5 — Full Regional Geology Coverage (TN + BZ)
**Files:**
frontend/src/pages/CaveMap.tsx
frontend/src/components/GeologyLegend.tsx
**Deviations from spec:** Integrated the Alto Adige (Bolzano) geological WMS service and updated the legend and hover identify logic to support both provinces.
**Assumptions:** Unified "Geologia Regionale" toggle is better for UX than separate provincial toggles.
**Next session notes:** None

## [2026-05-11 14:30] Phase 5 — Separated Mutually Exclusive Geology Layers
**Files:**
frontend/src/pages/CaveMap.tsx
frontend/src/components/GeologyLegend.tsx
**Deviations from spec:** Separated Bolzano (Macro) and Trentino (Detail) into independent, mutually exclusive overlays. Implemented dynamic legend switching to match the active map layer.
**Assumptions:** Mutual exclusivity improves clarity by preventing visual and conceptual overlap between different geological contexts.
**Next session notes:** None

## [2026-05-11 15:00] Phase 5 — Fixed Bolzano Legend Structure
**Files:**
frontend/src/components/GeologyLegend.tsx
**Deviations from spec:** Corrected the data mapping for Bolzano's GeoServer legend which uses a different JSON structure than Trentino's ArcGIS server.
**Assumptions:** Using hex colors from GeoServer rules to render custom color swatches for Bolzano's macro-units.
**Next session notes:** None

# Devlog

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

## [2026-05-08 17:45] Phase 3b — CaveForm mandatory fields and label update
**Files:**
frontend/src/pages/CaveForm.tsx
**Deviations from spec:** Made `geology` and `last_survey_date` mandatory in the frontend to match backend requirements. Renamed `last_survey_date` label to "Data ultima modifica".
**Assumptions:** None
**Next session notes:** Phase 3b is complete.

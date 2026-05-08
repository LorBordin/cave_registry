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

## [2026-05-08 10:40] Foundation — Docker volume fix
**Files:**
docker-compose.yml
**Deviations from spec:** Mounted ./data to /data in the backend container to allow the import command to access source CSVs.
**Assumptions:** None
**Next session notes:** None

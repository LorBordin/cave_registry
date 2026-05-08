# Project Plan v2: Trentino Cave Registry (Catasto Grotte)
> PoC — Simple, effective, free-stack. Optimised for vibe coding with Gemini CLI / Antigravity.

---

## 1. Project Goal

Build a clean, working **Proof of Concept** for the official cave registry of the Trentino–Alto Adige region. The focus is on correctness and usability, not production hardening. Security is minimal and intentional for this stage.

The PoC must be fully functional: real data, real map, real logins — just not hardened for the open internet yet.

---

## 2. Pages & Features (Scope)

### 2.1 Public Pages (no login required)

| Page | Route | Description |
| :--- | :--- | :--- |
| **Landing Page** | `/` | Hero section with a short description of the project, a prominent CTA to the map and the list. Clean, minimal design. No carousel, no animation overkill. |
| **Cave List** | `/caves` | Paginated table of all caves. Columns: Registry ID, Name, Municipality, Elevation (m a.s.l.), Length (m), Depth (m). Sortable by any column. Simple text search by name or ID. |
| **Cave Map** | `/map` | Full-screen interactive map. All caves rendered as markers. Clicking a marker opens a popup with: name, ID, elevation, and a "View details" link (placeholder for future Cave Detail page). |
| **Cave Detail** *(planned — near future)* | `/caves/:id` | Dedicated page per cave. Displays all stored fields, photo gallery, and survey file downloads. Not in PoC scope but schema and routes should be stubbed. |

### 2.2 Private Area (login required)

| Page | Route | Description |
| :--- | :--- | :--- |
| **Login** | `/login` | Simple email + password form. No registration — accounts are created by the admin only. |
| **Dashboard** | `/dashboard` | List of all caves with Edit and Delete actions. Button to add a new cave. |
| **Cave Form** | `/dashboard/caves/new` and `/dashboard/caves/:id/edit` | Single form used for both create and edit. All cave fields included. Media upload section for photos and survey files. |

---

## 3. System Architecture

Decoupled architecture: Django REST backend + React frontend. They communicate exclusively via JSON API.

```
Browser
  └── React Frontend (Vite)
        ├── Public pages (Landing, List, Map)
        └── Private area (Dashboard, Forms)
              │
              │ JSON (REST API)
              ▼
        Django REST Framework
              │
              ▼
        PostgreSQL + PostGIS
              │
              └── /media/  (uploaded photos and PDFs)
```

---

## 4. Technical Stack

All tools are **free and open source**.

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Backend** | Python 3.12+, Django 5.x | |
| **Package manager** | `uv` | All Python deps managed via `pyproject.toml`. No `requirements.txt`. |
| **API** | Django REST Framework | GeoJSON output for map endpoints. |
| **Database** | PostgreSQL 16 + PostGIS | Spatial queries, geographic point storage. |
| **Frontend** | React 18 + Vite + TypeScript | |
| **Styling** | Tailwind CSS v3 | Utility-first. No component library needed for PoC. |
| **Map** | Leaflet.js + OpenStreetMap tiles | Free tile provider. `leaflet.markercluster` for marker clustering. |
| **Auth** | Django Session Auth (cookie-based) | Simplest correct choice for PoC. No JWT complexity. |
| **Media storage** | Django `MEDIA_ROOT` (local filesystem) | Sufficient for PoC. Swap to S3-compatible later if needed. |
| **Dev environment** | Docker Compose | One command to start postgres+postgis, django, and vite dev server. |
| **Code quality** | `ruff` (Python) - ruff handles both linting and formatting, `eslint` + `prettier` (JS/TS) | Enforced via pre-commit hooks. |

---

## 5. Repository Structure

```
catasto-grotte/
├── data/                           # Source CSV files — committed to git, source of truth
│   ├── caves_01.csv
│   ├── caves_02.csv
│   └── ...
├── backend/
│   ├── pyproject.toml              # uv-managed deps
│   ├── manage.py
│   ├── config/                     # Django settings, urls, wsgi
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── caves/                      # Main Django app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── management/
│   │       └── commands/
│   │           └── import_caves.py # CSV ingestion pipeline
│   └── media/                      # Uploaded files (gitignored)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/                    # Axios/fetch wrappers per resource
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── CaveList.tsx
│   │   │   ├── CaveMap.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── CaveForm.tsx
│   │   └── components/             # Shared UI: Navbar, CaveMarker, MediaUpload, etc.
├── docker-compose.yml
├── Makefile
├── .gitignore
└── .pre-commit-config.yaml
```

---

## 6. Database Schema

### 6.1 CSV → Model Field Mapping

The source CSVs use Italian column names. The mapping to model fields is:

| CSV column | Model field | Notes |
| :--- | :--- | :--- |
| `catasto` | `registry_id` | Official catasto code, unique identifier |
| `Numero di placchetta` | `plaque_number` | Physical marker number on-site |
| `Nome` | `name` | Cave name |
| `Quota ingresso` | `elevation` | Entrance elevation in metres a.s.l. |
| `Estensione spaziale` | `length` | Total surveyed length in metres |
| `Estensione verticale positiva` | `depth_positive` | Upward vertical extent in metres |
| `Estensione verticale negativa` | `depth_negative` | Downward vertical extent in metres |
| `Latitudine` | `location` (lat) | Combined with Longitudine into PostGIS PointField |
| `Longitudine` | `location` (lon) | WGS84 decimal degrees |

### 6.2 Cave

The core model. Fields present in the CSV are required where data is expected to exist; all enrichment fields added for future use are nullable.

| Field | Type | Notes |
| :--- | :--- | :--- |
| `id` | AutoField (PK) | Internal DB id |
| `registry_id` | CharField, unique | CSV: `catasto` |
| `plaque_number` | CharField, optional | CSV: `Numero di placchetta` — may be alphanumeric |
| `name` | CharField | CSV: `Nome` |
| `location` | PointField (PostGIS, SRID=4326) | Built from CSV `Latitudine` + `Longitudine`. Rows missing either coordinate are skipped during import with a warning. |
| `elevation` | IntegerField, optional | CSV: `Quota ingresso`, metres a.s.l. |
| `length` | FloatField, optional | CSV: `Estensione spaziale`, metres |
| `depth_positive` | FloatField, optional | CSV: `Estensione verticale positiva`, metres |
| `depth_negative` | FloatField, optional | CSV: `Estensione verticale negativa`, metres |
| `municipality` | CharField, optional | Not in CSV — manually enriched via dashboard |
| `valley` | CharField, optional | Not in CSV — manually enriched via dashboard |
| `geology` | CharField (choices), optional | Not in CSV. Choices: `limestone`, `dolomite`, `gypsum`, `other` |
| `description` | TextField, optional | Not in CSV — manually enriched via dashboard |
| `last_survey_date` | DateField, optional | Not in CSV — manually enriched via dashboard |
| `is_published` | BooleanField, default=True | False = hidden from public pages |
| `created_at` | DateTimeField, auto | |
| `updated_at` | DateTimeField, auto | |

### 6.3 CaveMedia

Separate model — one cave can have many media files.

| Field | Type | Notes |
| :--- | :--- | :--- |
| `id` | AutoField (PK) | |
| `cave` | ForeignKey → Cave | |
| `file` | FileField | Stored in `media/caves/<registry_id>/` |
| `media_type` | CharField (choices) | `photo`, `survey_pdf`, `survey_image` |
| `caption` | CharField, optional | |
| `uploaded_by` | ForeignKey → User | |
| `uploaded_at` | DateTimeField, auto | |

### 6.4 User

Use Django's built-in `auth.User`. No custom model needed for PoC. Accounts created only via Django admin or management command. No self-registration endpoint.

---

## 7. CSV Ingestion Pipeline

### 7.1 Data folder

Source CSVs live in `data/` at the repo root and are committed to git. They are the authoritative source for raw cave data and should not be modified manually — corrections go through the dashboard after import.

```
data/
├── caves_01.csv
├── caves_02.csv
└── ...
```

All files share the same column structure:
```
catasto,Numero di placchetta,Nome,Quota ingresso,Estensione spaziale,Estensione verticale positiva,Estensione verticale negativa,Latitudine,Longitudine
```

### 7.2 Management command

Location: `backend/caves/management/commands/import_caves.py`

Invoked as:
```bash
uv run python manage.py import_caves --source ../data/
```

Or via Makefile:
```bash
make import
```

Behaviour:

- Accepts a `--source` argument pointing to a folder. Defaults to `../data/` relative to `manage.py`.
- Iterates all `*.csv` files in the folder in alphabetical order.
- For each row:
  - Parses `Latitudine` and `Longitudine` as float. **Skips the row with a warning** if either is missing or unparseable — a cave without coordinates cannot be placed on the map.
  - Constructs a PostGIS `Point(longitude, latitude, srid=4326)`.
  - Uses `update_or_create` on `registry_id` — running the command multiple times is safe and idempotent.
  - Maps all other columns to model fields per the table in section 6.1.
  - Leaves all nullable enrichment fields (`municipality`, `geology`, etc.) untouched on update, so manual edits made via the dashboard are never overwritten.
- Prints a summary at the end: `Imported: N created, M updated, K skipped (no coordinates), E errors`.

### 7.3 Git strategy

| Path | Git status | Reason |
| :--- | :--- | :--- |
| `data/*.csv` | ✅ Committed | Text, small, version-controllable source of truth |
| `backend/media/` | ❌ Gitignored | Binary uploads, arbitrarily large |
| `uv.lock` | ✅ Committed | Reproducible Python dependency resolution |
| `.env` | ❌ Gitignored | Secrets (DB password, Django secret key) |
| Postgres data volume | ❌ Never in repo | Lives in Docker named volume, persists across restarts |

`.gitignore` must include at minimum:
```
backend/media/
*.sqlite3
.env
__pycache__/
.venv/
```

Docker Compose uses a **named volume** (not a bind mount) for Postgres so data survives `docker compose down/up`:
```yaml
volumes:
  postgres_data:

services:
  db:
    image: postgis/postgis:16-3.4
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### 7.4 First-run sequence

Document this in the README:
```bash
docker compose up -d        # Start services
make migrate                # Apply Django migrations
make createsuperuser        # Create the first admin account
make import                 # Seed cave data from data/*.csv
```

---

## 8. API Endpoints

All endpoints under `/api/v1/`.

### Public (no auth)

| Method | Path | Response | Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/caves/` | JSON list | Supports `?search=`, `?ordering=`, `?page=` |
| `GET` | `/caves/geojson/` | GeoJSON FeatureCollection | All published caves. Used by Leaflet. Optionally filter by `?bbox=minLng,minLat,maxLng,maxLat` for viewport loading. |
| `GET` | `/caves/:id/` | JSON object | Single cave detail (stubbed for future Cave Detail page) |

### Private (session auth required)

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/login/` | Sets session cookie |
| `POST` | `/auth/logout/` | Clears session |
| `GET` | `/auth/me/` | Returns current user info |
| `POST` | `/caves/` | Create new cave |
| `PUT/PATCH` | `/caves/:id/` | Update cave |
| `DELETE` | `/caves/:id/` | Delete cave |
| `POST` | `/caves/:id/media/` | Upload a media file (multipart/form-data) |
| `DELETE` | `/media/:id/` | Delete a media file |

---

## 9. Frontend Component Map

```
App.tsx
├── <Navbar />                  # Logo, nav links, login/logout button
├── <ProtectedRoute />          # Wraps private pages, redirects to /login if not authed
│
├── pages/Landing.tsx
│   ├── <HeroSection />         # Title, tagline, CTA buttons
│   └── <StatsBar />            # Simple counters: N caves, N municipalities, etc.
│
├── pages/CaveList.tsx
│   ├── <SearchBar />
│   ├── <SortableTable />       # Columns: ID, Name, Municipality, Elevation, Length, Depth
│   └── <Pagination />
│
├── pages/CaveMap.tsx
│   └── <LeafletMap />
│       ├── TileLayer: OpenStreetMap
│       ├── MarkerClusterGroup   # leaflet.markercluster
│       └── <CavePopup />       # Name, ID, elevation, "View details" link
│
├── pages/Login.tsx
│   └── <LoginForm />
│
├── pages/Dashboard.tsx         # Private
│   ├── <DashboardStats />      # Total caves, unpublished count
│   └── <CaveAdminTable />      # All caves with Edit / Delete buttons
│
└── pages/CaveForm.tsx          # Private — used for both create and edit
    ├── <CaveFieldsForm />      # All Cave model fields
    │   └── Coordinate input: lat/lon text fields + optional map pin picker
    └── <MediaManager />        # List existing media, upload new files, delete
```

---

## 10. Map Implementation Notes

- **Tile provider:** OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`). Free, no API key, good coverage of Trentino. Consider also adding a satellite layer toggle using ESRI World Imagery (free, no key required for reasonable usage).
- **Clustering:** Use `leaflet.markercluster` — handles hundreds of markers without performance issues.
- **Data loading:** On map mount, fetch `/api/v1/caves/geojson/` once and render all markers. For PoC this is fine; add bbox filtering later if the dataset grows large.
- **Cave popup:** Show `registry_id`, `name`, `elevation`, `municipality`. Include a "Dettagli →" link (disabled/placeholder for PoC).
- **Coordinate input in forms:** Two plain number inputs (latitude, longitude, WGS84 decimal degrees). Optionally add a small embedded Leaflet map where the admin can click to place the pin — this is a nice UX touch and not difficult with React-Leaflet.

---

## 11. Dev Environment & Tooling

### uv (Python package manager)

```bash
# Install uv
curl -Lsf https://astral.sh/uv/install.sh | sh

# Create project and install deps
uv init backend
cd backend
uv add django djangorestframework psycopg[binary] djangorestframework-gis Pillow

# Run commands
uv run python manage.py migrate
uv run python manage.py runserver
```

All dependencies declared in `pyproject.toml`. No `requirements.txt`. Lockfile (`uv.lock`) committed to git.

### Docker Compose (dev)

```yaml
# docker-compose.yml (dev)
services:
  db:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: catasto
      POSTGRES_USER: catasto
      POSTGRES_PASSWORD: catasto
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    command: uv run python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      - db

  frontend:
    build: ./frontend
    command: npm run dev -- --host
    volumes:
      - ./frontend:/app
    ports:
      - "5173:5173"
```

### Makefile

```makefile
dev:             docker compose up
migrate:         docker compose exec backend uv run python manage.py migrate
createsuperuser: docker compose exec backend uv run python manage.py createsuperuser
import:          docker compose exec backend uv run python manage.py import_caves --source ../data/
shell:           docker compose exec backend uv run python manage.py shell
test:            docker compose exec backend uv run python manage.py test
lint:            cd backend && uv run ruff check . && cd ../frontend && npm run lint
```

### Pre-commit hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    hooks:
      - id: ruff
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-prettier
    hooks:
      - id: prettier
        types_or: [javascript, typescript, tsx]
```

---

## 12. Development Roadmap

### Phase 1 — Foundation
- [ ] Initialise repo with `data/` folder, Docker Compose, `uv` backend, Vite frontend
- [ ] Add `.gitignore` (media, .env, __pycache__, .venv)
- [ ] Define `Cave` and `CaveMedia` models per schema in section 6, run migrations
- [ ] Enable Django Admin for `Cave`
- [ ] Write `import_caves` management command
- [ ] Run `make import` — verify all CSVs load correctly, check skipped-row warnings

### Phase 2 — Public API & Map
- [ ] Implement `/api/v1/caves/` (list + detail) with pagination, search, and ordering
- [ ] Implement `/api/v1/caves/geojson/` endpoint (GeoJSON FeatureCollection, published caves only)
- [ ] Build `CaveMap` page with Leaflet + OSM tiles + `leaflet.markercluster` + popups
- [ ] Build `CaveList` page with sortable table (registry ID, name, elevation, length, depth_positive, depth_negative) and search

### Phase 3 — Auth & Private Area
- [ ] Implement session login/logout endpoints
- [ ] Build `Login` page and `ProtectedRoute` wrapper in React
- [ ] Build `Dashboard` with full cave admin table (edit / delete actions)
- [ ] Build `CaveForm` for create and edit (all Cave fields, including the nullable enrichment fields)
- [ ] Build `MediaManager` component (list, upload, delete photos and PDFs)

### Phase 4 — Landing Page & Polish
- [ ] Build `Landing` page (hero section, stats bar pulling live counts from API)
- [ ] Apply consistent Tailwind styling across all pages
- [ ] Stub `/caves/:id` route with a "coming soon" placeholder

### Phase 5 — Cave Detail Page *(near future)*
- [ ] Build full `CaveDetail` page: all fields, photo gallery, survey download links
- [ ] Connect map popups and list rows to the detail page
- [ ] Update GeoJSON popup "Dettagli →" link to point to live route

---

## 13. Design Guidelines

- **Palette:** Use a neutral dark background (slate-900 or stone-900) with white text and a single accent colour — suggest a muted teal or alpine green to echo the mountain/cave context. Keep it consistent across all pages.
- **Typography:** A single sans-serif font (Inter or similar via Google Fonts or Fontsource — free). Headings bold and large, body text readable at 16px.
- **Layout:** Full-width sections on landing. Content pages use a max-width container (e.g. `max-w-5xl mx-auto px-4`). Map is full-screen (no container).
- **Tables:** Clean, no excessive borders. Zebra-stripe rows for readability. Hover highlight.
- **Forms:** Generous spacing, clear labels above inputs, visible focus rings. No multi-column complexity.
- **No paid icons, no paid fonts, no paid tile providers.**

---

## 14. Out of Scope for PoC

- Email-based password reset
- User self-registration
- Role-based permissions (all logged-in users have the same access)
- Production deployment / HTTPS / reverse proxy
- Audit logs
- Data export (CSV/KML)
- Advanced GIS features (polygon cave entrance shapes, 3D survey viewer)

FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for PostGIS and uv
RUN apt-get update && apt-get install -y \
    binutils \
    libproj-dev \
    gdal-bin \
    libgdal-dev \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uv/bin/uv
ENV PATH="/uv/bin:${PATH}"
# Ensure uv uses a predictable environment path outside the mounted /app
ENV UV_PROJECT_ENVIRONMENT=/opt/venv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies into /opt/venv
RUN uv sync --frozen --no-cache

# Copy the rest of the application
COPY . .

EXPOSE 8000

CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]

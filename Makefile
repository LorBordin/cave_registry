.PHONY: dev migrate createsuperuser import shell test lint

dev:
	docker compose up

migrate:
	docker compose exec backend uv run python manage.py migrate

createsuperuser:
	docker compose exec backend uv run python manage.py createsuperuser

import:
	docker compose exec backend uv run python manage.py import_caves --source ../data/

shell:
	docker compose exec backend uv run python manage.py shell

test:
	docker compose exec backend uv run python manage.py test

lint:
	cd backend && uv run ruff check . && uv run ruff format --check .
	cd frontend && npm run lint



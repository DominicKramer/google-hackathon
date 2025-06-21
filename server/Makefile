.PHONY: fix-and-check fix check dev redis celery flower

fix-and-check:
	make fix
	make check

fix:
	ruff format .
	isort --skip-glob='.venv/**' .

check:
	pyright
	ruff check .
	isort --skip-glob='.venv/**' --check .

dev:
	python course_builder/api/server.py --dev

redis:
	docker run --rm --name some-redis -p 6379:6379 redis:latest

celery:
	celery -A course_builder.api.worker.celery worker --loglevel=info

flower:
	celery --broker=redis://localhost:6379 flower --port=5555

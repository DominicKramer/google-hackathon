# Docker Setup for Course Builder API

This directory contains Docker configurations for running the Course Builder API server and Celery worker.

## Files

- `Dockerfile.api` - Dockerfile for the FastAPI server
- `Dockerfile.worker` - Dockerfile for the Celery worker
- `docker-compose.yml` - Complete setup with Redis broker
- `requirements.txt` - Python dependencies
- `.dockerignore` - Files to exclude from Docker builds

## Quick Start with Docker Compose

1. **Create a `.env` file** with your environment variables:
   ```bash
   # Required environment variables
   SUPABASE_JWT_SECRET=your_jwt_secret
   SUPABASE_JWT_ALGORITHM=HS256
   SUPABASE_JWT_AUDIENCE=your_audience
   CELERY_BROKER_URL=redis://redis:6379/0
   CELERY_RESULT_BACKEND=redis://redis:6379/0
   # Add other required environment variables for your application
   ```

2. **Build and run all services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the services**:
   - API Server: http://localhost:8000
   - Flower (Celery monitoring): http://localhost:5555
   - Redis: localhost:6379

## Individual Docker Commands

### Build the API server image:
```bash
docker build -f Dockerfile.api -t course-builder-api .
```

### Build the worker image:
```bash
docker build -f Dockerfile.worker -t course-builder-worker .
```

### Run the API server:
```bash
docker run -p 8000:8000 --env-file .env course-builder-api
```

### Run the Celery worker:
```bash
docker run --env-file .env course-builder-worker
```

## Development

For development, you can use the existing Makefile commands:

```bash
# Run API server in development mode
make dev

# Run Redis
make redis

# Run Celery worker
make celery

# Run Flower monitoring
make flower
```

## Environment Variables

Make sure your `.env` file contains all necessary environment variables:

- `SUPABASE_JWT_SECRET` - JWT secret for authentication
- `SUPABASE_JWT_ALGORITHM` - JWT algorithm (e.g., HS256)
- `SUPABASE_JWT_AUDIENCE` - JWT audience
- `CELERY_BROKER_URL` - Redis URL for Celery broker
- `CELERY_RESULT_BACKEND` - Redis URL for Celery results
- Any other environment variables required by your application

## Notes

- The API server runs on port 8000
- The Celery worker connects to Redis for task queue management
- Flower provides a web interface for monitoring Celery tasks
- All services are configured to restart automatically unless stopped manually
- The `.env` file is mounted as read-only in the containers 
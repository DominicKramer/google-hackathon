FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies including Redis
RUN apt-get update && apt-get install -y \
    gcc \
    redis-server \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY course_builder/ ./course_builder/

# Create supervisor configuration directory
RUN mkdir -p /etc/supervisor/conf.d

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create Redis data directory
RUN mkdir -p /var/lib/redis && chown -R appuser:appuser /var/lib/redis

# Create log directories
RUN mkdir -p /var/log/supervisor /var/log/redis && \
    chown -R appuser:appuser /var/log/supervisor /var/log/redis

# Change ownership of the app directory to the non-root user
RUN chown -R appuser:appuser /app

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV CELERY_BROKER_URL=redis://localhost:6379/0
ENV CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Expose ports
EXPOSE 8000 6379

# Switch to non-root user
USER appuser

# Start supervisor which will manage all processes
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 
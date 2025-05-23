
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create the wait-for-db script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
host="$1"\n\
shift\n\
port="$1"\n\
shift\n\
cmd="$@"\n\
\n\
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -p "$port" -U "banquet_user" -d "banquet_db" -c "\\q"; do\n\
  >&2 echo "Postgres is unavailable - sleeping"\n\
  sleep 1\n\
done\n\
\n\
>&2 echo "Postgres is up - executing command"\n\
exec $cmd' > /app/wait-for-db.sh

# Make the script executable
RUN chmod +x /app/wait-for-db.sh

# Create non-root user
RUN useradd --create-home --shell /bin/bash banquet
RUN chown -R banquet:banquet /app
USER banquet

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Run the application with wait-for-db script
CMD ["/bin/bash", "-c", "/app/wait-for-db.sh postgres 5432 uvicorn main:app --host 0.0.0.0 --port 8000"]

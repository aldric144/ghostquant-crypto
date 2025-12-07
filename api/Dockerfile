FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for numpy/scikit-learn
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies (copy first for better layer caching)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app

# Default port (DigitalOcean uses 8080, Railway uses PORT env variable)
ENV PORT=8080
EXPOSE 8080

# Use shell form to expand $PORT variable
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for numpy/scikit-learn
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies from api folder
COPY api/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Copy application code from api folder
COPY api/app ./app

# Railway uses PORT env variable
ENV PORT=8000
EXPOSE 8000

# Use shell form to expand $PORT variable
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT

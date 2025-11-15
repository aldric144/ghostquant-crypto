FROM python:3.11-slim

WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy dependency files
COPY pyproject.toml ./

# Install dependencies
RUN poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi

# Copy application code
COPY src ./src

# Set Python path
ENV PYTHONPATH=/app/src

# Create results directory
RUN mkdir -p /data/backtests/results

# Run worker
CMD ["python", "-m", "worker"]

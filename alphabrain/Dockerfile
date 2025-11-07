FROM python:3.11-slim

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml ./
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi

COPY src ./src

# Set PYTHONPATH so alphabrain module is importable
ENV PYTHONPATH=/app/src

# Create reports directory
RUN mkdir -p /app/reports

CMD ["python", "-m", "uvicorn", "alphabrain.api:app", "--host", "0.0.0.0", "--port", "8081"]

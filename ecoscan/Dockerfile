FROM python:3.11-slim

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml ./
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi

COPY src ./src

# Set PYTHONPATH so ecoscan module is importable
ENV PYTHONPATH=/app/src

CMD ["python", "-m", "uvicorn", "ecoscan.api:app", "--host", "0.0.0.0", "--port", "8082"]

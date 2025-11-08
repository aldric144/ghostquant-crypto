FROM python:3.11-slim

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml ./
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi

COPY src ./src

CMD ["python", "-m", "signals.scheduler"]

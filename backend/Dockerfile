FROM python:3.11-slim-bookworm
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*
RUN git --version

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
WORKDIR /workspaces/resume-maker-react/backend

# Install pip-tools
RUN pip install --no-cache-dir pip-tools

# Copy requirements.in and compile it to requirements.txt
COPY requirements.in ./
RUN pip-compile --no-annotate --no-header requirements.in -o requirements.txt

# Install dependencies from the generated requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . ./
EXPOSE 8000
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
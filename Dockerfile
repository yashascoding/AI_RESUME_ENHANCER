FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirement.txt .
RUN pip install --no-cache-dir -r requirement.txt

# Copy backend code
COPY app/ app/
COPY graph/ graph/

# Build frontend
COPY frontend/ frontend/
WORKDIR /app/frontend
RUN npm install && npm run build

WORKDIR /app

# Copy uploads directory if it exists (for volume mount)
RUN mkdir -p uploads

EXPOSE $PORT

CMD sh -c "uvicorn app.server:app --host 0.0.0.0 --port $PORT"

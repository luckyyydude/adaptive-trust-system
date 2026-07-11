FROM python:3.11-slim

WORKDIR /app

# Copy requirements from the backend folder
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend code into /app
COPY backend/ .

# Run the app (using main.py, not app.main)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

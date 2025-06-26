# Use Python 3.10 base image
FROM python:3.10

# Set working directory inside the container
WORKDIR /app

# Copy local PyTorch wheel into the image
COPY wheels/ /wheels/

# Install torch from the local wheel (offline install)
RUN pip install /wheels/torch-2.1.0+cpu-cp310-cp310-linux_x86_64.whl

# Copy requirements and install remaining dependencies
COPY requirements.txt .
RUN pip install --default-timeout=300 --no-cache-dir -r requirements.txt

# Copy the rest of the FastAPI application
COPY . .

# Expose the port for Uvicorn
EXPOSE 8000

# Start FastAPI with Uvicorn
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]

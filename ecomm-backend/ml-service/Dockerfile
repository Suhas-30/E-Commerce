FROM python:3.10-slim

# === System dependencies ===
RUN apt-get update && \
    apt-get install -y curl unzip git && \
    rm -rf /var/lib/apt/lists/*

# === Set working directory ===
WORKDIR /app

# === Copy all source code ===
COPY . .

# === Install Python dependencies ===
# (Install torch separately with CPU-only wheel)
RUN pip install --no-cache-dir torch==2.1.0 --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt


# === Download and extract BERT model from Google Drive ===
RUN python download_model.py

# === Run FastAPI app on port 8000 ===
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]

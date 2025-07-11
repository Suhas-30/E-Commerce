FROM python:3.10-slim

# === Install system dependencies ===
RUN apt-get update && \
    apt-get install -y curl unzip git && \
    rm -rf /var/lib/apt/lists/*

# === Set working directory ===
WORKDIR /app

# === Copy all files into the container ===
COPY . .

# === Install PyTorch CPU version ===
RUN pip install --no-cache-dir torch==2.1.0 --timeout 300 --retries 10 --index-url https://download.pytorch.org/whl/cpu

# ✅ Install all Python dependencies (including protobuf)
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir protobuf

# ✅ Run the model download script (must extract to `./bert_nosql_model`)
RUN python download_model.py

# === Expose the port ===
EXPOSE 8000

# ✅ Run FastAPI app
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]

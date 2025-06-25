#ml-service
FROM python:3.10

WORKDIR /app
COPY . .

RUN pip install --progress-bar=on --no-cache-dir -r requirements.txt


CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"] 
# ml-service/main.py
from fastapi import FastAPI, Request
import torch
from transformers import BertTokenizer, BertForSequenceClassification
import json

app = FastAPI()

MODEL_PATH = "./bert_nosql_model"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

tokenizer = BertTokenizer.from_pretrained(MODEL_PATH, local_files_only=True)
model = BertForSequenceClassification.from_pretrained(MODEL_PATH, local_files_only=True)
model.to(DEVICE)
model.eval()

def predict(text: str):
    encoding = tokenizer.encode_plus(
        text,
        add_special_tokens=True,
        max_length=128,
        return_token_type_ids=False,
        padding='max_length',
        truncation=True,
        return_attention_mask=True,
        return_tensors='pt'
    )
    input_ids = encoding["input_ids"].to(DEVICE)
    attention_mask = encoding["attention_mask"].to(DEVICE)

    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=1)
        predicted_class = torch.argmax(probs, dim=1).item()
        confidence = probs[0][predicted_class].item()

    label = "malicious" if predicted_class == 1 else "benign"
    return {"prediction": label, "confidence": round(confidence, 4)}


@app.post("/predict")
async def classify(request: Request):
    try:
        body = await request.json()

        print("📝 Received Full Payload:", json.dumps(body))

        # Handle nested 'payload' object
        if "payload" in body and isinstance(body["payload"], dict):
            if "encryptedFingerprint" in body["payload"]:
                print("✂️ Trimming 'encryptedFingerprint' from nested payload before ML prediction.")
                body["payload"].pop("encryptedFingerprint")

        # Convert sanitized body to string
        raw_text = json.dumps(body)
        print("📦 Payload Sent to Model:", raw_text)

        result = predict(raw_text)
        print(f"🔍 Prediction => Label: {result['prediction']} | Confidence: {result['confidence']}")
        return result
    except Exception as e:
        print(f"❌ Error processing input: {e}")
        return {"error": f"Invalid input: {e}"}
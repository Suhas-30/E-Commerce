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
    return {"label": label, "confidence": round(confidence, 4)}

@app.post("/predict")
async def classify(request: Request):
    body = await request.json()
    try:
        # ✅ Convert incoming raw JSON into a string
        raw_text = json.dumps(body)
        print("📝 Received:", raw_text)
        return predict(raw_text)
    except Exception as e:
        return {"error": f"Invalid input: {e}"}

# api.py
import torch
import torch.nn as nn
import pickle
import re
from fastapi import FastAPI
from pydantic import BaseModel

MAX_LEN = 100
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load vocab
with open("C:\\Users\\LENOVO\\Desktop\\Ecommer\\ecomm-backend\\ml-service\\vocab.pkl", "rb") as f:
    vocab = pickle.load(f)

def simple_tokenizer(text):
    text = text.lower()
    return re.findall(r"\b\w+\b", text)[:MAX_LEN]

def encode(text):
    tokens = simple_tokenizer(text)
    ids = [vocab.get(t, 1) for t in tokens]
    ids += [0] * (MAX_LEN - len(ids))
    return torch.tensor(ids[:MAX_LEN], dtype=torch.long).unsqueeze(0)

class TransformerClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim=128, num_heads=4, num_layers=2, num_classes=2):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        encoder_layer = nn.TransformerEncoderLayer(embed_dim, num_heads, batch_first=True)
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers)
        self.fc = nn.Linear(embed_dim, num_classes)

    def forward(self, x):
        embedded = self.embedding(x)
        transformer_out = self.transformer(embedded)
        return self.fc(transformer_out.mean(dim=1))

model = TransformerClassifier(vocab_size=len(vocab)).to(DEVICE)
model.load_state_dict(torch.load("C:\\Users\\LENOVO\\Desktop\\Ecommer\\ecomm-backend\\ml-service\\transformer_nosql_model.pth", map_location=DEVICE))
model.eval()

app = FastAPI()

class QueryInput(BaseModel):
    payload: dict

@app.post("/predict")
async def predict(input_data: QueryInput):
    flat_text = " ".join(str(v) for v in input_data.payload.values())
    encoded = encode(flat_text).to(DEVICE)
    with torch.no_grad():
        pred = torch.argmax(model(encoded), dim=1).item()
    return {"prediction": "malicious" if pred == 1 else "benign"}

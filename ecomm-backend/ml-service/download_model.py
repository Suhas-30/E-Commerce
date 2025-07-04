import os
import zipfile
import gdown

MODEL_DIR = "bert_nosql_model"
MODEL_ZIP = "bert_nosql_model.zip"
GDRIVE_URL = "https://drive.google.com/uc?id=1tfSkSugTIx1jtv6f0rNoJXkyIyvwdmi3"

if not os.path.exists(MODEL_DIR):
    print("📦 Downloading model from Google Drive...")
    gdown.download(GDRIVE_URL, MODEL_ZIP, quiet=False)
    print("✅ Extracting model zip...")
    with zipfile.ZipFile(MODEL_ZIP, 'r') as zip_ref:
        zip_ref.extractall(MODEL_DIR)
    print("✅ Model is ready.")
else:
    print("✅ Model already exists. Skipping download.")

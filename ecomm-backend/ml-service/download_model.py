import os
import zipfile
import gdown
import shutil

MODEL_DIR = "bert_nosql_model"
MODEL_ZIP = "bert_nosql_model.zip"
GDRIVE_URL = "https://drive.google.com/uc?id=1yao397lO6ygTPZ8gMsbH6_VqrRYoNxMx"
TEMP_DIR = "temp_model_dir"

def extract_model(zip_path, target_dir):
    print("✅ Extracting model zip...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(TEMP_DIR)

    # Detect the correct inner folder (e.g., temp_model_dir/bert_nosql_model)
    subdirs = [d for d in os.listdir(TEMP_DIR) if os.path.isdir(os.path.join(TEMP_DIR, d))]
    if not subdirs:
        raise Exception("❌ No folder found inside zip.")

    inner_model_path = os.path.join(TEMP_DIR, subdirs[0])

    # Ensure final model dir exists
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)

    # Move model files to final directory
    for filename in os.listdir(inner_model_path):
        src = os.path.join(inner_model_path, filename)
        dst = os.path.join(target_dir, filename)
        shutil.move(src, dst)

    # Clean up
    shutil.rmtree(TEMP_DIR)
    print("✅ Model is ready.")


if not os.path.exists(MODEL_DIR):
    print("📦 Downloading model from Google Drive...")
    gdown.download(GDRIVE_URL, MODEL_ZIP, quiet=False)

    extract_model(MODEL_ZIP, MODEL_DIR)
else:
    print("✅ Model already exists. Skipping download.")

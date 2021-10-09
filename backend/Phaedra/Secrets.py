import json
from typing import Dict

import openai


def get_secrets() -> Dict[str, str]:
    with open("secrets.json") as file:
        secrets = json.load(file)
    return secrets


def get_secrets_remote() -> Dict[str, str]:
    from google.colab import drive  # type: ignore

    drive.mount("/content/drive")
    with open("/content/drive/MyDrive/secrets.json") as file:
        secrets = json.load(file)
    return secrets


def load_secrets(secrets):
    openai.api_key = secrets["KEY"]

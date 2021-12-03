"""Phaedra's backend API module."""

import json
import base64
import io

from flask import Flask, request, jsonify
from flask.json import load
from flask_cors import CORS  # type: ignore
from flask_ngrok import run_with_ngrok  # type: ignore

from Phaedra.Notebook import Notebook
from Phaedra.Secrets import get_secrets, get_secrets_remote, set_secrets

__all__ = ("run", "run_remote")

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/notebook/from_pdf", methods=["POST"])
def notebook_from_pdf():
    """Creates a Notebook from a PDF file."""

    path = request.json["path"]
    pdf_base64 = request.json["base64"]
    pdf_bytes = base64.b64decode(pdf_base64)
    pdf_stream = io.BytesIO(pdf_bytes)
    notebook = Notebook.from_pdf(stream=pdf_stream, path=path)
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/command/generation", methods=["POST"])
def command_generation():
    """Adds a generate cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_generation_cell(
        request.json["prompt"], request.json["page_id"], cell_id=request.json["cell_id"]
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/command/wimage", methods=["POST"])
def command_wimage():
    """Adds Wikipedia image cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_image_cell(
        request.json["query"], request.json["page_id"], cell_id=request.json["cell_id"]
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/command/question", methods=["POST"])
def command_question():
    """Adds question cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_question_cell(
        request.json["question"],
        request.json["page_id"],
        cell_id=request.json["cell_id"],
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/command/wsuggestion", methods=["POST"])
def command_wsuggestion():
    """Adds Wikipedia suggestions cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_suggestions_cell(
        request.json["query"], request.json["page_id"], cell_id=request.json["cell_id"]
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/command/wsummary", methods=["POST"])
def command_wsummary():
    """Adds Wikipedia summary cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_summary_cell(
        request.json["query"], request.json["page_id"], cell_id=request.json["cell_id"]
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


def authenticate():
    """Gets and loads secrets from a local file (secrets.json)."""

    secrets = get_secrets()
    set_secrets(secrets)


def run():
    """Serves the backend."""

    app.run()


def authenticate_remote():
    """Gets and loads secrets from a file (secrets.json) located in Google Drive. 
    Must be ran from Google Colaboratory"""

    secrets = get_secrets_remote()
    set_secrets(secrets)


def run_remote():
    """Serves the backend with ngrok."""

    run_with_ngrok(app)
    app.run()


if __name__ == "__main__":
    run()

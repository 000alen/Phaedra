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
    notebook = Notebook.from_pdf(document_stream=pdf_stream, document_path=path)
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/notebook/from_text", methods=["POST"])
def notebook_from_text():
    """Creates a Notebook from text."""

    notebook = Notebook.from_text(request.json["text"])
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/add/entities", methods=["POST"])
def add_entities_cell():
    """Adds entities cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_entities_cell(request.json["page_id"], cell_id=request.json["cell_id"])
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/add/question", methods=["POST"])
def add_question_cell():
    """Adds question cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_question_cell(
        request.json["question"],
        request.json["page_id"],
        cell_id=request.json["cell_id"],
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/add/sparse_question", methods=["POST"])
def add_sparse_question_cell():
    """Adds sparse question cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_sparse_question_cell(
        request.json["question"],
        request.json["page_id"],
        cell_id=request.json["cell_id"],
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/add/generate", methods=["POST"])
def add_generate_cell():
    """Adds a generate cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_generate_cell(
        request.json["prompt"], request.json["page_id"], cell_id=request.json["cell_id"]
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/add/wikipedia_summary", methods=["POST"])
def add_wikipedia_summary_cell():
    """Adds Wikipedia summary cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_wikipedia_summary_cell(
        request.json["query"], request.json["page_id"], cell_id=request.json["cell_id"]
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/add/wikipedia_suggestions", methods=["POST"])
def add_wikipedia_suggestions_cell():
    """Adds Wikipedia suggestions cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_wikipedia_suggestions_cell(
        request.json["query"], request.json["page_id"], cell_id=request.json["cell_id"]
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/add/wikipedia_image", methods=["POST"])
def add_wikipedia_image_cell():
    """Adds Wikipedia image cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_wikipedia_image_cell(
        request.json["query"], request.json["page_id"], cell_id=request.json["cell_id"]
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/add/meaning", methods=["POST"])
def add_meaning_cell():
    """Adds meaning cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_meaning_cell(
        request.json["word"], request.json["page_id"], cell_id=request.json["cell_id"]
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/add/synonym", methods=["POST"])
def add_synonym_cell():
    """Adds synonym cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_synonym_cell(
        request.json["word"], request.json["page_id"], cell_id=request.json["cell_id"]
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/add/antonym", methods=["POST"])
def add_antonym_cell():
    """Adds antonym cell to Notebook."""

    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    notebook.add_antonym_cell(
        request.json["word"], request.json["page_id"], cell_id=request.json["cell_id"]
    )
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/kill", methods=["GET"])
def kill():
    """Kills the server."""

    def _kill():
        function = request.environ.get("werkzeug.server.shutdown")
        if function is None:
            raise RuntimeError("Not running with the Werkzeug Server")
        function()

    _kill()
    return jsonify(True)


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

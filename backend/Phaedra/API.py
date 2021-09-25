import json
import base64
import io
import wikipedia
from flask import Flask, request, jsonify
from flask_cors import CORS

from Phaedra.Notebook import Notebook, Page, Cell

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/notebook/new", methods=["POST"])
def new_notebook():
    _id = request.json["id"]
    name = request.json["name"]
    file = request.json["file"]
    pages = [Page.from_json(page_json) for page_json in request.json["pages"]]

    notebook = Notebook(name=name, document=file, pages=pages)
    notebook.id = _id

    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/notebook/new/from_pdf", methods=["POST"])
def new_notebook_from_pdf():
    path = request.json["path"]
    _base64 = request.json["base64"]
    content = base64.b64decode(_base64)
    stream = io.BytesIO(content)
    notebook = Notebook.from_pdf(file=stream, document=path)
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/notebook/new/from_text", methods=["POST"])
def new_notebook_from_text():
    notebook = Notebook.from_text(request.json["text"])
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/entities", methods=["POST"])
def entities():
    notebook = Notebook.from_json(_json=request.json["notebook"])
    entities = notebook.entities(request.json["page_index"])
    return jsonify(entities)


@app.route("/question", methods=["POST"])
def question():
    notebook = Notebook.from_json(_json=request.json["notebook"])
    answer = notebook.question(
        request.json["question"], request.json["page_index"])
    return jsonify(answer)


@app.route("/question/sparse", methods=["POST"])
def sparse_question():
    notebook = Notebook.from_json(_json=request.json["notebook"])
    answer = notebook.sparse_question(request.json["question"])
    return jsonify(answer)


@app.route("/page/new", methods=["POST"])
def new_page():
    _id = request.json["id"]
    data = request.json["data"]
    cells = [Cell.from_json(cell_json) for cell_json in request.json["cells"]]

    page = Page(cells=cells, data=data)
    page.id = _id

    page_json = page.json()
    return jsonify(page_json)


@app.route("/page/remove", methods=["POST"])
def remove_page():
    notebook = Notebook.from_json(_json=request.json["notebook"])
    page = Page.from_json(request.json["page"])
    notebook.remove_page(page)
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/new", methods=["POST"])
def new_cell():
    _id = request.json["id"]
    data = request.json["data"]
    content = request.json["content"]

    cell = Cell(data=data, content=content)
    cell.id = _id

    cell_json = cell.json()
    return jsonify(cell_json)


@app.route("/cell/add", methods=["POST"])
def add_cell():
    notebook = Notebook.from_json(_json=request.json["notebook"])
    cell = Cell.from_json(request.json["cell"])
    notebook.get_page(request.json["page_index"]).add_cell(cell)
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/get", methods=["POST"])
def get_cell():
    notebook = Notebook.from_json(_json=request.json["notebook"])
    cell = notebook.get_page(request.json["page_index"]).get_cell(
        request.json["cell_index"])
    cell_json = cell.json()
    return jsonify(cell_json)


@app.route("/cell/remove", methods=["POST"])
def remove_cell():
    notebook = Notebook.from_json(_json=request.json["notebook"])
    cell = Cell.from_json(request.json["cell"])
    notebook.get_page(request.json["page_index"]).remove_cell(cell)
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/add/question", methods=["POST"])
def add_question_cell():
    notebook = Notebook.from_json(_json=json.loads(request.json["notebook"]))
    answer = notebook.question(
        request.json["question"], request.json["page_index"])
    cell = Cell()
    cell.add_titled_text(request.json["question"], answer)
    notebook.get_page(request.json["page_index"]).add_cell(cell)
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/cell/add/wikipedia", methods=["POST"])
def add_wikipedia_cell():
    notebook = Notebook.from_json(_json=request.json["notebook"])
    summary = wikipedia.summary(request.json["query"])
    cell = Cell()
    cell.add_titled_text(f"Wikipedia: {request.json['query']}", summary)
    notebook.get_page(request.json["page_index"]).add_cell(cell)
    json_notebook = notebook.json()
    return jsonify(json_notebook)


@app.route("/kill", methods=["GET"])
def kill():
    def _kill():
        function = request.environ.get("werkzeug.server.shutdown")
        if function is None:
            raise RuntimeError("Not running with the Werkzeug Server")
        function()

    _kill()
    return jsonify(True)


if __name__ == "__main__":
    app.run()

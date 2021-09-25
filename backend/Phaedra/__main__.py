import json

from Phaedra.Notebook import Notebook

notebook = Notebook.from_pdf(document_path=input("PDF> "))
json.dump(notebook.json(), open(f"{notebook.name}.json", "w"))

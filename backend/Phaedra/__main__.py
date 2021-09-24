import json

from Phaedra.Notebook import Notebook

notebook = Notebook.from_pdf(input("PDF> "))
json.dump(notebook.json(), open(f"notebooks/{notebook.name}.json", "w"))

import json

from Phaedra.Notebook import Notebook

notebook = Notebook.from_pdf(document=input("PDF> "))
json.dump(notebook.json(), open(f"{notebook.name}.json", "w"))

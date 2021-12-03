from json import dump
from Phaedra.Language import Mode, set_mode
from Phaedra.Secrets import get_secrets, set_secrets
from Phaedra.Notebook import Notebook

set_secrets(get_secrets())
set_mode(Mode.REMOTE)

notebook = Notebook.from_pdf(path="C:/Users/alenk/Desktop/bitcoin.pdf")

dump(notebook.json(), open("out.json", "w"))

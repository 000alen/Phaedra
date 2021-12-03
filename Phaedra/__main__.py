from Phaedra.Language import Mode, set_mode
from Phaedra.Secrets import get_secrets, set_secrets

set_secrets(get_secrets())
set_mode(Mode.REMOTE)

from Phaedra.API import run

run()

# from json import dump
# from Phaedra.Notebook import Notebook

# dump(
#     Notebook.from_pdf(path="C:/Users/alenk/Desktop/bitcoin.pdf").json(),
#     open("C:/Users/alenk/Desktop/bitcoin.json", "w"),
# )

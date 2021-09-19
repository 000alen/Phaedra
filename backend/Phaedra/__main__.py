import json

from Phaedra.PDF import extract_text, extract_text_to_pages
from Phaedra.NLP import summarize_text, question_text, extract_named_entities
from Phaedra.Notebook import Notebook

# notebook = Notebook.from_pdf("bitcoin.pdf")
# notebook = Notebook.from_text(open("ethereum.txt").read())

notebook = Notebook.from_pdf(input("PDF> "))

# print(f"\n{notebook.name}")

json.dump(notebook.json(), open(f"notebooks/{notebook.name}.json", "w"))
# with open(f"notebooks/{notebook.name}.md", "w") as file:
#     file.write(notebook.markdown())

# while True:
#     question = input("Question> ")

#     if not question:
#         break

#     page = input("Page> ")    

#     if page:
#         page = int(page)
#         notebook.get_page(page).add_question_cell(question)
#     else:
#         print(notebook.sparse_question(question))

#     json.dump(notebook.json(), open(f"notebooks/{notebook.name}.json", "w"))

#     with open(f"notebooks/{notebook.name}.md", "w") as file:
#         file.write(notebook.markdown())

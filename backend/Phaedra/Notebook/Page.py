import uuid
import wikipedia

from typing import List, Dict

from Phaedra.NLP import question_text, meaning, synonym, antonym, usage_example
from Phaedra.Notebook.Cell import Cell

class Page:
    id: str
    cells: List[Cell]
    data: Dict

    def __init__(self, cells: List[Cell] = None, data: Dict = None) -> None:
        if cells is None:
            cells = []

        if data is None:
            data = {}

        self.id = str(uuid.uuid4())
        self.cells = cells
        self.data = data

    def __eq__(self, other: object) -> bool:
        if type(other) is not Page:
            return False
        
        return self.id == other.id and self.cells == other.cells and self.data == other.data

    @classmethod
    def from_json(cls, _json):
        page = cls(cells=[Cell.from_json(cell_json) for cell_json in _json["cells"]], data=_json["data"])
        page.id = _json["id"]
        return page

    def json(self) -> Dict:
        json = {}
        json["id"] = self.id
        json["cells"] = [cell.json() for cell in self.cells]
        json["data"] = self.data
        return json

    def add_cell(self, cell: Cell) -> None:
        self.cells.append(cell)

    def index_cell(self, cell: Cell) -> int:
        return self.cells.index(cell)

    def get_cell(self, cell_index: int) -> Cell:
        return self.cells[cell_index]

    def remove_cell(self, cell: Cell) -> None:
        self.cells.remove(cell)

    def question(self, question: str) -> str:
        assert "source" in self.data
        return question_text(question, self.data["source"])

    def add_question_cell(self, question: str):
        cell = Cell()
        cell.add_titled_text(question, self.question(question))
        self.add_cell(cell)

    def add_wikipedia_summary_cell(self, query: str):
        cell = Cell()
        cell.add_titled_text(f"Wikipedia summary: {query}", wikipedia.summary(query))
        self.add_cell(cell)

    def add_wikipedia_suggestions_cell(self, query: str):
        suggestions, _ = wikipedia.search(query, results = 5, suggestion = True)
        references = {suggestion: wikipedia.page(suggestion).url for suggestion in suggestions}
        cell = Cell()
        content = "\n".join(f"{i + 1}. [{suggestion}]({url})" for i, (suggestion, url) in enumerate(references.items()))        
        cell.add_titled_text(f"Wikipedia suggestions: {query}", content)
        self.add_cell(cell)

    def add_wikipedia_image_cell(self, query: str):
        page = wikipedia.page(query)
        image_url = page.images[0]
        cell = Cell()
        content = f"![{query}]({image_url})" + "{:target=\"_blank\"}"
        cell.add_titled_text(f"Wikipedia image: {query}", content)
        self.add_cell(cell)

    def add_meaning_cell(self, word: str):
        cell = Cell()
        content = "\n".join(f"{i + 1}. {_meaning}" for i, _meaning in enumerate(meaning(word)))
        cell.add_titled_text(f"Meaning: {word}", content)
        self.add_cell(cell)

    def add_synonym_cell(self, word: str):
        cell = Cell()
        content = "\n".join(f"{i + 1}. {_synonym}" for i, _synonym in enumerate(synonym(word)))
        cell.add_titled_text(f"Synonym: {word}", content)
        self.add_cell(cell)

    def add_antonym_cell(self, word: str):
        cell = Cell()
        content = "\n".join(f"{i + 1}. {_antonym}" for i, _antonym in enumerate(antonym(word)))
        cell.add_titled_text(f"Antonym: {word}", content)
        self.add_cell(cell)

    def add_usage_example_cell(self, word: str):
        cell = Cell()
        content = "\n".join(f"{i + 1}. {_usage}" for i, _usage in enumerate(usage_example(word)))
        cell.add_titled_text(f"Usage example: {word}", content)
        self.add_cell(cell)


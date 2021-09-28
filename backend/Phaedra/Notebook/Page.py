import uuid

from typing import List, Dict

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
        page = cls(cells=[Cell.from_json(cell_json)
                   for cell_json in _json["cells"]], data=_json["data"])
        page.id = _json["id"]
        return page

    def json(self) -> Dict:
        json = {}
        json["id"] = self.id
        json["cells"] = [cell.json() for cell in self.cells]
        json["data"] = self.data
        return json

    def insert_cell(self, cell, index):
        self.cells.insert(index, cell)

    def add_cell(self, cell: Cell) -> None:
        self.cells.append(cell)

    def get_cell(self, cell_id) -> Cell:
        for cell in self.cells:
            if cell.id == cell_id:
                return cell

    def remove_cell(self, cell_id) -> None:
        self.cells.remove(self.get_cell(cell_id))

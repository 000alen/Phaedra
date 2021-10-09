"""
Page dataclass for Phaedra Notebook.
"""

from typing import Any, List, Dict, Optional, Union

import uuid

from wikipedia.wikipedia import page  # type: ignore

from Phaedra.Notebook.Cell import Cell, CELL_JSON_TYPE

__all__ = ("Page", "PAGE_JSON_TYPE")


PAGE_JSON_TYPE = Dict[str, Union[str, List[CELL_JSON_TYPE], Dict[Any, Any]]]


class Page:
    id: str
    cells: List[Cell]
    data: Dict

    def __init__(self, cells: List[Cell] = None, data: Dict = None):
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

        return (
            self.id == other.id
            and self.cells == other.cells
            and self.data == other.data
        )

    @classmethod
    def from_json(cls, _json: Dict) -> "Page":
        page = cls(
            cells=[Cell.from_json(cell_json) for cell_json in _json["cells"]],
            data=_json["data"],
        )
        page.id = _json["id"]
        return page

    def json(self) -> PAGE_JSON_TYPE:
        json: PAGE_JSON_TYPE = {}
        json["id"] = self.id
        json["cells"] = [cell.json() for cell in self.cells]
        json["data"] = self.data
        return json

    def insert_cell(self, cell: "Cell", index: int):
        self.cells.insert(index, cell)

    def add_cell(self, cell: Cell):
        self.cells.append(cell)

    def get_cell(self, cell_id: str) -> Optional[Cell]:
        for cell in self.cells:
            if cell.id == cell_id:
                return cell
        return None

    def remove_cell(self, cell_id: str):
        cell = self.get_cell(cell_id)

        assert cell is not None

        self.cells.remove(page)

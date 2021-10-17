"""Page dataclass for Phaedra Notebook."""

from typing import Any, List, Dict, Optional, Union

import uuid

from wikipedia.wikipedia import page  # type: ignore

from Phaedra.Notebook.Cell import Cell, CellJson

__all__ = ("Page", "PageJson")


PageJson = Dict[str, Union[str, List[CellJson], Dict[Any, Any]]]


class Page:
    """Page dataclass for Phaedra Notebook.

    :param cells: List of cells in the page.
    :type cells: List[Cell]
    :param data: Dictionary of data associated with the page.
    :type data: Dict

    """

    id: str
    cells: List[Cell]
    data: Dict

    def __init__(self, id: str = None, cells: List[Cell] = None, data: Dict = None):
        if id is None:
            id = str(uuid.uuid4())

        if cells is None:
            cells = []

        if data is None:
            data = {}

        self.id = id
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
        """Creates a Page from a JSON dictionary.

        :param _json: JSON dictionary.
        :type _json: Dict
        :return: Page object.
        :rtype: Page

        """

        page = cls(
            cells=[Cell.from_json(cell_json) for cell_json in _json["cells"]],
            data=_json["data"],
        )
        page.id = _json["id"]
        return page

    def json(self) -> PageJson:
        """Converts the Page to a JSON dictionary.

        :return: JSON dictionary.
        :rtype: Dict

        """

        json: PageJson = {}
        json["id"] = self.id
        json["cells"] = [cell.json() for cell in self.cells]
        json["data"] = self.data
        return json

    def insert_cell(self, cell: "Cell", index: int):
        """Inserts a cell into the page.

        :param cell: Cell to insert.
        :type cell: Cell
        :param index: Index to insert the cell at.
        :type index: int

        """

        self.cells.insert(index, cell)

    def add_cell(self, cell: Cell):
        """Adds a cell to the page.

        :param cell: Cell to add.
        :type cell: Cell

        """

        self.cells.append(cell)

    def get_cell(self, cell_id: str) -> Optional[Cell]:
        """Gets a cell by its ID.

        :param cell_id: Cell ID.
        :type cell_id: str

        """

        for cell in self.cells:
            if cell.id == cell_id:
                return cell
        return None

    def remove_cell(self, cell_id: str):
        """Removes a cell from the page.

        :param cell_id: Cell ID.
        :type cell_id: str

        """

        cell = self.get_cell(cell_id)

        assert cell is not None

        self.cells.remove(page)

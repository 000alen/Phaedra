"""
Cell dataclass for Phaedra Notebook.
"""

from typing import Any, Dict, Union

import uuid

__all__ = (
    "Cell",
    "CELL_JSON_TYPE"
)

CELL_JSON_TYPE = Dict[str, Union[str, Dict[Any, Any]]]


class Cell:
    id: str
    content: str
    data: Dict

    def __init__(self, content: str = None, data: Dict = None):
        if content is None:
            content = ""

        if data is None:
            data = {}

        self.id = str(uuid.uuid4())
        self.content = content
        self.data = data

    def __eq__(self, other: object) -> bool:
        if type(other) is not Cell:
            return False

        return self.id == other.id and self.content == other.content and self.data == other.data

    @classmethod
    def from_json(self, _json: Dict) -> "Cell":
        cell = Cell(content=_json["content"], data=_json["data"])
        cell.id = _json["id"]
        return cell

    def json(self) -> CELL_JSON_TYPE:
        return {
            "id": self.id,
            "content": self.content,
            "data": self.data
        }

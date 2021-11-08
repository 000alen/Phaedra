"""Page dataclass for Phaedra Notebook."""

from typing import Any, List, Dict
from dataclasses import dataclass

from uuid import uuid4

__all__ = ("Page", "PageJson")


PageJson = Any  # ! TODO


@dataclass
class Reference:
    source_id: str
    text_index: int


class Page:
    """Page dataclass for Phaedra Notebook.

    :param cells: List of cells in the page.
    :type cells: List[Cell]
    :param data: Dictionary of data associated with the page.
    :type data: Dict

    """

    id: str
    references: List[Reference]
    data: Dict
    blocks: List

    def __init__(
        self,
        id: str = None,
        references: List[Reference] = None,
        data: Dict = None,
        blocks: List = None,
    ):
        if id is None:
            id = str(uuid4())

        if references is None:
            references = []

        if data is None:
            data = {}

        if blocks is None:
            blocks = {}

        self.id = id
        self.references = references
        self.data = data
        self.blocks = blocks

    def __eq__(self, other: object) -> bool:
        if type(other) is not Page:
            return False

        return (
            self.id == other.id
            and self.references == other.references
            and self.data == other.data
            and self.blocks == other.blocks
        )

    @classmethod
    def from_json(cls, _json: Dict) -> "Page":
        """Creates a Page from a JSON dictionary.

        :param _json: JSON dictionary.
        :type _json: Dict
        :return: Page object.
        :rtype: Page

        """

        return cls(
            id=_json["id"],
            references=[
                Reference(reference["source_id"], reference["text_index"])
                for reference in _json["references"]
            ],
            data=_json["data"],
            blocks=_json["blocks"],
        )

    def json(self) -> PageJson:
        """Converts the Page to a JSON dictionary.

        :return: JSON dictionary.
        :rtype: Dict

        """

        return {
            "id": self.id,
            "references": [
                {
                    "source_id": reference["source_id"],
                    "text_index": reference["text_index"],
                }
                for reference in self.references
            ],
            "data": self.data,
            "blocks": self.blocks,
        }

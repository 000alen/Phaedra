import uuid

from typing import Dict


class Cell:
    id: str
    content: str
    data: Dict

    def __init__(self, content: str = None, data: Dict = None) -> None:
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
    def from_json(self, _json):
        cell = Cell(content=_json["content"], data=_json["data"])
        cell.id = _json["id"]
        return cell

    def json(self) -> Dict:
        return {
            "id": self.id,
            "content": self.content,
            "data": self.data
        }

    def add_text(self, text: str) -> None:
        self.content += f"\n{text}"

    def add_titled_text(self, title: str, text: str) -> None:
        self.content += f"\n\n**{title}**\n{text}"


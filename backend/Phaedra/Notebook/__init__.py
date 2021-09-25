import names_generator
import uuid

from typing import List, Tuple, Dict

from Phaedra.PDF import extract_text_to_pages, preprocess_text
from Phaedra.NLP import tokenizer, extract_named_entities, batch_summarize_text, batch_question_text_same_question, capitalize_text
from Phaedra.Notebook.Page import Page
from Phaedra.Notebook.Cell import Cell

QUERY_SIZE = 20
CHUNK_SIZE = 512 - QUERY_SIZE


def chunk_sources(sources: List[str]) -> Tuple[List[int], List[str]]:
    tokenized_sources = [tokenizer(source)["input_ids"] for source in sources]

    indexes = []
    chunks = []

    current_index = 0
    current_chunk = []
    for i, tokenized_source in enumerate(tokenized_sources):
        j = 0
        while j < len(tokenized_source):
            if j + (CHUNK_SIZE - len(current_chunk)) <= len(tokenized_source):
                chunk_extension = tokenized_source[j: j +
                                                   CHUNK_SIZE - len(current_chunk)]
                j += CHUNK_SIZE - len(current_chunk)
                current_chunk.extend(chunk_extension)

                indexes.append(current_index)
                chunks.append(current_chunk)

                current_index = i
                current_chunk = []
            else:
                current_chunk.extend(tokenized_source[j:])
                j = len(tokenized_source)

            if len(current_chunk) == CHUNK_SIZE:
                indexes.append(current_index)
                chunks.append(current_chunk)

                current_index = i
                current_chunk = []

        if current_chunk and i == len(tokenized_sources) - 1:
            indexes.append(current_index)
            chunks.append(current_chunk)

    return indexes, [tokenizer.decode(chunk) for chunk in chunks]


class Notebook:
    id: str
    name: str
    document_path: str
    pages: List[Page]

    def __init__(
        self,
        name: str = None,
        document_path: str = None,
        pages: List[Page] = None
    ) -> None:
        if name is None:
            name = names_generator.generate_name()

        if pages is None:
            pages = []

        self.id = str(uuid.uuid4())
        self.name = name
        self.document_path = document_path
        self.pages = pages

    def __eq__(self, other: object) -> bool:
        if type(other) is not Notebook:
            return False

        return self.id == other.id and self.name == other.name and self.document_path == other.document_path and self.pages == other.pages

    @classmethod
    def from_pdf(cls, document_file=None, document_path: str = None, name: str = None, do_preprocessing: bool = True) -> "Notebook":
        if document_file is None:
            document_file = open(document_path, "rb")

        sources = extract_text_to_pages(document_file)

        if do_preprocessing:
            sources = list(preprocess_text(source) for source in sources)

        pages = [Page(data={"source": source, "document_page_number": i + 1})
                 for i, source in enumerate(sources)]

        indexes, sources = chunk_sources(sources)

        summaries = batch_summarize_text(sources)
        summaries = [capitalize_text(summary) for summary in summaries]

        for i, summary in enumerate(summaries):
            cell = Cell(content=summary)
            pages[indexes[i]].add_cell(cell)

        return cls(pages=pages, name=name, document_path=document_path)

    @classmethod
    def from_text(cls, text: str, name: str = None, do_preprocessing: bool = True) -> "Notebook":
        sources = [text]
        if do_preprocessing:
            sources = list(preprocess_text(source) for source in sources)

        indexes, sources = chunk_sources(sources)

        pages = [Page(data={"source": source})
                 for source in sources]

        summaries = batch_summarize_text(sources)
        summaries = [capitalize_text(summary) for summary in summaries]

        for i, summary in enumerate(summaries):
            cell = Cell(content=summary)
            pages[indexes[i]].add_cell(cell)

        return cls(pages=pages, name=name, document_path=None)

    @classmethod
    def from_json(cls, file_path: str = None, _json: Dict = None) -> "Notebook":
        assert file_path is not None or _json is not None

        if file_path is not None:
            import json
            _json = json.load(open(file_path))

        notebook = cls(name=_json["name"], document_path=_json["document_path"], pages=[
                       Page.from_json(page_json) for page_json in _json["pages"]])
        notebook.id = _json["id"]
        return notebook

    def markdown(self) -> str:
        string = ""
        string += f"# {self.name} ({self.document_path})\n\n"

        for i, page in enumerate(self.pages):
            string += f"## Page {i}\n"
            string += f"```id: {page.id}```\n\n"

            for j, cell in enumerate(page.cells):
                string += f"### Cell {j} ({cell.id})\n"
                string += f"```id: {page.id}```\n\n"
                string += f"{cell.content}\n\n"

            entities = ", ".join(
                f"\"{entity}\"" for entity in self.entities(i))
            string += f"Entities: {entities}\n\n"

        return string

    def json(self) -> Dict:
        json = {}
        json["id"] = self.id
        json["name"] = self.name
        json["document_path"] = self.document_path
        json["pages"] = [page.json() for page in self.pages]
        return json

    def add_page(self, page: Page) -> None:
        self.pages.append(page)

    def index_page(self, page: Page) -> int:
        return self.pages.index(page)

    def get_page(self, page_index: int) -> Page:
        return self.pages[page_index]

    def remove_page(self, page: Page) -> None:
        self.pages.remove(page)

    def entities(self, page_index: int) -> List[str]:
        source = self.get_page(page_index).data["source"]
        return extract_named_entities(source)

    def question(self, question: str, page_index: int) -> str:
        return capitalize_text(self.get_page(page_index).question(question))

    # XXX
    def sparse_question(self, question) -> List[str]:
        contexts = []
        for i, page in enumerate(self.pages):
            source = page.data["source"]
            contexts.append(source)
            if i != 0:
                previous_source = tokenizer(
                    self.pages[i - 1].data["source"])["input_ids"]
                source = tokenizer(source)["input_ids"]
                new_source = previous_source[-CHUNK_SIZE //
                                             2:] + source[:CHUNK_SIZE // 2]
                contexts.append(tokenizer.decode(new_source))

        answers = batch_question_text_same_question(question, contexts)
        answers = [capitalize_text(answer) for answer in answers]

        return answers

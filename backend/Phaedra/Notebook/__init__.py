import names_generator
import uuid
import wikipedia

from typing import List, Tuple, Dict

from Phaedra.PDF import extract_text_to_pages, preprocess_text
from Phaedra.NLP import tokenizer, extract_named_entities, capitalize_text, question_text
from Phaedra.NLP.Vocabulary import meaning, synonym, antonym, usage_example
from Phaedra.NLP.Batch import batch_summarize_text, batch_question_text_same_question
from Phaedra.Notebook.Page import Page
from Phaedra.Notebook.Cell import Cell
from Phaedra.Notebook.Markdown import text, titled_text, ordered_list, link, image

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
    pages: List[Page]
    document_path: str

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
                f"\"{entity}\"" for entity in self._entities(i))
            string += f"Entities: {entities}\n\n"

        return string

    def json(self) -> Dict:
        json = {}
        json["id"] = self.id
        json["name"] = self.name
        json["document_path"] = self.document_path
        json["pages"] = [page.json() for page in self.pages]
        return json

    def insert_page(self, page: Page, index: int) -> None:
        self.pages.insert(index, page)

    def add_page(self, page: Page) -> None:
        self.pages.append(page)

    def get_page(self, page_id: str) -> Page:
        for page in self.pages:
            if page.id == page_id:
                return page

    def get_page_index(self, page_id: str) -> int:
        for i, page in enumerate(self.pages):
            if page.id == page_id:
                return i
    
    def remove_page(self, page_id: str) -> None:
        self.pages.remove(self.get_page(page_id))

    def insert_cell(self, page_id, cell, index):
        page = self.get_page(page_id)
        page.insert_cell(cell, index)

    def add_cell(self, page_id, cell):
        page = self.get_page(page_id)
        page.add_cell(cell)

    def get_cell(self, page_id: str, cell_id: str) -> Cell:
        page = self.get_page(page_id)
        return page.get_cell(cell_id)

    def remove_cell(self, page_id, cell_id):
        page = self.get_page(page_id)
        page.remove_cell(cell_id)

    def _entities(self, page_id):
        source = self.get_page(page_id).data["source"]
        return extract_named_entities(source)

    def _question(self, question, page_id):
        page = self.get_page(page_id)
        return capitalize_text(question_text(question, page.data["source"]))

    def _sparse_question(self, question) -> List[str]:
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

    def add_entities_cell(self, page_id):
        page = self.get_page(page_id)
        content = titled_text("Entities", ordered_list(self._entities(page_id)))
        page.add_cell(Cell(content=content))

    def add_question_cell(self, question: str, page_id: str):
        page = self.get_page(page_id)
        content = titled_text(question, self._question(question, page_id))
        page.add_cell(Cell(content=content))

    def add_sparse_question_cell(self, question: str):
        content = titled_text(question, ordered_list(self._sparse_question(question)))
        self.pages[-1].add_cell(Cell(content=content))

    def add_wikipedia_summary_cell(self, query: str, page_id):
        page = self.get_page(page_id)
        content = titled_text(f"Wikipedia summary: {query}", wikipedia.summary(query))
        page.add_cell(Cell(content=content))

    def add_wikipedia_suggestions_cell(self, query: str, page_id):
        page = self.get_page(page_id)
        suggestions, _ = wikipedia.search(query, results=5, suggestion=True)
        links = {suggestion: wikipedia.page(suggestion).url for suggestion in suggestions}
        links = [link(text, url) for text, url in links.items()]
        content = titled_text(f"Wikipedia suggestions: {query}", ordered_list(links))
        page.add_cell(Cell(content=content))

    def add_wikipedia_image_cell(self, query: str, page_id):
        page = self.get_page(page_id)
        wikipedia_page = wikipedia.page(query)
        url = wikipedia_page.images[0]
        content = image(query, url)
        page.add_cell(Cell(content=content))

    def add_meaning_cell(self, word: str, page_id):
        page = self.get_cell(page_id)
        content = titled_text(f"Meaning: {word}", ordered_list(meaning(word)))
        page.add_cell(Cell(content=content))

    def add_synonym_cell(self, word: str, page_id):
        page = self.get_cell(page_id)
        content = titled_text(f"Synonym: {word}", ordered_list(synonym(word)))
        page.add_cell(Cell(content=content))

    def add_antonym_cell(self, word: str, page_id):
        page = self.get_cell(page_id)
        content = titled_text(f"Antonym: {word}", ordered_list(antonym(word)))
        page.add_cell(Cell(content=content))

    def add_usage_example_cell(self, word: str, page_id):
        page = self.get_cell(page_id)
        content = titled_text(f"Usage: {word}", ordered_list(usage_example(word)))
        page.add_cell(Cell(content=content))


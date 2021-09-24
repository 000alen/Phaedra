import names_generator
import wikipedia
import uuid

from Phaedra.PDF import extract_text_to_pages, preprocess_text
from Phaedra.NLP import summarize_text, question_text, extract_named_entities, tokenizer, batch_summarize_text, batch_question_text_same_question, batch_check_linguistic_acceptability, batch_get_sentence_similarity, capitalize_text, meaning, synonym, antonym, usage_example

QUERY_SIZE = 20
CHUNK_SIZE = 512 - QUERY_SIZE


def chunk_sources(sources: list[str]) -> list[list[int], list[str]]:
    tokenized_sources = [tokenizer(source)["input_ids"] for source in sources]

    indexes = []
    chunks = []

    current_index = 0
    current_chunk = []
    for i, tokenized_source in enumerate(tokenized_sources):
        j = 0
        while j < len(tokenized_source):
            if j + (CHUNK_SIZE - len(current_chunk)) <= len(tokenized_source):
                chunk_extension = tokenized_source[j : j + CHUNK_SIZE - len(current_chunk)] 
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


class Cell:
    id: str
    content: str
    data: dict

    def __init__(self, content: str = None, data: dict = None) -> None:
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

    def json(self) -> dict:
        return {
            "id": self.id,
            "content": self.content,
            "data": self.data
        }

    def add_text(self, text: str) -> None:
        self.content += f"\n{text}"

    def add_titled_text(self, title: str, text: str) -> None:
        self.content += f"\n\n**{title}**\n{text}"


class Page:
    id: str
    cells: list[Cell]
    data: dict

    def __init__(self, cells: list[Cell] = None, data: dict = None) -> None:
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

    def json(self) -> dict:
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


class Notebook:
    id: str
    name: str
    document: str
    pages: list[Page]

    def __init__(
        self, 
        name: str = None,
        document: str = None,
        pages: list[Page] = None
    ) -> None:
        if name is None:
            name = names_generator.generate_name()

        if pages is None:
            pages = []

        self.id = str(uuid.uuid4())
        self.name = name
        self.document = document
        self.pages = pages

    def __eq__(self, other: object) -> bool:
        if type(other) is not Notebook:
            return False
        
        return self.id == other.id and self.name == other.name and self.document == other.document and self.pages == other.pages

    @classmethod
    def from_pdf(cls, document: str, name: str = None, do_preprocessing: bool = True) -> "Notebook":
        sources = extract_text_to_pages(document)
        if do_preprocessing:
            sources = list(preprocess_text(source) for source in sources)

        pages = [Page(data={"source": source, "number": i + 1}) for i, source in enumerate(sources)]
        
        indexes, sources = chunk_sources(sources)

        summaries = batch_summarize_text(sources)
        summaries = [capitalize_text(summary) for summary in summaries]
        
        for i, summary in enumerate(summaries):
            cell = Cell(content=summary)
            pages[indexes[i]].add_cell(cell)

        return cls(pages=pages, name=name, document=document)
    
    @classmethod
    def from_text(cls, text: str, name: str = None, do_preprocessing: bool = True) -> "Notebook":
        sources = [text]
        if do_preprocessing:
            sources = list(preprocess_text(source) for source in sources)

        indexes, sources = chunk_sources(sources)

        pages = [Page(data={"source": source, "number": i + 1}) for i, source in enumerate(sources)]        

        summaries = batch_summarize_text(sources)
        summaries = [capitalize_text(summary) for summary in summaries]

        for i, summary in enumerate(summaries):
            cell = Cell(content=summary)
            pages[indexes[i]].add_cell(cell)

        return cls(pages=pages, name=name, file=None)

    @classmethod
    def from_json(cls, file: str = None, _json: dict = None) -> "Notebook":
        assert file is not None or _json is not None

        if file is not None:
            import json
            _json = json.load(open(file))

        notebook = cls(name=_json["name"], document=_json["document"], pages=[Page.from_json(page_json) for page_json in _json["pages"]])
        notebook.id = _json["id"]
        return notebook

    def markdown(self) -> str:
        string = ""
        string += f"# {self.name} ({self.document})\n\n"

        for i, page in enumerate(self.pages):
            string += f"## Page {i}\n"  
            string += f"```id: {page.id}```\n\n"

            for j, cell in enumerate(page.cells):
                string += f"### Cell {j} ({cell.id})\n"
                string += f"```id: {page.id}```\n\n"
                string += f"{cell.content}\n\n"

            entities = ", ".join(f"\"{entity}\"" for entity in self.entities(i))
            string += f"Entities: {entities}\n\n"

        return string

    def json(self) -> dict:
        json = {}
        json["id"] = self.id
        json["name"] = self.name
        json["document"] = self.document
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

    def entities(self, page_index: int) -> list[str]:
        source = self.get_page(page_index).data["source"]
        return extract_named_entities(source)

    def question(self, question: str, page_index: int) -> str:
        return capitalize_text(self.get_page(page_index).question(question))

    # XXX
    def sparse_question(self, question) -> list[str]:
        contexts = []
        for i, page in enumerate(self.pages):
            source = page.data["source"]
            contexts.append(source)
            if i != 0:
                previous_source = tokenizer(self.pages[i - 1].data["source"])["input_ids"]
                source = tokenizer(source)["input_ids"]
                new_source = previous_source[-CHUNK_SIZE // 2:] + source[:CHUNK_SIZE // 2]
                contexts.append(tokenizer.decode(new_source))

        answers = batch_question_text_same_question(question, contexts)
        answers = [capitalize_text(answer) for answer in answers]

        return answers

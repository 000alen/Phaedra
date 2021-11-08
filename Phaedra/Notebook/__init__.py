"""Dataclass for Phaedra Notebook."""

from uuid import uuid4

from typing import Any, BinaryIO, List, Optional, Dict, Union
from dataclasses import dataclass

import names_generator  # type: ignore

from Phaedra.Text import extract_text_from_pdf_to_pages, preprocess_text
from Phaedra.Language import (
    get_summarizer_tokenizer,
    entities,
    answer,
    generate,
    meaning,
    synonym,
    antonym,
    batch_summarize,
    batch_answer_same_question,
)
from Phaedra.Knowledge import summary, suggestions, image
from Phaedra.Language.Base import summarizer_input_size, answerer_input_size
from Phaedra.Language.Utils import chop
from Phaedra.Notebook.Page import Page, PageJson
from Phaedra.Notebook.Markdown import text, titled_text, ordered_list, link, image
from Phaedra.Notebook.Schema import is_valid_notebook

__all__ = ("Notebook",)


NotebookJson = Dict[str, Union[Optional[str], List[PageJson]]]


@dataclass
class Source:
    id: str
    type: str
    path: str
    texts: List[str]


class Notebook:
    """Dataclass for Phaedra Notebook.

    :param name: Name of the notebook.
    :type name: str
    :param document_path: Path to the document.
    :type document_path: str
    :param pages: List of pages.
    :type pages: List[Page]

    """

    id: str
    name: str
    sources: List[Source]
    pages: List[Page]

    def __init__(
        self,
        id: str = None,
        name: str = None,
        sources: List[Source] = None,
        pages: List[Page] = None,
    ):
        if id is None:
            id = str(uuid4())

        if name is None:
            name = names_generator.generate_name()

        if pages is None:
            pages = []

        if sources is None:
            sources = []

        self.id = id
        self.name = name
        self.pages = pages
        self.sources = sources

    def __eq__(self, other: object) -> bool:
        if type(other) is not Notebook:
            return False

        return (
            self.id == other.id
            and self.name == other.name
            and self.pages == other.pages
            and self.sources == other.sources
        )

    @classmethod
    def from_pdf(
        cls,
        pdf_stream: BinaryIO = None,
        pdf_path: str = None,
        name: str = None,
        id: str = None,
        do_preprocessing: bool = True,
    ) -> "Notebook":
        """Creates a Notebook from a PDF document.

        :param document_stream: Stream of the document.
        :type document_stream: BinaryIO
        :param document_path: Path to the document.
        :type document_path: str
        :param name: Name of the Notebook.
        :type name: str
        :param do_preprocessing: Whether to preprocess the text.
        :type do_preprocessing: bool
        :return: Notebook object.
        :rtype: Notebook

        """

        if pdf_stream is None:
            assert type(pdf_path) is str
            pdf_stream = open(pdf_path, "rb")

        source_texts = extract_text_from_pdf_to_pages(pdf_stream)

        if do_preprocessing:
            source_texts = list(
                preprocess_text(source_text) for source_text in source_texts
            )

        source = Source(id=str(uuid4()), type="pdf", path=pdf_path, texts=source_texts)

        pages = [Page(references=[source.id, i]) for i in range(len(source.texts))]

        indexes, source_texts = chop(
            source_texts, get_summarizer_tokenizer(), summarizer_input_size
        )

        summaries = batch_summarize(source_texts)

        for i, summary in enumerate(summaries):
            # cell = Cell(content=summary)
            # pages[indexes[i]].add_cell(cell)
            ...

        return cls(id=id, name=name, sources=[source], pages=pages)

    @classmethod
    def from_text(
        cls, text: str, name: str = None, do_preprocessing: bool = True
    ) -> "Notebook":
        """Creates a Notebook from text

        :param text: Text of the document.
        :type text: str 
        :param name: Name of the Notebook.
        :type name: str
        :param do_preprocessing: Whether to preprocess the text.
        :type do_preprocessing: bool
        :return: Notebook object.
        :rtype: Notebook

        """

        sources = [text]
        if do_preprocessing:
            sources = list(preprocess_text(source) for source in sources)

        indexes, sources = chop(
            sources, get_summarizer_tokenizer(), summarizer_input_size
        )

        pages = [Page(data={"source": source}) for source in sources]

        summaries = batch_summarize(sources)

        for i, summary in enumerate(summaries):
            ...

        return cls(pages=pages, name=name, document_path=None)

    @classmethod
    def from_json(cls, file_path: str = None, _json: Dict = None) -> "Notebook":
        """Creates a Notebook from a JSON dictionary.

        :param file_path: Path to the JSON file.
        :type file_path: str
        :param _json: JSON dictionary.
        :type _json: Dict
        :return: Notebook object.
        :rtype: Notebook

        """

        assert file_path is not None or _json is not None

        if file_path is not None:
            import json

            _json = json.load(open(file_path))

        assert type(_json) is dict
        assert is_valid_notebook(_json)

        notebook = cls(
            id=_json["id"],
            name=_json["name"],
            document_path=_json["document_path"] if "document_path" in _json else None,
            pages=[Page.from_json(page_json) for page_json in _json["pages"]],
        )

        return notebook

    def markdown(self) -> str:
        """Returns the Notebook as Markdown.

        :return: Markdown string.
        :rtype: str

        """

        string = ""
        string += f"# {self.name} ({self.sources})\n\n"

        for i, page in enumerate(self.pages):
            string += f"## Page {i}\n"
            string += f"```id: {page.id}```\n\n"

            for j, cell in enumerate(page.cells):
                string += f"### Cell {j} ({cell.id})\n"
                string += f"```id: {page.id}```\n\n"
                string += f"{cell.content}\n\n"

        return string

    def json(self) -> NotebookJson:
        """Returns the Notebook as a JSON dictionary.

        :return: JSON dictionary.
        :rtype: Dict

        """

        json: NotebookJson = {}
        json["id"] = self.id
        json["name"] = self.name

        if self.sources:
            json["document_path"] = self.sources

        json["pages"] = [page.json() for page in self.pages]

        assert is_valid_notebook(json)

        return json

    def insert_page(self, page: Page, index: int):
        """Inserts a page into the Notebook.

        :param page: Page to insert.
        :type page: Page
        :param index: Index to insert the page.
        :type index: int

        """

        self.pages.insert(index, page)

    def add_page(self, page: Page):
        """Adds a page to the Notebook.

        :param page: Page to add.
        :type page: Page

        """

        self.pages.append(page)

    def get_page(self, page_id: str) -> Optional[Page]:
        """Returns a page from the Notebook.

        :param page_id: ID of the page.
        :type page_id: str
        :return: Page object.
        :rtype: Optional[Page]

        """

        for page in self.pages:
            if page.id == page_id:
                return page
        return None

    def get_page_index(self, page_id: str) -> Optional[int]:
        """Indexes a page from the Notebook.

        :param page_id: ID of the page.
        :type page_id: str
        :return: Index of the page.
        :rtype: Optional[int]

        """

        for i, page in enumerate(self.pages):
            if page.id == page_id:
                return i
        return None

    def remove_page(self, page_id: str):
        """Removes a page from the Notebook.

        :param page_id: ID of the page.
        :type page_id: str

        """

        page = self.get_page(page_id)

        assert page is not None

        self.pages.remove(page)

    def _entities(self, page_id: str) -> List[str]:
        """Returns the entities of a page (from page.data["source"]).

        :param page_id: ID of the page.
        :type page_id: str
        :return: List of entities.
        :rtype: List[str]

        """

        page = self.get_page(page_id)

        assert page is not None
        assert "source" in page.data

        source = page.data["source"]
        return entities(source)

    def _question(self, question: str, page_id: str) -> str:
        """Answers a question in a page (from page.data["source"]).

        :param question: Question to answer.
        :type question: str
        :param page_id: ID of the page.
        :type page_id: str
        :return: Answer.
        :rtype: str

        """

        page = self.get_page(page_id)

        assert page is not None

        context = page.data["source"] if "source" in page.data else ""

        return answer(question, context)

    def _sparse_question(self, question: str) -> List[str]:
        """Answers a question in all pages (from page.data["source"]).

        :param question: Question to answer.
        :type question: str
        :return: Answers.
        :rtype: List[str]

        """

        tokenizer = get_summarizer_tokenizer()

        contexts = []
        for i, page in enumerate(self.pages):
            source = page.data["source"] if "source" in page.data else ""
            contexts.append(source)
            if i != 0:
                previous_source = tokenizer(self.pages[i - 1].data["source"])[
                    "input_ids"
                ]
                source = tokenizer(source)["input_ids"]
                new_source = (
                    previous_source[-answerer_input_size // 2 :]
                    + source[: answerer_input_size // 2]
                )
                contexts.append(tokenizer.decode(new_source))

        answers = batch_answer_same_question(question, contexts)

        return answers

    def _generation(self, prompt: str, page_id: str) -> str:
        """Generates text from a given prompt with context (from page.data["source"]).

        :param prompt: Prompt to generate text from.
        :type prompt: str
        :param page_id: ID of the page.
        :type page_id: str
        :return: Generated text.
        :rtype: str

        """

        page = self.get_page(page_id)

        assert page is not None

        source = page.data["source"] if "source" in page.data else ""

        return generate(prompt, source)

    # def add_entities_cell(
    #     self, page_id: str, cell_id: Optional[str] = None
    # ) -> Optional[str]:
    #     """Adds entities cell to the Notebook.

    #     :param page_id: ID of the page.
    #     :type page_id: str

    #     """

    #     page = self.get_page(page_id)

    #     assert page is not None

    #     content = titled_text(
    #         "Entities", ordered_list(self._entities(page_id)))

    #     if cell_id is None:
    #         cell_id = str(uuid4())
    #         page.add_cell(Cell(id=cell_id, content=content))
    #     else:
    #         cell = page.get_cell(cell_id)
    #         assert cell is not None

    #         if "loading" in cell.data:
    #             cell.data["loading"] = False

    #         cell.content = content

    #     return cell_id

    # def add_question_cell(
    #     self, question: str, page_id: str, cell_id: Optional[str] = None
    # ) -> Optional[str]:
    #     """Adds question cell to the Notebook.

    #     :param question: Question to answer.
    #     :type question: str
    #     :param page_id: ID of the page.
    #     :type page_id: str

    #     """

    #     page = self.get_page(page_id)

    #     assert page is not None

    #     content = titled_text(question, self._question(question, page_id))

    #     if cell_id is None:
    #         cell_id = str(uuid4())
    #         page.add_cell(Cell(id=cell_id, content=content))
    #     else:
    #         cell = page.get_cell(cell_id)
    #         assert cell is not None

    #         if "loading" in cell.data:
    #             cell.data["loading"] = False

    #         cell.content = content

    #     return cell_id

    # def add_sparse_question_cell(
    #     self,
    #     question: str,
    #     page_id: Optional[str] = None,
    #     cell_id: Optional[str] = None,
    # ) -> Optional[str]:
    #     """Adds sparse question cell to the Notebook.

    #     :param question: Question to answer.
    #     :type question: str

    #     """

    #     content = titled_text(question, ordered_list(
    #         self._sparse_question(question)))

    #     if cell_id is None:
    #         cell_id = str(uuid4())
    #         self.pages[-1].add_cell(Cell(id=cell_id, content=content))
    #     else:
    #         assert page_id is not None
    #         page = self.get_page(page_id)
    #         assert page is not None
    #         cell = page.get_cell(cell_id)
    #         assert cell is not None

    #         if "loading" in cell.data:
    #             cell.data["loading"] = False

    #         cell.content = content

    #     return cell_id

    # def add_generation_cell(
    #     self, prompt: str, page_id: str, cell_id: Optional[str] = None
    # ) -> Optional[str]:
    #     """Adds generate cell to the Notebook.

    #     :param prompt: Prompt to generate text from.
    #     :type prompt: str
    #     :param page_id: ID of the page.
    #     :type page_id: str

    #     """

    #     page = self.get_page(page_id)

    #     assert page is not None

    #     content = titled_text(prompt, self._generation(prompt, page_id))

    #     if cell_id is None:
    #         cell_id = str(uuid4())
    #         page.add_cell(Cell(id=cell_id, content=content))
    #     else:
    #         cell = page.get_cell(cell_id)
    #         assert cell is not None

    #         if "loading" in cell.data:
    #             cell.data["loading"] = False

    #         cell.content = content

    #     return cell_id

    # def add_summary_cell(
    #     self, query: str, page_id: str, cell_id: Optional[str] = None
    # ) -> Optional[str]:
    #     """Adds Wikipedia summary cell to the Notebook.

    #     :param query: Query to search Wikipedia for.
    #     :type query: str
    #     :param page_id: ID of the page.
    #     :type page_id: str

    #     """

    #     page = self.get_page(page_id)

    #     assert page is not None

    #     content = titled_text(f"Wikipedia summary: {query}", summary(query))

    #     if cell_id is None:
    #         cell_id = str(uuid4())
    #         page.add_cell(Cell(id=cell_id, content=content))
    #     else:
    #         cell = page.get_cell(cell_id)
    #         assert cell is not None

    #         if "loading" in cell.data:
    #             cell.data["loading"] = False

    #         cell.content = content

    #     return cell_id

    # def add_suggestions_cell(
    #     self, query: str, page_id: str, cell_id: Optional[str] = None
    # ) -> Optional[str]:
    #     """Adds Wikipedia suggestions cell to the Notebook.

    #     :param query: Query to search Wikipedia for.
    #     :type query: str
    #     :param page_id: ID of the page.
    #     :type page_id: str

    #     """

    #     page = self.get_page(page_id)

    #     assert page is not None

    #     suggestions = suggestions(query)
    #     links = [link(text, url) for text, url in suggestions.items()]
    #     content = titled_text(
    #         f"Wikipedia suggestions: {query}", ordered_list(links))

    #     if cell_id is None:
    #         cell_id = str(uuid4())
    #         page.add_cell(Cell(id=cell_id, content=content))
    #     else:
    #         cell = page.get_cell(cell_id)
    #         assert cell is not None

    #         if "loading" in cell.data:
    #             cell.data["loading"] = False

    #         cell.content = content

    #     return cell_id

    # def add_image_cell(
    #     self, query: str, page_id: str, cell_id: Optional[str] = None
    # ) -> Optional[str]:
    #     """Adds Wikipedia image cell to the Notebook.

    #     :param query: Query to search Wikipedia for.
    #     :type query: str
    #     :param page_id: ID of the page.
    #     :type page_id: str

    #     """

    #     page = self.get_page(page_id)

    #     assert page is not None

    #     url = image(query)
    #     content = image(query, url)

    #     if cell_id is None:
    #         cell_id = str(uuid4())
    #         page.add_cell(Cell(id=cell_id, content=content))
    #     else:
    #         cell = page.get_cell(cell_id)
    #         assert cell is not None

    #         if "loading" in cell.data:
    #             cell.data["loading"] = False

    #         cell.content = content

    #     return cell_id

    # def add_meaning_cell(
    #     self, word: str, page_id: str, cell_id: Optional[str] = None
    # ) -> Optional[str]:
    #     """Adds meaning cell to the Notebook.

    #     :param word: Word to get meaning of.
    #     :type word: str
    #     :param page_id: ID of the page.
    #     :type page_id: str

    #     """

    #     page = self.get_page(page_id)

    #     assert page is not None

    #     _meaning = meaning(word)

    #     content = titled_text(
    #         f"Meaning: {word}",
    #         "\n\n".join(
    #             titled_text(f"Type: {word_type}", ordered_list(meaning))
    #             for word_type, meaning in _meaning.items()
    #         ),
    #     )

    #     if cell_id is None:
    #         cell_id = str(uuid4())
    #         page.add_cell(Cell(id=cell_id, content=content))
    #     else:
    #         cell = page.get_cell(cell_id)
    #         assert cell is not None

    #         if "loading" in cell.data:
    #             cell.data["loading"] = False

    #         cell.content = content

    #     return cell_id

    # def add_synonym_cell(
    #     self, word: str, page_id: str, cell_id: Optional[str] = None
    # ) -> Optional[str]:
    #     """Adds synonym cell to the Notebook.

    #     :param word: Word to get synonyms of.
    #     :type word: str
    #     :param page_id: ID of the page.
    #     :type page_id: str

    #     """

    #     page = self.get_page(page_id)

    #     assert page is not None

    #     content = titled_text(f"Synonym: {word}", ordered_list(synonym(word)))

    #     if cell_id is None:
    #         cell_id = str(uuid4())
    #         page.add_cell(Cell(id=cell_id, content=content))
    #     else:
    #         cell = page.get_cell(cell_id)
    #         assert cell is not None

    #         if "loading" in cell.data:
    #             cell.data["loading"] = False

    #         cell.content = content

    #     return cell_id

    # def add_antonym_cell(
    #     self, word: str, page_id: str, cell_id: Optional[str] = None
    # ) -> Optional[str]:
    #     """Adds antonym cell to the Notebook.

    #     :param word: Word to get antonyms of.
    #     :type word: str
    #     :param page_id: ID of the page.
    #     :type page_id: str

    #     """

    #     page = self.get_page(page_id)

    #     assert page is not None

    #     content = titled_text(f"Antonym: {word}", ordered_list(antonym(word)))

    #     if cell_id is None:
    #         cell_id = str(uuid4())
    #         page.add_cell(Cell(id=cell_id, content=content))
    #     else:
    #         cell = page.get_cell(cell_id)
    #         assert cell is not None

    #         if "loading" in cell.data:
    #             cell.data["loading"] = False

    #         cell.content = content

    #     return cell_id

    # def move_page(self, page_id: str, index: int):
    #     page_index = self.get_page_index(page_id)
    #     assert page_index is not None

    #     self.pages.insert(index, self.pages.pop(page_index))

    # def move_cell(self, page_id: str, cell_id: str, index: int):
    #     page_index = self.get_page_index(page_id)
    #     assert page_index is not None

    #     cell_index = self.get_cell_index(page_id, cell_id)
    #     assert cell_index is not None

    #     page = self.pages[page_index]
    #     page.cells.insert(index, page.cells.pop(cell_index))

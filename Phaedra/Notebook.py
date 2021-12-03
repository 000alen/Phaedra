"""Dataclass for Phaedra Notebook."""

from uuid import uuid4

from typing import Any, BinaryIO, List, Optional, Dict, TypeVar, Union
from dataclasses import dataclass, field, asdict

import names_generator  # type: ignore

from Phaedra.Text import extract_text_from_pdf_to_pages, preprocess_text
from Phaedra.Language import (
    get_summarizer_tokenizer,
    answer,
    generate,
    batch_summarize,
    batch_answer_same_question,
)
from Phaedra.Knowledge import wsummary, wsuggestion, wimage
from Phaedra.Language.Base import summarizer_input_size
from Phaedra.Language.Utils import chop

__all__ = ("Notebook",)


def uuid_factory():
    return str(uuid4())


def content_factory() -> "Content":
    return {"ops": []}


def layout_children_factory():
    return [Pane()]


@dataclass
class Source:
    id: str = field(default_factory=uuid_factory)
    title: str = field(default="Unnamed source")
    type: str = field(default="unknown")
    content: str = field(default="unknown")
    path: Optional[str] = field(default=None)
    index: Optional[int] = field(default=None)


@dataclass
class Reference:
    id: str = field(default_factory=uuid_factory)
    title: str = field(default="Unnamed reference")
    sourceId: str = field(default="unknown")


Content = Dict[str, List]
ContentOperation = Dict[str, Any]


@dataclass
class Quill:
    id: str = field(default_factory=uuid_factory)
    content: Content = field(default_factory=content_factory)


@dataclass
class PaneProps:
    type: str = field(default="default")
    paramId: Optional[str] = field(default=None)


@dataclass
class Pane:
    id: str = field(default_factory=uuid_factory)
    position: float = field(default=0.0)
    size: float = field(default=1)
    previous: Optional[str] = field(default=None)
    next: Optional[str] = field(default=None)
    props: PaneProps = field(default_factory=PaneProps)
    type: str = field(default="pane")


@dataclass
class Layout:
    id: str = field(default_factory=uuid_factory)
    position: float = field(default=0.0)
    size: float = field(default=1.0)
    orientation: str = field(default="horizontal")
    previous: Optional[str] = field(default=None)
    next: Optional[str] = field(default=None)
    children: List[Union["Layout", Pane]] = field(
        default_factory=layout_children_factory
    )
    type: str = field(default="layout")


@dataclass
class Page:
    id: str = field(default_factory=uuid_factory)
    references: List[Reference] = field(default_factory=list)
    layout: Layout = field(default_factory=Layout)
    content: Content = field(default_factory=content_factory)
    quills: List[Quill] = field(default_factory=list)


class Notebook:
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
        self.id = str(uuid4()) if id is None else id
        self.name = names_generator.generate_name() if name is None else name
        self.pages = [] if pages is None else pages
        self.sources = [] if sources is None else sources

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
        stream: BinaryIO = None,
        path: str = None,
        name: str = None,
        id: str = None,
        do_preprocessing: bool = True,
    ) -> "Notebook":
        notebook = cls(id=id, name=name)

        if stream is None:
            assert type(path) is str
            stream = open(path, "rb")

        path = "Unknown" if path is None else path

        contents = extract_text_from_pdf_to_pages(stream)

        if do_preprocessing:
            contents = list(preprocess_text(source) for source in contents)

        indexes, contents = chop(
            contents, get_summarizer_tokenizer(), summarizer_input_size
        )
        summaries = batch_summarize(contents)
        for index, content, summary in zip(indexes, contents, summaries):
            source_id = uuid_factory()
            page_id = uuid_factory()
            notebook.add_source(
                Source(
                    id=source_id,
                    title=f"{path} ({index})",
                    type="pdf",
                    content=content,
                    path=path,
                    index=index,
                )
            )
            notebook.add_page(Page(id=page_id))
            notebook.add_page_reference(
                page_id, Reference(title=f"{path} ({index})", sourceId=source_id)
            )
            notebook.add_page_content_operation(
                page_id, {"insert": {"pre": f"{summary}\n\n"}}
            )

        return notebook

    @classmethod
    def from_json(cls, file_path: str = None, _json: Dict = None) -> "Notebook":
        ...

    def json(self):
        return {
            "id": self.id,
            "name": self.name,
            "sources": [asdict(source) for source in self.sources],
            "pages": [asdict(page) for page in self.pages],
        }

    def get_sources(self):
        return self.sources

    def get_source(self, id: str):
        for source in self.sources:
            if source.id == id:
                return source

    def get_pages(self):
        return self.pages

    def get_page(self, id: str):
        for page in self.pages:
            if page.id == id:
                return page

    def get_page_references(self, id: str):
        page = self.get_page(id)
        return page.references

    def get_page_reference(self, page_id: str, reference_id: str):
        page = self.get_page(page_id)
        for reference in page.references:
            if reference.id == reference_id:
                return reference

    def get_page_layout(self, id: str):
        page = self.get_page(id)
        return page.layout

    def get_page_content(self, id: str):
        page = self.get_page(id)
        return page.content

    def get_page_quills(self, id: str):
        page = self.get_page(id)
        return page.quills

    def get_page_quill(self, page_id: str, quill_id: str):
        page = self.get_page(page_id)
        for quill in page.quills:
            if quill.id == quill_id:
                return quill

    def add_source(self, source: Source):
        self.sources.append(source)

    def add_page(self, page: Page):
        self.pages.append(page)

    def add_page_reference(self, page_id: str, reference: Reference):
        page = self.get_page(page_id)
        page.references.append(reference)

    def add_page_content_operation(self, page_id: str, operation: ContentOperation):
        page = self.get_page(page_id)
        page.content["ops"].append(operation)

    def add_page_quill(self, page_id: str, quill: Quill):
        page = self.get_page(page_id)
        page.quills.append(quill)

    def insert_page(self, page: Page, index: int):
        self.pages.insert(index, page)

    def remove_page(self, page_id: str):
        page = self.get_page(page_id)
        self.pages.remove(page)

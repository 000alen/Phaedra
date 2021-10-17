import unittest
from uuid import uuid4
from copy import deepcopy

from Phaedra.Notebook import Notebook
from Phaedra.Notebook.Page import Page
from Phaedra.Notebook.Cell import Cell
from Phaedra.Notebook.Markdown import (
    text,
    titled_text,
    ordered_list,
    unordered_list,
    link,
    image,
)
from Phaedra.Tests import (
    get_jupiter_pdf_path,
    get_jupiter_text,
    get_jupiter_json,
    get_jupiter_notebook,
    get_jupiter_json_page,
    get_jupiter_page,
    get_jupiter_json_cell,
    get_jupiter_cell,
)


class TestNotebook(unittest.TestCase):
    def test_eq(self):
        name = str(uuid4())
        id = str(uuid4())
        document_path = str(uuid4())

        pages = [
            Page(id=str(uuid4()), data={}, cells=[Cell(id=str(uuid4()), data={})]),
            Page(id=str(uuid4()), data={}, cells=[Cell(id=str(uuid4()), data={})]),
        ]

        notebook_a = Notebook(
            name=name, id=id, document_path=document_path, pages=deepcopy(pages)
        )

        notebook_b = Notebook(
            name=name, id=id, document_path=document_path, pages=deepcopy(pages)
        )

        self.assertEqual(notebook_a, notebook_b)

    def test_from_pdf(self):
        jupiter_pdf_path = get_jupiter_pdf_path()
        notebook = Notebook.from_pdf(document_path=jupiter_pdf_path)

        self.assertTrue(notebook.id is not None)
        self.assertTrue(notebook.name is not None)
        self.assertTrue(notebook.document_path is not None)
        self.assertTrue(notebook.pages is not None)
        self.assertTrue(len(notebook.pages) > 0)

    def test_from_text(self):
        jupiter_text = get_jupiter_text()
        notebook = Notebook.from_text(text=jupiter_text)

        self.assertTrue(notebook.id is not None)
        self.assertTrue(notebook.name is not None)
        # self.assertTrue(notebook.document_path is not None)
        self.assertTrue(notebook.pages is not None)
        self.assertTrue(len(notebook.pages) > 0)

    def test_from_json(self):
        jupiter_json = get_jupiter_json()
        notebook = Notebook.from_json(_json=jupiter_json)

        self.assertTrue(notebook.id is not None)
        self.assertTrue(notebook.name is not None)
        self.assertTrue(notebook.document_path is not None)
        self.assertTrue(notebook.pages is not None)
        self.assertTrue(len(notebook.pages) > 0)

    def test_markdown(self):
        jupiter_notebook = deepcopy(get_jupiter_notebook())
        markdown = jupiter_notebook.markdown()

        self.assertIsInstance(markdown, str)
        self.assertTrue(len(markdown) > 0)

    def test_json(self):
        jupiter_notebook = deepcopy(get_jupiter_notebook())
        json = jupiter_notebook.json()

        self.assertIsInstance(json, dict)
        self.assertTrue(len(json) > 0)

    def test_insert_page(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        page = Page(id=str(uuid4()), data={}, cells=[])

        notebook_a.insert_page(page, 0)

        self.assertFalse(notebook_a == notebook_b)
        self.assertTrue(len(notebook_a.pages) > len(notebook_b.pages))

    def test_add_page(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        page = Page(id=str(uuid4()), data={}, cells=[])

        notebook_a.add_page(page)

        self.assertFalse(notebook_a == notebook_b)
        self.assertTrue(len(notebook_a.pages) > len(notebook_b.pages))

    def test_get_page(self):
        notebook = deepcopy(get_jupiter_notebook())

        id = str(uuid4())

        page = Page(id=id, data={}, cells=[])

        notebook.add_page(page)

        self.assertEqual(notebook.get_page(id), page)

    def test_get_page_index(self):
        notebook = deepcopy(get_jupiter_notebook())

        id = str(uuid4())

        page = Page(id=id, data={}, cells=[])

        notebook.insert_page(page, 0)

        self.assertEqual(notebook.get_page_index(id), 0)

    def test_remove_page(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        id = (str(uuid4()),)

        page = Page(id=id, data={}, cells=[])

        notebook_a.add_page(page)
        notebook_a.remove_page(id)

        self.assertEqual(notebook_a, notebook_b)

    def test_insert_cell(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        page_id = notebook_a.pages[0].id
        id = (str(uuid4()),)
        content = str(uuid4())

        cell = Cell(id=id, data={}, content=content)

        notebook_a.insert_cell(page_id, cell, 0)

        self.assertFalse(notebook_a == notebook_b)
        self.assertTrue(len(notebook_a.pages[0].cells) > len(notebook_b.pages[0].cells))

    def test_add_cell(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        page_id = notebook_a.pages[0].id
        id = (str(uuid4()),)
        content = str(uuid4())

        cell = Cell(id=id, data={}, content=content)

        notebook_a.add_cell(page_id, cell)

        self.assertFalse(notebook_a == notebook_b)
        self.assertTrue(len(notebook_a.pages[0].cells) > len(notebook_b.pages[0].cells))

    def test_get_cell(self):
        notebook = deepcopy(get_jupiter_notebook())

        page_id = notebook.pages[0].id
        id = str(uuid4())
        content = str(uuid4())

        cell = Cell(id=id, data={}, content=content)

        notebook.add_cell(page_id, cell)

        self.assertEqual(notebook.get_cell(page_id, id), cell)

    def test_remove_cell(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        page_id = notebook_a.pages[0].id
        id = str(uuid4())
        content = str(uuid4())

        cell = Cell(id=id, data={}, content=content)

        notebook_a.add_cell(page_id, cell)
        notebook_a.remove_cell(page_id, id)

        self.assertEqual(notebook_a, notebook_b)

    def test_entities(self):
        notebook = deepcopy(get_jupiter_notebook())
        entities = notebook._entities()

        self.assertIsInstance(entities, list)

    def test_question(self):
        notebook = deepcopy(get_jupiter_notebook())

        question = "What is Jupiter?"
        page_id = notebook.pages[0].id

        answer = notebook._question(question, page_id)

        self.assertIsInstance(answer, str)

    def test_sparse_question(self):
        notebook = deepcopy(get_jupiter_notebook())

        question = "What is Jupiter?"

        answer = notebook._sparse_question(question)

        self.assertIsInstance(answer, list)

    def test_generate(self):
        notebook = deepcopy(get_jupiter_notebook())

        prompt = "Jupiter is"
        page_id = notebook.pages[0].id

        generated = notebook._generate(prompt, page_id)

        self.assertIsInstance(generated, str)

    def test_add_entities_cell(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        page_id = notebook_a.pages[0].id

        notebook_a.add_entities_cell(page_id)

        self.assertFalse(notebook_a == notebook_b)

    def test_add_question_cell(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        question = "What is Jupiter?"
        page_id = notebook_a.pages[0].id

        notebook_a.add_question_cell(question, page_id)

        self.assertFalse(notebook_a == notebook_b)

    def test_add_sparse_question_cell(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        question = "What is Jupiter?"

        notebook_a.add_sparse_question_cell(question)

        self.assertFalse(notebook_a == notebook_b)

    def test_add_generate_cell(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        prompt = "Jupiter is"
        page_id = notebook_a.pages[0].id

        notebook_a.add_generate_cell(prompt, page_id)

        self.assertFalse(notebook_a == notebook_b)

    def test_add_wikipedia_summary_cell(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        query = "Jupiter"
        page_id = notebook_a.pages[0].id

        notebook_a.add_wikipedia_summary_cell(query, page_id)

        self.assertFalse(notebook_a == notebook_b)

    def test_add_wikipedia_suggestions_cell(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        query = "Jupiter"
        page_id = notebook_a.pages[0].id

        notebook_a.add_wikipedia_suggestions_cell(query, page_id)

        self.assertFalse(notebook_a == notebook_b)

    def test_add_wikipedia_image_cell(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        query = "Jupiter"
        page_id = notebook_a.pages[0].id

        notebook_a.add_wikipedia_image_cell(query, page_id)

        self.assertFalse(notebook_a == notebook_b)

    def test_add_meaning_cell(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        word = "good"
        page_id = notebook_a.pages[0].id

        notebook_a.add_meaning_cell(word, page_id)

        self.assertFalse(notebook_a == notebook_b)

    def test_add_synonym_cell(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        word = "good"
        page_id = notebook_a.pages[0].id

        notebook_a.add_synonym_cell(word, page_id)

        self.assertFalse(notebook_a == notebook_b)

    def test_add_antonym_cell(self):
        notebook_a = deepcopy(get_jupiter_notebook())
        notebook_b = deepcopy(get_jupiter_notebook())

        word = "good"
        page_id = notebook_a.pages[0].id

        notebook_a.add_antonym_cell(word, page_id)

        self.assertFalse(notebook_a == notebook_b)


class TestPage(unittest.TestCase):
    def test_eq(self):
        page_a = deepcopy(get_jupiter_page())
        page_b = deepcopy(get_jupiter_page())

        self.assertEqual(page_a, page_b)

    def test_from_json(self):
        jupiter_json_page = deepcopy(get_jupiter_json_page())
        page = Page.from_json(_json=jupiter_json_page)

        self.assertIsInstance(page, Page)
        self.assertTrue(page.id is not None)
        self.assertTrue(page.cells is not None)
        self.assertTrue(len(page.cells) > 0)

    def test_json(self):
        jupiter_page = deepcopy(get_jupiter_page())
        json = jupiter_page.json()

        self.assertIsInstance(json, dict)
        self.assertTrue(len(json) > 0)

    def test_insert_cell(self):
        page_a = deepcopy(get_jupiter_page())
        page_b = deepcopy(get_jupiter_page())

        id = str(uuid4())
        content = str(uuid4())

        cell = Cell(id=id, content=content)

        page_a.insert_cell(cell, 0)

        self.assertFalse(page_a == page_b)
        self.assertTrue(len(page_a.cells) > len(page_b.cells))

    def test_add_cell(self):
        page_a = deepcopy(get_jupiter_page())
        page_b = deepcopy(get_jupiter_page())

        id = str(uuid4())
        content = str(uuid4())

        cell = Cell(id=id, content=content)

        page_a.add_cell(cell)

        self.assertFalse(page_a == page_b)
        self.assertTrue(len(page_a.cells) > len(page_b.cells))

    def test_get_cell(self):
        page = deepcopy(get_jupiter_page())

        id = str(uuid4())
        content = str(uuid4())

        cell = Cell(id=id, content=content)

        page.add_cell(cell)

        self.assertTrue(page.get_cell(id) is not None)
        self.assertTrue(page.get_cell(id) == cell)

    def test_remove_cell(self):
        page_a = deepcopy(get_jupiter_page())
        page_b = deepcopy(get_jupiter_page())

        id = str(uuid4())
        content = str(uuid4())

        cell = Cell(id=id, content=content)

        page_a.add_cell(cell)
        page_a.remove_cell(id)

        self.assertTrue(page_a == page_b)


class TestCell(unittest.TestCase):
    def test_eq(self):
        cell_a = deepcopy(get_jupiter_cell())
        cell_b = deepcopy(get_jupiter_cell())

        self.assertEqual(cell_a, cell_b)

    def test_from_json(self):
        jupiter_json_cell = deepcopy(get_jupiter_json_cell())
        cell = Cell.from_json(_json=jupiter_json_cell)

        self.assertIsInstance(cell, Cell)
        self.assertTrue(cell.id is not None)
        self.assertTrue(cell.data is not None)
        self.assertTrue(cell.content is not None)

    def test_json(self):
        cell = deepcopy(get_jupiter_cell())
        json = cell.json()

        self.assertIsInstance(json, dict)
        self.assertTrue(len(json) > 0)


class TestMarkdown(unittest.TestCase):
    def test_text(self):
        _text = str(uuid4())
        self.assertTrue(text(_text) == _text)

    def test_titled_text(self):
        _title = str(uuid4())
        _text = str(uuid4())
        self.assertTrue(titled_text(_title, _text) == f"**{_title}**\n\n{_text}")

    def test_ordered_list(self):
        items = [str(uuid4()) for _ in range(3)]
        self.assertTrue(ordered_list(items) == "1. {}\n2. {}\n3. {}".format(*items))

    def test_unordered_list(self):
        items = [str(uuid4()) for _ in range(3)]
        self.assertTrue(unordered_list(items) == "- {}\n- {}\n- {}".format(*items))

    def test_link(self):
        _text = str(uuid4())
        _url = str(uuid4())
        self.assertTrue(link(_text, _url) == f"[{_text}]({_url})")

    def test_image(self):
        _text = str(uuid4())
        _url = str(uuid4())
        self.assertTrue(image(_text, _url) == f"![{_text}]({_url})")

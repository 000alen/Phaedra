import unittest

from copy import deepcopy

from Phaedra.API import app
from Phaedra.Tests import get_jupiter_base64, get_jupiter_notebook, get_jupiter_text


class TestAPI(unittest.TestCase):
    def test_notebook_from_pdf(self):
        path = "jupiter.pdf"
        jupiter_base64 = get_jupiter_base64()

        with app.test_client() as c:
            response = c.post(
                "/notebook/from_pdf", json={"path": path, "base64": jupiter_base64}
            )
            self.assertIn("id", response.json)
            self.assertIn("name", response.json)
            self.assertIn("pages", response.json)
            self.assertIn("document_path", response.json)

            self.assertEqual(response.json["document_path"], path)

    def test_notebook_from_text(self):
        text = get_jupiter_text()

        with app.test_client() as c:
            response = c.post("/notebook/from_text", json={"text": text})
            self.assertIn("id", response.json)
            self.assertIn("name", response.json)
            self.assertIn("pages", response.json)
            # self.assertIn("document_path", response.json)

    def test_add_entities_cell(self):
        notebook = deepcopy(get_jupiter_notebook())
        page_id = "1"

        with app.test_client() as c:
            response = c.post(
                "/cell/add/entities",
                json={"notebook": notebook.json(), "page_id": page_id},
            )
            self.assertIn("id", response.json)
            self.assertIn("name", response.json)
            self.assertIn("pages", response.json)
            self.assertEqual(len(response.json["pages"]), 1)
            self.assertEqual(len(response.json["pages"][0]["cells"]), 2)

    def test_add_question_cell(self):
        notebook = deepcopy(get_jupiter_notebook())
        page_id = "1"
        question = "What is Jupiter?"

        with app.test_client() as c:
            response = c.post(
                "/cell/add/question",
                json={
                    "notebook": notebook.json(),
                    "page_id": page_id,
                    "question": question,
                },
            )
            self.assertIn("id", response.json)
            self.assertIn("name", response.json)
            self.assertIn("pages", response.json)
            self.assertEqual(len(response.json["pages"]), 1)
            self.assertEqual(len(response.json["pages"][0]["cells"]), 2)

    def test_add_sparse_question_cell(self):
        notebook = deepcopy(get_jupiter_notebook())
        question = "What is Jupiter?"

        with app.test_client() as c:
            response = c.post(
                "/cell/add/sparse_question",
                json={"notebook": notebook.json(), "question": question},
            )
            self.assertIn("id", response.json)
            self.assertIn("name", response.json)
            self.assertIn("pages", response.json)
            self.assertEqual(len(response.json["pages"]), 1)
            self.assertEqual(len(response.json["pages"][0]["cells"]), 2)

    def test_add_generate_cell(self):
        notebook = deepcopy(get_jupiter_notebook())
        page_id = "1"
        prompt = "Jupiter is"

        with app.test_client() as c:
            response = c.post(
                "/cell/add/generate",
                json={
                    "notebook": notebook.json(),
                    "page_id": page_id,
                    "prompt": prompt,
                },
            )
            self.assertIn("id", response.json)
            self.assertIn("name", response.json)
            self.assertIn("pages", response.json)
            self.assertEqual(len(response.json["pages"]), 1)
            self.assertEqual(len(response.json["pages"][0]["cells"]), 2)

    def test_add_wikipedia_summary_cell(self):
        notebook = deepcopy(get_jupiter_notebook())
        page_id = "1"
        query = "Jupiter"

        with app.test_client() as c:
            response = c.post(
                "/cell/add/wikipedia_summary",
                json={"notebook": notebook.json(), "page_id": page_id, "query": query},
            )
            self.assertIn("id", response.json)
            self.assertIn("name", response.json)
            self.assertIn("pages", response.json)
            self.assertEqual(len(response.json["pages"]), 1)
            self.assertEqual(len(response.json["pages"][0]["cells"]), 2)

    def test_add_wikipedia_suggestions_cell(self):
        notebook = deepcopy(get_jupiter_notebook())
        page_id = "1"
        query = "Jupiter"

        with app.test_client() as c:
            response = c.post(
                "/cell/add/wikipedia_suggestions",
                json={"notebook": notebook.json(), "page_id": page_id, "query": query},
            )
            self.assertIn("id", response.json)
            self.assertIn("name", response.json)
            self.assertIn("pages", response.json)
            self.assertEqual(len(response.json["pages"]), 1)
            self.assertEqual(len(response.json["pages"][0]["cells"]), 2)

    def test_add_wikipedia_image_cell(self):
        notebook = deepcopy(get_jupiter_notebook())
        page_id = "1"
        query = "Jupiter"

        with app.test_client() as c:
            response = c.post(
                "/cell/add/wikipedia_image",
                json={"notebook": notebook.json(), "page_id": page_id, "query": query},
            )
            self.assertIn("id", response.json)
            self.assertIn("name", response.json)
            self.assertIn("pages", response.json)
            self.assertEqual(len(response.json["pages"]), 1)
            self.assertEqual(len(response.json["pages"][0]["cells"]), 2)

    def test_add_meaning_cell(self):
        notebook = deepcopy(get_jupiter_notebook())
        page_id = "1"
        word = "Good"

        with app.test_client() as c:
            response = c.post(
                "/cell/add/meaning",
                json={"notebook": notebook.json(), "page_id": page_id, "word": word},
            )
            self.assertIn("id", response.json)
            self.assertIn("name", response.json)
            self.assertIn("pages", response.json)
            self.assertEqual(len(response.json["pages"]), 1)
            self.assertEqual(len(response.json["pages"][0]["cells"]), 2)

    def test_add_synonym_cell(self):
        notebook = deepcopy(get_jupiter_notebook())
        page_id = "1"
        word = "Good"

        with app.test_client() as c:
            response = c.post(
                "/cell/add/synonym",
                json={"notebook": notebook.json(), "page_id": page_id, "word": word},
            )
            self.assertIn("id", response.json)
            self.assertIn("name", response.json)
            self.assertIn("pages", response.json)
            self.assertEqual(len(response.json["pages"]), 1)
            self.assertEqual(len(response.json["pages"][0]["cells"]), 2)

    def test_add_antonym_cell(self):
        notebook = deepcopy(get_jupiter_notebook())
        page_id = "1"
        word = "Good"

        with app.test_client() as c:
            response = c.post(
                "/cell/add/antonym",
                json={"notebook": notebook.json(), "page_id": page_id, "word": word},
            )
            self.assertIn("id", response.json)
            self.assertIn("name", response.json)
            self.assertIn("pages", response.json)
            self.assertEqual(len(response.json["pages"]), 1)
            self.assertEqual(len(response.json["pages"][0]["cells"]), 2)

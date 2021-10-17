import unittest

from Phaedra.Text import (
    extract_text_from_pdf,
    extract_text_from_pdf_to_pages,
    preprocess_text,
)
from Phaedra.Tests import get_jupiter_pdf_path, get_jupiter_text


class TestText(unittest.TestCase):
    def test_extract_text_from_pdf(self):
        jupiter_pdf_path = get_jupiter_pdf_path()
        text = extract_text_from_pdf(jupiter_pdf_path)

        self.assertIsInstance(text, str)

    def test_extract_text_from_pdf_to_pages(self):
        jupiter_pdf_path = get_jupiter_pdf_path()
        text = extract_text_from_pdf_to_pages(jupiter_pdf_path)

        self.assertIsInstance(text, list)

    def test_preprocess_text(self):
        jupiter_text = get_jupiter_text()
        text = preprocess_text(jupiter_text)

        self.assertIsInstance(text, str)

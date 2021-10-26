import unittest
import os

from Phaedra.CLI import CLI
from Phaedra.Tests import (
    get_jupiter_pdf_path,
    get_jupiter_text_path,
    get_jupiter_json_path,
)


class TestCLI(unittest.TestCase):
    def test_from_pdf(self):
        cli = CLI()
        cli.command_from_pdf(get_jupiter_pdf_path())
        self.assertIsNotNone(cli.notebook)

    def test_from_text(self):
        cli = CLI()
        cli.command_from_text(get_jupiter_text_path())
        self.assertIsNotNone(cli.notebook)

    def test_load_notebook(self):
        cli = CLI()
        cli.command_load_notebook(get_jupiter_json_path())
        self.assertIsNotNone(cli.notebook)

    def test_save_notebook(self):
        cli = CLI()
        cli.command_load_notebook(get_jupiter_json_path())
        cli.command_save_notebook(get_jupiter_json_path() + ".save")
        self.assertTrue(os.path.exists(get_jupiter_json_path() + ".save"))

    def test_to_markdown(self):
        cli = CLI()
        cli.command_load_notebook(get_jupiter_json_path())
        cli.command_to_markdown(get_jupiter_json_path() + ".md")
        self.assertTrue(os.path.exists(get_jupiter_json_path() + ".md"))

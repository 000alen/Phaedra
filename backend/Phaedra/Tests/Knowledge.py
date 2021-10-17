import unittest

from Phaedra.Knowledge import wikipedia_summary, wikipedia_suggestions, wikipedia_image


class TestKnowledge(unittest.TestCase):
    def test_wikipedia_summary(self):
        query = "Jupiter"
        summary = wikipedia_summary(query)
        self.assertIsInstance(summary, str)

    def test_wikipedia_suggestions(self):
        query = "Jupiter"
        suggestions = wikipedia_suggestions(query)
        self.assertIsInstance(suggestions, dict)

    def test_wikipedia_image(self):
        query = "Jupiter"
        image = wikipedia_image(query)
        self.assertIsInstance(image, str)

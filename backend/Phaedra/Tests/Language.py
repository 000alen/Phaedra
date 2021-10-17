import unittest

from Phaedra.Language import (
    summarize,
    batch_summarize,
    answer,
    batch_answer,
    batch_answer_same_context,
    batch_answer_same_question,
    generate,
    batch_generate,
    batch_generate_same_context,
    batch_generate_same_prompt,
    entities,
    meaning,
    synonym,
    antonym,
)
from Phaedra.Tests import get_jupiter_500_words_text


class TestLanguage(unittest.TestCase):
    def test_summarize(self):
        text = get_jupiter_500_words_text()
        summary = summarize(text)
        self.assertIsInstance(summary, str)

    def test_batch_summarize(self):
        texts = [get_jupiter_500_words_text() for _ in range(5)]
        summaries = batch_summarize(texts)
        self.assertIsInstance(summaries, list)
        self.assertEqual(len(summaries), len(texts))
        for summary in summaries:
            self.assertIsInstance(summary, str)

    def test_answer(self):
        text = get_jupiter_500_words_text()
        question = "What is jupiter?"
        _answer = answer(question, text)
        self.assertIsInstance(_answer, str)

    def test_batch_answer(self):
        texts = [get_jupiter_500_words_text() for _ in range(5)]
        questions = ["What is jupiter?" for _ in range(5)]
        answers = batch_answer(questions, texts)
        self.assertIsInstance(answers, list)
        self.assertEqual(len(answers), len(questions))
        for answer in answers:
            self.assertIsInstance(answer, str)

    def test_batch_answer_same_context(self):
        text = get_jupiter_500_words_text()
        questions = ["What is jupiter?" for _ in range(5)]
        answers = batch_answer_same_context(questions, text)
        self.assertIsInstance(answers, list)
        self.assertEqual(len(answers), len(questions))
        for answer in answers:
            self.assertIsInstance(answer, str)

    def test_batch_answer_same_question(self):
        texts = [get_jupiter_500_words_text() for _ in range(5)]
        questions = ["What is jupiter?" for _ in range(5)]
        answers = batch_answer_same_question(questions, texts)
        self.assertIsInstance(answers, list)
        self.assertEqual(len(answers), len(questions))
        for answer in answers:
            self.assertIsInstance(answer, str)

    def test_generate(self):
        text = get_jupiter_500_words_text()
        prompt = "Jupiter is"
        generated = generate(prompt, text)
        self.assertIsInstance(generated, str)

    def test_batch_generate(self):
        texts = [get_jupiter_500_words_text() for _ in range(5)]
        prompts = ["Jupiter is" for _ in range(5)]
        generated = batch_generate(prompts, texts)
        self.assertIsInstance(generated, list)
        self.assertEqual(len(generated), len(prompts))
        for generated in generated:
            self.assertIsInstance(generated, str)

    def test_batch_generate_same_context(self):
        text = get_jupiter_500_words_text()
        prompts = ["Jupiter is" for _ in range(5)]
        generated = batch_generate_same_context(prompts, text)
        self.assertIsInstance(generated, list)
        self.assertEqual(len(generated), len(prompts))
        for generated in generated:
            self.assertIsInstance(generated, str)

    def test_batch_generate_same_prompt(self):
        texts = [get_jupiter_500_words_text() for _ in range(5)]
        prompts = ["Jupiter is" for _ in range(5)]
        generated = batch_generate_same_prompt(prompts, texts)
        self.assertIsInstance(generated, list)
        self.assertEqual(len(generated), len(prompts))
        for generated in generated:
            self.assertIsInstance(generated, str)

    def test_entities(self):
        text = get_jupiter_500_words_text()
        _entities = entities(text)
        self.assertIsInstance(_entities, list)
        for entity in _entities:
            self.assertIsInstance(entity, str)

    def test_meaning(self):
        word = "good"
        _meanings = meaning(word)
        self.assertIsInstance(_meanings, dict)
        for _type, _meaning in _meanings.items():
            self.assertIsInstance(_type, str)
            self.assertIsInstance(_meaning, str)

    def test_synonym(self):
        word = "good"
        _synonyms = synonym(word)
        self.assertIsInstance(_synonyms, list)
        for _synonym in _synonyms:
            self.assertIsInstance(_synonym, str)

    def test_antonym(self):
        word = "good"
        _antonyms = antonym(word)
        self.assertIsInstance(_antonyms, list)
        for _antonym in _antonyms:
            self.assertIsInstance(_antonym, str)

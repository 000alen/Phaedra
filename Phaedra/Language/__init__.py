"""Phaedra's Language operations module."""

from enum import Enum, auto
from typing import List, Dict

import Phaedra.Language.Local as Local
import Phaedra.Language.Remote as Remote

__all__ = (
    "summarize",
    "batch_summarize",
    "answer",
    "batch_answer",
    "batch_answer_same_context",
    "batch_answer_same_question",
    "entities",
    "meaning",
    "synonym",
    "antonym",
)


class Mode(Enum):
    LOCAL = auto()
    REMOTE = auto()


_mode = Mode.LOCAL
_get_summarizer_tokenizer = {
    Mode.LOCAL: Local.get_summarizer_tokenizer,
    Mode.REMOTE: Remote.get_summarizer_tokenizer,
}
_summarize = {Mode.LOCAL: Local.summarize, Mode.REMOTE: Remote.summarize}
_batch_summarize = {
    Mode.LOCAL: Local.batch_summarize,
    Mode.REMOTE: Remote.batch_summarize,
}
_get_answerer_tokenizer = {
    Mode.LOCAL: Local.get_answerer_tokenizer,
    Mode.REMOTE: Remote.get_answerer_tokenizer,
}
_answer = {Mode.LOCAL: Local.answer, Mode.REMOTE: Remote.answer}
_batch_answer = {Mode.LOCAL: Local.batch_answer, Mode.REMOTE: Remote.batch_answer}
_batch_answer_same_context = {
    Mode.LOCAL: Local.batch_answer_same_context,
    Mode.REMOTE: Remote.batch_answer_same_context,
}
_batch_answer_same_question = {
    Mode.LOCAL: Local.batch_answer_same_question,
    Mode.REMOTE: Remote.batch_answer_same_question,
}
_get_generator_tokenizer = {
    Mode.LOCAL: Local.get_generator_tokenizer,
    Mode.REMOTE: Remote.get_generator_tokenizer,
}
_generate = {Mode.LOCAL: Local.generate, Mode.REMOTE: Remote.generate}
_batch_generate = {Mode.LOCAL: Local.batch_generate, Mode.REMOTE: Remote.batch_generate}
_batch_generate_same_context = {
    Mode.LOCAL: Local.batch_generate_same_context,
    Mode.REMOTE: Remote.batch_generate_same_context,
}
_batch_generate_same_prompt = {
    Mode.LOCAL: Local.batch_generate_same_prompt,
    Mode.REMOTE: Remote.batch_generate_same_prompt,
}
_get_ner_tokenizer = {
    Mode.LOCAL: Local.get_ner_tokenizer,
    Mode.REMOTE: Local.get_ner_tokenizer,
}
_entities = {Mode.LOCAL: Local.entities, Mode.REMOTE: Local.entities}
_meaning = {Mode.LOCAL: Local.meaning, Mode.REMOTE: Local.meaning}
_synonym = {Mode.LOCAL: Local.synonym, Mode.REMOTE: Local.synonym}
_antonym = {Mode.LOCAL: Local.antonym, Mode.REMOTE: Local.antonym}


def get_mode() -> Mode:
    """Returns the current mode of the backend execution (LOCAL or REMOTE).

    :return: The current mode of the backend execution.
    :rtype: Mode

    """

    return _mode


def set_mode(mode: Mode):
    """Sets the current mode of the backend execution (LOCAL or REMOTE).

    :param mode: The mode to set.
    :type mode: Mode

    """

    global _mode
    _mode = mode


def get_summarizer_tokenizer():
    """Returns the summarizer tokenizer.

    :return: The summarizer tokenizer.

    """

    return _get_summarizer_tokenizer[get_mode()]()


def summarize(text: str) -> str:
    """Summarizes the text.

    :param text: The text to summarize.
    :type text: str
    :return: The summarized text.
    :rtype: str

    """

    return _summarize[get_mode()](text)


def batch_summarize(texts: List[str]) -> List[str]:
    """Summarizes the texts.

    :param texts: The texts to summarize.
    :type texts: List[str]
    :return: The summarized texts.
    :rtype: List[str]

    """

    return _batch_summarize[get_mode()](texts)


def get_answerer_tokenizer():
    """Returns the answerer tokenizer.

    :return: The answerer tokenizer.

    """

    return _get_answerer_tokenizer[get_mode()]


def answer(question: str, context: str) -> str:
    """Answers the question with the given context.

    :param question: The question to answer.
    :type question: str
    :param context: The context to answer the question with.
    :type context: str
    :return: The answer.
    :rtype: str

    """

    return _answer[get_mode()](question, context)


def batch_answer(questions: List[str], contexts: List[str]) -> List[str]:
    """Answers the questions with the given contexts.

    :param questions: The questions to answer.
    :type questions: List[str]
    :param contexts: The contexts to answer the questions with.
    :type contexts: List[str]
    :return: The answers.
    :rtype: List[str]

    """

    return _batch_answer[get_mode()](questions, contexts)


def batch_answer_same_context(questions: List[str], context: str) -> List[str]:
    """Answers the questions with the given context.

    :param questions: The questions to answer.
    :type questions: List[str]
    :param context: The context to answer the questions with.
    :type context: str
    :return: The answers.
    :rtype: List[str]

    """

    return _batch_answer_same_context[get_mode()](questions, context)


def batch_answer_same_question(question: str, contexts: List[str]) -> List[str]:
    """Answers the question with the given contexts.

    :param question: The question to answer.
    :type question: str
    :param contexts: The contexts to answer the question with.
    :type contexts: List[str]
    :return: The answers.
    :rtype: List[str]

    """

    return _batch_answer_same_question[get_mode()](question, contexts)


def get_generator_tokenizer():
    """Returns the generator tokenizer.

    :return: The generator tokenizer.

    """

    return _get_generator_tokenizer[get_mode()]


def generate(prompt: str, context: str) -> str:
    """Generates a response for the given prompt and context.

    :param prompt: The prompt to generate a response for.
    :type prompt: str
    :param context: The context to generate a response for.
    :type context: str
    :return: The generated response.
    :rtype: str

    """

    return _generate[get_mode()](prompt, context)


def batch_generate(prompts: List[str], contexts: List[str]) -> List[str]:
    """Generates responses for the given prompts and contexts.
    
    :param prompts: The prompts to generate responses for.
    :type prompts: List[str]
    :param contexts: The contexts to generate responses for.
    :type contexts: List[str]
    :return: The generated responses.
    :rtype: List[str]

    """

    return _batch_generate[get_mode()](prompts, contexts)


def batch_generate_same_context(prompts: List[str], context: str) -> List[str]:
    """Generates responses for the given prompts and context.

    :param prompts: The prompts to generate responses for.
    :type prompts: List[str]
    :param context: The context to generate responses for.
    :type context: str
    :return: The generated responses.
    :rtype: List[str]

    """

    return _batch_generate_same_context[get_mode()](prompts, context)


def batch_generate_same_prompt(prompt: str, contexts: List[str]) -> List[str]:
    """Generates responses for the given prompt and contexts.

    :param prompt: The prompt to generate responses for.
    :type prompt: str
    :param contexts: The contexts to generate responses for.
    :type contexts: List[str]
    :return: The generated responses.
    :rtype: List[str]

    """

    return _batch_generate_same_prompt[get_mode()](prompt, contexts)


def get_ner_tokenizer():
    """Returns the Named Entities Recognizer tokenizer.

    :return: The Named Entities Recognizer tokenizer.

    """

    return _get_ner_tokenizer[get_mode()]


def entities(text: str) -> List[str]:
    """Returns the entities in the given text.

    :param text: The text to get the entities of.
    :type text: str
    :return: The entities in the given text.
    :rtype: List[str]

    """

    return _entities[get_mode()](text)


def meaning(word: str) -> Dict[str, List[str]]:
    """Returns the meanings of the given word.

    :param word: The word to get the meanings of.
    :type word: str
    :return: The meanings of the given word.
    :rtype: Dict[str, List[str]]

    """

    return _meaning[get_mode()](word)


def synonym(word: str) -> List[str]:
    """Returns the synonyms of the given word.

    :param word: The word to get the synonyms of.
    :type word: str
    :return: The synonyms of the given word.
    :rtype: List[str]

    """

    return _synonym[get_mode()](word)


def antonym(word: str) -> List[str]:
    """Returns the antonyms of the given word.

    :param word: The word to get the antonyms of.
    :type word: str
    :return: The antonyms of the given word.
    :rtype: List[str]

    """

    return _antonym[get_mode()](word)

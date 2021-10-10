"""
Phaedra's Language operations module.
"""

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
_get_ner_tokenizer = {
    Mode.LOCAL: Local.get_ner_tokenizer,
    Mode.REMOTE: Local.get_ner_tokenizer,
}
_entities = {Mode.LOCAL: Local.entities, Mode.REMOTE: Local.entities}
_meaning = {Mode.LOCAL: Local.meaning, Mode.REMOTE: Local.meaning}
_synonym = {Mode.LOCAL: Local.synonym, Mode.REMOTE: Local.synonym}
_antonym = {Mode.LOCAL: Local.antonym, Mode.REMOTE: Local.antonym}


def get_mode() -> Mode:
    return _mode


def set_mode(mode: Mode):
    global _mode
    _mode = mode


def get_summarizer_tokenizer():
    return _get_summarizer_tokenizer[get_mode()]()


def summarize(text: str) -> str:
    return _summarize[get_mode()](text)


def batch_summarize(texts: List[str]) -> List[str]:
    return _batch_summarize[get_mode()](texts)


def get_answerer_tokenizer():
    return _get_answerer_tokenizer[get_mode()]


def answer(question: str, context: str) -> str:
    return _answer[get_mode()](question, context)


def batch_answer(questions: List[str], contexts: List[str]) -> List[str]:
    return _batch_answer[get_mode()](questions, contexts)


def batch_answer_same_context(questions: List[str], context: str) -> List[str]:
    return _batch_answer_same_context[get_mode()](questions, context)


def batch_answer_same_question(question: str, contexts: List[str]) -> List[str]:
    return _batch_answer_same_question[get_mode()](question, contexts)


def get_generator_tokenizer():
    return _get_generator_tokenizer[get_mode()]


def generate(prompt: str) -> str:
    return _generate[get_mode()](prompt)


def batch_generate(prompts: List[str]) -> List[str]:
    return _batch_generate[get_mode()](prompts)


def get_ner_tokenizer():
    return _get_ner_tokenizer[get_mode()]


def entities(text: str) -> List[str]:
    return _entities[get_mode()](text)


def meaning(word: str) -> Dict[str, List[str]]:
    return _meaning[get_mode()](word)


def synonym(word: str) -> List[str]:
    return _synonym[get_mode()](word)


def antonym(word: str) -> List[str]:
    return _antonym[get_mode()](word)

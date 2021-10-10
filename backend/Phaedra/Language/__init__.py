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


MODE = Mode.LOCAL


def set_mode(mode: Mode):
    global MODE
    MODE = mode


_get_summarizer_tokenizer = {
    Mode.LOCAL: Local.get_summarizer_tokenizer,
    Mode.REMOTE: Remote.get_summarizer_tokenizer,
}


def get_summarizer_tokenizer():
    return _get_summarizer_tokenizer[MODE]()


_summarize = {Mode.LOCAL: Local.summarize, Mode.REMOTE: Remote.summarize}


def summarize(text: str) -> str:
    return _summarize[MODE](text)


_batch_summarize = {
    Mode.LOCAL: Local.batch_summarize,
    Mode.REMOTE: Remote.batch_summarize,
}


def batch_summarize(texts: List[str]) -> List[str]:
    return _batch_summarize[MODE](texts)


_get_answerer_tokenizer = {
    Mode.LOCAL: Local.get_answerer_tokenizer,
    Mode.REMOTE: Remote.get_answerer_tokenizer,
}


def get_answerer_tokenizer():
    return _get_answerer_tokenizer[MODE]


_answer = {Mode.LOCAL: Local.answer, Mode.REMOTE: Remote.answer}


def answer(question: str, context: str) -> str:
    return _answer[MODE](question, context)


_batch_answer = {Mode.LOCAL: Local.batch_answer, Mode.REMOTE: Remote.batch_answer}


def batch_answer(questions: List[str], contexts: List[str]) -> List[str]:
    return _batch_answer[MODE](questions, contexts)


_batch_answer_same_context = {
    Mode.LOCAL: Local.batch_answer_same_context,
    Mode.REMOTE: Remote.batch_answer_same_context,
}


def batch_answer_same_context(questions: List[str], context: str) -> List[str]:
    return _batch_answer_same_context[MODE](questions, context)


_batch_answer_same_question = {
    Mode.LOCAL: Local.batch_answer_same_question,
    Mode.REMOTE: Remote.batch_answer_same_question,
}


def batch_answer_same_question(question: str, contexts: List[str]) -> List[str]:
    return _batch_answer_same_question[MODE](question, contexts)


_get_generator_tokenizer = {
    Mode.LOCAL: Local.get_generator_tokenizer,
    Mode.REMOTE: Remote.get_generator_tokenizer,
}


def get_generator_tokenizer():
    return _get_generator_tokenizer[MODE]


_generate = {Mode.LOCAL: Local.generate, Mode.REMOTE: Remote.generate}


def generate(prompt: str) -> str:
    return _generate[MODE](prompt)


_batch_generate = {Mode.LOCAL: Local.batch_generate, Mode.REMOTE: Remote.batch_generate}


def batch_generate(prompts: List[str]) -> List[str]:
    return _batch_generate[MODE](prompts)


_get_ner_tokenizer = {
    Mode.LOCAL: Local.get_ner_tokenizer,
    Mode.REMOTE: Local.get_ner_tokenizer,
}


def get_ner_tokenizer():
    return _get_ner_tokenizer[MODE]


_entities = {Mode.LOCAL: Local.entities, Mode.REMOTE: Local.entities}


def entities(text: str) -> List[str]:
    return _entities[MODE](text)


_meaning = {Mode.LOCAL: Local.meaning, Mode.REMOTE: Local.meaning}


def meaning(word: str) -> Dict[str, List[str]]:
    return _meaning[MODE](word)


_synonym = {Mode.LOCAL: Local.synonym, Mode.REMOTE: Local.synonym}


def synonym(word: str) -> List[str]:
    return _synonym[MODE](word)


_antonym = {Mode.LOCAL: Local.antonym, Mode.REMOTE: Local.antonym}


def antonym(word: str) -> List[str]:
    return _antonym[MODE](word)

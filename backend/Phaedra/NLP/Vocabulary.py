import json

from typing import List
from vocabulary.vocabulary import Vocabulary


def meaning(word: str) -> List[str]:
    return [_["text"] for _ in json.loads(Vocabulary.meaning(word))]


def synonym(word: str) -> List[str]:
    return [_["text"] for _ in json.loads(Vocabulary.synonym(word))]


def antonym(word: str) -> List[str]:
    return [_["text"] for _ in json.loads(Vocabulary.antonym(word))]


def usage_example(word: str) -> List[str]:
    return [_["text"] for _ in json.loads(Vocabulary.usage_example(word))]

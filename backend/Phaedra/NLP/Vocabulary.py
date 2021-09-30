from typing import List, Dict
from PyDictionary import PyDictionary


dictionary = PyDictionary()


def meaning(word: str) -> Dict[str, List[str]]:
    return dictionary.meaning(word)


def synonym(word: str) -> List[str]:
    return dictionary.synonym(word)


def antonym(word: str) -> List[str]:
    return dictionary.antonym(word)

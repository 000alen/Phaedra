"""Phaedra's Knowledge operations module."""


from typing import Dict

import wikipedia


def summary(query: str) -> str:
    """Returns Wikipedia summary.

    :param query: Query to search Wikipedia for.
    :type query: str
    :return: Summary of the Wikipedia page.
    :rtype: str

    """

    return wikipedia.summary(query)


def suggestions(query: str) -> Dict[str, str]:
    """Returns Wikipedia suggestions.

    :param query: Query to search Wikipedia for.
    :type query: str
    :return: Dictionary of suggestions.
    :rtype: Dict[str, str]

    """

    suggestions, _ = wikipedia.search(query, results=5, suggestion=True)
    return {suggestion: wikipedia.page(suggestion).url for suggestion in suggestions}


def image(query: str) -> str:
    """Returns Wikipedia image.

    :param query: Query to search Wikipedia for.
    :type query: str
    :return: URL of the Wikipedia image.
    :rtype: str

    """

    wikipedia_page = wikipedia.page(query)
    return wikipedia_page.images[0]

"""Markdown wrapper for Phaedra Notebook."""

from typing import List

__all__ = ("text", "titled_text", "ordered_list", "unordered_list", "link", "image")


def text(text: str) -> str:
    """Formats text to Markdown.

    :param text: The text to format.
    :type text: str
    :return: The formatted text.
    :rtype: str

    """

    return f"{text}"


def titled_text(title: str, text: str) -> str:
    """Formats text to Markdown with a title.

    :param title: The title of the text.
    :type title: str
    :param text: The text to format.
    :type text: str
    :return: The formatted text.
    :rtype: str

    """

    return f"**{title}**\n\n{text}"


def ordered_list(items: List[str]) -> str:
    """Formats as a ordered list of items to Markdown.

    :param items: The items to format.
    :type items: List[str]
    :return: The formatted list.
    :rtype: str

    """

    return "\n".join(f"{i + 1}. {item}" for i, item in enumerate(items))


def unordered_list(items: List[str]) -> str:
    """Formats as an unordered list of items to Markdown.

    :param items: The items to format.
    :type items: List[str]
    :return: The formatted list.
    :rtype: str

    """

    return "\n".join(f"- {item}" for item in items)


def link(text: str, url: str) -> str:
    """Formats as a link to Markdown.

    :param text: The text of the link.
    :type text: str
    :param url: The URL of the link.
    :type url: str
    :return: The formatted link.
    :rtype: str

    """

    return f"[{text}]({url})"


def image(text: str, url: str) -> str:
    """Formats as an image to Markdown.

    :param text: The text of the image.
    :type text: str
    :param url: The URL of the image.
    :type url: str
    :return: The formatted image.
    :rtype: str

    """

    return f"![{text}]({url})"

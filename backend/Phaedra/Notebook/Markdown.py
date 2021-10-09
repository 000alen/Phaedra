"""
Markdown wrapper for Phaedra Notebook.
"""

from typing import List

__all__ = ("text", "titled_text", "ordered_list", "unordered_list", "link", "image")


def text(text: str) -> str:
    return f"{text}"


def titled_text(title: str, text: str) -> str:
    return f"**{title}**\n\n{text}"


def ordered_list(items: List[str]) -> str:
    return "\n".join(f"{i + 1}. {item}" for i, item in enumerate(items))


def unordered_list(items: List[str]) -> str:
    return "\n".join(f"- {item}" for item in items)


def link(text: str, url: str) -> str:
    return f"[{text}]({url})"


def image(text: str, url: str) -> str:
    return f"![{text}]({url})"

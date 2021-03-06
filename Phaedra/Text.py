"""Phaedra's text operations module."""

import re
import string

from typing import List, Union, BinaryIO

import pdfplumber  # type: ignore

from nltk import word_tokenize, corpus, download  # type: ignore

download("punkt")
download("stopwords")
download("wordnet")

__all__ = ("extract_text_from_pdf", "extract_text_from_pdf_to_pages", "preprocess_text")

stop_words = corpus.stopwords.words("english")
title_expression = re.compile(r"[0-9]+\.(\w|\s)+")


def extract_text_from_pdf(file_path_or_stream: Union[str, BinaryIO]) -> str:
    """Extracts text from a PDF file.

    :param file_path_or_stream: The path to the PDF file or a file-like object.
    :type file_path_or_stream: str | BinaryIO
    :return: The extracted text.
    :rtype: str

    """

    return "".join(
        page.extract_text() for page in pdfplumber.open(file_path_or_stream).pages
    )


def extract_text_from_pdf_to_pages(
    file_path_or_stream: Union[str, BinaryIO]
) -> List[str]:
    """Extracts text from a PDF file and separates it into pages.

    :param file_path_or_stream: The path to the PDF file or a file-like object.
    :type file_path_or_stream: str | BinaryIO
    :return: The extracted text separated into pages.
    :rtype: list[str]

    """

    return [page.extract_text() for page in pdfplumber.open(file_path_or_stream).pages]


# XXX: Hacky
def preprocess_text(text: str) -> str:
    """Preprocesses text (tries to remove useless text).

    :param text: The text to preprocess.
    :type text: str
    :return: The preprocessed text.
    :rtype: str
    
    """

    response_text: str = ""

    for line in text.split("\n"):
        all_words = word_tokenize(line)

        has_stop_word = False
        for word in all_words:
            if word.lower() in stop_words:
                has_stop_word = True
                break

        acceptable_word = has_stop_word

        if any(c not in string.printable for c in line):
            acceptable_word = False

        if title_expression.match(line):
            acceptable_word = True

        if "[" in line.split(" ")[0] and "]" in line.split(" ")[0]:
            acceptable_word = True

        if line.count(" ") > len(line) / 5:
            acceptable_word = False

        if acceptable_word:
            response_text += line + "\n"

    return response_text

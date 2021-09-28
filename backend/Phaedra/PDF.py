import pdfplumber
import re
import string
import logging

from typing import List

from nltk import word_tokenize, corpus

STOP_WORDS = corpus.stopwords.words("english")
TITLE_EXPRESSION = re.compile(r"[0-9]+\.(\w|\s)+")


def extract_text(file_path: str) -> str:
    if type(file_path) is str:
        logging.info(f"Extracting text: '{file_path[:5]}...'")
    else:
        logging.info(f"Extracting text from: {file_path}")

    return "".join(page.extract_text() for page in pdfplumber.open(file_path).pages)


def extract_text_to_pages(file_path: str) -> List[str]:
    if type(file_path) is str:
        logging.info(f"Extracting text (to pages): '{file_path[:5]}...'")
    else:
        logging.info(f"Extracting text (to pages) from: {file_path}")
        
    return [page.extract_text() for page in pdfplumber.open(file_path).pages]


# Preprocess the text from the page
def preprocess_text(text: str) -> str:
    logging.info(f"Preprocessing: '{text[:5]}...'")

    response_text: str = ""

    for line in text.split("\n"):
        all_words = word_tokenize(line)

        has_stop_word = False
        for word in all_words:
            if word.lower() in STOP_WORDS:
                has_stop_word = True
                break

        acceptable_word = has_stop_word

        # If has weird characters
        if any(c not in string.printable for c in line):
            acceptable_word = False

        # If is a title
        if TITLE_EXPRESSION.match(line):
            acceptable_word = True

        # If is a reference
        if "[" in line.split(" ")[0] and "]" in line.split(" ")[0]:
            acceptable_word = True

        # If is code
        if line.count(" ") > len(line)/5:
            acceptable_word = False

        # If pass all tests, is a valid line
        if acceptable_word:
            response_text += line + "\n"

    return response_text

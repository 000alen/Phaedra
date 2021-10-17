import pkg_resources  # type: ignore
import base64
import json

from Phaedra.Notebook import Notebook

_jupiter_pdf = None
_jupiter_base64 = None
_jupiter_text = None
_jupiter_json = None
_jupiter_notebook = None
_jupiter_pdf_path = None
_jupiter_text_path = None
_jupiter_json_path = None
_jupiter_500_words_text = None


def load_jupiter_pdf():
    global _jupiter_pdf
    _jupiter_pdf = pkg_resources.resource_string(__name__, "jupiter.pdf")


def load_jupiter_base64():
    if _jupiter_pdf is None:
        load_jupiter_pdf()

    global _jupiter_base64
    _jupiter_base64 = base64.b64encode(_jupiter_pdf).decode("utf-8")


def load_jupiter_text():
    global _jupiter_text
    _jupiter_text = pkg_resources.resource_string(__name__, "jupiter.txt").decode(
        "utf-8"
    )


def load_jupiter_json():
    global _jupiter_json
    _jupiter_json = json.loads(
        pkg_resources.resource_string(__name__, "jupiter.json").decode("utf-8")
    )


def load_jupiter_notebook():
    if _jupiter_json is None:
        load_jupiter_json()
    global _jupiter_notebook
    _jupiter_notebook = Notebook.from_json(_json=_jupiter_json)


def load_jupiter_pdf_path():
    global _jupiter_pdf_path
    _jupiter_pdf_path = pkg_resources.resource_filename("tempfile", "jupiter.pdf")


def load_jupiter_text_path():
    global _jupiter_text_path
    _jupiter_text_path = pkg_resources.resource_filename("tempfile", "jupiter.txt")


def load_jupiter_json_path():
    global _jupiter_json_path
    _jupiter_json_path = pkg_resources.resource_filename("tempfile", "jupiter.json")


def load_jupiter_500_words_text():
    global _jupiter_500_words_text
    _jupiter_500_words_text = pkg_resources.resource_string(
        __name__, "jupiter_500_words.txt"
    ).decode("utf-8")


def get_jupiter_pdf():
    if _jupiter_pdf is None:
        load_jupiter_pdf()
    return _jupiter_pdf


def get_jupiter_base64():
    if _jupiter_base64 is None:
        load_jupiter_base64()
    return _jupiter_base64


def get_jupiter_text():
    if _jupiter_text is None:
        load_jupiter_text()
    return _jupiter_text


def get_jupiter_json():
    if _jupiter_json is None:
        load_jupiter_json()
    return _jupiter_json


def get_jupiter_notebook():
    if _jupiter_notebook is None:
        load_jupiter_notebook()
    return _jupiter_notebook


def get_jupiter_pdf_path():
    if _jupiter_pdf_path is None:
        load_jupiter_pdf_path()
    return _jupiter_pdf_path


def get_jupiter_text_path():
    if _jupiter_text_path is None:
        load_jupiter_text_path()
    return _jupiter_text_path


def get_jupiter_json_path():
    if _jupiter_json_path is None:
        load_jupiter_json_path()
    return _jupiter_json_path


def get_jupiter_500_words_text():
    if _jupiter_500_words_text is None:
        load_jupiter_500_words_text()
    return _jupiter_500_words_text

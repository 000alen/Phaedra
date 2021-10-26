from typing import Dict
import pkg_resources  # type: ignore
import json
import jsonschema

_notebook = json.loads(
    pkg_resources.resource_string(__name__, "notebook.json").decode()
)
_page = json.loads(pkg_resources.resource_string(__name__, "page.json").decode())
_page_data = json.loads(
    pkg_resources.resource_string(__name__, "page.data.json").decode()
)
_cell = json.loads(pkg_resources.resource_string(__name__, "cell.json").decode())
_cell_data = json.loads(
    pkg_resources.resource_string(__name__, "cell.data.json").decode()
)

_store = {
    _notebook["$id"]: _notebook,
    _page["$id"]: _page,
    _page_data["$id"]: _page_data,
    _cell["$id"]: _cell,
    _cell_data["$id"]: _cell_data,
}

_resolver = jsonschema.RefResolver.from_schema(_notebook, store=_store)

_notebook_validator = jsonschema.Draft7Validator(_notebook, resolver=_resolver)
_page_validator = jsonschema.Draft7Validator(_page, resolver=_resolver)
_page_data_validator = jsonschema.Draft7Validator(_page_data, resolver=_resolver)
_cell_validator = jsonschema.Draft7Validator(_cell, resolver=_resolver)
_cell_data_validator = jsonschema.Draft7Validator(_cell_data, resolver=_resolver)


def is_valid_notebook(notebook: Dict) -> bool:
    valid = True
    try:
        _notebook_validator.validate(notebook)
    except jsonschema.ValidationError:
        valid = False
    return valid


def is_valid_page(page: Dict) -> bool:
    valid = True
    try:
        _page_validator.validate(page)
    except jsonschema.ValidationError:
        valid = False
    return valid


def is_valid_page_data(page_data: Dict) -> bool:
    valid = True
    try:
        _page_data_validator.validate(page_data)
    except jsonschema.ValidationError:
        valid = False
    return valid


def is_valid_cell(cell: Dict) -> bool:
    valid = True
    try:
        _cell_validator.validate(cell)
    except jsonschema.ValidationError:
        valid = False
    return valid


def is_valid_cell_data(cell_data: Dict) -> bool:
    valid = True
    try:
        _cell_data_validator.validate(cell_data)
    except jsonschema.ValidationError:
        valid = False
    return valid

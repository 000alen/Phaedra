from typing import Dict
import pkg_resources  # type: ignore
import json
import jsonschema

_notebook = json.loads(
    pkg_resources.resource_string(__name__, "notebook.json").decode()
)

_notebook_validator = jsonschema.Draft7Validator(_notebook)


def is_valid_notebook(notebook: Dict) -> bool:
    return _notebook_validator.is_valid(notebook)

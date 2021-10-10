import json
import pkg_resources  # type: ignore

input_size = 512
query_size = 20

summarizer_input_size = input_size - query_size
summarizer_parameters = json.loads(
    pkg_resources.resource_string(__name__, "summarizer_parameters.json").decode()
)
summarizer_prompt = pkg_resources.resource_string(
    __name__, "summarizer_prompt.txt"
).decode()

answerer_input_size = input_size - query_size
answerer_parameters = json.loads(
    pkg_resources.resource_string(__name__, "answerer_parameters.json").decode()
)
answerer_prompt = pkg_resources.resource_string(
    __name__, "answerer_prompt.txt"
).decode()

generator_input_size = input_size - query_size
generator_parameters = json.loads(
    pkg_resources.resource_string(__name__, "generator_parameters.json").decode()
)
generator_prompt = pkg_resources.resource_string(__name__, "generator_prompt.txt")

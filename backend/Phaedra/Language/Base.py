import pkg_resources  # type: ignore

summarize_prompt = pkg_resources.resource_string(
    "Phaedra.Language", "summarize_prompt.txt"
)
answer_prompt = pkg_resources.resource_string("Phaedra.Language", "answer_prompt.txt")

import pkg_resources  # type: ignore
from typing import List, Tuple

from Phaedra.Language import get_summarizer_tokenizer

QUERY_SIZE = 20
CHUNK_SIZE = 512 - QUERY_SIZE


def chunk_sources(sources: List[str]) -> Tuple[List[int], List[str]]:
    tokenizer = get_summarizer_tokenizer()
    tokenized_sources = [tokenizer(source)["input_ids"] for source in sources]

    indexes = []
    chunks = []

    current_index = 0
    current_chunk: List[int] = []
    for i, tokenized_source in enumerate(tokenized_sources):
        j = 0
        while j < len(tokenized_source):
            if j + (CHUNK_SIZE - len(current_chunk)) <= len(tokenized_source):
                chunk_extension = tokenized_source[
                    j : j + CHUNK_SIZE - len(current_chunk)
                ]
                j += CHUNK_SIZE - len(current_chunk)
                current_chunk.extend(chunk_extension)

                indexes.append(current_index)
                chunks.append(current_chunk)

                current_index = i
                current_chunk = []
            else:
                current_chunk.extend(tokenized_source[j:])
                j = len(tokenized_source)

            if len(current_chunk) == CHUNK_SIZE:
                indexes.append(current_index)
                chunks.append(current_chunk)

                current_index = i
                current_chunk = []

        if current_chunk and i == len(tokenized_sources) - 1:
            indexes.append(current_index)
            chunks.append(current_chunk)

    return indexes, [tokenizer.decode(chunk) for chunk in chunks]


summarize_prompt = pkg_resources.resource_string(
    "Phaedra.Language", "summarize_prompt.txt"
).decode()
answer_prompt = pkg_resources.resource_string(
    "Phaedra.Language", "answer_prompt.txt"
).decode()

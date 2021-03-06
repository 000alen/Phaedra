from typing import Dict, List, Tuple


def chop(texts: List[str], tokenizer, size: int) -> Tuple[List[int], List[str]]:
    """Chops a list of texts into chunks of a given size.

    :param texts: List of texts to chop.
    :type texts: List[str]
    :param tokenizer: Tokenizer to use.
    :param size: Size of the chunks.
    :type size: int
    :return: List of indices and chunks.
    :rtype: Tuple[List[int], List[str]]

    """

    tokenized_sources = [tokenizer(source)["input_ids"] for source in texts]

    indexes = []
    chunks = []

    current_index = 0
    current_chunk: List[int] = []
    for i, tokenized_source in enumerate(tokenized_sources):
        j = 0
        while j < len(tokenized_source):
            if j + (size - len(current_chunk)) <= len(tokenized_source):
                chunk_extension = tokenized_source[j : j + size - len(current_chunk)]
                j += size - len(current_chunk)
                current_chunk.extend(chunk_extension)

                indexes.append(current_index)
                chunks.append(current_chunk)

                current_index = i
                current_chunk = []
            else:
                current_chunk.extend(tokenized_source[j:])
                j = len(tokenized_source)

            if len(current_chunk) == size:
                indexes.append(current_index)
                chunks.append(current_chunk)

                current_index = i
                current_chunk = []

        if current_chunk and i == len(tokenized_sources) - 1:
            indexes.append(current_index)
            chunks.append(current_chunk)

    return indexes, [tokenizer.decode(chunk) for chunk in chunks]


def format_parameters_to_local(parameters: Dict, information: Dict) -> Dict:
    """Formats parameters for local mode.

    :param parameters: Parameters to format.
    :type parameters: Dict
    :param information: Information about the parameters.
    :type information: Dict
    :return: Formatted parameters.
    :rtype: Dict

    """

    formatted_parameters = {
        "max_length": parameters["max_tokens"] + information["prompt_length"],
        "temperature": parameters["temperature"],
        "top_p": parameters["top_p"],
        "frequency_penalty": parameters["frequency_penalty"],
        "presence_penalty": parameters["presence_penalty"],
        "return_full_text": False,
    }

    return formatted_parameters


def cut_on_stop(text: str, stop: List[str]) -> str:
    """Cuts a text to the first stop sequences.

    :param text: Text to cut.
    :type text: str
    :param stop: List of stop sequences.
    :type stop: List[str]
    :return: Cut text.
    :rtype: str

    """

    items = [text]
    for _stop in stop:
        _items = []
        for item in items:
            _items.extend(item.split(_stop))
        items = _items
    return items[0]

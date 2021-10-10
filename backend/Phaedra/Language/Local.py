from typing import List, Dict

import transformers  # type: ignore

from PyDictionary import PyDictionary  # type: ignore

from Phaedra.Language.Base import (
    summarizer_parameters,
    summarizer_prompt,
    answerer_parameters,
    answerer_prompt,
    generator_parameters,
    generator_prompt,
)

from Phaedra.Language.Utils import format_parameters_to_local, cut_on_stop

_device = 0

_model_name = "EleutherAI/gpt-neo-1.3B"
_model = None

_summarizer = None
_answerer = None
_generator = None
_ner = None
_dictionary = None


def load_model():
    global _model
    _model = transformers.pipeline("text-generation", model=_model_name, device=_device)


def load_summarizer():
    global _summarizer

    # _summarizer = transformers.pipeline("summarization", device=_device)

    if _model is None:
        load_model()

    _summarizer = _model


def load_answerer():
    global _answerer

    # _answerer = transformers.pipeline("question-answering", device=_device)

    if _model is None:
        load_model()

    _answerer = _model


def load_generator():
    global _generator

    # _generator = transformers.pipeline("text-generation", device=_device)

    if _model is None:
        load_model()

    _generator = _model


def load_ner():
    global _ner
    _ner = transformers.pipeline("ner", grouped_entities=True, device=_device)


def load_dictionary():
    global _dictionary
    _dictionary = PyDictionary()


def get_summarizer_tokenizer():
    if _summarizer is None:
        load_summarizer()

    assert _summarizer is not None

    return _summarizer.tokenizer


def get_answerer_tokenizer():
    if _answerer is None:
        load_answerer()

    assert _answerer is not None

    return _answerer.tokenizer


def get_generator_tokenizer():
    if _generator is None:
        load_generator()

    assert _generator is not None

    return _generator.tokenizer


def get_ner_tokenizer():
    if _ner is None:
        load_ner()

    assert _ner is not None

    return _ner.tokenizer


def summarize(text: str) -> str:
    if _summarizer is None:
        load_summarizer()

    assert _summarizer is not None

    tokenizer = get_summarizer_tokenizer()
    prompt = summarizer_prompt.format(text=text)
    information = {"prompt_length": len(tokenizer.encode(prompt))}
    parameters = format_parameters_to_local(summarizer_parameters, information)

    response = _summarizer(prompt, **parameters)

    return cut_on_stop(response[0]["generated_text"], summarizer_parameters["stop"])


def batch_summarize(texts: List[str]) -> List[str]:
    if _summarizer is None:
        load_summarizer()

    assert _summarizer is not None

    tokenizer = get_summarizer_tokenizer()
    prompts = [summarizer_prompt.format(text=text) for text in texts]
    information = {
        "prompt_length": max(len(tokenizer.encode(prompt)) for prompt in prompts)
    }
    parameters = format_parameters_to_local(summarizer_parameters, information)

    response = _summarizer(prompts, **parameters)

    return [
        cut_on_stop(choice["generated_text"], summarizer_parameters["stop"])
        for choice in response
    ]


def answer(question: str, context: str) -> str:
    if _answerer is None:
        load_answerer()

    assert _answerer is not None

    tokenizer = get_answerer_tokenizer()
    prompt = answerer_prompt.format(question=question, context=context)
    information = {"prompt_length": len(tokenizer.encode(prompt))}
    parameters = format_parameters_to_local(answerer_parameters, information)

    response = _answerer(prompt, **parameters)

    return cut_on_stop(response[0]["generated_text"], answerer_parameters["stop"])


def batch_answer(questions: List[str], contexts: List[str]) -> List[str]:
    if _answerer is None:
        load_answerer()

    assert _answerer is not None

    tokenizer = get_answerer_tokenizer()
    prompts = [
        answerer_prompt.format(question=question, context=context)
        for question, context in zip(questions, contexts)
    ]
    information = {
        "prompt_length": max(len(tokenizer.encode(prompt)) for prompt in prompts)
    }
    parameters = format_parameters_to_local(answerer_parameters, information)

    response = _answerer(prompts, **parameters)

    return [
        cut_on_stop(choice["generated_text"], answerer_parameters["stop"])
        for choice in response
    ]


def batch_answer_same_context(questions: List[str], context: str) -> List[str]:
    if _answerer is None:
        load_answerer()

    assert _answerer is not None

    tokenizer = get_answerer_tokenizer()
    prompts = [
        answerer_prompt.format(question=question, context=context)
        for question in questions
    ]
    information = {
        "prompt_length": max(len(tokenizer.encode(prompt)) for prompt in prompts)
    }
    parameters = format_parameters_to_local(answerer_parameters, information)

    response = _answerer(prompts, **parameters)

    return [
        cut_on_stop(choice["generated_text"], answerer_parameters["stop"])
        for choice in response
    ]


def batch_answer_same_question(question: str, contexts: List[str]) -> List[str]:
    if _answerer is None:
        load_answerer()

    assert _answerer is not None

    tokenizer = get_answerer_tokenizer()
    prompts = [
        answerer_prompt.format(question=question, context=context)
        for context in contexts
    ]
    information = {
        "prompt_length": max(len(tokenizer.encode(prompt)) for prompt in prompts)
    }
    parameters = format_parameters_to_local(answerer_parameters, information)

    response = _answerer(prompts, **parameters)

    return [
        cut_on_stop(choice["generated_text"], answerer_parameters["stop"])
        for choice in response
    ]


def generate(prompt: str) -> str:
    if _generator is None:
        load_generator()

    assert _generator is not None

    tokenizer = get_generator_tokenizer()
    prompt = generator_prompt.format(prompt=prompt)
    information = {"prompt_length": len(tokenizer.encode(prompt))}
    parameters = format_parameters_to_local(generator_parameters, information)

    response = _generator(prompt, **parameters)

    return cut_on_stop(response[0]["generated_text"], generator_parameters["stop"])


def batch_generate(prompts: List[str]) -> List[str]:
    if _generator is None:
        load_generator()

    assert _generator is not None

    tokenizer = get_generator_tokenizer()
    prompts = [generator_prompt.format(prompt=prompt) for prompt in prompts]
    information = {
        "prompt_length": max(len(tokenizer.encode(prompt)) for prompt in prompts)
    }
    parameters = format_parameters_to_local(generator_parameters, information)

    response = _generator(prompts, **parameters)

    return [
        cut_on_stop(choice["generated_text"], generator_parameters["stop"])
        for choice in response
    ]


def entities(text: str) -> List[str]:
    if _ner is None:
        load_ner()

    assert _ner is not None

    entities = _ner(text)
    return [entity["word"] for entity in entities]


def meaning(word: str) -> Dict[str, List[str]]:
    if _dictionary is None:
        load_dictionary()

    assert _dictionary is not None

    return _dictionary.meaning(word)


# XXX: Not working properly
def synonym(word: str) -> List[str]:
    if _dictionary is None:
        load_dictionary()

    assert _dictionary is not None

    return _dictionary.synonym(word)


# XXX: Not working properly
def antonym(word: str) -> List[str]:
    if _dictionary is None:
        load_dictionary()

    assert _dictionary is not None

    return _dictionary.antonym(word)

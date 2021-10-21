from nltk.corpus import wordnet

from typing import List, Dict

import transformers  # type: ignore

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


def load_model():
    """Loads the main model."""

    global _model
    _model = transformers.pipeline("text-generation", model=_model_name, device=_device)


def load_summarizer():
    """Loads the summarizer model."""

    global _summarizer

    if _model is None:
        load_model()

    _summarizer = _model


def load_answerer():
    """Loads the answerer model."""

    global _answerer

    if _model is None:
        load_model()

    _answerer = _model


def load_generator():
    """Loads the generator model."""

    global _generator

    if _model is None:
        load_model()

    _generator = _model


def load_ner():
    """loads the Named Entities Recognizer model."""

    global _ner
    _ner = transformers.pipeline("ner", grouped_entities=True, device=_device)


def get_summarizer_tokenizer():
    """Returns the summarizer tokenizer.

    :return: The summarizer tokenizer.

    """

    if _summarizer is None:
        load_summarizer()

    assert _summarizer is not None

    return _summarizer.tokenizer


def get_answerer_tokenizer():
    """Returns the answerer tokenizer.

    :return: The answerer tokenizer.

    """

    if _answerer is None:
        load_answerer()

    assert _answerer is not None

    return _answerer.tokenizer


def get_generator_tokenizer():
    """Returns the generator tokenizer.

    :return: The generator tokenizer.

    """

    if _generator is None:
        load_generator()

    assert _generator is not None

    return _generator.tokenizer


def get_ner_tokenizer():
    """Returns the Named Entities Recognizer tokenizer.

    :return: The Named Entities Recognizer tokenizer.

    """

    if _ner is None:
        load_ner()

    assert _ner is not None

    return _ner.tokenizer


def summarize(text: str) -> str:
    """Summarizes the text (local mode).

    :param text: The text to summarize.
    :type text: str
    :return: The summarized text.
    :rtype: str

    """

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
    """Summarizes the texts (local mode).

    :param texts: The texts to summarize.
    :type texts: List[str]
    :return: The summarized texts.
    :rtype: List[str]

    """

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
        cut_on_stop(choices[0]["generated_text"], summarizer_parameters["stop"])
        for choices in response
    ]


def answer(question: str, context: str) -> str:
    """Answers the question with the given context (local mode).

    :param question: The question to answer.
    :type question: str
    :param context: The context to answer the question with.
    :type context: str
    :return: The answer.
    :rtype: str

    """

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
    """Answers the questions with the given contexts (local mode).

    :param questions: The questions to answer.
    :type questions: List[str]
    :param contexts: The contexts to answer the questions with.
    :type contexts: List[str]
    :return: The answers.
    :rtype: List[str]

    """

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
        cut_on_stop(choices[0]["generated_text"], answerer_parameters["stop"])
        for choices in response
    ]


def batch_answer_same_context(questions: List[str], context: str) -> List[str]:
    """Answers the questions with the given context (local mode).

    :param questions: The questions to answer.
    :type questions: List[str]
    :param context: The context to answer the questions with.
    :type context: str
    :return: The answers.
    :rtype: List[str]

    """

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
        cut_on_stop(choices[0]["generated_text"], answerer_parameters["stop"])
        for choices in response
    ]


def batch_answer_same_question(question: str, contexts: List[str]) -> List[str]:
    """Answers the question with the given contexts (local mode).

    :param question: The question to answer.
    :type question: str
    :param contexts: The contexts to answer the question with.
    :type contexts: List[str]
    :return: The answers.
    :rtype: List[str]

    """

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
        cut_on_stop(choices[0]["generated_text"], answerer_parameters["stop"])
        for choices in response
    ]


def generate(prompt: str, context: str) -> str:
    """Generates a response for the given prompt and context (local mode).

    :param prompt: The prompt to generate a response for.
    :type prompt: str
    :param context: The context to generate a response for.
    :type context: str
    :return: The generated response.
    :rtype: str

    """

    if _generator is None:
        load_generator()

    assert _generator is not None

    tokenizer = get_generator_tokenizer()
    prompt = generator_prompt.format(prompt=prompt, context=context)
    information = {"prompt_length": len(tokenizer.encode(prompt))}
    parameters = format_parameters_to_local(generator_parameters, information)

    response = _generator(prompt, **parameters)

    return cut_on_stop(response[0]["generated_text"], generator_parameters["stop"])


def batch_generate(prompts: List[str], contexts: List[str]) -> List[str]:
    """Generates responses for the given prompts and contexts (local mode).
    
    :param prompts: The prompts to generate responses for.
    :type prompts: List[str]
    :param contexts: The contexts to generate responses for.
    :type contexts: List[str]
    :return: The generated responses.
    :rtype: List[str]

    """

    if _generator is None:
        load_generator()

    assert _generator is not None

    tokenizer = get_generator_tokenizer()
    prompts = [
        generator_prompt.format(prompt=prompt, context=context)
        for prompt, context in zip(prompts, contexts)
    ]
    information = {
        "prompt_length": max(len(tokenizer.encode(prompt)) for prompt in prompts)
    }
    parameters = format_parameters_to_local(generator_parameters, information)

    response = _generator(prompts, **parameters)

    return [
        cut_on_stop(choices[0]["generated_text"], generator_parameters["stop"])
        for choices in response
    ]


def batch_generate_same_context(prompts: List[str], context: str) -> List[str]:
    """Generates responses for the given prompts and context (local mode).

    :param prompts: The prompts to generate responses for.
    :type prompts: List[str]
    :param context: The context to generate responses for.
    :type context: str
    :return: The generated responses.
    :rtype: List[str]

    """

    if _generator is None:
        load_generator()

    assert _generator is not None

    tokenizer = get_generator_tokenizer()
    prompts = [
        generator_prompt.format(prompt=prompt, context=context) for prompt in prompts
    ]
    information = {
        "prompt_length": max(len(tokenizer.encode(prompt)) for prompt in prompts)
    }
    parameters = format_parameters_to_local(generator_parameters, information)

    response = _generator(prompts, **parameters)

    return [
        cut_on_stop(choices[0]["generated_text"], generator_parameters["stop"])
        for choices in response
    ]


def batch_generate_same_prompt(prompt: str, contexts: List[str]) -> List[str]:
    """Generates responses for the given prompt and contexts (local mode).

    :param prompt: The prompt to generate responses for.
    :type prompt: str
    :param contexts: The contexts to generate responses for.
    :type contexts: List[str]
    :return: The generated responses.
    :rtype: List[str]

    """

    if _generator is None:
        load_generator()

    assert _generator is not None

    tokenizer = get_generator_tokenizer()
    prompts = [
        generator_prompt.format(prompt=prompt, context=context) for context in contexts
    ]
    information = {
        "prompt_length": max(len(tokenizer.encode(prompt)) for prompt in prompts)
    }
    parameters = format_parameters_to_local(generator_parameters, information)

    response = _generator(prompts, **parameters)

    return [
        cut_on_stop(choices[0]["generated_text"], generator_parameters["stop"])
        for choices in response
    ]


def entities(text: str) -> List[str]:
    """Returns the entities in the given text (local mode).

    :param text: The text to get the entities of.
    :type text: str
    :return: The entities in the given text.
    :rtype: List[str]

    """

    if _ner is None:
        load_ner()

    assert _ner is not None

    entities = _ner(text)
    return [entity["word"] for entity in entities]


def meaning(word: str) -> Dict[str, List[str]]:
    """Returns the meanings of the given word (local mode).

    :param word: The word to get the meanings of.
    :type word: str
    :return: The meanings of the given word.
    :rtype: Dict[str, List[str]]

    """

    syns = wordnet.synsets(word)

    return {
        syn.lemmas()[0].name(): syn.definition()
        for syn in syns
        if len(syn.lemmas()) > 0
    }


def synonym(word: str) -> List[str]:
    """Returns the synonyms of the given word (local mode).

    :param word: The word to get the synonyms of.
    :type word: str
    :return: The synonyms of the given word.
    :rtype: List[str]

    """

    syns = wordnet.synsets(word)

    return list(set([lemma.name() for syn in syns for lemma in syn.lemmas()]))


def antonym(word: str) -> List[str]:
    """Returns the antonyms of the given word (local mode).

    :param word: The word to get the antonyms of.
    :type word: str
    :return: The antonyms of the given word.
    :rtype: List[str]

    """

    syns = wordnet.synsets(word)

    return list(
        set(
            [
                lemma.antonyms()[0].name()
                for syn in syns
                for lemma in syn.lemmas()
                if len(lemma.antonyms()) > 0
            ]
        )
    )

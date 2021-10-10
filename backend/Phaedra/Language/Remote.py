from typing import List

import openai
import transformers  # type: ignore

from Phaedra.Language.Base import (
    summarizer_parameters,
    summarizer_prompt,
    answerer_parameters,
    answerer_prompt,
    generator_parameters,
    generator_prompt,
)

_tokenizer = transformers.AutoTokenizer.from_pretrained("gpt2")


def get_summarizer_tokenizer():
    return _tokenizer


def get_answerer_tokenizer():
    return _tokenizer


def get_generator_tokenizer():
    return _tokenizer


def summarize(text: str) -> str:
    parameters = summarizer_parameters
    prompt = summarizer_prompt.format(text=text)

    response = openai.Completion.create(**parameters, prompt=prompt)

    return response["choices"][0]["text"]


def batch_summarize(texts: List[str]) -> List[str]:
    parameters = summarizer_parameters
    prompts = [summarizer_prompt.format(text=text) for text in texts]

    response = openai.Completion.create(**parameters, prompt=prompts)

    return [choice["text"] for choice in response["choices"]]


def answer(question: str, context: str) -> str:
    parameters = answerer_parameters
    prompt = answerer_prompt.format(question=question, context=context)

    response = openai.Completion.create(**parameters, prompt=prompt)

    return response["choices"][0]["text"]


def batch_answer(questions: List[str], contexts: List[str]) -> List[str]:
    parameters = answerer_parameters
    prompts = [
        answerer_prompt.format(question=question, context=context)
        for question, context in zip(questions, contexts)
    ]

    response = openai.Completion.create(**parameters, prompt=prompts)

    return [choice["text"] for choice in response["choices"]]


def batch_answer_same_context(questions: List[str], context: str) -> List[str]:
    parameters = answerer_parameters
    prompts = [
        answerer_prompt.format(question=question, context=context)
        for question in questions
    ]

    response = openai.Completion.create(**parameters, prompt=prompts)

    return [choice["text"] for choice in response["choices"]]


def batch_answer_same_question(question: str, contexts: List[str]) -> List[str]:
    parameters = answerer_parameters
    prompts = [
        answerer_prompt.format(question=question, context=context)
        for context in contexts
    ]

    response = openai.Completion.create(**parameters, prompt=prompts)

    return [choice["text"] for choice in response["choices"]]


def generate(prompt: str) -> str:
    parameters = generator_parameters
    prompt = generator_prompt.format(prompt=prompt)

    response = openai.Completion.create(**parameters, prompt=prompt)

    return response["choices"][0]["text"]


def batch_generate(prompts: List[str]) -> List[str]:
    parameters = generator_parameters
    prompts = [generator_prompt.format(prompt=prompt) for prompt in prompts]

    response = openai.Completion.create(**parameters, prompt=prompts)

    return [choice["text"] for choice in response["choices"]]

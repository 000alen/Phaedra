from typing import List

import openai
import transformers  # type: ignore

from Phaedra.Language.Base import summarize_prompt, answer_prompt

_tokenizer = transformers.AutoTokenizer.from_pretrained("gpt2")
summarizer_tokenizer = _tokenizer


def get_summarizer_tokenizer():
    return summarizer_tokenizer


answerer_tokenizer = _tokenizer


def get_answerer_tokenizer():
    return answerer_tokenizer


generator_tokenizer = _tokenizer


def get_generator_tokenizer():
    return generator_tokenizer


def summarize(text: str) -> str:
    prompt = summarize_prompt.format(text=text)

    response = openai.Completion.create(
        engine="davinci",
        prompt=prompt,
        temperature=0.5,
        max_tokens=100,
        top_p=1,
        frequency_penalty=0.2,
        presence_penalty=0,
        stop=['"""'],
    )

    return response["choices"][0]["text"]


def batch_summarize(texts: List[str]) -> List[str]:
    raise NotImplementedError


def answer(question: str, context: str) -> str:
    prompt = answer_prompt.format(question=question, context=context)
    response = openai.Completion.create(
        engine="davinci",
        prompt=prompt,
        temperature=0.75,
        max_tokens=120,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
        stop=['"""'],
    )

    return response["choices"][0]["text"]


def batch_answer(questions: List[str], contexts: List[str]) -> List[str]:
    raise NotImplementedError


def batch_answer_same_context(questions: List[str], context: str) -> List[str]:
    raise NotImplementedError


def batch_answer_same_question(question: str, contexts: List[str]) -> List[str]:
    raise NotImplementedError


def generate(prompt: str) -> str:
    raise NotImplementedError


def batch_generate(prompts: List[str]) -> List[str]:
    raise NotImplementedError

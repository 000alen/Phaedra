import json
from typing import List

import openai
import transformers  # type: ignore

_tokenizer = transformers.AutoTokenizer.from_pretrained("gpt2")
summarizer_tokenizer = _tokenizer
answerer_tokenizer = _tokenizer
generator_tokenizer = _tokenizer

prompts = json.load(open("prompts.json"))
summarize_prompt = prompts["summarize"]


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
    raise NotImplementedError


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

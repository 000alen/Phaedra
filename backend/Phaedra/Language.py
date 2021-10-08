"""
Phaedra's Language operations module.
"""


from typing import List, Dict

import transformers  # type: ignore
import logging

from PyDictionary import PyDictionary  # type: ignore
import openai

__all__ = (
    "summarizer",
    "load_summarizer",
    "tokenizer",
    "answerer",
    "load_answerer",
    "generator"
    "load_generator",
    "ner",
    "load_ner",
    "dictionary",
    "load_dictionary",
    "summarize",
    "batch_summarize",
    "answer",
    "batch_answer",
    "batch_answer_same_context",
    "batch_answer_same_question",
    "entities",
    "meaning",
    "synonym",
    "antonym"
)

DEVICE = 0

summarizer = None
tokenizer = None


def load_summarizer():
    global summarizer
    summarizer = transformers.pipeline("summarization", device=DEVICE)
    tokenizer = summarizer.tokenizer


answerer = None


def load_answerer():
    global answerer
    answerer = transformers.pipeline("question-answering", device=DEVICE)


generator = None


def load_generator():
    global generator
    generator = transformers.pipeline("text-generation", device=DEVICE)


ner = None


def load_ner():
    global ner
    ner = transformers.pipeline("ner", grouped_entities=True, device=DEVICE)


dictionary = None


def load_dictionary():
    global dictionary
    dictionary = PyDictionary()


def summarize(text: str) -> str:
    if summarizer is None:
        load_summarizer()

    logging.info(f"Summarizing: '{text[:5]}...'")
    return summarizer(text)[0]["summary_text"]


def summarize_openai(text: str) -> str:
    prompt_template = "My second grader asked me what this passage means:\n\"\"\"\n{text}\n\"\"\"\nI rephrase it for him, in plain language a second grader can understand:\n\"\"\"\n"
    prompt = prompt_template.format(text=text)

    response = openai.Completion.create(
        engine="davinci",
        prompt=prompt,
        temperature=0.5,
        max_tokens=100,
        top_p=1,
        frequency_penalty=0.2,
        presence_penalty=0,
        stop=["\"\"\""]
    )

    return response["choices"][0]["text"]


def batch_summarize(texts: List[str]) -> List[str]:
    if summarizer is None:
        load_summarizer()

    logging.info(f"Batch summarizing: {len(texts)}")
    results = summarizer(texts)
    return [result["summary_text"] for result in results]


def answer(question: str, context: str) -> str:
    if answerer is None:
        load_answerer()

    logging.info(f"Questioning: '{question[:5]}...', '{context[:5]}...'")
    return answerer(question=question, context=context)["answer"]


def answer_openai(question: str, context: str) -> str:
    raise NotImplementedError


def batch_answer(questions: List[str], contexts: List[str]) -> List[str]:
    if answerer is None:
        load_answerer()

    logging.info(f"Batch questioning: {len(questions)}")
    results = answerer(question=questions, context=contexts)
    return [result["answer"] for result in results]


def batch_answer_same_context(questions: List[str], context: str) -> List[str]:
    if answerer is None:
        load_answerer()

    logging.info(f"Batch questioning (same context): {len(questions)}")
    return batch_answer(questions, [context] * len(questions))


def batch_answer_same_question(question: str, contexts: List[str]) -> List[str]:
    if answerer is None:
        load_answerer()

    logging.info(f"Batch questioning (same question): {len(contexts)}")
    return batch_answer([question] * len(contexts), contexts)


def generate(prompt: str) -> str:
    if generator is None:
        load_generator()

    logging.info(f"Generating: '{prompt[:5]}...'")
    return generator(prompt, return_full_text=False, temperature=0.4, max_length=1000)[0]["generated_text"]


def generate_openai(prompt: str) -> str:
    raise NotImplementedError


def batch_generate(prompts: List[str]) -> List[str]:
    if generator is None:
        load_generator()

    logging.info(f"Batch generating: {len(prompts)}")
    results = generator(prompts)
    return [result["generated_text"] for result in results]


# XXX: Not working properly
def entities(text: str) -> List[str]:
    if ner is None:
        load_ner()

    logging.info(f"Extracting NE: '{text[:5]}...'")
    entities = ner(text)
    return [entity["word"] for entity in entities]


def meaning(word: str) -> Dict[str, List[str]]:
    if dictionary is None:
        load_dictionary()

    return dictionary.meaning(word)


# XXX: Not working properly
def synonym(word: str) -> List[str]:
    if dictionary is None:
        load_dictionary()

    return dictionary.synonym(word)


# XXX: Not working properly
def antonym(word: str) -> List[str]:
    if dictionary is None:
        load_dictionary()

    return dictionary.antonym(word)

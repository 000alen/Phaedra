"""
Phaedra's Language operations module.
"""


from typing import List, Dict

import transformers # type: ignore
import logging

from PyDictionary import PyDictionary # type: ignore

__all__ = (
    "summarizer",
    "tokenizer",
    "answerer",
    "ner",
    "dictionary",
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

summarizer = transformers.pipeline("summarization", device=DEVICE)
tokenizer = summarizer.tokenizer
answerer = transformers.pipeline("question-answering", device=DEVICE)
generator = transformers.pipeline("text-generation", device=DEVICE)
ner = transformers.pipeline("ner", grouped_entities=True, device=DEVICE)
dictionary = PyDictionary()


def summarize(text: str) -> str:
    logging.info(f"Summarizing: '{text[:5]}...'")
    return summarizer(text)[0]["summary_text"]


def batch_summarize(texts: List[str]) -> List[str]:
    logging.info(f"Batch summarizing: {len(texts)}")
    results = summarizer(texts)
    return [result["summary_text"] for result in results]


def answer(question: str, context: str) -> str:
    logging.info(f"Questioning: '{question[:5]}...', '{context[:5]}...'")
    return answerer(question=question, context=context)["answer"]


def batch_answer(questions: List[str], contexts: List[str]) -> List[str]:
    logging.info(f"Batch questioning: {len(questions)}")
    results = answerer(question=questions, context=contexts)
    return [result["answer"] for result in results]


def batch_answer_same_context(questions: List[str], context: str) -> List[str]:
    logging.info(f"Batch questioning (same context): {len(questions)}")
    return batch_answer(questions, [context] * len(questions))


def batch_answer_same_question(question: str, contexts: List[str]) -> List[str]:
    logging.info(f"Batch questioning (same question): {len(contexts)}")
    return batch_answer([question] * len(contexts), contexts)


def generate(prompt: str) -> str:
    logging.info(f"Generating: '{prompt[:5]}...'")
    return generator(prompt, return_full_text=False, temperature=0.4, max_length=1000)[0]["generated_text"]


def batch_generate(prompts: List[str]) -> List[str]:
    logging.info(f"Batch generating: {len(prompts)}")
    results = generator(prompts)
    return [result["generated_text"] for result in results]


# XXX: Not working properly
def entities(text: str) -> List[str]:
    logging.info(f"Extracting NE: '{text[:5]}...'")
    entities = ner(text)
    return [entity["word"] for entity in entities]


def meaning(word: str) -> Dict[str, List[str]]:
    return dictionary.meaning(word)


# XXX: Not working properly
def synonym(word: str) -> List[str]:
    return dictionary.synonym(word)


# XXX: Not working properly
def antonym(word: str) -> List[str]:
    return dictionary.antonym(word)

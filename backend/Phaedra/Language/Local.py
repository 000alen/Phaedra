from typing import List, Dict

import transformers  # type: ignore
import logging

from PyDictionary import PyDictionary  # type: ignore

DEVICE = 0

summarizer = None
summarizer_tokenizer = None


def load_summarizer():
    global summarizer, summarizer_tokenizer
    summarizer = transformers.pipeline("summarization", device=DEVICE)
    summarizer_tokenizer = summarizer.tokenizer


def get_summarizer_tokenizer():
    if summarizer_tokenizer is None:
        load_summarizer()

    assert summarizer_tokenizer is not None

    return summarizer_tokenizer


answerer = None
answerer_tokenizer = None


def load_answerer():
    global answerer, answerer_tokenizer
    answerer = transformers.pipeline("question-answering", device=DEVICE)
    answerer_tokenizer = answerer.tokenizer


def get_answerer_tokenizer():
    if answerer_tokenizer is None:
        load_answerer()

    assert answerer_tokenizer is not None

    return answerer_tokenizer


generator = None
generator_tokenizer = None


def load_generator():
    global generator, generator_tokenizer
    generator = transformers.pipeline("text-generation", device=DEVICE)
    generator_tokenizer = generator.tokenizer


def get_generator_tokenizer():
    if generator_tokenizer is None:
        load_generator()

    assert generator_tokenizer is not None

    return generator_tokenizer


ner = None
ner_tokenizer = None


def load_ner():
    global ner, ner_tokenizer
    ner = transformers.pipeline("ner", grouped_entities=True, device=DEVICE)
    ner_tokenizer = ner.tokenizer


def get_ner_tokenizer():
    if ner_tokenizer is None:
        load_ner()

    assert ner_tokenizer is not None

    return ner_tokenizer


dictionary = None


def load_dictionary():
    global dictionary
    dictionary = PyDictionary()


def summarize(text: str) -> str:
    if summarizer is None:
        load_summarizer()

    logging.info(f"Summarizing: '{text[:5]}...'")

    assert summarizer is not None

    return summarizer(text)[0]["summary_text"]


def batch_summarize(texts: List[str]) -> List[str]:
    if summarizer is None:
        load_summarizer()

    logging.info(f"Batch summarizing: {len(texts)}")

    assert summarizer is not None

    results = summarizer(texts)
    return [result["summary_text"] for result in results]


def answer(question: str, context: str) -> str:
    if answerer is None:
        load_answerer()

    logging.info(f"Questioning: '{question[:5]}...', '{context[:5]}...'")

    assert answerer is not None

    return answerer(question=question, context=context)["answer"]


def batch_answer(questions: List[str], contexts: List[str]) -> List[str]:
    if answerer is None:
        load_answerer()

    logging.info(f"Batch questioning: {len(questions)}")

    assert answerer is not None

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

    assert generator is not None

    return generator(prompt, return_full_text=False, temperature=0.4, max_length=1000)[
        0
    ]["generated_text"]


def batch_generate(prompts: List[str]) -> List[str]:
    if generator is None:
        load_generator()

    logging.info(f"Batch generating: {len(prompts)}")

    assert generator is not None

    results = generator(prompts)
    return [result["generated_text"] for result in results]


def entities(text: str) -> List[str]:
    if ner is None:
        load_ner()

    logging.info(f"Extracting NE: '{text[:5]}...'")

    assert ner is not None

    entities = ner(text)
    return [entity["word"] for entity in entities]


def meaning(word: str) -> Dict[str, List[str]]:
    if dictionary is None:
        load_dictionary()

    assert dictionary is not None

    return dictionary.meaning(word)


# XXX: Not working properly
def synonym(word: str) -> List[str]:
    if dictionary is None:
        load_dictionary()

    assert dictionary is not None

    return dictionary.synonym(word)


# XXX: Not working properly
def antonym(word: str) -> List[str]:
    if dictionary is None:
        load_dictionary()

    assert dictionary is not None

    return dictionary.antonym(word)

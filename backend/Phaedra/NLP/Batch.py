import logging
import torch

from typing import List

from Phaedra.NLP import DEVICE, MODEL_NAME, model, tokenizer

BATCH_SIZES = {
    "t5-large": 1,
    "t5-base": 8,
    "t5-small": 16
}
BATCH_SIZE = BATCH_SIZES[MODEL_NAME]

logging.info(f"Batch size: {BATCH_SIZE}")


def batch_summarize_text(texts: List[str], max_length=1000, min_length=100, do_sample=False) -> List[str]:
    def chunks(iterator, n):
        for i in range(0, len(iterator), n):
            yield iterator[i:i + n]

    logging.info(f"Batch summarizing: {len(texts)}")

    predictions = []
    for texts_chunk in chunks(texts, BATCH_SIZE):
        logging.info(f"\tchunk: {len(texts_chunk)}")
        texts_chunk = [f"summarize: {text}" for text in texts_chunk]
        encoding = tokenizer(texts_chunk, padding=True,
                             return_tensors="pt").to(DEVICE)
        generated_ids = model.generate(
            input_ids=encoding["input_ids"],
            max_length=max_length,
            min_length=min_length,
            do_sample=do_sample,
            num_beams=4,
            no_repeat_ngram_size=2,
            early_stopping=True
        )
        predictions.extend([tokenizer.decode(generated_id, skip_special_tokens=True,
                           clean_up_tokenization_spaces=True) for generated_id in generated_ids])
    return predictions


def batch_question_text(questions: List[str], contexts: List[str]) -> List[str]:
    def chunks(iterator, n):
        for i in range(0, len(iterator), n):
            yield iterator[i:i + n]

    logging.info(f"Batch questioning: {len(questions)}")

    predictions = []
    for questions_chunk in chunks(questions, BATCH_SIZE):
        logging.info(f"\tchunk: {len(questions_chunk)}")
        encoding = tokenizer(
            questions_chunk,
            contexts,
            max_length=396,
            padding="max_length",
            truncation="only_second",
            return_attention_mask=True,
            add_special_tokens=True,
            return_tensors="pt"
        ).to(DEVICE)
        generated_ids = model.generate(
            input_ids=encoding["input_ids"],
            attention_mask=encoding["attention_mask"],
            num_beams=1,
            max_length=100,
            repetition_penalty=2.5,
            length_penalty=1.0,
            early_stopping=True,
            use_cache=True
        )
        predictions.extend([tokenizer.decode(generated_id, skip_special_tokens=True,
                           clean_up_tokenization_spaces=True) for generated_id in generated_ids])
    return predictions


def batch_question_text_same_context(questions: List[str], context: str) -> List[str]:
    def chunks(iterator, n):
        for i in range(0, len(iterator), n):
            yield iterator[i:i + n]

    logging.info(f"Batch questioning (same context): {len(questions)}")

    predictions = []
    for questions_chunk in chunks(questions, BATCH_SIZE):
        logging.info(f"\tchunk: {len(questions_chunk)}")

        encoding = tokenizer(
            questions_chunk,
            [context] * len(questions),
            max_length=396,
            padding="max_length",
            truncation="only_second",
            return_attention_mask=True,
            add_special_tokens=True,
            return_tensors="pt"
        ).to(DEVICE)
        generated_ids = model.generate(
            input_ids=encoding["input_ids"],
            attention_mask=encoding["attention_mask"],
            num_beams=1,
            max_length=100,
            repetition_penalty=2.5,
            length_penalty=1.0,
            early_stopping=True,
            use_cache=True
        )
        predictions.extend([tokenizer.decode(generated_id, skip_special_tokens=True,
                           clean_up_tokenization_spaces=True) for generated_id in generated_ids])
    return predictions


def batch_question_text_same_question(question: str, contexts: List[str]) -> List[str]:
    def chunks(iterator, n):
        for i in range(0, len(iterator), n):
            yield iterator[i:i + n]

    logging.info(f"Batch questioning (same question): {len(contexts)}")

    predictions = []
    for contexts_chunk in chunks(contexts, BATCH_SIZE):
        logging.info(f"\tchunk: {len(contexts_chunk)}")

        _input_ids = []
        _attention_mask = []

        for context in contexts_chunk:
            encoding = tokenizer(
                question,
                context,
                max_length=396,
                padding="max_length",
                truncation="only_second",
                return_attention_mask=True,
                add_special_tokens=True,
                return_tensors="pt"
            )
            _input_ids.append(encoding["input_ids"])
            _attention_mask.append(encoding["attention_mask"])

        input_ids = torch.cat(_input_ids).to(DEVICE)
        attention_mask = torch.cat(_attention_mask).to(DEVICE)

        generated_ids = model.generate(
            input_ids=input_ids,
            attention_mask=attention_mask,
            num_beams=1,
            max_length=100,
            repetition_penalty=2.5,
            length_penalty=1.0,
            early_stopping=True,
            use_cache=True
        )
        predictions.extend([tokenizer.decode(generated_id, skip_special_tokens=True,
                           clean_up_tokenization_spaces=True) for generated_id in generated_ids])
    return predictions


# XXX
def batch_check_linguistic_acceptability(texts: List[str]) -> List[bool]:
    def chunks(iterator, n):
        for i in range(0, len(iterator), n):
            yield iterator[i:i + n]

    logging.info(f"Batch checking linguistic acceptability: {len(texts)}")

    predictions = []
    for texts_chunk in chunks(texts, BATCH_SIZE):
        logging.info(f"\tchunk: {len(texts_chunk)}")

        texts_chunk = [f"cola sentence: {text}" for text in texts_chunk]
        encoding = tokenizer(texts_chunk, padding=True,
                             return_tensors="pt").to(DEVICE)
        generated_ids = model.generate(input_ids=encoding["input_ids"])
        predictions.extend([tokenizer.decode(generated_id, skip_special_tokens=True,
                                             clean_up_tokenization_spaces=True) for generated_id in generated_ids])
    return [True if prediction == "acceptable" else False for prediction in predictions]


def batch_get_sentence_similarity(sentences1: List[str], sentences2: List[str]) -> List[float]:
    def chunks(iterator, n):
        for i in range(0, len(iterator), n):
            yield iterator[i:i + n]

    logging.info(
        f"Batch checking sentence similarity: {len(sentences1)}, {len(sentences2)}")

    tasks = [f"stsb sentence1: {sentences1[i]} sentence2: {sentences2[i]}" for i in range(
        len(sentences1))]

    predictions = []
    for tasks_chunk in chunks(tasks, BATCH_SIZE):
        logging.info(f"\tchunk: {len(tasks_chunk)}")

        encoding = tokenizer(tasks_chunk, padding=True,
                             return_tensors="pt").to(DEVICE)
        generated_ids = model.generate(input_ids=encoding["input_ids"])
        predictions.extend([tokenizer.decode(generated_id, skip_special_tokens=True,
                                             clean_up_tokenization_spaces=True) for generated_id in generated_ids])
    return [float(prediction) for prediction in predictions]

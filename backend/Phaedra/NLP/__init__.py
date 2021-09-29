import transformers
import nltk
import torch
import logging

from typing import List

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

logging.info(f"Running on: {DEVICE}")

print(f"Running on {DEVICE}")

MODEL_NAME = "t5-base"

logging.info(f"Loading model: {MODEL_NAME}")

tokenizer = transformers.T5Tokenizer.from_pretrained(MODEL_NAME)
model = transformers.T5ForConditionalGeneration.from_pretrained(
    MODEL_NAME).to(DEVICE)


def summarize_text(text: str, max_length=1000, min_length=100, do_sample=False) -> str:
    logging.info(f"Summarizing: '{text[:5]}...'")

    encoding = tokenizer(f"summarize: {text}", return_tensors="pt").to(DEVICE)
    generated_ids = model.generate(
        input_ids=encoding["input_ids"],
        max_length=max_length,
        min_length=min_length,
        do_sample=do_sample,
        num_beams=4,
        no_repeat_ngram_size=2,
        early_stopping=True
    )
    predictions = [tokenizer.decode(generated_id, skip_special_tokens=True,
                                    clean_up_tokenization_spaces=True) for generated_id in generated_ids]
    return "".join(predictions)


def question_text(question: str, context: str) -> str:
    logging.info(f"Questioning: '{question[:5]}...', '{context[:5]}...'")
    encoding = tokenizer(
        question,
        context,
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
    predictions = [tokenizer.decode(generated_id, skip_special_tokens=True,
                                    clean_up_tokenization_spaces=True) for generated_id in generated_ids]
    return "".join(predictions)


# XXX
def check_linguistic_acceptability(text: str) -> bool:
    logging.info(f"Checking linguistic acceptability: '{text[:5]}...'")

    encoding = tokenizer(
        f"cola sentence: {text}", return_tensors="pt").to(DEVICE)
    generated_ids = model.generate(input_ids=encoding["input_ids"])
    predictions = [tokenizer.decode(generated_id, skip_special_tokens=True,
                                    clean_up_tokenization_spaces=True) for generated_id in generated_ids]
    predictions = "".join(predictions)
    return True if predictions == "acceptable" else False


def get_sentence_similarity(sentence1: str, sentence2: str) -> float:
    logging.info(
        f"Checking sentence similarity: '{sentence1[:5]}...', '{sentence2[:5]}...'")

    encoding = tokenizer(
        f"stsb sentence1: {sentence1} sentence2: {sentence2}", return_tensors="pt").to(DEVICE)
    generated_ids = model.generate(input_ids=encoding["input_ids"])
    predictions = [tokenizer.decode(generated_id, skip_special_tokens=True,
                                    clean_up_tokenization_spaces=True) for generated_id in generated_ids]
    predictions = "".join(predictions)
    return float(predictions)


def extract_named_entities(text: str) -> List[str]:
    logging.info(f"Extracting NE: '{text[:5]}...'")
    words = nltk.word_tokenize(text)
    tags = nltk.pos_tag(words)
    tree = nltk.ne_chunk(tags, binary=True)
    return list(set(
        " ".join(i[0] for i in branch)
        for branch in tree
        if hasattr(branch, "label") and branch.label() == "NE"
    ))


def capitalize_text(text: str) -> str:
    sentences = nltk.sent_tokenize(text)
    return " ".join(sentence.capitalize() for sentence in sentences)

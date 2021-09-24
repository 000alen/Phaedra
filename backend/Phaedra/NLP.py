import transformers
import nltk
import torch
import json

from vocabulary.vocabulary import Vocabulary

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"Running on: {DEVICE}")

MODEL_NAME = "t5-small"

BATCH_SIZES = {
    "t5-large": 1,
    "t5-base": 8,
    "t5-small": 16
}
BATCH_SIZE = BATCH_SIZES[MODEL_NAME]

print(f"Batch size: {BATCH_SIZE}")

print(f"Loading model: {MODEL_NAME}")

tokenizer = transformers.T5Tokenizer.from_pretrained(MODEL_NAME)
model = transformers.T5ForConditionalGeneration.from_pretrained(
    MODEL_NAME).to(DEVICE)

def summarize_text(text: str, max_length=1000, min_length=100, do_sample=False) -> str:
    print(f"Summarizing: '{text[:5]}...'")

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


def batch_summarize_text(texts: list[str], max_length=1000, min_length=100, do_sample=False) -> list[str]:
    def chunks(iterator, n):
        for i in range(0, len(iterator), n):
            yield iterator[i:i + n]

    print(f"Batch summarizing: {len(texts)}")

    predictions = []
    for texts_chunk in chunks(texts, BATCH_SIZE):
        print(f"\tchunk: {len(texts_chunk)}")
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


def question_text(question: str, context: str) -> str:
    print(f"Questioning: '{question[:5]}...', '{context[:5]}'")
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


def batch_question_text(questions: list[str], contexts: list[str]) -> list[str]:
    def chunks(iterator, n):
        for i in range(0, len(iterator), n):
            yield iterator[i:i + n]

    print(f"Batch questioning: {len(questions)}")

    predictions = []
    for questions_chunk in chunks(questions, BATCH_SIZE):
        print(f"\tchunk: {len(questions_chunk)}")
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


def batch_question_text_same_context(questions: list[str], context: str) -> list[str]:
    def chunks(iterator, n):
        for i in range(0, len(iterator), n):
            yield iterator[i:i + n]

    print(f"Batch questioning (same context): {len(questions)}")

    predictions = []
    for questions_chunk in chunks(questions, BATCH_SIZE):
        print(f"\tchunk: {len(questions_chunk)}")

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


def batch_question_text_same_question(question: str, contexts: list[str]) -> list[str]:
    def chunks(iterator, n):
        for i in range(0, len(iterator), n):
            yield iterator[i:i + n]

    print(f"Batch questioning (same question): {len(contexts)}")

    predictions = []
    for contexts_chunk in chunks(contexts, BATCH_SIZE):
        print(f"\tchunk: {len(contexts_chunk)}")

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
def check_linguistic_acceptability(text: str) -> bool:
    print(f"Checking linguistic acceptability: '{text[:5]}...'")
    
    encoding = tokenizer(f"cola sentence: {text}", return_tensors="pt").to(DEVICE)
    generated_ids = model.generate(input_ids=encoding["input_ids"])
    predictions = [tokenizer.decode(generated_id, skip_special_tokens=True,
                                    clean_up_tokenization_spaces=True) for generated_id in generated_ids]    
    predictions = "".join(predictions)
    return True if predictions == "acceptable" else False


# XXX
def batch_check_linguistic_acceptability(texts: list[str]) -> list[bool]:
    def chunks(iterator, n):
        for i in range(0, len(iterator), n):
            yield iterator[i:i + n]

    print(f"Batch checking linguistic acceptability: {len(texts)}")

    predictions = []
    for texts_chunk in chunks(texts, BATCH_SIZE):
        print(f"\tchunk: {len(texts_chunk)}")

        texts_chunk = [f"cola sentence: {text}" for text in texts_chunk]
        encoding = tokenizer(texts_chunk, padding=True, return_tensors="pt").to(DEVICE)
        generated_ids = model.generate(input_ids=encoding["input_ids"])
        predictions.extend([tokenizer.decode(generated_id, skip_special_tokens=True,
                                        clean_up_tokenization_spaces=True) for generated_id in generated_ids])   
    return [True if prediction == "acceptable" else False for prediction in predictions]


def get_sentence_similarity(sentence1: str, sentence2: str) -> float:
    print(f"Checking sentence similarity: '{sentence1[:5]}...', '{sentence2[:5]}...'")
    
    encoding = tokenizer(f"stsb sentence1: {sentence1} sentence2: {sentence2}", return_tensors="pt").to(DEVICE)
    generated_ids = model.generate(input_ids=encoding["input_ids"])
    predictions = [tokenizer.decode(generated_id, skip_special_tokens=True,
                                    clean_up_tokenization_spaces=True) for generated_id in generated_ids]    
    predictions = "".join(predictions)
    return float(predictions)


def batch_get_sentence_similarity(sentences1: list[str], sentences2: list[str]) -> list[float]:
    def chunks(iterator, n):
        for i in range(0, len(iterator), n):
            yield iterator[i:i + n]

    print(f"Batch checking sentence similarity: {len(sentences1)}, {len(sentences2)}")

    tasks = [f"stsb sentence1: {sentences1[i]} sentence2: {sentences2[i]}" for i in range(len(sentences1))]

    predictions = []
    for tasks_chunk in chunks(tasks, BATCH_SIZE):
        print(f"\tchunk: {len(tasks_chunk)}")

        encoding = tokenizer(tasks_chunk, padding=True, return_tensors="pt").to(DEVICE)
        generated_ids = model.generate(input_ids=encoding["input_ids"])
        predictions.extend([tokenizer.decode(generated_id, skip_special_tokens=True,
                                        clean_up_tokenization_spaces=True) for generated_id in generated_ids]) 
    return [float(prediction) for prediction in predictions]


def extract_named_entities(text: str) -> set[str]:
    print(f"Extracting NE: '{text[:5]}...'")
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


def meaning(word: str) -> list[str]:
    return [_["text"] for _ in json.loads(Vocabulary.meaning(word))]


def synonym(word: str) -> list[str]:
    return [_["text"] for _ in json.loads(Vocabulary.synonym(word))]


def antonym(word: str) -> list[str]:
    return [_["text"] for _ in json.loads(Vocabulary.antonym(word))]


def usage_example(word: str) -> list[str]:
    return [_["text"] for _ in json.loads(Vocabulary.usage_example(word))]


import OpenAI from "openai-api";
import { v4 as uuidv4 } from "uuid";

import {
  makePage,
  makeReference,
  makeSource,
  Notebook
} from "../Notebook/Future";
import { INotebook } from "../Notebook/types";
import { getSettings } from "../settings";
import { chop, extractTextToPagesFromPdf, zip } from "./Text";

const summaryParameters = {
  max_tokens: 256,
  temperature: 0.5,
  top_p: 1,
  frequency_penalty: 0.2,
  presence_penalty: 0,
  stop: ['"""'],
  engine: "davinci"
};

const questionParameters = {
  max_tokens: 128,
  temperature: 0.75,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  stop: ['"""'],
  engine: "davinci"
};

const generationParameters = {
  max_tokens: 256,
  temperature: 0.5,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  stop: ['"""'],
  engine: "davinci"
};

export function summaryPrompt(text: string) {
  return `Text: """${text}"""\n\nSummary: """`;
}

export function questionPrompt(question: string, context: string) {
  return `Context: """${context}"""\n\nQuestion: """${question}"""\n\nAnswer: """`;
}

export function generationPrompt(prompt: string, context: string) {
  return `Context: """${context}"""\n\nPrompt: """${prompt}"""\n\nAnswer: """`;
}

export async function summary(text: string): Promise<string> {
  const settings = await getSettings();

  const openAi = new OpenAI(settings.key);

  const gptResponse = await openAi.complete({
    ...summaryParameters,
    prompt: summaryPrompt(text)
  });

  return gptResponse.data.choices[0].text;
}

export async function batchSummary(texts: string[]): Promise<string[]> {
  return Promise.all(texts.map(summary));
}

export async function question(
  question: string,
  context: string
): Promise<string> {
  const settings = await getSettings();

  const openAi = new OpenAI(settings.key);

  const gptResponse = await openAi.complete({
    ...questionParameters,
    prompt: questionPrompt(question, context)
  });

  return gptResponse.data.choices[0].text;
}

export async function batchQuestion(
  questions: string[],
  contexts: string[]
): Promise<string[]> {
  return Promise.all(
    questions.map((_question, index) => question(_question, contexts[index]))
  );
}

export async function batchQuestionSameQuestion(
  _question: string,
  contexts: string[]
): Promise<string[]> {
  return Promise.all(contexts.map((context) => question(_question, context)));
}

export async function batchQuestionSameContext(
  questions: string[],
  context: string
): Promise<string[]> {
  return Promise.all(
    questions.map((_question) => question(_question, context))
  );
}

export async function generation(
  prompt: string,
  context: string
): Promise<string> {
  const settings = await getSettings();

  const openAi = new OpenAI(settings.key);

  const gptResponse = await openAi.complete({
    ...generationParameters,
    prompt: generationPrompt(prompt, context)
  });

  return gptResponse.data.choices[0].text;
}

export async function batchGeneration(
  prompts: string[],
  contexts: string[]
): Promise<string[]> {
  return Promise.all(
    prompts.map((prompt, index) => generation(prompt, contexts[index]))
  );
}

export async function batchGenerationSamePrompt(
  prompt: string,
  contexts: string[]
): Promise<string[]> {
  return Promise.all(contexts.map((context) => generation(prompt, context)));
}

export async function batchGenerationSameContext(
  prompts: string[],
  context: string
): Promise<string[]> {
  return Promise.all(prompts.map((prompt) => generation(prompt, context)));
}

export async function notebookFromPDF(
  buffer: Buffer,
  path: string
): Promise<INotebook> {
  const notebook = new Notebook({});
  const texts = await extractTextToPagesFromPdf(buffer);
  const [indexes, contents] = await chop(texts, 512);
  const summaries = await batchSummary(contents);
  for (const [index, content, summary] of zip(indexes, contents, summaries)) {
    const sourceId = uuidv4();
    const pageId = uuidv4();
    notebook.addSource(
      makeSource({
        id: sourceId,
        title: `${path} (${index})`,
        type: "pdf",
        content: content,
        path: path,
        index: index
      })
    );
    notebook.addPage(makePage({ id: pageId }));
    notebook.addPageReference(
      pageId,
      makeReference({ title: `${path} (${index})`, sourceId })
    );
    notebook.editPageContent(pageId, { insert: { pre: `${summary}\n\n` } });
  }
  return notebook.JSON();
}

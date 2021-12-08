import { getSettings } from "../electron";
import OpenAI from "openai-api";

const summaryParameters = {
  max_tokens: 256,
  temperature: 0.5,
  top_p: 1,
  frequency_penalty: 0.2,
  presence_penalty: 0,
  stop: ['"""'],
  engine: "davinci",
};

const questionParameters = {
  max_tokens: 128,
  temperature: 0.75,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  stop: ['"""'],
  engine: "davinci",
};

const generationParameters = {
  max_tokens: 256,
  temperature: 0.5,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  stop: ['"""'],
  engine: "davinci",
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

  // @ts-ignore
  const openAi = new OpenAI(settings.key);

  const gptResponse = await openAi.complete({
    ...summaryParameters,
    prompt: summaryPrompt(text),
  });

  return gptResponse.data.choices[0].text;
}

// export async function batchSummary(texts: string[]): Promise<string[]> {
//   return await texts.map((text) => "Lorem ipsum");
// }

export async function question(
  question: string,
  context: string
): Promise<string> {
  const settings = await getSettings();

  // @ts-ignore
  const openAi = new OpenAI(settings.key);

  const gptResponse = await openAi.complete({
    ...questionParameters,
    prompt: questionPrompt(question, context),
  });

  return gptResponse.data.choices[0].text;
}

// export async function batchQuestion(
//   questions: string[],
//   contexts: string[]
// ): Promise<string[]> {
//   return await questions.map((question) => "Lorem ipsum");
// }

// export async function batchQuestionSameContext(
//   questions: string[],
//   context: string
// ): Promise<string[]> {
//   return await questions.map((question) => "Lorem ipsum");
// }

// export async function batchQuestionSameQuestion(
//   question: string,
//   contexts: string[]
// ): Promise<string[]> {
//   return await contexts.map((context) => "Lorem ipsum");
// }

export async function generation(
  prompt: string,
  context: string
): Promise<string> {
  const settings = await getSettings();

  // @ts-ignore
  const openAi = new OpenAI(settings.key);

  const gptResponse = await openAi.complete({
    ...generationParameters,
    prompt: generationPrompt(prompt, context),
  });

  return gptResponse.data.choices[0].text;
}

// export async function batchGeneration(
//   prompts: string[],
//   contexts: string[]
// ): Promise<string[]> {
//   return await prompts.map((prompt) => "Lorem ipsum");
// }

// export async function batchGenerationSameContext(
//   prompts: string[],
//   context: string
// ): Promise<string[]> {
//   return await prompts.map((prompt) => "Lorem ipsum");
// }

// export async function batchGenerationSamePrompt(
//   prompt: string,
//   contexts: string[]
// ): Promise<string[]> {
//   return await contexts.map((context) => "Lorem ipsum");
// }

import { getSettings } from "../settings";
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

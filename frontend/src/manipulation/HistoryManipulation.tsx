import { INotebookCommand } from "./NotebookManipulation";

export type History = INotebookCommand[];

export interface IHistoryInformation {
  history: History;
  historyIndex: number;
}

export function historyDo(
  history: History,
  historyIndex: number,
  { command }: { command: INotebookCommand }
): IHistoryInformation {
  if (historyIndex === history.length - 1) {
    history.push(command);
  } else {
    history.splice(historyIndex, history.length - historyIndex, command);
  }
  historyIndex++;
  return {
    history: history,
    historyIndex: historyIndex,
  };
}

export function historyUndo(
  history: History,
  historyIndex: number
): [INotebookCommand, IHistoryInformation] {
  let command = history[historyIndex];
  historyIndex--;
  return [command, { history: history, historyIndex: historyIndex }];
}

export function historyRedo(
  history: History,
  historyIndex: number
): [INotebookCommand, IHistoryInformation] {
  let command = history[historyIndex];
  historyIndex++;
  return [command, { history: history, historyIndex: historyIndex }];
}

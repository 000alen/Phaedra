import { IHistory, IHistoryManipulation } from "./IHistoryManipulation";
import { INotebookCommand } from "./INotebookManipulation";

export function historyDo(
  history: IHistory,
  historyIndex: number,
  { command }: { command: INotebookCommand }
): IHistoryManipulation {
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
  history: IHistory,
  historyIndex: number
): [INotebookCommand, IHistoryManipulation] {
  let command = history[historyIndex];
  historyIndex--;
  return [command, { history: history, historyIndex: historyIndex }];
}

export function historyRedo(
  history: IHistory,
  historyIndex: number
): [INotebookCommand, IHistoryManipulation] {
  let command = history[historyIndex];
  historyIndex++;
  return [command, { history: history, historyIndex: historyIndex }];
}

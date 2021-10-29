import { INotebookManipulationArguments } from "../notebook/INotebookManipulation";
import { IHistory, IHistoryInformation } from "./IHistoryManipulation";

export function historyDo(
  history: IHistory,
  historyIndex: number,
  { command }: { command: INotebookManipulationArguments }
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
  history: IHistory,
  historyIndex: number
): [INotebookManipulationArguments, IHistoryInformation] {
  let command = history[historyIndex];
  historyIndex--;
  return [command, { history: history, historyIndex: historyIndex }];
}

export function historyRedo(
  history: IHistory,
  historyIndex: number
): [INotebookManipulationArguments, IHistoryInformation] {
  let command = history[historyIndex];
  historyIndex++;
  return [command, { history: history, historyIndex: historyIndex }];
}

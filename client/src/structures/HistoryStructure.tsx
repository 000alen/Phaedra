import { INotebookManipulationAction } from "./NotebookStructure";

export type IHistory = INotebookManipulationAction[];

export interface IHistoryInformation {
  history: IHistory;
  historyIndex: number;
}

export function historyDo(
  history: IHistory,
  historyIndex: number,
  { command }: { command: INotebookManipulationAction }
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
): [INotebookManipulationAction | undefined, IHistoryInformation] {
  if (historyIndex === 0)
    return [undefined, { history: history, historyIndex: 0 }];

  let command = history[historyIndex];
  historyIndex--;
  return [command, { history: history, historyIndex: historyIndex }];
}

export function historyRedo(
  history: IHistory,
  historyIndex: number
): [INotebookManipulationAction | undefined, IHistoryInformation] {
  if (historyIndex === history.length - 1)
    return [undefined, { history: history, historyIndex: history.length - 1 }];

  let command = history[historyIndex];
  historyIndex++;
  return [command, { history: history, historyIndex: historyIndex }];
}

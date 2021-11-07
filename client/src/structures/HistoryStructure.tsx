import { INotebookManipulationAction } from "./NotebookStructure";

export interface IHistory {
  actions: INotebookManipulationAction[];
  index: number;
}

export function historyDo(
  history: IHistory,
  { manipulationAction }: { manipulationAction: INotebookManipulationAction }
): IHistory {
  if (history.index === history.actions.length - 1) {
    history.actions.push(manipulationAction);
  } else {
    history.actions.splice(
      history.index,
      history.actions.length - history.index,
      manipulationAction
    );
  }
  history.index++;
  return history;
}

export function historyUndo(
  history: IHistory
): [INotebookManipulationAction | undefined, IHistory] {
  if (history.index === 0) return [undefined, history];

  let manipulationAction = history.actions[history.index];
  history.index--;
  return [manipulationAction, history];
}

export function historyRedo(
  history: IHistory
): [INotebookManipulationAction | undefined, IHistory] {
  if (history.index === history.actions.length - 1) return [undefined, history];

  let manipulationAction = history.actions[history.index];
  history.index++;
  return [manipulationAction, history];
}

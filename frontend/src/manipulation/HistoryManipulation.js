export function historyDo(history, historyIndex, { command }) {
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

export function historyUndo(history, historyIndex) {
  let command = history[historyIndex];
  historyIndex--;
  return [command, { history: history, historyIndex: historyIndex }];
}

export function historyRedo(history, historyIndex) {
  let command = history[historyIndex];
  historyIndex++;
  return [command, { history: history, historyIndex: historyIndex }];
}

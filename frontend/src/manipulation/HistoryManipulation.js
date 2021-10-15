/**
 * @typedef {import("./NotebookManipulation").Command} Command
 */

/**
 * @typedef {Command[]} History
 */

/**
 * @typedef {Object} HistoryInformation
 * @property {History} history
 * @property {number} historyIndex
 */

/**
 * Adds a command to the history.
 * @param {History} history
 * @param {number} historyIndex
 * @param {Object} args
 * @param {Command} args.command
 * @returns {HistoryInformation}
 */
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

/**
 * Shifts back in the history.
 * @param {History} history
 * @param {number} historyIndex
 * @returns {[Command, HistoryInformation]}
 */
export function historyUndo(history, historyIndex) {
  let command = history[historyIndex];
  historyIndex--;
  return [command, { history: history, historyIndex: historyIndex }];
}

/**
 * Shifts forward in the history.
 * @param {History} history
 * @param {number} historyIndex
 * @returns {[Command, HistoryInformation]}
 */
export function historyRedo(history, historyIndex) {
  let command = history[historyIndex];
  historyIndex++;
  return [command, { history: history, historyIndex: historyIndex }];
}

/**
 * @typedef {Array} Clipboard
 */

/**
 * Adds an element to the Clipboard.
 * @param {Clipboard} clipboard
 * @param {Object} args
 * @param {*} args.element
 * @returns {Clipboard}
 */
export function clipboardPush(clipboard, { element }) {
  return [...clipboard, element];
}

/**
 * Returns the top element of the clipboard.
 * @param {Clipboard} clipboard
 * @returns {*}
 */
export function clipboardTop(clipboard) {
  return clipboard[clipboard.length - 1];
}

/**
 * Removes an element from the Clipboard.
 * @param {Clipboard} clipboard
 * @returns {Clipboard}
 */
export function clipboardPop(clipboard) {
  return clipboard.slice(0, -1);
}

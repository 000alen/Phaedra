export function clipboardPush(clipboard, { element }) {
  return [...clipboard, element];
}

export function clipboardTop(clipboard) {
  return clipboard[clipboard.length - 1];
}

export function clipboardPop(clipboard) {
  return clipboard.slice(0, -1);
}

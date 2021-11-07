import {
  clipboardPop,
  clipboardPush,
  clipboardTop,
  IClipboard,
} from "./ClipboardStructure";
import { createCell, createPage, ICell, IPage } from "./NotebookStructure";

const dummyPage = createPage({ id: "dummyPageId", data: { id: "page1" } });
const dummyCell = createCell({ id: "dummyCellId", data: { id: "cell1" } });
const dummyPages = [
  createPage({ id: "dummyPageId1", data: { id: "page1" } }),
  createPage({ id: "dummyPageId2", data: { id: "page2" } }),
  createPage({ id: "dummyPageId3", data: { id: "page3" } }),
];
const dummyCells = [
  createCell({ id: "dummyCellId1", data: { id: "cell1" } }),
  createCell({ id: "dummyCellId2", data: { id: "cell2" } }),
  createCell({ id: "dummyCellId3", data: { id: "cell3" } }),
];

it("clipboardPush", () => {
  let clipboard: IClipboard = [];

  clipboard = clipboardPush(clipboard, {
    item: { type: "page", element: dummyPage },
  });

  expect(clipboard.length).toBe(1);
  let topElement = clipboardTop(clipboard).element;
  expect((topElement as IPage).data).toEqual({ id: "page1" });

  clipboard = clipboardPush(clipboard, {
    item: { type: "cell", element: dummyCell },
  });

  expect(clipboard.length).toBe(2);
  topElement = clipboardTop(clipboard).element;
  expect((topElement as ICell).data).toEqual({ id: "cell1" });

  clipboard = clipboardPush(clipboard, {
    item: { type: "pages", element: dummyPages },
  });

  expect(clipboard.length).toBe(3);
  topElement = clipboardTop(clipboard).element;
  (topElement as IPage[]).forEach((page, index) => {
    expect(page.data).toEqual({ id: `page${index + 1}` });
  });

  clipboard = clipboardPush(clipboard, {
    item: { type: "cells", element: dummyCells },
  });

  expect(clipboard.length).toBe(4);
  topElement = clipboardTop(clipboard).element;
  (topElement as ICell[]).forEach((cell, index) => {
    expect(cell.data).toEqual({ id: `cell${index + 1}` });
  });
});

it("clipboardPop", () => {
  let clipboard: IClipboard = [];

  clipboard = clipboardPush(clipboard, {
    item: { type: "page", element: dummyPage },
  });

  expect(clipboard.length).toBe(1);
  let topElement = clipboardTop(clipboard).element;
  expect((topElement as IPage).data).toEqual({ id: "page1" });

  clipboard = clipboardPop(clipboard);

  expect(clipboard.length).toBe(0);

  clipboard = clipboardPush(clipboard, {
    item: { type: "page", element: dummyPage },
  });

  expect(clipboard.length).toBe(1);
  topElement = clipboardTop(clipboard).element;
  expect((topElement as IPage).data).toEqual({ id: "page1" });

  clipboard = clipboardPush(clipboard, {
    item: { type: "page", element: dummyPage },
  });

  expect(clipboard.length).toBe(2);
  topElement = clipboardTop(clipboard).element;
  expect((topElement as IPage).data).toEqual({ id: "page1" });

  clipboard = clipboardPop(clipboard);

  expect(clipboard.length).toBe(1);
  topElement = clipboardTop(clipboard).element;
  expect((topElement as IPage).data).toEqual({ id: "page1" });

  clipboard = clipboardPop(clipboard);

  expect(clipboard.length).toBe(0);
});

import isEqual from "lodash/isEqual";
import xor from "lodash/xor";
import { v4 as genUUID } from "uuid";
import * as Y from "yjs";

import EditorJS from "@editorjs/editorjs";

import { createMutex } from "./utils/mutex";

// from editor.js
const Block = {
  CSS: {
    wrapper: "ce-block",
    wrapperStretched: "ce-block--stretched",
    content: "ce-block__content",
    focused: "ce-block--focused",
    selected: "ce-block--selected",
    dropTarget: "ce-block--drop-target",
  },
};

function checkChangeType(mutation: MutationRecord) {
  const isBlockElement = (el: Element | Text) =>
    el instanceof Element ? el.classList.contains(Block.CSS.wrapper) : false;
  if (
    !!Array.from(mutation.removedNodes)
      // @ts-ignore
      .find(isBlockElement)
  )
    return "remove";

  if (
    !!Array.from(mutation.addedNodes)
      // @ts-ignore
      .find(isBlockElement)
  )
    return "add";

  return "update";
}

export class EditorBinding {
  yArray: Y.Array<any>;

  // @ts-ignore
  observer: MutationObserver;

  holder: HTMLElement;

  editor: EditorJS;

  isReady: Promise<any>;

  mux;

  mapping = new Map();

  // @ts-ignore
  constructor(editor, holder, yArray) {
    this.holder = holder;
    this.editor = editor;
    this.yArray = yArray;
    this.mux = createMutex();
    this.isReady = this.initYDoc();
    this.setObserver();
  }

  get editorBlocks() {
    const blockCount = this.editor.blocks.getBlocksCount();
    const blocks = [];
    for (let i = 0; i < blockCount; i += 1) {
      blocks.push(this.editor.blocks.getBlockByIndex(i));
    }
    return blocks;
  }

  private async initYDoc() {
    await this.editor.isReady;
    if (this.yArray.length) {
      this.yArray.toArray().forEach((yBlock, index) => {
        this.editor.blocks.insert(yBlock.type, yBlock.data, null, index, false);
        const blockApi = this.editor.blocks.getBlockByIndex(index);
        // @ts-ignore
        blockApi.holder.setAttribute("data-block-id", yBlock.uuid);
        this.mapping.set(yBlock.uuid, { index, blockApi, yBlock });
      });
    }
    this.yArray.observeDeep((evt, tr) => {
      this.mux(() => {
        const docArr = this.yArray.toArray();
        // add or delete
        // @ts-ignore
        const changedIds = xor(
          docArr.map((b) => b.uuid),
          // @ts-ignore
          [...this.mapping.keys()]
        );
        changedIds.forEach((id) => {
          if (this.mapping.has(id)) {
            // del an item
            const { index } = this.mapping.get(id);
            this.mapping.delete(id);
            this.editor.blocks.delete(index);
          } else {
            // add an item
            const yBlock = docArr.find((b) => b.uuid === id);
            const index = docArr.indexOf(yBlock);
            this.editor.blocks.insert(
              yBlock.type,
              yBlock.data,
              null,
              index,
              false
            );
            const blockApi = this.editor.blocks.getBlockByIndex(index);
            // @ts-ignore
            blockApi.holder.setAttribute("data-block-id", id);
            this.mapping.set(id, { index, blockApi, yBlock });
          }
        });
      });
    });
  }

  private async setObserver() {
    const observerOptions = {
      childList: true,
      attributes: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
    };

    this.observer = new MutationObserver((mutationList, observer) => {
      this.mutationHandler(mutationList, observer);
    });
    await this.editor.isReady;
    // @ts-ignore
    this.observer.observe(
      // @ts-ignore
      this.holder.querySelector(".codex-editor__redactor"),
      observerOptions
    );
  }

  // @ts-ignore
  private mutationHandler(mutationList: MutationRecord[], observer): void {
    /**
     * We divide two Mutation types:
     * 1) mutations that concerns client changes: settings changes, symbol added, deletion, insertions and so on
     * 2) functional changes. On each client actions we set functional identifiers to interact with user
     */
    const changed = new Set();

    mutationList.forEach((mutation) => {
      const target = mutation.target as Element;
      const blockSelector = "." + Block.CSS.wrapper;

      // @ts-ignore
      function findChangedBlockElement(
        mutation: MutationRecord,
        // @ts-ignore
        changeType
      ): HTMLElement {
        if (changeType === "add") {
          // @ts-ignore

          return Array.from(mutation.addedNodes).find((n: Element) =>
            n.classList.contains(Block.CSS.wrapper)
          ) as HTMLElement;
        }

        if (changeType === "remove") {
          // @ts-ignore
          return Array.from(mutation.removedNodes).find((n: Element) =>
            n.classList.contains(Block.CSS.wrapper)
          ) as HTMLElement;
        }

        const el = mutation.target;
        if (el instanceof Text)
          // @ts-ignore
          return el.parentElement?.closest(blockSelector);

        if (el instanceof Element)
          // @ts-ignore
          return el.querySelector(blockSelector) || el.closest(blockSelector);

        // @ts-ignore
        return null;
      }

      // ! Commented this out
      // const blockElements = Array.from(
      //   this.holder.querySelectorAll(blockSelector)
      // );
      const changeType = checkChangeType(mutation);

      switch (mutation.type) {
        case "childList":
        case "characterData":
          const blockElement = findChangedBlockElement(mutation, changeType);
          if (blockElement) {
            const blockId = blockElement.dataset.blockId || genUUID();

            if (!blockElement.dataset.blockId)
              blockElement.setAttribute("data-block-id", blockId);

            changed.add({ blockId, changeType });
          }
          break;
        case "attributes":
          /**
           * Changes on Element.ce-block usually is functional
           */
          if (!target.classList.contains(Block.CSS.wrapper)) {
            const blockElement = findChangedBlockElement(mutation, changeType);
            if (blockElement) {
              const blockId = blockElement.dataset.blockId || genUUID();

              if (!blockElement.dataset.blockId)
                blockElement.setAttribute("data-block-id", blockId);

              changed.add({ blockId, changeType });
            }
            break;
          }
      }
    });

    if (changed.size > 0) {
      this.onBlockChange(changed);
    }
  }

  // @ts-ignore
  private async onBlockChange(changed) {
    // todo: Maybe it can be optimized here
    for await (const { blockId, changeType } of changed) {
      // avoid calling observerDeep handler
      const mappingItem = this.mapping.get(blockId);
      // @ts-ignore
      const blockApi = this.editorBlocks.find(
        // @ts-ignore
        (b) => b.holder.dataset.blockId === blockId
      );
      // @ts-ignore
      const index = this.editorBlocks.findIndex(
        // @ts-ignore
        (b) => b.holder.dataset.blockId === blockId
      );
      // blockApi is undefined when remove block
      const savedData = (await blockApi?.save()) || {};
      const blockData = {
        // @ts-ignore
        type: savedData.tool,
        // @ts-ignore
        data: savedData.data,
        uuid: blockId,
      };

      this.mux(() => {
        switch (changeType) {
          case "add":
            if (this.mapping.has(blockId)) break;

            this.yArray.insert(index, [blockData]);
            this.mapping.set(blockId, { index, blockApi, yBlock: blockData });
            break;
          case "remove":
            if (!this.mapping.has(blockId)) break;

            const rmIdx = this.yArray.toArray().indexOf(mappingItem.yBlock);
            this.yArray.delete(rmIdx);
            this.mapping.delete(blockId);
            break;
          case "update":
            if (isEqual(blockData, this.yArray.get(index))) break;

            if (this.mapping.has(blockId)) {
              this.yArray.delete(index);
              this.yArray.insert(index, [blockData]);
              this.mapping.set(blockId, { index, blockApi, yBlock: blockData });
            } else {
              // update initial first block, need add it to yArray
              this.yArray.insert(index, [blockData]);
              this.mapping.set(blockId, { index, blockApi, yBlock: blockData });
            }
            break;
        }
      });
    }
  }
}

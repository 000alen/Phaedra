import Quill from "quill";

const Delta = Quill.import("delta");

// Binds autoformat transforms to typing and pasting

export class Autoformat {
  constructor(quill, options) {
    this.quill = quill;
    this.options = options;
    this.transforms = options;

    this.registerTypeListener();
    this.registerPasteListener();
  }

  registerPasteListener() {
    for (const name in this.transforms) {
      const transform = this.transforms[name];
      this.quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
        if (typeof node.data !== "string") {
          return;
        }

        delta.ops.forEach((op, index, deltaOps) => {
          // Find insert string ops
          if (typeof op.insert === "string") {
            const changeDelta = makeTransformedDelta(transform, op.insert);
            const composedDelta = new Delta([op]).compose(changeDelta);

            // Replace the current op with transformed ops
            deltaOps.splice(index, 1, ...composedDelta.ops);
          }
        });

        return delta;
      });
    }
  }

  registerTypeListener() {
    this.quill.keyboard.addBinding(
      {
        key: 38, // Arrow Up
        collapsed: true,
        format: ["autoformat-helper"]
      },
      this.forwardKeyboardUp.bind(this)
    );

    this.quill.keyboard.addBinding(
      {
        key: 40, // Arrow Down
        collapsed: true,
        format: ["autoformat-helper"]
      },
      this.forwardKeyboardDown.bind(this)
    );

    this.quill.on(Quill.events.TEXT_CHANGE, (delta, oldDelta, source) => {
      const ops = delta.ops;
      if (source !== "user" || !ops || ops.length < 1) {
        return;
      }

      // Check last insert
      let lastOpIndex = ops.length - 1;
      let lastOp = ops[lastOpIndex];

      while (!lastOp.insert && lastOpIndex > 0) {
        lastOpIndex--;
        lastOp = ops[lastOpIndex];
      }

      if (!lastOp.insert || typeof lastOp.insert !== "string") {
        return;
      }
      const isEnter = lastOp.insert === "\n";

      // Get selection
      const sel = this.quill.getSelection();
      if (!sel) {
        return;
      }
      const endSelIndex =
        this.quill.getLength() - sel.index - (isEnter ? 1 : 0);

      // Get leaf
      const checkIndex = sel.index;
      const [leaf] = this.quill.getLeaf(checkIndex);

      if (!leaf || !leaf.text) {
        return;
      }

      const leafIndex = leaf.offset(leaf.scroll);
      const leafSelIndex = checkIndex - leafIndex;

      let transformed = false;

      // Check transforms
      for (const name in this.transforms) {
        const transform = this.transforms[name];

        // Check helper trigger
        if (transform.helper && transform.helper.trigger) {
          if (lastOp.insert.match(transform.helper.trigger)) {
            // TODO(#42): check leaf/atindex instead
            this.quill.formatText(
              checkIndex,
              1,
              "autoformat-helper",
              name,
              Quill.sources.API
            );
            this.openHelper(transform, checkIndex);
            continue;
          }
        }

        // Check transform trigger
        if (lastOp.insert.match(transform.trigger || /./)) {
          this.closeHelper(transform);

          let ops = new Delta().retain(leafIndex);
          const transformOps = makeTransformedDelta(
            transform,
            leaf.text,
            leafSelIndex
          );

          if (transformOps) {
            ops = ops.concat(transformOps);
          }

          this.quill.updateContents(ops, "api");
          transformed = true;
        }
      }

      // Restore cursor position
      if (transformed) {
        setTimeout(() => {
          this.quill.setSelection(this.quill.getLength() - endSelIndex, "api");
        }, 0);
      }
    });
  }

  forwardKeyboard(range, context) {
    if (this.currentHelper && this.currentHelper.container) {
      const target =
        this.currentHelper.container.querySelector(".dropdown-menu");
      console.log("keyboard", target, context.event);
      target.dispatchEvent(context.event);
    }
  }

  forwardKeyboardUp(range, context) {
    const e = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      keyCode: 38,
      which: 38,
      bubbles: true,
      cancelable: true
    });
    context.event = e;
    this.forwardKeyboard(range, context);
  }

  forwardKeyboardDown(range, context) {
    const e = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      keyCode: 40,
      which: 40,
      bubbles: true,
      cancelable: true
    });
    context.event = e;
    this.forwardKeyboard(range, context);
  }

  openHelper(transform, index) {
    if (transform.helper) {
      this.currentHelper = transform.helper;
      if (typeof transform.helper.open === "function") {
        console.log("openHelper", index, this.quill.getFormat(index));
        const pos = this.quill.getBounds(index);
        const helperNode = this.quill.addContainer("ql-helper");
        helperNode.style.position = "absolute";
        helperNode.style.top = pos.top + "px";
        helperNode.style.left = pos.left + "px";
        helperNode.style.width = pos.width + "px";
        helperNode.style.height = pos.height + "px";
        console.log("openHelper", pos, helperNode);

        transform.helper.container = helperNode;
        transform.helper.open(helperNode);
      }
    }
  }

  closeHelper(transform) {
    if (transform.helper) {
      if (typeof transform.helper.close === "function") {
        transform.helper.close(transform.helper.container);
      }
    }
  }
}

function getFormat(transform, match) {
  let format = {};

  if (typeof transform.format === "string") {
    format[transform.format] = match;
  } else if (typeof transform.format === "object") {
    format = transform.format;
  }

  return format;
}

function transformMatch(transform, match) {
  const find = new RegExp(transform.extract || transform.find);
  return transform.transform ? match.replace(find, transform.transform) : match;
}

function applyExtract(transform, match) {
  // Extract
  if (transform.extract) {
    const extract = new RegExp(transform.extract);
    const extractMatch = extract.exec(match[0]);

    if (!extractMatch || !extractMatch.length) {
      return match;
    }

    extractMatch.index += match.index;
    return extractMatch;
  }

  return match;
}

function makeTransformedDelta(transform, text, atIndex) {
  if (!transform.find.global) {
    transform.find = new RegExp(transform.find, transform.find.flags + "g");
  }
  transform.find.lastIndex = 0;

  let ops = new Delta();
  let findResult = null;
  const checkAtIndex = atIndex !== undefined && atIndex !== null;

  if (checkAtIndex) {
    // find match at index
    findResult = transform.find.exec(text);

    while (findResult && findResult.length && findResult.index < atIndex) {
      if (
        findResult.index < atIndex &&
        findResult.index + findResult[0].length + 1 >= atIndex
      ) {
        ops = ops.concat(transformedMatchOps(transform, findResult).ops);
        break;
      } else {
        findResult = transform.find.exec(text);
      }
    }
  } else {
    // find all matches
    while ((findResult = transform.find.exec(text)) !== null) {
      const transformedMatch = transformedMatchOps(transform, findResult);
      ops = ops.concat(transformedMatch.ops);
      text = text.substr(transformedMatch.rightIndex);
      transform.find.lastIndex = 0;
    }
  }

  return ops;
}

function transformedMatchOps(transform, result) {
  result = applyExtract(transform, result);

  const resultIndex = result.index;
  const transformedMatch = transformMatch(transform, result[0]);

  let insert = transformedMatch;

  if (transform.insert) {
    insert = {};
    insert[transform.insert] = transformedMatch;
  }

  const format = getFormat(transform, transformedMatch);

  const ops = new Delta();

  ops.retain(resultIndex).delete(result[0].length).insert(insert, format);

  const rightIndex = resultIndex + result[0].length;

  return {
    ops,
    rightIndex
  };
}

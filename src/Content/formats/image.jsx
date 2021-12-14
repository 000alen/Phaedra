import Quill from "quill";
import React from "react";
import ReactDOM from "react-dom";
import { v4 as uuidv4 } from "uuid";
import { ImageComponent } from "../../components/Blots/image";

const BlockEmbed = Quill.import("blots/block/embed");

export class WImage extends BlockEmbed {
  static blotName = "wimage";
  static tagName = "div";
  static className = "ql-custom";
  static refs = {};

  static create(value) {
    const id = uuidv4();
    const node = super.create(value);
    const refs = WImage.refs;
    node.setAttribute("data-id", id);
    WImage.data = value;
    WImage.refs = {
      ...refs,
      [id]: React.createRef(),
    };
    return node;
  }

  static value(domNode) {
    const id = domNode.getAttribute("data-id");
    const ref = WImage.refs[id];
    return ref && ref.current && ref.current.getData();
  }

  constructor(domNode) {
    super(domNode);
    this.id = domNode.getAttribute("data-id");
    this.data = WImage.data;
  }

  attach() {
    super.attach();
    this.scroll.emitter.emit("blot-mount", this);
  }

  renderPortal(blotId, pageId, notebookManager, page) {
    const { options } = Quill.find(this.scroll.domNode.parentNode);
    const ref = WImage.refs[blotId];
    return ReactDOM.createPortal(
      <ImageComponent
        ref={ref}
        data={this.data}
        readOnly={options.readOnly}
        id={pageId}
        notebookManager={notebookManager}
        page={page}
      />,
      this.domNode
    );
  }

  detach() {
    super.detach();
    this.scroll.emitter.emit("blot-unmount", this);
  }
}

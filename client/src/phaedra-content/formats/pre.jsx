import Quill from "quill";
import React from "react";
import ReactDOM from "react-dom";
import { v4 as uuidv4 } from "uuid";

const BlockEmbed = Quill.import("blots/block/embed");

export class Pre extends BlockEmbed {
  static blotName = "pre";
  static tagName = "div";
  static className = "ql-custom";
  static refs = {};

  static create(value) {
    const id = uuidv4();
    const node = super.create(value);
    const refs = Pre.refs;
    node.setAttribute("data-id", id);
    Pre.data = value;
    Pre.refs = {
      ...refs,
      [id]: React.createRef(),
    };
    return node;
  }

  static value(domNode) {
    const id = domNode.getAttribute("data-id");
    const ref = Pre.refs[id];
    return ref && ref.current && ref.current.getData();
  }

  constructor(domNode) {
    super(domNode);
    this.id = domNode.getAttribute("data-id");
    this.data = Pre.data;
  }

  attach() {
    super.attach();
    this.scroll.emitter.emit("blot-mount", this);
  }

  renderPortal(blotId, pageId, notebookManager, page) {
    const { options } = Quill.find(this.scroll.domNode.parentNode);
    const ref = Pre.refs[blotId];
    return ReactDOM.createPortal(
      <PreComponent
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

class PreComponent extends React.Component {
  getData() {
    const { data } = this.props;
    return data;
  }

  render() {
    const { data } = this.props;

    return <pre>{data}</pre>;
  }
}

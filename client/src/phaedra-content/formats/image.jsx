import { IconButton, Label, Spinner, SpinnerSize } from "@fluentui/react";
import Quill from "quill";
import React from "react";
import ReactDOM from "react-dom";
import { v4 as uuidv4 } from "uuid";
import { wimage } from "../../API/PhaedraAPI";

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

class ImageComponent extends React.Component {
  constructor(props) {
    super(props);

    this.increaseIndex = this.increaseIndex.bind(this);
    this.decreaseIndex = this.decreaseIndex.bind(this);

    const { data } = props;

    const query = typeof data === "string" ? data : data.query;
    const response = typeof data === "string" ? null : data.response;
    const index = typeof data === "string" ? 0 : data.index;

    this.state = {
      query,
      response,
      index,
    };
  }

  componentDidMount() {
    /** @type {{data: string, notebookManager: import("../../HOC/UseNotebook/UseNotebook").NotebookManager, page: import("../../HOC/UseNotebook/Notebook").IPage}} */

    const { query, response } = this.state;

    if (response !== null) return;

    wimage(query)
      .then((response) => {
        this.setState({ response });
      })
      .catch((error) => {});
  }

  getData() {
    const { query, response, index } = this.state;
    return response === null ? query : { query, response, index };
  }

  increaseIndex() {
    this.setState(({ index }) => ({ index: index + 1 }));
  }

  decreaseIndex() {
    this.setState(({ index }) => ({ index: index > 0 ? index - 1 : index }));
  }

  render() {
    const { query, response, index } = this.state;

    return response === null ? (
      <div className="flex flex-row space-x-2 align-middle">
        <Spinner size={SpinnerSize.xSmall} />
        <Label>{query}</Label>
      </div>
    ) : (
      <div className="relative">
        <img
          className="rounded"
          src={response[index % response.length]}
          alt={query}
        />
        <div className="absolute right-0 bottom-0">
          <IconButton
            iconProps={{ iconName: "ChromeBack" }}
            onClick={this.decreaseIndex}
          />
          <IconButton
            iconProps={{ iconName: "ChromeBackMirrored" }}
            onClick={this.increaseIndex}
          />
        </div>
      </div>
    );
  }
}

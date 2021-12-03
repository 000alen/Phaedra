import { Label, Spinner, SpinnerSize } from "@fluentui/react";
import Quill from "quill";
import React from "react";
import ReactDOM from "react-dom";
import { v4 as uuidv4 } from "uuid";
import { wsummary } from "../../API/PhaedraAPI";

const BlockEmbed = Quill.import("blots/block/embed");

export class WSummary extends BlockEmbed {
  static blotName = "wsummary";
  static tagName = "div";
  static className = "ql-custom";
  static refs = {};

  static create(value) {
    const id = uuidv4();
    const node = super.create(value);
    const refs = WSummary.refs;
    node.setAttribute("data-id", id);
    WSummary.data = value;
    WSummary.refs = {
      ...refs,
      [id]: React.createRef(),
    };
    return node;
  }

  static value(domNode) {
    const id = domNode.getAttribute("data-id");
    const ref = WSummary.refs[id];
    return ref && ref.current && ref.current.getData();
  }

  constructor(domNode) {
    super(domNode);
    this.id = domNode.getAttribute("data-id");
    this.data = WSummary.data;
  }

  attach() {
    super.attach();
    this.scroll.emitter.emit("blot-mount", this);
  }

  renderPortal(blotId, pageId, notebookManager, page) {
    const { options } = Quill.find(this.scroll.domNode.parentNode);
    const ref = WSummary.refs[blotId];
    return ReactDOM.createPortal(
      <SummaryComponent
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

class SummaryComponent extends React.Component {
  constructor(props) {
    super(props);

    const { data } = props;

    const query = typeof data === "string" ? data : data.query;
    const response = typeof data === "string" ? null : data.response;

    this.state = {
      query,
      response,
    };
  }

  componentDidMount() {
    /** @type {{data: string, notebookManager: import("../../HOC/UseNotebook/UseNotebook").NotebookManager, page: import("../../HOC/UseNotebook/Notebook").IPage}} */
    const { query, response } = this.state;

    if (response !== null) return;

    wsummary(query)
      .then((response) => {
        this.setState({ response });
      })
      .catch((error) => {});
  }

  getData() {
    const { query, response } = this.state;
    return response === null ? query : { query, response };
  }

  render() {
    const { query, response } = this.state;

    return response === null ? (
      <div className="flex flex-row space-x-2 align-middle">
        <Spinner size={SpinnerSize.xSmall} />
        <Label>{query}</Label>
      </div>
    ) : (
      <div>
        <Label>{query}</Label>
        <pre>{response}</pre>
      </div>
    );
  }
}

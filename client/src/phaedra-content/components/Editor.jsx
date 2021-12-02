import React from "react";
import Quill from "quill";
import defer from "lodash/defer";
import map from "lodash/map";
import { Autoformat } from "../modules/autoformat";
import { Generation } from "../formats/generation";
import { Mention } from "../formats/mention";
import { Question } from "../formats/question";

import "quill/dist/quill.bubble.css";
import { WImage } from "../formats/image";
import { WSuggestion } from "../formats/suggestion";
import { WSummary } from "../formats/summary";

Quill.register({
  "modules/autoformat": Autoformat,
  "formats/generation": Generation,
  "formats/mention": Mention,
  "formats/question": Question,
  "formats/wimage": WImage,
  "formats/wsuggestion": WSuggestion,
  "formats/wsummary": WSummary,
});

export function register(toRegister) {
  Quill.register(toRegister);
}

const MODULES = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{ align: [] }],

    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],

    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["link", "image", "video"],
    [{ color: [] }, { background: [] }],

    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const FORMATS = [
  "bold",
  "italic",
  "underline",
  "strike",
  "align",
  "list",
  "indent",
  "size",
  "header",
  "link",
  "image",
  "video",
  "color",
  "background",
  "clean",

  "generation",
  "mention",
  "question",
  "wimage",
  "wsuggestion",
  "wsummary",
];

const AUTOFORMAT = {};

// * defaultContent: Delta;
// * onContentChange: (content: Delta) => void;
// * toRegister: { [path: string]: any };
// * modules: object;
// * formats: object;
// * autoformat: object;
// * readonly: boolean;
// * spellCheck: boolean;

export class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.onMount = this.onMount.bind(this);
    this.onUnmount = this.onUnmount.bind(this);
    this.onContentChange = this.onContentChange.bind(this);

    this.editor = null;
    this.editorContainer = React.createRef();

    this.state = {
      embedBlots: [],
    };
  }

  componentDidMount() {
    const { readOnly, modules, formats, autoformat, defaultContent } =
      this.props;

    this.editor = new Quill(this.editorContainer.current, {
      theme: "bubble",
      readOnly,
      modules: {
        ...MODULES,
        ...modules,
        autoformat: { ...AUTOFORMAT, ...autoformat },
      },
      formats: [...FORMATS, ...formats],
    });

    this.editor.on("text-change", this.onContentChange);

    let blots = [];
    /** Listener to listen for custom format */
    this.editor.scroll.emitter.on("blot-mount", (blot) => {
      blots.push(blot);
      defer(() => {
        if (blots.length > 0) {
          this.onMount(...blots);
          blots = [];
        }
      });
    });
    this.editor.scroll.emitter.on("blot-unmount", this.onUnmount);
    this.editor.setContents(defaultContent);
  }

  onMount(...blots) {
    const embeds = blots.reduce(
      (memo, blot) => {
        memo[blot.id] = blot;
        return memo;
      },
      { ...this.state.embedBlots }
    );
    this.setState({ embedBlots: embeds });
  }

  onUnmount(unmountedBlot) {
    const { [unmountedBlot.id]: blot, ...embedBlots } = this.state.embedBlots;
    this.setState({ embedBlots });
  }

  onContentChange(delta, oldDelta, source) {
    const { onContentChange } = this.props;
    onContentChange(this.editor.getContents());
  }

  render() {
    const { spellCheck } = this.props;

    return (
      <div spellCheck={spellCheck} ref={this.editorContainer}>
        {map(this.state.embedBlots, (blot) => blot.renderPortal(blot.id))}
      </div>
    );
  }
}

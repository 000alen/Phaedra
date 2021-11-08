import React, { Component } from "react";
// @ts-ignore
import { createReactEditorJS } from "react-editor-js";

import { theme } from "../resources/theme";
import { tools } from "../resources/tools";

interface PaperComponentProps {}

interface PaperComponentState {
  value: any;
}

const ReactEditorJS = createReactEditorJS();

export default class PaperComponent extends Component<
  PaperComponentProps,
  PaperComponentState
> {
  constructor(props: PaperComponentProps) {
    super(props);

    this.state = {
      value: {
        time: 1635603431943,
        blocks: [
          {
            id: "sheNwCUP5A",
            type: "header",
            data: {
              text: "Editor.js",
              level: 2,
            },
          },
          {
            id: "12iM3lqzcm",
            type: "paragraph",
            data: {
              text: "Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.",
            },
          },
        ],
      },
    };
  }

  render() {
    const pageStyle = {
      width: "8.5in",
      minHeight: "11in",
      backgroundColor: theme.palette.white,
    };

    return (
      <div className="px-2 py-10 m-2 rounded-sm shadow-sm" style={pageStyle}>
        <ReactEditorJS tools={tools} defaultValue={this.state.value} />
      </div>
    );
  }
}

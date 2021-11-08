import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

// @ts-ignore
import { theme } from "../resources/theme";
import Editor from "./Editor";

interface PaperComponentProps {}

interface PaperComponentState {}

export default class PaperComponent extends Component<
  PaperComponentProps,
  PaperComponentState
> {
  constructor(props: PaperComponentProps) {
    super(props);
    this.state = {};
  }

  render() {
    const pageStyle = {
      width: "8.5in",
      minHeight: "11in",
      backgroundColor: theme.palette.white,
    };

    return (
      <div className="px-2 py-10 m-2 rounded-sm shadow-sm" style={pageStyle}>
        <Editor id={uuidv4()} />
      </div>
    );
  }
}

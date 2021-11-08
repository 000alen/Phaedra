import React, { Component } from "react";

import { theme } from "../resources/theme";
import { IBlock } from "../structures/NotebookStructure";
import Editor from "./Editor";

interface PaperComponentProps {
  id: string;
  blocks: IBlock[];
  onBlocks: (pageId: string, blocks: IBlock[]) => void;
}

interface PaperComponentState {}

export default class PaperComponent extends Component<
  PaperComponentProps,
  PaperComponentState
> {
  render() {
    const { id, blocks, onBlocks } = this.props;

    const pageStyle = {
      width: "8.5in",
      minHeight: "11in",
      backgroundColor: theme.palette.white,
    };

    return (
      <div className="px-2 py-10 m-2 rounded-sm shadow-sm" style={pageStyle}>
        <Editor id={id} blocks={blocks} onBlocks={onBlocks} />
      </div>
    );
  }
}

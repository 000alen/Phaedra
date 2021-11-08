import React, { Component, createRef } from "react";

import EditorJS, { API, BlockAPI, OutputData } from "@editorjs/editorjs";

import { tools } from "../resources/tools";
import { IBlock } from "../structures/NotebookStructure";

interface EditorProps {
  id: string;
  blocks: IBlock[];
  onBlocks: (pageId: string, blocks: IBlock[]) => void;
}

interface EditorState {
  editorData: OutputData;
  holder: string;
}

function wrapBlocks(blocks: IBlock[]): OutputData {
  return {
    time: new Date().getTime(),
    blocks: blocks,
  };
}

export default class Editor extends Component<EditorProps, EditorState> {
  editorInstance: React.RefObject<EditorJS>;

  constructor(props: EditorProps) {
    super(props);

    this.onChange = this.onChange.bind(this);

    this.editorInstance = createRef<EditorJS>();

    const { id, blocks } = props;

    this.state = {
      editorData: wrapBlocks(blocks),
      holder: `editor_${id}`,
    };
  }

  componentDidMount() {
    if (!this.editorInstance.current) {
      this.initEditor();
    }
  }

  componentWillUnmount() {
    this.editorInstance.current!.destroy();

    // @ts-ignore
    this.editorInstance.current = null;
  }

  initEditor() {
    const { editorData, holder } = this.state;

    const editor = new EditorJS({
      holder: holder,
      data: editorData,
      onReady: () => {
        // @ts-ignore
        this.editorInstance.current = editor;
      },
      onChange: this.onChange,
      autofocus: true,
      tools: tools,
    });
  }

  onChange(api: API, block: BlockAPI) {
    const { id, onBlocks } = this.props;

    api.saver.save().then((data) => {
      onBlocks(id, data.blocks);
      this.setState({
        editorData: data,
      });
    });
  }

  render() {
    const { holder } = this.state;

    return <div id={holder}></div>;
  }
}

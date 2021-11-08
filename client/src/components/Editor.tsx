import React, { Component, createRef } from "react";

import EditorJS, { API, BlockAPI, OutputData } from "@editorjs/editorjs";

import { tools } from "../resources/tools";

const DEFAULT_INITIAL_DATA = () => {
  return {
    time: new Date().getTime(),
    blocks: [
      {
        type: "header",
        data: {
          text: "This is my awesome editor!",
          level: 1,
        },
      },
    ],
  };
};

interface EditorProps {
  id: string;
}

interface EditorState {
  editorData: OutputData;
  holder: string;
}

export default class Editor extends Component<EditorProps, EditorState> {
  editorInstance: React.RefObject<EditorJS>;

  constructor(props: EditorProps) {
    super(props);

    this.editorInstance = createRef<EditorJS>();

    const { id } = props;

    this.state = {
      editorData: DEFAULT_INITIAL_DATA(),
      holder: `editorJS_${id}`,
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
      onChange: async (api: API, block: BlockAPI) => {
        let content = await api.saver.save();
        this.setEditorData(content);
      },
      autofocus: true,
      tools: tools,
    });
  }

  setEditorData(data: OutputData) {
    this.setState({
      editorData: data,
    });
  }

  render() {
    const { holder } = this.state;

    return <div id={holder}></div>;
  }
}

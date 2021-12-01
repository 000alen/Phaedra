import React from "react";
import { DefaultButton } from "@fluentui/react";

import { getTheme } from "../themes";
import { Page } from "./Page";
import { UseNotebookInjectedProps } from "../HOC/UseNotebook/UseNotebook";
import { v4 as uuidv4 } from "uuid";

export type NotebookProps = UseNotebookInjectedProps;

export interface NotebookState {}

export class NotebookSkeleton extends React.Component<
  NotebookProps,
  NotebookState
> {
  constructor(props: NotebookProps) {
    super(props);

    this.addPage = this.addPage.bind(this);
  }

  addPage() {
    const { _notebookManager } = this.props;
    _notebookManager.addPage({
      id: uuidv4(),
      references: [],
      layout: {
        type: "layout",
        id: uuidv4(),
        position: 0,
        size: 1,
        orientation: "horizontal",
        previous: null,
        next: null,
        children: [
          {
            type: "pane",
            id: uuidv4(),
            position: 0,
            size: 1,
            previous: null,
            next: null,
          },
        ],
      },
      content: {},
    });
  }

  render() {
    const { _defaultNotebook, _onLayoutChange, _onContentChange } = this.props;

    const containerStyle = {
      backgroundColor: getTheme().palette.neutralLight,
    };

    return (
      <div
        className="w-[100%] h-[100%] overflow-y-auto overflow-x-hidden"
        id="notebook"
        style={containerStyle}
      >
        {_defaultNotebook.pages.map((page) => (
          <Page
            key={page.id}
            id={page.id}
            page={page}
            _onLayoutChange={_onLayoutChange}
            _onContentChange={_onContentChange}
          />
        ))}
        <DefaultButton text="Add page" onClick={this.addPage} />
      </div>
    );
  }
}

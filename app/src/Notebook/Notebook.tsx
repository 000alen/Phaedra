import React from "react";

import { Page } from "../components/Page/Page";
import { getTheme } from "../themes";
import {
  emptyPage,
  UseNotebook,
  UseNotebookInjectedProps
} from "./UseNotebook";

export type NotebookSkeletonProps = UseNotebookInjectedProps;

export interface NotebookSkeletonState {}

export class NotebookSkeleton extends React.Component<
  NotebookSkeletonProps,
  NotebookSkeletonState
> {
  constructor(props: NotebookSkeletonProps) {
    super(props);

    this.addPage = this.addPage.bind(this);
  }

  addPage(callback?: (pageId: string) => void) {
    const { _notebookManager } = this.props;
    const page = emptyPage();
    _notebookManager.addPage(page, () => {
      if (callback) callback(page.id);
    });
  }

  render() {
    const {
      _notebookManager,
      _defaultNotebook,
      _onLayoutChange,
      _onContentChange,
      _onQuillChange
    } = this.props;

    const containerStyle = {
      backgroundColor: getTheme().palette.neutralLight
    };

    return (
      <div
        className="w-full h-full overflow-y-auto overflow-x-hidden"
        style={containerStyle}
      >
        {_defaultNotebook.pages.map((page) => (
          <Page
            key={page.id}
            id={page.id}
            page={page}
            _notebookManager={_notebookManager}
            _onLayoutChange={_onLayoutChange}
            _onContentChange={_onContentChange}
            _onQuillChange={_onQuillChange}
          />
        ))}
      </div>
    );
  }
}

export const Notebook = UseNotebook(NotebookSkeleton);

import { LayoutJSON } from "../../phaedra-layout/UseLayout/UseLayout";
import { UseNotebook } from "./UseNotebook";

import React from "react";

import { getTheme } from "../../themes";
import { Page } from "../../components/Page";
import { UseNotebookInjectedProps } from "./UseNotebook";
import { emptyPage } from "./UseNotebook";

export interface ISource {
  id: string;
  content: string;
}

export interface IReference {
  id: string;
  sourceId: string;
}

export type IContent = object;

export interface IQuill {
  id: string;
  content: IContent;
}

export type ILayout = LayoutJSON;

export interface IPage {
  id: string;
  references: IReference[];
  layout: ILayout;
  content: IContent;
  quills: IQuill[];
}

export interface INotebook {
  id: string;
  name: string;
  sources: ISource[];
  pages: IPage[];
}

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
      _onQuillChange,
    } = this.props;

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

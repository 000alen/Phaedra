import { Layout } from "../../phaedra-layout/Layout";
import React from "react";

import { PagePane } from "./PagePane";
import { IContent, ILayout, IPage } from "../../HOC/UseNotebook/Notebook";
import { emptyQuill, NotebookManager } from "../../HOC/UseNotebook/UseNotebook";

export interface PageProps {
  id: string;
  page: IPage;
  _notebookManager: NotebookManager;
  _onLayoutChange: (pageId: string, layout: ILayout) => void;
  _onContentChange: (pageId: string, content: IContent) => void;
  _onQuillChange: (pageId: string, quillId: string, content: IContent) => void;
}

export interface PageState {}

export class Page extends React.Component<PageProps, PageState> {
  constructor(props: PageProps) {
    super(props);

    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.onContentChange = this.onContentChange.bind(this);
    this.onQuillChange = this.onQuillChange.bind(this);
    this.addQuill = this.addQuill.bind(this);
  }

  onLayoutChange(layout: ILayout) {
    const { id, _onLayoutChange } = this.props;
    _onLayoutChange(id, layout);
  }

  onContentChange(content: IContent) {
    const { id, _onContentChange } = this.props;
    _onContentChange(id, content);
  }

  onQuillChange(quillId: string, content: IContent) {
    const { id, _onQuillChange } = this.props;
    _onQuillChange(id, quillId, content);
  }

  addQuill(callback?: (quillId: string) => void) {
    const { id, _notebookManager } = this.props;
    const quill = emptyQuill();
    _notebookManager.addPageQuill(id, quill, () => {
      if (callback) callback(quill.id);
    });
  }

  // ! TODO: Cannot get rid of @ts-ignore
  render() {
    const { id, page, _notebookManager } = this.props;

    return (
      <div className="w-[100%] h-[100%] relative">
        <Layout
          defaultLayout={page.layout}
          onLayoutChange={this.onLayoutChange}
          // @ts-ignore
          PaneComponent={PagePane}
          props={{
            id,
            page,
            notebookManager: _notebookManager,
            onContentChange: this.onContentChange,
            onQuillChange: this.onQuillChange,
            addQuill: this.addQuill,
          }}
        />
      </div>
    );
  }
}

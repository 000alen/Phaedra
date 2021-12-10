import { Layout } from "../../Layout/Layout";
import React from "react";

import { PagePane } from "./PagePane";
import { IContent, ILayout, IPage } from "../../Notebook/Notebook";
import { emptyQuill, NotebookManager } from "../../Notebook/UseNotebook";
import { v4 as uuidv4 } from "uuid";

export interface PageProps {
  id: string;
  page: IPage;
  _notebookManager: NotebookManager | undefined;
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
    this.addReference = this.addReference.bind(this);
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

  addReference(sourceId: string, callback?: (referenceId: string) => void) {
    const { id, _notebookManager } = this.props;
    const referenceId = uuidv4();

    if (_notebookManager === undefined) throw new Error("No notebook manager");

    _notebookManager.addPageReference(
      id,
      {
        id: referenceId,
        title: _notebookManager.getSource(sourceId)?.title!,
        sourceId,
      },
      () => {
        if (callback) callback(referenceId);
      }
    );
  }

  addQuill(callback?: (quillId: string) => void) {
    const { id, _notebookManager } = this.props;

    if (_notebookManager === undefined) throw new Error("No notebook manager");

    const quill = emptyQuill();

    _notebookManager.addPageQuill(id, quill, () => {
      if (callback) callback(quill.id);
    });
  }

  // ! TODO: Cannot get rid of @ts-ignore
  render() {
    const { id, page, _notebookManager } = this.props;

    return (
      <div className="w-full h-full relative">
        <div id={`toolbar(${id})`}></div>
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
            addReference: this.addReference,
            addQuill: this.addQuill,
          }}
        />
      </div>
    );
  }
}

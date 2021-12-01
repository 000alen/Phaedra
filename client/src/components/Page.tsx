import { Layout } from "../phaedra-layout/Layout";
import React from "react";

import { NotebookController } from "../contexts";
import { IContent, IPage } from "../HOC/UseNotebook/deprecated";
import { PagePane } from "./PagePane";
import { ILayout } from "../HOC/UseNotebook/UseNotebook";

export interface PageProps {
  id: string;
  page: IPage;
  _onLayoutChange: (pageId: string, layout: ILayout) => void;
  _onContentChange: (pageId: string, content: IContent) => void;
}

export interface PageState {}

export class Page extends React.Component<PageProps, PageState> {
  constructor(props: PageProps) {
    super(props);

    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.onContentChange = this.onContentChange.bind(this);
  }

  onLayoutChange(layout: ILayout) {
    const { id, _onLayoutChange } = this.props;
    _onLayoutChange(id, layout);
  }

  onContentChange(content: IContent) {
    const { id, _onContentChange } = this.props;
    _onContentChange(id, content);
  }

  render() {
    const { id, page } = this.props;

    const layoutElement = (
      <Layout
        // @ts-ignore
        Component={PagePane}
        props={{
          id,
          page,
          onContentChange: this.onContentChange,
        }}
        defaultLayout={page.layout}
        onLayoutChange={this.onLayoutChange}
      />
    );

    return <div className="w-[100%] h-[100%] relative">{layoutElement}</div>;
  }
}

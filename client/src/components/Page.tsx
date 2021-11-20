import "react-quill/dist/quill.bubble.css";

import React from "react";

import Subdivide, { ConfigProvider } from "@pixore/subdivide";

import { NotebookController } from "../contexts";
import { IContent, IData, IReference } from "../HOC/UseNotebook";
import { PageLayoutMaster } from "./PageLayoutMaster";

export interface PageProps {
  id: string;
  references: IReference[];
  data: IData;
  content: IContent;
  layout: any;
  onReferencesChange: (...args: any[]) => void;
  onDataChange: (...args: any[]) => void;
  onContentChange: (...args: any[]) => void;
  onLayoutChange: (...args: any[]) => void;
}

export interface PageState {}

export class Page extends React.Component<PageProps, PageState> {
  static contextType = NotebookController;

  render() {
    const { id, onReferencesChange, onDataChange, onContentChange } =
      this.props;
    const { layout } = this.props;

    return (
      <div className="w-[100%] h-[100%] relative">
        <ConfigProvider initialState={layout}>
          <Subdivide
            component={() => (
              <PageLayoutMaster
                id={id}
                onReferencesChange={onReferencesChange}
                onDataChange={onDataChange}
                onContentChange={onContentChange}
              />
            )}
          />
        </ConfigProvider>
      </div>
    );
  }
}

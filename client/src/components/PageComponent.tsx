import React, { Component, MouseEvent } from "react";

import {
  INotebookController,
  NotebookController,
} from "../contexts/NotebookController";
import { theme } from "../resources/theme";
import { tools } from "../resources/tools";
import { ICell } from "../structures/NotebookStructure";
import CellComponent from "./CellComponent";
import { DocumentSourceComponent } from "./DocumentSourceComponent";
import { DocumentFile } from "./NotebookComponent";
import PaperComponent from "./PaperComponent";
import SplitViewComponent from "./SplitView/SplitViewComponent";

export interface PageComponentProps {
  id: string;
  data: any;
  cells: ICell[];
  selected: { [key: string]: string[] };
  document: DocumentFile | undefined;
  editing: boolean;
}

export interface PageComponentState {}

export default class PageComponent extends Component<
  PageComponentProps,
  PageComponentState
> {
  static contextType = NotebookController;

  constructor(props: PageComponentProps) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event: MouseEvent<HTMLDivElement>) {
    const { id, selected, editing } = this.props;
    const notebookController: INotebookController = this.context;

    if (id in selected && editing) return;

    if (id in selected) {
      notebookController.deselectPage(id);
    } else {
      notebookController.selectPage(id);
    }
  }

  render() {
    return (
      <div>
        <SplitViewComponent
          left={
            <div className="flex justify-center">
              <PaperComponent />
            </div>
          }
          right={<h1>aa</h1>}
        />
      </div>
    );
  }
}

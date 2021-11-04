import React, { Component, MouseEvent } from "react";

import {
  INotebookController,
  NotebookController,
} from "../contexts/NotebookController";
import { theme } from "../resources/theme";
import { ICell } from "../structures/NotebookStructure";
import CellComponent from "./CellComponent";
import { DocumentSourceComponent } from "./DocumentSourceComponent";
import { DocumentFile } from "./NotebookComponent";

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

  renderWithDocument() {
    const { id, data, cells, selected, document, editing } = this.props;

    const containerStyle = {
      backgroundColor: theme.palette.neutralLight,
    };

    const paperStyle = {
      backgroundColor: theme.palette.white,
      border:
        id in selected
          ? `1px solid ${theme.palette.themePrimary}`
          : `1px solid ${theme.palette.white}`,
    };

    return (
      <div className="page grid grid-cols-2" style={containerStyle}>
        <div
          className="m-2 p-2 rounded-sm shadow-sm"
          style={paperStyle}
          onClick={this.handleClick}
        >
          {cells.map((cell) => (
            <CellComponent
              key={cell.id}
              id={cell.id}
              data={cell.data}
              content={cell.content}
              pageId={id}
              selected={id in selected ? selected[id] : []}
              editing={editing}
            />
          ))}
        </div>

        <div className="m-2">
          <DocumentSourceComponent
            document={document!}
            pageNumber={data.document_page_number}
          />
        </div>
      </div>
    );
  }

  renderWithoutDocument() {
    const { id, cells, selected, editing } = this.props;

    const containerStyle = {
      backgroundColor: theme.palette.neutralLight,
    };

    const pageStyle = {
      width: "8.5in",
      minHeight: "11in",
      backgroundColor: theme.palette.white,
      border:
        id in selected ? `1px solid ${theme.palette.themePrimary}` : undefined,
    };

    return (
      <div className="flex items-center justify-center" style={containerStyle}>
        <div
          className="page p-2 m-2 rounded-sm shadow-sm"
          style={pageStyle}
          onClick={this.handleClick}
        >
          <div>
            {cells.map((cell) => (
              <CellComponent
                key={cell.id}
                id={cell.id}
                data={cell.data}
                content={cell.content}
                pageId={id}
                selected={id in selected ? selected[id] : []}
                editing={editing}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { document, data } = this.props;

    if (document && data.document_page_number) {
      return this.renderWithDocument();
    } else {
      return this.renderWithoutDocument();
    }
  }
}

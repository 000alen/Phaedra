import React, { Component, MouseEvent } from "react";

import { NotebookController } from "../../contexts/NotebookController";
import { theme } from "../../index";
import CellComponent from "../Cell/CellComponent";
import { PageComponentProps, PageComponentState } from "./IPageComponent";
import { PageDocumentComponent } from "./PageDocumentComponent";

export default class PageComponent extends Component<
  PageComponentProps,
  PageComponentState
> {
  static contextType = NotebookController;

  constructor(props: PageComponentProps) {
    super(props);

    this.handleSelection = this.handleSelection.bind(this);
  }

  handleSelection(event: MouseEvent<HTMLDivElement>) {
    const { id, active, editing } = this.props;
    if (active && editing) return;

    this.context.handleSelection(id);
  }

  renderWithDocument() {
    const { id, data, cells, active, activeCell, document, editing } =
      this.props;

    const containerStyle = {
      backgroundColor: theme.palette.neutralLight,
    };

    const paperStyle = {
      backgroundColor: theme.palette.white,
      border: active
        ? `1px solid ${theme.palette.themePrimary}`
        : `1px solid ${theme.palette.white}`,
    };

    return (
      <div className="page grid grid-cols-2" style={containerStyle}>
        <div
          className="m-2 p-2 rounded-sm shadow-sm"
          style={paperStyle}
          onClick={this.handleSelection}
        >
          {cells.map((cell) => (
            <CellComponent
              key={cell.id}
              id={cell.id}
              data={cell.data}
              content={cell.content}
              pageId={id}
              active={active ? activeCell === cell.id : false}
              editing={editing}
            />
          ))}
        </div>

        <div className="m-2">
          <PageDocumentComponent
            document={document!}
            pageNumber={data.document_page_number}
          />
        </div>
      </div>
    );
  }

  renderWithoutDocument() {
    const { id, cells, active, activeCell, editing } = this.props;

    const containerStyle = {
      backgroundColor: theme.palette.neutralLight,
    };

    const pageStyle = {
      width: "8.5in",
      minHeight: "11in",
      backgroundColor: theme.palette.white,
      border: active ? `1px solid ${theme.palette.themePrimary}` : undefined,
    };

    return (
      <div className="flex items-center justify-center" style={containerStyle}>
        <div
          className="page p-2 m-2 rounded-sm shadow-sm"
          style={pageStyle}
          onClick={this.handleSelection}
        >
          <div>
            {cells.map((cell) => (
              <CellComponent
                key={cell.id}
                id={cell.id}
                data={cell.data}
                content={cell.content}
                pageId={id}
                active={active ? activeCell === cell.id : false}
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

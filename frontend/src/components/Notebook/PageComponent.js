import React, { Component } from "react";

import { PageDocumentComponent } from "./PageDocumentComponent";
import CellComponent from "./CellComponent";

import { theme } from "../../index";
import { NotebookController } from "./NotebookController";

export default class PageComponent extends Component {
  static contextType = NotebookController;

  constructor(props) {
    super(props);

    this.handleSelection = this.handleSelection.bind(this);

    const { id } = props;

    this.state = {
      id: id,
    };
  }

  handleSelection(event) {
    const { active, editing } = this.props;
    if (active && editing) return;

    const { id } = this.state;
    this.context.handleSelection(id);
  }

  renderWithDocument() {
    const { id } = this.state;
    const { data, cells, active, activeCell, document, editing } = this.props;

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
          className="m-2 p-2 rounded-md shadow-md"
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
              active={active ? activeCell === cell.id : null}
              editing={editing}
            />
          ))}
        </div>

        <div className="m-2">
          <PageDocumentComponent
            document={document}
            pageNumber={data.document_page_number}
          />
        </div>
      </div>
    );
  }

  renderWithoutDocument() {
    const { id } = this.state;
    const { cells, active, activeCell, editing } = this.props;

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
          className="page p-2 m-2 rounded-md shadow-md"
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
                active={active ? activeCell === cell.id : null}
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

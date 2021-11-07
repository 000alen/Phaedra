import React, { Component, MouseEvent } from "react";
// @ts-ignore
import { createReactEditorJS } from "react-editor-js";

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

export interface PageComponentProps {
  id: string;
  data: any;
  cells: ICell[];
  selected: { [key: string]: string[] };
  document: DocumentFile | undefined;
  editing: boolean;
}

export interface PageComponentState {}

const ReactEditorJS = createReactEditorJS();

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

  // renderWithSource() {
  //   const { id, data, cells, selected, document, editing } = this.props;

  //   const paperStyle = {
  //     backgroundColor: theme.palette.white,
  //     border:
  //       id in selected
  //         ? `1px solid ${theme.palette.themePrimary}`
  //         : `1px solid ${theme.palette.white}`,
  //   };

  //   return (
  //     <div className="grid grid-cols-2">
  //       <div>
  //         <div className="m-2 p-2 rounded-sm shadow-sm" style={paperStyle}>
  //           {/* <ReactEditorJS
  //             tools={tools}
  //             defaultValue={{
  //               time: 1635603431943,
  //               blocks: [
  //                 {
  //                   id: "sheNwCUP5A",
  //                   type: "header",
  //                   data: {
  //                     text: "Editor.js",
  //                     level: 2,
  //                   },
  //                 },
  //                 {
  //                   id: "12iM3lqzcm",
  //                   type: "paragraph",
  //                   data: {
  //                     text: "Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.",
  //                   },
  //                 },
  //               ],
  //             }}
  //           /> */}
  //           {cells.map((cell) => (
  //             <CellComponent
  //               key={cell.id}
  //               id={cell.id}
  //               data={cell.data}
  //               content={cell.content}
  //               pageId={id}
  //               selected={id in selected ? selected[id] : []}
  //               editing={editing}
  //             />
  //           ))}
  //         </div>

  //         <div className="m-2">
  //           <DocumentSourceComponent
  //             document={document!}
  //             pageNumber={data.document_page_number}
  //           />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  renderWithoutSource() {
    const { id, cells, selected, editing } = this.props;

    const pageStyle = {
      width: "8.5in",
      minHeight: "11in",
      backgroundColor: theme.palette.white,
      border:
        id in selected ? `1px solid ${theme.palette.themePrimary}` : undefined,
    };

    return (
      <div className="px-2 py-10 m-2 rounded-sm shadow-sm" style={pageStyle}>
        <ReactEditorJS
          tools={tools}
          defaultValue={{
            time: 1635603431943,
            blocks: [
              {
                id: "sheNwCUP5A",
                type: "header",
                data: {
                  text: "Editor.js",
                  level: 2,
                },
              },
              {
                id: "12iM3lqzcm",
                type: "paragraph",
                data: {
                  text: "Hey. Meet the new Editor. On this page you can see it in action — try to edit this text.",
                },
              },
            ],
          }}
        />
      </div>
    );
  }

  render() {
    return this.renderWithoutSource();
  }
}

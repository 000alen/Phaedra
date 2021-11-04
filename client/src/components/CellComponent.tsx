import React, { Component, FormEvent, MouseEvent } from "react";
import ReactMarkdown from "react-markdown";

import { mergeStyles, Shimmer, TextField } from "@fluentui/react";

import {
  INotebookController,
  NotebookController,
} from "../contexts/NotebookController";
import { theme } from "../resources/theme";
import { setCellContentSync } from "../structures/NotebookStructure";
import { CellToolbarComponent } from "./CellToolbarComponent";

export interface CellComponentProps {
  id: string;
  data: any;
  content: string;
  pageId: string;
  selected: string[];
  editing: boolean;
}

export interface CellComponentState {}

export default class CellComponent extends Component<
  CellComponentProps,
  CellComponentState
> {
  static contextType = NotebookController;

  constructor(props: CellComponentProps) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getStyles = this.getStyles.bind(this);
  }

  handleClick(event: MouseEvent<HTMLDivElement>) {
    const notebookController: INotebookController = this.context;
    const { id, pageId, selected } = this.props;

    if (selected === undefined) return;

    if (selected.includes(id)) {
      notebookController.deselectCell(pageId, id);
    } else {
      notebookController.selectCell(pageId, id);
    }

    event.stopPropagation();
  }

  handleChange(
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue: string | undefined
  ) {
    const notebookController: INotebookController = this.context;
    const { id, pageId } = this.props;

    notebookController.do(setCellContentSync, {
      pageId: pageId,
      cellId: id,
      content: newValue!,
    });
  }

  getStyles(
    seamless: boolean,
    active: boolean,
    editing: boolean
  ): [string, React.CSSProperties] {
    if (active && editing) return ["m-2 space-y-2", {}];

    const classes = `p-2 m-2 rounded-sm text-justify ${
      !seamless && "shadow-sm"
    }`;

    const style = {
      minHeight: "32px",
      backgroundColor: seamless ? "transparent" : theme.palette.neutralLight,
      border: `1px solid ${
        active
          ? theme.palette.themePrimary
          : seamless
          ? "transparent"
          : theme.palette.neutralLight
      }`,
    };

    return [classes, style];
  }

  renderLoading() {
    const { id, data, selected, editing } = this.props;
    const [classes, style] = this.getStyles(
      data.seamless,
      selected.includes(id),
      editing
    );

    const wrapperClass = mergeStyles({
      padding: 2,
      selectors: {
        "& > .ms-Shimmer-container": {
          margin: "10px 0",
        },
      },
    });

    return (
      <div
        className={`cell ${classes} ${wrapperClass}`}
        style={style}
        onClick={this.handleClick}
      >
        <Shimmer />
        <Shimmer />
        <Shimmer />
      </div>
    );
  }

  renderViewing() {
    const { id, data, content, selected, editing } = this.props;
    const [classes, style] = this.getStyles(
      data.seamless,
      selected.includes(id),
      editing
    );

    return (
      <div
        className={`cell ${classes}`}
        style={style}
        onClick={this.handleClick}
      >
        {selected.includes(id) && <CellToolbarComponent />}

        <ReactMarkdown children={content} linkTarget="_blank" />
      </div>
    );
  }

  renderEditing() {
    const { id, data, content, selected, editing } = this.props;
    const [classes, style] = this.getStyles(
      data.seamless,
      selected.includes(id),
      editing
    );

    return (
      <div className={`cell ${classes}`} style={style}>
        <TextField
          value={content}
          onChange={this.handleChange}
          multiline
          autoAdjustHeight
          resizable={false}
        />
      </div>
    );
  }

  render() {
    const { id, data, selected, editing } = this.props;

    const loading = data.loading;

    if (loading) {
      return this.renderLoading();
    } else if (selected.includes(id) && editing) {
      return this.renderEditing();
    } else {
      return this.renderViewing();
    }
  }
}

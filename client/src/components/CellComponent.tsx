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
  active: boolean;
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

    this.handleSelection = this.handleSelection.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getStyles = this.getStyles.bind(this);
  }

  handleSelection(event: MouseEvent<HTMLDivElement>) {
    const notebookController = this.context;
    const { id, pageId } = this.props;

    notebookController.handleSelection(pageId, id);
    event.stopPropagation();
  }

  handleChange(
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue: string | undefined
  ) {
    const notebookController: INotebookController = this.context;
    const { id, pageId } = this.props;

    notebookController.doSync(setCellContentSync, {
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
    const { data, active, editing } = this.props;
    const [classes, style] = this.getStyles(data.seamless, active, editing);

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
        onClick={this.handleSelection}
      >
        <Shimmer />
        <Shimmer />
        <Shimmer />
      </div>
    );
  }

  renderViewing() {
    const { data, content, active, editing } = this.props;
    const [classes, style] = this.getStyles(data.seamless, active, editing);

    return (
      <div
        className={`cell ${classes}`}
        style={style}
        onClick={this.handleSelection}
      >
        {active && <CellToolbarComponent />}

        <ReactMarkdown children={content} linkTarget="_blank" />
      </div>
    );
  }

  renderEditing() {
    const { data, content, active, editing } = this.props;
    const [classes, style] = this.getStyles(data.seamless, active, editing);

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
    const { data, active, editing } = this.props;

    const loading = data.loading;

    if (loading) {
      return this.renderLoading();
    } else if (active && editing) {
      return this.renderEditing();
    } else {
      return this.renderViewing();
    }
  }
}

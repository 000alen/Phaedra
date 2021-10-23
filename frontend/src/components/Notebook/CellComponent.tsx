import React, { Component, FormEvent, MouseEvent } from "react";
import ReactMarkdown from "react-markdown";

import { mergeStyles, Shimmer, TextField } from "@fluentui/react";

import { NotebookController } from "../../contexts/NotebookController";
import { theme } from "../../index";
import { setCellContent } from "../../manipulation/NotebookManipulation";
import { CellComponentProps, CellComponentState } from "./ICellComponent";

export default class CellComponent extends Component<
  CellComponentProps,
  CellComponentState
> {
  static contextType = NotebookController;

  constructor(props: CellComponentProps) {
    super(props);

    this.handleSelection = this.handleSelection.bind(this);
    this.handleChange = this.handleChange.bind(this);
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
    const notebookController = this.context;
    const { id, pageId } = this.props;

    notebookController.do(setCellContent, {
      pageId: pageId,
      cellId: id,
      content: newValue!,
    });
  }

  renderLoading() {
    const { data, active } = this.props;

    const backgroundColor = data.seamless
      ? "transparent"
      : theme.palette.neutralLight;

    const borderColor = active
      ? theme.palette.themePrimary
      : data.seamless
      ? "transparent"
      : theme.palette.neutralLight;

    const border = `1px solid ${borderColor}`;
    const shadow = data.seamless ? "" : "shadow-md";

    const style = {
      backgroundColor: backgroundColor,
      border: border,
    };

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
        className={`cell p-2 m-2 rounded-sm ${shadow} text-justify ${wrapperClass}`}
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
    const { data, content, active } = this.props;

    const backgroundColor = data.seamless
      ? "transparent"
      : theme.palette.neutralLight;

    const borderColor = active
      ? theme.palette.themePrimary
      : data.seamless
      ? "transparent"
      : theme.palette.neutralLight;

    const border = `1px solid ${borderColor}`;
    const shadow = data.seamless ? "" : "shadow-md";

    const style = {
      backgroundColor: backgroundColor,
      border: border,
    };

    return (
      <div
        className={`cell p-2 m-2 rounded-sm ${shadow} text-justify`}
        style={style}
        onClick={this.handleSelection}
      >
        <ReactMarkdown children={content} linkTarget="_blank" />
      </div>
    );
  }

  renderEditing() {
    const { content } = this.props;

    return (
      <div className="cell m-2 space-y-2">
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
    const { active, editing, data } = this.props;

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

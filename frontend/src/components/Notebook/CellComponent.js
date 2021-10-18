import React, { Component } from "react";
import ReactMarkdown from "react-markdown";
import {
  PrimaryButton,
  Shimmer,
  TextField,
  mergeStyles,
} from "@fluentui/react";

import { setCellContent } from "../../manipulation/NotebookManipulation";

import { theme } from "../../index";

/**
 * @typedef {import("./NotebookComponent").NotebookController} NotebookController
 */

/**
 * @typedef {import("../../pages/NotebookPage/NotebookPage").NotebookPageController} NotebookPageController
 */

/**
 * @typedef {Object} CellState
 * @property {string} id
 * @property {string} pageId
 * @property {NotebookPageController} pageController
 * @property {NotebookController} notebookController
 */

export default class CellComponent extends Component {
  constructor(props) {
    super(props);

    this.handleSelection = this.handleSelection.bind(this);
    this.handleChange = this.handleChange.bind(this);

    const { id, pageId, pageController, notebookController } = props;

    /**
     * @type {CellState}
     */
    this.state = {
      id: id,
      pageId: pageId,
      pageController: pageController,
      notebookController: notebookController,
    };
  }

  handleSelection(event) {
    const { id, pageId, pageController, notebookController } = this.state;

    notebookController.handleSelection(pageId, id);
    event.stopPropagation();
  }

  handleChange(event) {
    const { id, pageId, pageController, notebookController } = this.state;

    notebookController.do(setCellContent, {
      pageId: pageId,
      cellId: id,
      content: event.target.value,
    });
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
    const { data, content, active, editing } = this.props;

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
    const { active, editing } = this.props;

    if (active && editing) {
      return this.renderEditing();
    } else {
      return this.renderViewing();
    }
  }
}

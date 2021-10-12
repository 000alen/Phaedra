import React, { Component } from "react";
import ReactMarkdown from "react-markdown";
import { theme } from "../../index";
import {
  PrimaryButton,
  Shimmer,
  TextField,
  mergeStyles,
} from "@fluentui/react";

export default class CellComponent extends Component {
  constructor(props) {
    super(props);

    const { id, pageId, pageController, notebookController } = props;
    const { content } = props;

    this.state = {
      id: id,
      pageId: pageId,
      pageController: pageController,
      notebookController: notebookController,
      content: content,
    };
  }

  renderViewing() {
    const { id, pageId, pageController, notebookController } = this.state;
    const { data, content, active } = this.props;

    const handleSelection = (event) => {
      notebookController.handleSelection(pageId, id);
      event.stopPropagation();
    };

    const backgroundColor = data.seamless
      ? "transparent"
      : theme.palette.neutralLight;
    const borderColor = active
      ? theme.palette.themePrimary
      : theme.palette.neutralLight;
    const border = data.seamless ? "" : `1px solid ${borderColor}`;
    const shadow = data.seamless ? "" : "shadow-md";

    const style = {
      backgroundColor: backgroundColor,
      border: border,
    };

    const wrapperClass = mergeStyles({
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
        onClick={handleSelection}
      >
        <ReactMarkdown children={content} linkTarget="_blank" />
      </div>
    );
  }

  renderEditing() {
    const { id, pageId, pageController, notebookController } = this.state;
    const { data, content, active, editing } = this.props;

    const handleChange = (event) => {
      this.setState((state) => {
        return {
          ...state,
          content: event.target.value,
        };
      });
    };

    const handleSet = () => {
      notebookController.setCellContent(pageId, id, this.state.content, true);
    };

    return (
      <div className="cell m-2 space-y-2">
        <TextField
          value={this.state.content}
          onChange={handleChange}
          multiline
          autoAdjustHeight
          resizable={false}
        />
        <PrimaryButton text="Set" onClick={handleSet} />
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

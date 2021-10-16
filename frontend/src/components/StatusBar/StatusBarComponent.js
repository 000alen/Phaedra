import React, { Component } from "react";
import { Spinner, SpinnerSize, Text } from "@fluentui/react";

import { StatusBarButtonComponent } from "./StatusBarButtonComponent";
import { StatusBarLoadingComponent } from "./StatusBarLoadingComponent";

import { theme } from "../../index";

import "../../css/components/StatusBarComponent.css";

/**
 * @typedef {Object} StatusBarController
 * @property {Function} setLoadingText
 * @property {Function} showLoading
 * @property {Function} hideLoading
 */

/**
 * @typedef {Object} StatusBarState
 * @property {StatusBarController} statusBarController
 * @property {string} loadingText
 * @property {boolean} loadingShown
 */

export default class StatusBarComponent extends Component {
  constructor(props) {
    super(props);

    this.setLoadingText = this.setLoadingText.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);

    /**
     * @type {StatusBarController}
     */
    const statusBarController = {
      setLoadingText: this.setLoadingText,
      showLoading: this.showLoading,
      hideLoading: this.hideLoading,
    };

    /**
     * @type {StatusBarState}
     */
    this.state = {
      statusBarController: statusBarController,
      loadingText: "Loading",
      loadingShown: false,
    };
  }

  /**
   * Sets the loading text.
   * @param {string} text
   */
  setLoadingText(text) {
    this.setState({
      loadingText: text,
    });
  }

  showLoading() {
    this.setState({
      loadingShown: true,
    });
  }

  hideLoading() {
    this.setState({
      loadingShown: false,
    });
  }

  render() {
    const { loadingShown, loadingText } = this.state;

    const statusBarStyle = {
      backgroundColor: theme.palette.neutralLight,
    };

    return (
      <div
        className="statusBar flex items-center pl-2 space-x-2 select-none"
        style={statusBarStyle}
      >
        {loadingShown ? <StatusBarLoadingComponent text={loadingText} /> : null}

        <StatusBarButtonComponent text="Test1" icon="Accept" />
        <StatusBarButtonComponent text="Test2" icon="Accept" />
      </div>
    );
  }
}

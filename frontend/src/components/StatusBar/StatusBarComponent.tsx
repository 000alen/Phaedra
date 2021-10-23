import "../../css/components/StatusBarComponent.css";

import React, { Component } from "react";

import { theme } from "../../index";
import {
  StatusBarComponentProps,
  StatusBarController,
} from "./IStatusBarComponent";
import { StatusBarButtonComponent } from "./StatusBarButtonComponent";
import { StatusBarLoadingComponent } from "./StatusBarLoadingComponent";

interface StatusBarComponentState {
  statusBarController: StatusBarController;
  loadingText: string;
  loadingShown: boolean;
}

export default class StatusBarComponent extends Component<
  StatusBarComponentProps,
  StatusBarComponentState
> {
  constructor(props: StatusBarComponentProps) {
    super(props);

    this.setLoadingText = this.setLoadingText.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);

    const statusBarController = {
      setLoadingText: this.setLoadingText,
      showLoading: this.showLoading,
      hideLoading: this.hideLoading,
    };

    this.state = {
      statusBarController: statusBarController,
      loadingText: "Loading",
      loadingShown: false,
    };
  }

  setLoadingText(text: string) {
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
        className="statusBar flex flex-row items-center px-2 select-none"
        style={statusBarStyle}
      >
        <div className="statusBarMessageSection">
          {loadingShown ? (
            <StatusBarLoadingComponent text={loadingText} />
          ) : null}
        </div>

        <div className="statusBarButtonsSection flex flex-row-reverse space-x-2">
          <StatusBarButtonComponent text="Test1" icon="Accept" />
          <StatusBarButtonComponent text="Test2" icon="Accept" />
        </div>
      </div>
    );
  }
}

import React, { Component } from "react";
import { Spinner, SpinnerSize, Text } from "@fluentui/react";
import { theme } from "../index";
import "../css/StatusBar.css";

class StatusBar extends Component {
  constructor(props) {
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
        className="statusBar flex items-center pl-2 space-x-2"
        style={statusBarStyle}
      >
        {loadingShown && (
          <>
            <Spinner size={SpinnerSize.xSmall} />
            <Text variant="small">{loadingText}</Text>
          </>
        )}
      </div>
    );
  }
}

export default StatusBar;

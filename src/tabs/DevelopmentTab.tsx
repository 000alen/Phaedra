import React from "react";

interface DevelopmentState {}

export class DevelopmentTab extends React.Component<
  TabProps,
  DevelopmentState
> {
  componentDidMount() {
    const { setActiveTabRef } = this.props;
    setActiveTabRef(this);
  }

  componentWillUnmount() {
    const { setActiveTabRef } = this.props;
    setActiveTabRef(undefined);
  }

  render() {
    return <div></div>;
  }
}

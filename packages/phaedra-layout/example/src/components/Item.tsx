import React from "react";

import style from "../css/Item.module.css";

interface ItemProps {}

interface ItemState {
  background: string;
}

function getRandomBackground() {
  const hue = ~~(Math.random() * 360);
  return `hsla(${hue}, 50%, 50%, 0.2)`;
}

export class Item extends React.Component<ItemProps, ItemState> {
  constructor(props: ItemProps) {
    super(props);

    this.changeBackground = this.changeBackground.bind(this);

    this.state = {
      background: getRandomBackground()
    };
  }

  changeBackground() {
    this.setState({
      background: getRandomBackground()
    });
  }

  render() {
    const { background } = this.state;

    const itemStyle: React.CSSProperties = {
      backgroundColor: background
    };

    return (
      <div
        className={style.div}
        style={itemStyle}
        onClick={this.changeBackground}
      />
    );
  }
}

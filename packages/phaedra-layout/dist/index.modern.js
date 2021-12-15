import React from 'react';

function computePosition(orientation, position) {
  return orientation === "horizontal" ? {
    left: `${position * 100}%`,
    top: "0"
  } : {
    left: "0",
    top: `${position * 100}%`
  };
}
function computeSize(orientation, size) {
  return orientation === "horizontal" ? {
    width: `${size * 100}%`,
    height: "100%"
  } : {
    width: "100%",
    height: `${size * 100}%`
  };
}

class Divider extends React.Component {
  computeSize(orientation) {
    return orientation === "horizontal" ? {
      width: "10px",
      height: "100%"
    } : {
      width: "100%",
      height: "10px"
    };
  }

  render() {
    const {
      orientation,
      next
    } = this.props;
    const style = {
      backgroundColor: "red",
      position: "absolute",
      ...computePosition(orientation, next.position),
      ...this.computeSize(orientation)
    };
    return React.createElement("div", {
      style: style
    });
  }

}

class Pane extends React.Component {
  constructor(props) {
    super(props);
    this.computeEdge = this.computeEdge.bind(this);
    this.computeRelativeSize = this.computeRelativeSize.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.paneRef = React.createRef();
  }

  computeEdge(event) {
    const {
      left,
      right,
      top,
      bottom
    } = this.paneRef.current.getBoundingClientRect();
    const {
      clientX,
      clientY
    } = event;
    const [distance, closestDirection] = [[clientX - left, "west"], [right - clientX, "east"], [clientY - top, "north"], [bottom - clientY, "south"]].sort(([a, b], [c, d]) => a - c)[0];
    return distance <= 100 ? closestDirection : null;
  }

  computeRelativeSize(orientation, event) {
    const {
      left,
      top,
      width,
      height
    } = this.paneRef.current.getBoundingClientRect();
    return orientation === "horizontal" ? event.clientX - left / width : event.clientY - top / height;
  }

  handleMouseDown(event) {
    if (!event.ctrlKey || !event.metaKey) return;
    const edge = this.computeEdge(event);
    if (edge === null) return;
    const {
      notebook,
      pageId,
      pane
    } = this.props;
    notebook.splitPageLayoutPane(pageId, pane.id, edge, this.computeRelativeSize(edge === "west" || edge === "east" ? "horizontal" : "vertical", event));
  }

  render() {
    const {
      pane,
      orientation,
      Component
    } = this.props;
    const {
      position,
      size,
      props
    } = pane;
    const style = {
      position: "absolute",
      ...computePosition(orientation, position),
      ...computeSize(orientation, size)
    };
    return React.createElement("div", {
      ref: this.paneRef,
      style: style,
      onMouseDown: this.handleMouseDown
    }, React.createElement(Component, Object.assign({}, props)));
  }

}

class Layout extends React.Component {
  render() {
    const {
      notebook,
      pageId,
      layout,
      orientation: parentOrientation,
      Component
    } = this.props;
    const {
      orientation,
      children
    } = layout;
    const style = {
      position: "relative",
      ...computePosition(parentOrientation, layout.position),
      ...computeSize(parentOrientation, layout.size)
    };
    return React.createElement("div", {
      style: style
    }, children.map(child => child.type === "layout" ? React.createElement(Layout, {
      key: child.id,
      notebook: notebook,
      pageId: pageId,
      layout: child,
      orientation: orientation,
      Component: Component
    }) : React.createElement(Pane, {
      key: child.id,
      notebook: notebook,
      pageId: pageId,
      pane: child,
      orientation: orientation,
      Component: Component
    })), children.slice(1).map((child, index) => React.createElement(Divider, {
      key: child.id,
      notebook: notebook,
      pageId: pageId,
      orientation: orientation,
      previous: children[index],
      next: child
    })));
  }

}

export { Layout };
//# sourceMappingURL=index.modern.js.map

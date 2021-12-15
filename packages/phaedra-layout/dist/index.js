function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function computePosition(orientation, position) {
  return orientation === "horizontal" ? {
    left: position * 100 + "%",
    top: "0"
  } : {
    left: "0",
    top: position * 100 + "%"
  };
}
function computeSize(orientation, size) {
  return orientation === "horizontal" ? {
    width: size * 100 + "%",
    height: "100%"
  } : {
    width: "100%",
    height: size * 100 + "%"
  };
}

var Divider = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(Divider, _React$Component);

  function Divider() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = Divider.prototype;

  _proto.computeSize = function computeSize(orientation) {
    return orientation === "horizontal" ? {
      width: "10px",
      height: "100%"
    } : {
      width: "100%",
      height: "10px"
    };
  };

  _proto.render = function render() {
    var _this$props = this.props,
        orientation = _this$props.orientation,
        next = _this$props.next;

    var style = _extends({
      backgroundColor: "red",
      position: "absolute"
    }, computePosition(orientation, next.position), this.computeSize(orientation));

    return React.createElement("div", {
      style: style
    });
  };

  return Divider;
}(React.Component);

var Pane = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(Pane, _React$Component);

  function Pane(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;
    _this.computeEdge = _this.computeEdge.bind(_assertThisInitialized(_this));
    _this.computeRelativeSize = _this.computeRelativeSize.bind(_assertThisInitialized(_this));
    _this.handleMouseDown = _this.handleMouseDown.bind(_assertThisInitialized(_this));
    _this.paneRef = React.createRef();
    return _this;
  }

  var _proto = Pane.prototype;

  _proto.computeEdge = function computeEdge(event) {
    var _this$paneRef$current = this.paneRef.current.getBoundingClientRect(),
        left = _this$paneRef$current.left,
        right = _this$paneRef$current.right,
        top = _this$paneRef$current.top,
        bottom = _this$paneRef$current.bottom;

    var clientX = event.clientX,
        clientY = event.clientY;
    var _sort$ = [[clientX - left, "west"], [right - clientX, "east"], [clientY - top, "north"], [bottom - clientY, "south"]].sort(function (_ref, _ref2) {
      var a = _ref[0];
      var c = _ref2[0];
      return a - c;
    })[0],
        distance = _sort$[0],
        closestDirection = _sort$[1];
    return distance <= 100 ? closestDirection : null;
  };

  _proto.computeRelativeSize = function computeRelativeSize(orientation, event) {
    var _this$paneRef$current2 = this.paneRef.current.getBoundingClientRect(),
        left = _this$paneRef$current2.left,
        top = _this$paneRef$current2.top,
        width = _this$paneRef$current2.width,
        height = _this$paneRef$current2.height;

    return orientation === "horizontal" ? event.clientX - left / width : event.clientY - top / height;
  };

  _proto.handleMouseDown = function handleMouseDown(event) {
    if (!event.ctrlKey || !event.metaKey) return;
    var edge = this.computeEdge(event);
    if (edge === null) return;
    var _this$props = this.props,
        notebook = _this$props.notebook,
        pageId = _this$props.pageId,
        pane = _this$props.pane;
    notebook.splitPageLayoutPane(pageId, pane.id, edge, this.computeRelativeSize(edge === "west" || edge === "east" ? "horizontal" : "vertical", event));
  };

  _proto.render = function render() {
    var _this$props2 = this.props,
        pane = _this$props2.pane,
        orientation = _this$props2.orientation,
        Component = _this$props2.Component;
    var position = pane.position,
        size = pane.size,
        props = pane.props;

    var style = _extends({
      position: "absolute"
    }, computePosition(orientation, position), computeSize(orientation, size));

    return React.createElement("div", {
      ref: this.paneRef,
      style: style,
      onMouseDown: this.handleMouseDown
    }, React.createElement(Component, Object.assign({}, props)));
  };

  return Pane;
}(React.Component);

var Layout = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(Layout, _React$Component);

  function Layout() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = Layout.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        notebook = _this$props.notebook,
        pageId = _this$props.pageId,
        layout = _this$props.layout,
        parentOrientation = _this$props.orientation,
        Component = _this$props.Component;
    var orientation = layout.orientation,
        children = layout.children;

    var style = _extends({
      position: "relative"
    }, computePosition(parentOrientation, layout.position), computeSize(parentOrientation, layout.size));

    return React.createElement("div", {
      style: style
    }, children.map(function (child) {
      return child.type === "layout" ? React.createElement(Layout, {
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
      });
    }), children.slice(1).map(function (child, index) {
      return React.createElement(Divider, {
        key: child.id,
        notebook: notebook,
        pageId: pageId,
        orientation: orientation,
        previous: children[index],
        next: child
      });
    }));
  };

  return Layout;
}(React.Component);

exports.Layout = Layout;
//# sourceMappingURL=index.js.map

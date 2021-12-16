import generateName from 'project-name-generator';
import { v4 } from 'uuid';

function makeSource(_ref) {
  var id = _ref.id,
      title = _ref.title,
      type = _ref.type,
      content = _ref.content,
      path = _ref.path,
      index = _ref.index;
  if (id === undefined) id = v4();
  if (title === undefined) title = generateName().spaced;
  if (type === undefined) type = "unknown";
  if (content === undefined) content = "";
  if (path === undefined) path = undefined;
  if (index === undefined) index = undefined;
  return {
    id: id,
    title: title,
    type: type,
    content: content,
    path: path,
    index: index
  };
}
function makeReference(_ref2) {
  var id = _ref2.id,
      title = _ref2.title,
      sourceId = _ref2.sourceId;
  if (id === undefined) id = v4();
  if (title === undefined) title = generateName().spaced;
  if (sourceId === undefined) sourceId = "unknown";
  return {
    id: id,
    title: title,
    sourceId: sourceId
  };
}
function makePaneProps(_ref3) {
  var type = _ref3.type,
      paramId = _ref3.paramId;
  if (type === undefined) type = "default";
  if (paramId === undefined) paramId = undefined;
  return {
    type: type,
    paramId: paramId
  };
}
function makePane(_ref4) {
  var id = _ref4.id,
      position = _ref4.position,
      size = _ref4.size,
      previous = _ref4.previous,
      next = _ref4.next,
      props = _ref4.props;
  if (id === undefined) id = v4();
  if (position === undefined) position = 0;
  if (size === undefined) size = 1;
  if (previous === undefined) previous = null;
  if (next === undefined) next = null;
  if (props === undefined) props = makePaneProps({});
  return {
    type: "pane",
    id: id,
    position: position,
    size: size,
    previous: previous,
    next: next,
    props: props
  };
}
function makeLayout(_ref5) {
  var id = _ref5.id,
      position = _ref5.position,
      size = _ref5.size,
      orientation = _ref5.orientation,
      previous = _ref5.previous,
      next = _ref5.next,
      children = _ref5.children;
  if (id === undefined) id = v4();
  if (position === undefined) position = 0;
  if (size === undefined) size = 1;
  if (orientation === undefined) orientation = "horizontal";
  if (previous === undefined) previous = null;
  if (next === undefined) next = null;
  if (children === undefined) children = [makePane({})];
  return {
    type: "layout",
    id: id,
    position: position,
    size: size,
    orientation: orientation,
    previous: previous,
    next: next,
    children: children
  };
}
function makeContent(_ref6) {
  var ops = _ref6.ops;
  if (ops === undefined) ops = [];
  return {
    ops: ops
  };
}
function makeQuill(_ref7) {
  var id = _ref7.id,
      content = _ref7.content;
  if (id === undefined) id = v4();
  if (content === undefined) content = makeContent({});
  return {
    id: id,
    content: content
  };
}
function makePage(_ref8) {
  var id = _ref8.id,
      references = _ref8.references,
      layout = _ref8.layout,
      content = _ref8.content,
      quills = _ref8.quills;
  if (id === undefined) id = v4();
  if (references === undefined) references = [];
  if (layout === undefined) layout = makeLayout({});
  if (content === undefined) content = makeContent({});
  if (quills === undefined) quills = [];
  return {
    id: id,
    references: references,
    layout: layout,
    content: content,
    quills: quills
  };
}

export { makeContent, makeLayout, makePage, makePane, makePaneProps, makeQuill, makeReference, makeSource };
//# sourceMappingURL=index.modern.js.map

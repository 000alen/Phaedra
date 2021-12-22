import generateName from 'project-name-generator';
import { v4 } from 'uuid';

var Notebook = /*#__PURE__*/function () {
  function Notebook(_ref) {
    var id = _ref.id,
        name = _ref.name,
        sources = _ref.sources,
        pages = _ref.pages;
    this.id = id || v4();
    this.name = name || generateName().spaced;
    this.sources = sources || [];
    this.pages = pages || [];
  }

  var _proto = Notebook.prototype;

  _proto.JSON = function JSON() {
    return {
      id: this.id,
      name: this.name,
      sources: this.sources,
      pages: this.pages
    };
  };

  _proto.getId = function getId() {
    return this.id;
  };

  _proto.getName = function getName() {
    return this.name;
  };

  _proto.getSources = function getSources() {
    return this.sources;
  };

  _proto.getPages = function getPages() {
    return this.pages;
  };

  _proto.getSource = function getSource(sourceId) {
    return this.sources.find(function (source) {
      return source.id === sourceId;
    });
  };

  _proto.getPage = function getPage(pageId) {
    return this.pages.find(function (page) {
      return page.id === pageId;
    });
  };

  _proto.getPageReferences = function getPageReferences(pageId) {
    var _this$getPage;

    return (_this$getPage = this.getPage(pageId)) === null || _this$getPage === void 0 ? void 0 : _this$getPage.references;
  };

  _proto.getPageLayout = function getPageLayout(pageId) {
    var _this$getPage2;

    return (_this$getPage2 = this.getPage(pageId)) === null || _this$getPage2 === void 0 ? void 0 : _this$getPage2.layout;
  };

  _proto.getPageLayoutPanes = function getPageLayoutPanes(pageId) {
    throw new Error("Not implemented");
  };

  _proto.getPageContent = function getPageContent(pageId) {
    var _this$getPage3;

    return (_this$getPage3 = this.getPage(pageId)) === null || _this$getPage3 === void 0 ? void 0 : _this$getPage3.content;
  };

  _proto.getPageQuills = function getPageQuills(pageId) {
    var _this$getPage4;

    return (_this$getPage4 = this.getPage(pageId)) === null || _this$getPage4 === void 0 ? void 0 : _this$getPage4.quills;
  };

  _proto.getPageReference = function getPageReference(pageId, referenceId) {
    var _this$getPageReferenc;

    return (_this$getPageReferenc = this.getPageReferences(pageId)) === null || _this$getPageReferenc === void 0 ? void 0 : _this$getPageReferenc.find(function (reference) {
      return reference.id === referenceId;
    });
  };

  _proto.getPageLayoutPane = function getPageLayoutPane(pageId, paneId) {
    throw new Error("Not implemented");
  };

  _proto.getPageQuill = function getPageQuill(pageId, quillId) {
    var _this$getPageQuills;

    return (_this$getPageQuills = this.getPageQuills(pageId)) === null || _this$getPageQuills === void 0 ? void 0 : _this$getPageQuills.find(function (quill) {
      return quill.id === quillId;
    });
  };

  _proto.addSource = function addSource(source) {
    this.sources.push(source);
  };

  _proto.addPage = function addPage(page) {
    this.pages.push(page);
  };

  _proto.addPageReference = function addPageReference(pageId, reference) {
    var _this$getPage5;

    (_this$getPage5 = this.getPage(pageId)) === null || _this$getPage5 === void 0 ? void 0 : _this$getPage5.references.push(reference);
  };

  _proto.addPageQuill = function addPageQuill(pageId, quill) {
    var _this$getPageQuills2;

    (_this$getPageQuills2 = this.getPageQuills(pageId)) === null || _this$getPageQuills2 === void 0 ? void 0 : _this$getPageQuills2.push(quill);
  };

  _proto.removeSource = function removeSource(sourceId) {
    this.sources = this.sources.filter(function (source) {
      return source.id !== sourceId;
    });
  };

  _proto.removePage = function removePage(pageId) {
    this.pages = this.pages.filter(function (page) {
      return page.id !== pageId;
    });
  };

  _proto.removePageReference = function removePageReference(pageId, referenceId) {
    var page = this.getPage(pageId);
    if (page) page.references = page.references.filter(function (reference) {
      return reference.id !== referenceId;
    });
  };

  _proto.removePageLayoutPane = function removePageLayoutPane(pageId, paneId) {
    throw new Error("Not implemented");
  };

  _proto.removePageQuill = function removePageQuill(pageId, quillId) {
    var page = this.getPage(pageId);
    if (page) page.quills = page.quills.filter(function (quill) {
      return quill.id !== quillId;
    });
  };

  _proto.rename = function rename(name) {
    this.name = name;
  };

  _proto.editPageContent = function editPageContent(pageId, operation) {
    var page = this.getPage(pageId);
    if (page) page.content.ops.push(operation);
  };

  _proto.editPageQuill = function editPageQuill(pageId, quillId, operation) {
    var quill = this.getPageQuill(pageId, quillId);
    if (quill) quill.content.ops.push(operation);
  };

  _proto.splitPageLayoutPane = function splitPageLayoutPane(pageId, paneId, edge, size) {
    throw new Error("Not implemented");
  };

  _proto.resizePageLayoutPane = function resizePageLayoutPane(pageId, paneId, edge, size) {
    throw new Error("Not implemented");
  };

  return Notebook;
}();

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

export { Notebook, makeContent, makeLayout, makePage, makePane, makePaneProps, makeQuill, makeReference, makeSource };
//# sourceMappingURL=index.modern.js.map

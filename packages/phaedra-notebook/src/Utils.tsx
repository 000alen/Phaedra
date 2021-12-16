import generateName from "project-name-generator";
import { v4 as uuidv4 } from "uuid";

import {
  IContent, ILayout, IPage, IPane, IPaneProps, IQuill, IReference, ISource
} from "./Notebook";

export function makeSource({
  id,
  title,
  type,
  content,
  path,
  index
}: Partial<ISource>): ISource {
  if (id === undefined) id = uuidv4();
  if (title === undefined) title = generateName().spaced;
  if (type === undefined) type = "unknown";
  if (content === undefined) content = "";
  if (path === undefined) path = undefined;
  if (index === undefined) index = undefined;

  return {
    id,
    title,
    type,
    content,
    path,
    index
  };
}

export function makeReference({
  id,
  title,
  sourceId
}: Partial<IReference>): IReference {
  if (id === undefined) id = uuidv4();
  if (title === undefined) title = generateName().spaced;
  if (sourceId === undefined) sourceId = "unknown";

  return {
    id,
    title,
    sourceId
  };
}

export function makePaneProps({
  type,
  paramId
}: Partial<IPaneProps>): IPaneProps {
  if (type === undefined) type = "default";
  if (paramId === undefined) paramId = undefined;

  return {
    type,
    paramId
  };
}

export function makePane({
  id,
  position,
  size,
  previous,
  next,
  props
}: Partial<IPane>): IPane {
  if (id === undefined) id = uuidv4();
  if (position === undefined) position = 0;
  if (size === undefined) size = 1;
  if (previous === undefined) previous = null;
  if (next === undefined) next = null;
  if (props === undefined) props = makePaneProps({});

  return {
    type: "pane",
    id,
    position,
    size,
    previous,
    next,
    props
  };
}

export function makeLayout({
  id,
  position,
  size,
  orientation,
  previous,
  next,
  children
}: Partial<ILayout>): ILayout {
  if (id === undefined) id = uuidv4();
  if (position === undefined) position = 0;
  if (size === undefined) size = 1;
  if (orientation === undefined) orientation = "horizontal";
  if (previous === undefined) previous = null;
  if (next === undefined) next = null;
  if (children === undefined) children = [makePane({})];

  return {
    type: "layout",
    id,
    position,
    size,
    orientation,
    previous,
    next,
    children
  };
}

export function makeContent({ ops }: Partial<IContent>): IContent {
  if (ops === undefined) ops = [];

  return {
    ops
  };
}

export function makeQuill({ id, content }: Partial<IQuill>): IQuill {
  if (id === undefined) id = uuidv4();
  if (content === undefined) content = makeContent({});

  return {
    id,
    content
  };
}

export function makePage({
  id,
  references,
  layout,
  content,
  quills
}: Partial<IPage>): IPage {
  if (id === undefined) id = uuidv4();
  if (references === undefined) references = [];
  if (layout === undefined) layout = makeLayout({});
  if (content === undefined) content = makeContent({});
  if (quills === undefined) quills = [];

  return {
    id,
    references,
    layout,
    content,
    quills
  };
}

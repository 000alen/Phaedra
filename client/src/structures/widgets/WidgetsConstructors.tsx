import { v4 as uuidv4 } from "uuid";

import { IWidget } from "./IWidgetsManipulation";

export function createWidget({ id, element }: Partial<IWidget>): IWidget {
  if (!id) id = uuidv4();
  if (!element) element = <div>{id}</div>;
  return { id: id, element: element };
}

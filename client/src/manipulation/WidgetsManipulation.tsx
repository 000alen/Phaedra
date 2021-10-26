import { v4 as uuidv4 } from "uuid";

import { IWidget, IWidgetsCommand } from "./IWidgetsManipulation";

export function createWidget({ id, element }: Partial<IWidget>): IWidget {
  if (!id) id = uuidv4();
  if (!element) element = <div>{id}</div>;
  return { id: id, element: element };
}

export function addWidget(
  widgets: IWidget[],
  { widget }: IWidgetsCommand
): IWidget[] {
  return [...widgets, widget!];
}

export function removeWidget(
  widgets: IWidget[],
  { id }: IWidgetsCommand
): IWidget[] {
  return widgets.filter((widget) => widget.id === id);
}

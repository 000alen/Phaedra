import { IWidget, IWidgetsCommand } from "./IWidgetsManipulation";

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

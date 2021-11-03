import { v4 as uuidv4 } from "uuid";

export interface IWidget {
  id: string;
  element: JSX.Element;
}

export interface IWidgetsManipulationArguments {
  widget?: IWidget;
  id?: string;
}

export type IWidgetsManipulation = (
  widgets: IWidget[],
  args: Partial<IWidgetsManipulationArguments>
) => IWidget[];

export function createWidget({ id, element }: Partial<IWidget>): IWidget {
  if (!id) id = uuidv4();
  if (!element) element = <div>{id}</div>;
  return { id: id, element: element };
}

export function addWidget(
  widgets: IWidget[],
  { widget }: IWidgetsManipulationArguments
): IWidget[] {
  return [...widgets, widget!];
}

export function removeWidget(
  widgets: IWidget[],
  { id }: IWidgetsManipulationArguments
): IWidget[] {
  return widgets.filter((widget) => widget.id === id);
}

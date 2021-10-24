export interface IWidget {
  id: string;
  element: JSX.Element;
}

export interface IWidgetsCommand {
  widget?: IWidget;
  id?: string;
}

export type IWidgetsManipulation = (
  widgets: IWidget[],
  args: Partial<IWidgetsCommand>
) => IWidget[];

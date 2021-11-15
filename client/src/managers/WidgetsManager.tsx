import { useState } from "react";

import { IWidget } from "../App";

export function useWidgets(initialWidgets: IWidget[]) {
  const [widgets, setWidgets] = useState(initialWidgets);

  return {
    widgets,
    widgetsManager: new WidgetsManager(widgets, setWidgets),
  };
}

export class WidgetsManager {
  widgets: IWidget[];
  setWidgets: (widgets: IWidget[]) => void;

  constructor(widgets: IWidget[], setWidgets: (widgets: IWidget[]) => void) {
    this.widgets = widgets;
    this.setWidgets = setWidgets;
  }
}

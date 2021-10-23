import { IIconProps } from "@fluentui/react";

export interface CardComponentProps {
  iconProps: IIconProps;
  title: string;
  subtitle: string;
  onClick: (
    event: React.SyntheticEvent<HTMLElement, Event> | undefined
  ) => void;
}

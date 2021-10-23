export interface StatusBarController {
  setLoadingText: (text: string) => void;
  showLoading: () => void;
  hideLoading: () => void;
}

export interface StatusBarComponentProps {}

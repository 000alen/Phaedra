export interface FileFilter {
  extensions: string[];
  name: string;
}

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: FileFilter[];
  properties?: Array<
    | "openFile"
    | "openDirectory"
    | "multiSelections"
    | "showHiddenFiles"
    | "createDirectory"
    | "promptToCreate"
    | "noResolveAliases"
    | "treatPackageAsDirectory"
    | "dontAddToRecent"
  >;
  message?: string;
  securityScopedBookmarks?: boolean;
}

export interface OpenDialogReturnValue {
  canceled: boolean;
  filePaths: string[];
  bookmarks?: string[];
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: FileFilter[];
  message?: string;
  nameFieldLabel?: string;
  showsTagField?: boolean;
  properties?: Array<
    | "showHiddenFiles"
    | "createDirectory"
    | "treatPackageAsDirectory"
    | "showOverwriteConfirmation"
    | "dontAddToRecent"
  >;
  securityScopedBookmarks?: boolean;
}

export interface StoreFile {
  path: string;
  name: string;
  lastOpened: string;
}

export interface SaveDialogReturnValue {
  canceled: boolean;
  filePath?: string;
  bookmark?: string;
}

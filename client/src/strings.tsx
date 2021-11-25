export const en_strings = {
  unknownError: "An unknown error occurred",
  documentLoadingError: "An error occurred while loading the document",

  notebookManipulationError:
    "An error occurred while manipulating the Notebook",

  noActiveCell: "There's no cell selected.",
  noActivePage: "There's no page selected.",
  noActiveCellOrPage: "There's no cell or page selected.",

  noQuestion: "There's no question specified",
  noPrompt: "There's no prompt specified",
  noQuery: "There's no query specified.",
  noWord: "There's no word specified.",

  newTabTitle: "New Tab",
  newNotebookTitle: "New Notebook",
  newCellContent: "",
  newTaskTitle: "New Task",
  newMessageTitle: "New Message",

  openFileButtonLabel: "Open File",
  openFileButtonDescription: "Open a PDF document or a JSON Notebook",

  createFileTitle: "Create File",
  createFileSubtitle: "Create a JSON Notebook",

  connectBackend: "Connect to Backend",

  commandBoxPlaceholder: "Command",

  ribbonFileHeader: "File",
  ribbonHomeHeader: "Home",
  ribbonEditHeader: "Edit",
  ribbonInsertHeader: "Insert",
  ribbonReviewHeader: "Review",
  ribbonViewHeader: "View",

  testButtonLabel: "Test",
  undoButtonLabel: "Undo",
  redoButtonLabel: "Redo",
  cutButtonLabel: "Cut",
  copyButtonLabel: "Copy",
  pasteButtonLabel: "Paste",
  entitiesButtonLabel: "Entities",
  wikipediaButtonLabel: "Wikipedia",
  wikipediaSummaryButtonLabel: "Wikipedia Summary",
  wikipediaSuggestionsButtonLabel: "Wikipedia Suggestions",
  wikipediaImageButtonLabel: "Wikipedia Image",
  dictionaryButtonLabel: "Dictionary",
  meaningButtonLabel: "Meaning",
  synonymsButtonLabel: "Synonyms",
  antonymsButtonLabel: "Antonyms",
  exportButtonLabel: "Export",

  notebooksFilterName: "Notebooks",

  navigationHomeGroupTitle: "Home",
  navigationRecentItemTitle: "Recent",
  navigationPinnedItemTitle: "Pinned",
  navigationNewGroupTitle: "New",
  navigationEmptyItemTitle: "Empty",
  navigationFromPdfItemTitle: "From PDF",
  navigationFromTextItemTitle: "From Text",
  navigationOpenGroupTitle: "Open",
  navigationNotebookItemTitle: "Notebook",
  navigationSettingsGroupTitle: "Settings",
  navigationBackendItemTitle: "Backend",

  nameButtonLabel: "Name",
  pathButtonLabel: "Path",
  lastOpenedButtonLabel: "Last Opened",

  loadingDocumentTaskLabel: "Loading document",
  savingNotebookTaskLabel: "Saving notebook",
  savingNotebookTaskError: "Could not save notebook",

  openTextFileButtonLabel: "Open text file",
  openTextFileButtonDescription: "Create a notebook from a text file",

  openNotebookButtonLabel: "Open notebook",
  openNotebookButtonDescription: "Open a Phaedra notebook",

  openPdfFileButtonLabel: "Open PDF file",
  openPdfFileButtonDescription: "Create a notebook from a PDF file",

  createNotebookButtonLabel: "Create notebook",
  createNotebookButtonDescription: "Create a Phaedra notebook",

  setButtonLabel: "Set",

  pingApiButtonLabel: "Ping API",

  backendUrlLabel: "Backend URL",

  openingFileTaskLabel: "Opening file",

  welcome: "Welcome to Phaedra!",
};

export function getStrings(): { [key: string]: string } {
  return en_strings;
}

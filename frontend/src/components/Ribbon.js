import React from 'react';
import { Pivot, PivotItem, CommandBar } from '@fluentui/react';
import { ipcRenderer, theme } from '../index';
import {createPage} from './Notebook/Page';
import {createCell} from './Notebook/Cell';

function Ribbon({ notebookRef, commandBoxRef }) {
  const ribbonStyle = {
    backgroundColor: theme.palette.white,
  };

  const handleSave = () => {
    const {notebookPath, notebook} = notebookRef.current.state;
    ipcRenderer.invoke('writeFile', notebookPath, JSON.stringify(notebook));
  };

  const handleQuestion = () => {
    const {notebookController, activePage} = notebookRef.current.state;
    const {command} = commandBoxRef.current.state;
    notebookController.addQuestionCell(command, activePage);
    commandBoxRef.current.consume();
  };

  const handleInsertPage = () => {
    const {notebookController, activePage} = notebookRef.current.state;
    const activePageIndex = notebookController.indexPage(activePage);
    notebookController.insertPage(createPage(), activePageIndex + 1);
  };

  const handleInsertCell = () => {
    const {notebookController, activePage, activeCell} = notebookRef.current.state;
    const activeCellIndex = notebookController.indexCell(activePage, activeCell);
    notebookController.insertCell(activePage, createCell(), activeCellIndex + 1);
  };

  
  const handleWikipediaSummary = () => {
    const {notebookController, activePage} = notebookRef.current.state;
    const {command} = commandBoxRef.current.state;
    notebookController.addWikipediaSummaryCell(command, activePage);
    commandBoxRef.current.consume();
  };

  const handleWikipediaSuggestions = () => {
    const {notebookController, activePage} = notebookRef.current.state;
    const {command} = commandBoxRef.current.state;
    notebookController.addWikipediaSuggestionsCell(command, activePage);
    commandBoxRef.current.consume();
  };

  const handleWikipediaImage = () => {
    const {notebookController, activePage} = notebookRef.current.state;
    const {command} = commandBoxRef.current.state;
    notebookController.addWikipediaImageCell(command, activePage);
    commandBoxRef.current.consume();
  };

  const homeItems = [
    {
      key: 'save',
      text: 'Save',
      iconProps: { iconName: 'Save' },
      onClick: handleSave,
    },
    {
      key: 'question',
      text: 'Question',
      iconProps: { iconName: 'SurveyQuestions' },
      onClick: handleQuestion
    }
  ];

  const insertItems = [
    {
      key: 'insertPage',
      text: 'Insert Page',
      iconProps: { iconName: 'Add' },
      onClick: handleInsertPage,
    },
    {
      key: 'insertCell',
      text: 'Insert Cell',
      iconProps: { iconName: 'Add' },
      onClick: handleInsertCell,
    },
    {
      key: 'wikipediaSummary',
      text: 'Wikipedia Summary',
      iconProps: { iconName: 'Add' },
      onClick: handleWikipediaSummary,
    },
    {
      key: 'wikipediaSuggestions',
      text: 'Wikipedia Suggestions',
      iconProps: { iconName: 'Add' },
      onClick: handleWikipediaSuggestions,
    },
    {
      key: 'wikipediaImage',
      text: 'Wikipedia Image',
      iconProps: { iconName: 'Add' },
      onClick: handleWikipediaImage,
    }
  ];

  const reviewItems = [];

  const viewItems = [];

  return (
    <div style={ribbonStyle}>
      <Pivot aria-label="Ribbon">
        <PivotItem headerText="Home" itemKey="home">
          <CommandBar items={homeItems} />
        </PivotItem>

        <PivotItem headerText="Insert" itemKey="insert">
          <CommandBar items={insertItems} />
        </PivotItem>

        <PivotItem headerText="Review" itemKey="review">
          <CommandBar items={reviewItems} />
        </PivotItem>

        <PivotItem headerText="View" itemKey="view">
          <CommandBar items={viewItems} />
        </PivotItem>
      </Pivot>
    </div>
  );
}

export default Ribbon;

import React from 'react';
import { Pivot, PivotItem, CommandBar } from '@fluentui/react';
import { ipcRenderer, theme } from '../index';
import {createPage} from './Notebook/Page';
import {createCell} from './Notebook/Cell';

function Ribbon({ notebookRef }) {
  const ribbonStyle = {
    backgroundColor: theme.palette.white,
  };

  const handleSave = () => {
    const {path, notebook} = notebookRef.current.state;
    ipcRenderer.invoke('writeFile', path, JSON.stringify(notebook));
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

  const homeItems = [
    {
      key: 'save',
      text: 'Save',
      iconProps: { iconName: 'Save' },
      onClick: handleSave,
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

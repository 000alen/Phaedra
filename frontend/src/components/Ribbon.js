import React from 'react';
import { Pivot, PivotItem, CommandBar } from '@fluentui/react';
import { theme } from '../index';
import { createPage } from './Notebook/Page';
import { createCell } from './Notebook/Cell';
import { v4 as uuidv4 } from 'uuid';

function Ribbon({ notebookRef, commandBoxRef, appController, pageController }) {

    const handleSave = () => {
        const { notebookController } = notebookRef.current.state;
        notebookController.save();
    };

    const handleCopy = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage, activeCell } = notebookRef.current.state;
        const cell = notebookController.getCell(activePage, activeCell);
        appController.setClipboard(cell);
    };
    
    const handlePaste = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage, activeCell } = notebookRef.current.state;
        const activeCellIndex = notebookController.indexCell(activePage, activeCell);
        let cell = { ...appController.getClipboard() };
        cell.id = uuidv4();
        notebookController.insertCell(activePage, cell, activeCellIndex + 1);    
    };

    const handleEdit = () => {
        const { notebookController } = notebookRef.current.state;
        notebookController.toggleEditing();
    };

    const handleQuestion = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage } = notebookRef.current.state;
        const { command } = commandBoxRef.current.state;
        notebookController.addQuestionCell(command, activePage);
        commandBoxRef.current.consume();
    };

    const handleInsertPage = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage } = notebookRef.current.state;
        const activePageIndex = notebookController.indexPage(activePage);
        notebookController.insertPage(createPage(), activePageIndex + 1);
    };

    const handleInsertCell = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage, activeCell } = notebookRef.current.state;
        const activeCellIndex = notebookController.indexCell(activePage, activeCell);
        notebookController.insertCell(activePage, createCell(), activeCellIndex + 1);
    };

    const handleWikipediaSummary = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage } = notebookRef.current.state;
        const { command } = commandBoxRef.current.state;
        notebookController.addWikipediaSummaryCell(command, activePage);
        commandBoxRef.current.consume();
    };

    const handleWikipediaSuggestions = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage } = notebookRef.current.state;
        const { command } = commandBoxRef.current.state;
        notebookController.addWikipediaSuggestionsCell(command, activePage);
        commandBoxRef.current.consume();
    };

    const handleWikipediaImage = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage } = notebookRef.current.state;
        const { command } = commandBoxRef.current.state;
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
            key: 'copy',
            text: 'Copy',
            iconProps: { iconName: 'Copy' },
            onClick: handleCopy,
        },
        {
            key: 'paste',
            text: 'Paste',
            iconProps: { iconName: 'Paste' },
            onClick: handlePaste,
        },
        {
            key: 'edit',
            text: 'Edit',
            iconProps: { iconName: 'Edit' },
            onClick: handleEdit,
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

    const ribbonStyle = {
        backgroundColor: theme.palette.white,
    };

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

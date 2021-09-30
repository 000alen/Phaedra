import React from 'react';
import {CommandBar} from '@fluentui/react';
import {v4 as uuidv4} from 'uuid';

function HomeItems({ notebookRef, commandBoxRef, appController, pageController }) {
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

    return (
        <CommandBar items={homeItems} />
    )
}

export default HomeItems;

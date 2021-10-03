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
    
    const handleGenerate = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage } = notebookRef.current.state;
        const { command } = commandBoxRef.current.state;
        notebookController.addGenerateCell(command, activePage);
        commandBoxRef.current.consume();    
    };

    const homeItems = [
        {
            key: 'save',
            iconProps: { iconName: 'Save' },
            onClick: handleSave,
        },
        {
            key: 'history',
            iconProps: { iconName: 'History' },
            subMenuProps: {
                items: [
                    {
                        key: 'undo',
                        text: 'Undo',
                        iconProps: { iconName: 'Undo' },
                    },
                    {
                        key: 'redo',
                        text: 'Redo',
                        iconProps: { iconName: 'Redo' },
                    }
                ]
            }
        },

        {
            key: 'clipboard',
            iconProps: { iconName: 'ClipboardSolid' },
            subMenuProps: {
                items: [
                    {
                        key: 'cut',
                        text: 'Cut',
                        iconProps: { iconName: 'Cut' },
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
            
                ]
            }
        },
        {
            key: 'bold',
            iconProps: { iconName: 'Bold' },
        },
        {
            key: 'italic',
            iconProps: { iconName: 'Italic' },
        },
        {
            key: 'underline',
            iconProps: { iconName: 'Underline' },
        },
        {
            key: 'moreFontOptions',
            iconProps: { iconName: 'More' },
            subMenuProps: {
                items: [
                    {
                        key: 'strikethrough',
                        text: 'Strikethrough',
                        iconProps: { iconName: 'Strikethrough' },
                    },
                    {
                        key: 'subscript',
                        text: 'Subscript',
                        iconProps: { iconName: 'Subscript' },
                    },
                    {
                        key: 'superscript',
                        text: 'Superscript',
                        iconProps: { iconName: 'Superscript' },
                    },
                    {
                        key: 'fontColor',
                        text: 'Font Color',
                        iconProps: { iconName: 'FontColor' },
                    },
                    {
                        key: 'highlight',
                        text: 'Highlight',
                        iconProps: { iconName: 'Highlight' },
                    },
                    {
                        key: 'clearFormatting',
                        text: 'Clear Formatting',
                        iconProps: { iconName: 'ClearFormatting' },
                    }
                ]
            }
        },
        {
            key: 'bullet',
            iconProps: { iconName: 'BulletedList' },
        },
        {
            key: 'number',
            iconProps: { iconName: 'NumberedList' },
        }
    ];    

    const homeFarItems = [
        {
            key: 'generate',
            iconProps: { iconName: 'Processing' },
            onClick: handleGenerate
        },
        {
            key: 'question',
            iconProps: { iconName: 'Search' },
            onClick: handleQuestion
        },
        {
            key: 'edit',
            iconProps: { iconName: 'Edit' },
            onClick: handleEdit,
        },
    ];

    return (
        <CommandBar items={homeItems}  farItems={homeFarItems}/>
    )
}

export default HomeItems;

import React from 'react';
import { CommandBar, MessageBarType } from '@fluentui/react';
import { createPage } from '../../Notebook/Page';
import { createCell } from '../../Notebook/Cell';
import { v4 as uuidv4 } from 'uuid';

function HomeItems({ notebookRef, commandBoxRef, appController, pageController }) {
    const handleSave = () => {
        const { notebookController } = notebookRef.current.state;
        notebookController.save();
    };

    const handleInsertPage = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage } = notebookRef.current.state;

        if (activePage) {
            const activePageIndex = notebookController.indexPage(activePage);
            notebookController.insertPage(createPage(), activePageIndex + 1);
        } else {
            pageController.addMessageBar(
                "No page selected",
                MessageBarType.error
            );
        }
    };

    const handleInsertCell = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage, activeCell } = notebookRef.current.state;
        if (activeCell) {
            const activeCellIndex = notebookController.indexCell(activePage, activeCell);
            notebookController.insertCell(activePage, createCell(), activeCellIndex + 1);
        } else {
            pageController.addMessageBar(
                "No cell selected",
                MessageBarType.error
            );
        }
    };

    const handleDelete = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage, activeCell } = notebookRef.current.state;

        if (activeCell) {
            const cell = notebookController.getCell(activePage, activeCell);
            appController.setClipboard(cell);
            notebookController.removeCell(activePage, activeCell);
        } else {
            pageController.addMessageBar(
                "No page selected",
                MessageBarType.error
            );
        }
    };

    const handleUndo = () => {
        const { notebookController } = notebookRef.current.state;
        notebookController.undo();
    };

    const handleRedo = () => {
        const { notebookController } = notebookRef.current.state;
        notebookController.redo();
    };

    const handleCut = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage, activeCell } = notebookRef.current.state;

        if (activeCell) {
            const cell = notebookController.getCell(activePage, activeCell);
            appController.setClipboard(cell);
            notebookController.removeCell(activePage, activeCell);
        } else {
            pageController.addMessageBar(
                "No cell selected",
                MessageBarType.error
            );
        }
    };

    const handleCopy = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage, activeCell } = notebookRef.current.state;

        if (activeCell) {
            const cell = notebookController.getCell(activePage, activeCell);
            appController.setClipboard(cell);
        } else {
            pageController.addMessageBar(
                "No cell selected",
                MessageBarType.error
            );
        }
    };

    const handlePaste = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage, activeCell } = notebookRef.current.state;
        if (activeCell) {
            const activeCellIndex = notebookController.indexCell(activePage, activeCell);
            let cell = { ...appController.getClipboard() };
            cell.id = uuidv4();
            notebookController.insertCell(activePage, cell, activeCellIndex + 1);    
        } else {
            pageController.addMessageBar(
                "No cell selected",
                MessageBarType.error
            );
        }
    };

    const handleEdit = () => {
        const { notebookController } = notebookRef.current.state;
        notebookController.toggleEditing();
    };

    const handleQuestion = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage } = notebookRef.current.state;
        if (activePage && commandBoxRef.current) {
            const { command } = commandBoxRef.current.state;
            notebookController.addQuestionCell(command, activePage);
            commandBoxRef.current.consume();
        } else if (activePage) {
            pageController.addMessageBar(
                "No question",
                MessageBarType.error
            );
        } else {
            pageController.addMessageBar(
                "No page selected",
                MessageBarType.error
            );
        }
    };

    const handleGenerate = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage } = notebookRef.current.state;
        if (activePage && commandBoxRef.current) {
            const { command } = commandBoxRef.current.state;
            notebookController.addGenerateCell(command, activePage);
            commandBoxRef.current.consume();
        } else if (activePage) {
            pageController.addMessageBar(
                "No prompt",
                MessageBarType.error
            );
        } else {
            pageController.addMessageBar(
                "No page selected",
                MessageBarType.error
            );
        }
    };

    const homeItems = [
        {
            key: 'save',
            iconProps: { iconName: 'Save' },
            onClick: handleSave,
        },
        {
            key: 'insert',
            iconProps: { iconName: 'Add' },
            subMenuProps: {
                items: [
                    {
                        key: 'insertPage',
                        text: 'Insert Page',
                        onClick: handleInsertPage,
                    },
                    {
                        key: 'insertCell',
                        text: 'Insert Cell',
                        onClick: handleInsertCell,
                    },
                ]
            }
        },
        {
            key: 'delete',
            iconProps: { iconName: 'Delete' },
            onClick: handleDelete,
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
                        onClick: handleUndo,
                    },
                    {
                        key: 'redo',
                        text: 'Redo',
                        iconProps: { iconName: 'Redo' },
                        onClick: handleRedo,
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
                        onClick: handleCut,
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
        // {
        //     key: 'bold',
        //     iconProps: { iconName: 'Bold' },
        // },
        // {
        //     key: 'italic',
        //     iconProps: { iconName: 'Italic' },
        // },
        // {
        //     key: 'underline',
        //     iconProps: { iconName: 'Underline' },
        // },
        // {
        //     key: 'moreFontOptions',
        //     iconProps: { iconName: 'More' },
        //     subMenuProps: {
        //         items: [
        //             {
        //                 key: 'strikethrough',
        //                 text: 'Strikethrough',
        //                 iconProps: { iconName: 'Strikethrough' },
        //             },
        //             {
        //                 key: 'subscript',
        //                 text: 'Subscript',
        //                 iconProps: { iconName: 'Subscript' },
        //             },
        //             {
        //                 key: 'superscript',
        //                 text: 'Superscript',
        //                 iconProps: { iconName: 'Superscript' },
        //             },
        //             {
        //                 key: 'fontColor',
        //                 text: 'Font Color',
        //                 iconProps: { iconName: 'FontColor' },
        //             },
        //             {
        //                 key: 'highlight',
        //                 text: 'Highlight',
        //                 iconProps: { iconName: 'Highlight' },
        //             },
        //             {
        //                 key: 'clearFormatting',
        //                 text: 'Clear Formatting',
        //                 iconProps: { iconName: 'ClearFormatting' },
        //             }
        //         ]
        //     }
        // },
        // {
        //     key: 'bullet',
        //     iconProps: { iconName: 'BulletedList' },
        // },
        // {
        //     key: 'number',
        //     iconProps: { iconName: 'NumberedList' },
        // }
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
        <CommandBar items={homeItems} farItems={homeFarItems} />
    )
}

export default HomeItems;

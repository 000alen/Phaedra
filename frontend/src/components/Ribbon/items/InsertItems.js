import React from 'react';
import {CommandBar} from '@fluentui/react';
import { createPage } from '../../Notebook/Page';
import { createCell } from '../../Notebook/Cell';

function InsertItems({ notebookRef, commandBoxRef, appController, pageController }) {
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
    
    const handleEntities = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage } = notebookRef.current.state;
        notebookController.addEntitiesCell(activePage);
    };
    
    const insertItems = [
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
            key: 'entities',
            text: 'Entities',
            iconProps: { iconName: 'People' },
            onClick: handleEntities
        },
        {
            key: 'wikipedia',
            text: 'Wikipedia',
            iconProps: { iconName: 'Articles' },
            subMenuProps: {
                items: [
                    {
                        key: 'wikipediaSummary',
                        text: 'Wikipedia Summary',
                        onClick: handleWikipediaSummary,
                    },
                    {
                        key: 'wikipediaSuggestions',
                        text: 'Wikipedia Suggestions',
                        onClick: handleWikipediaSuggestions,
                    },
                    {
                        key: 'wikipediaImage',
                        text: 'Wikipedia Image',
                        onClick: handleWikipediaImage,
                    }, 
                ]
            }
        }
    ];

    const insertFarItems = [
        {
            key: 'loadDocument',
            text: 'Load Document',
            iconProps: { iconName: 'TextDocument' },
        }
    ];

    return (
        <CommandBar items={insertItems} farItems={insertFarItems} />
    )
}

export default InsertItems;

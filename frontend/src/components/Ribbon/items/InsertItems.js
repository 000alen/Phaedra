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
        },
        {
            key: 'entities',
            text: 'Entities',
            iconProps: { iconName: 'Add' },
            onClick: handleEntities
        }
    ];    

    return (
        <CommandBar items={insertItems} />
    )
}

export default InsertItems;

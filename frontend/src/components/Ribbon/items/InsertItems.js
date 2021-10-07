import React from 'react';
import {CommandBar} from '@fluentui/react';

function InsertItems({ notebookRef, commandBoxRef, appController, pageController }) {
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
        // {
        //     key: 'loadDocument',
        //     text: 'Load Document',
        //     iconProps: { iconName: 'TextDocument' },
        // }
    ];

    return (
        <CommandBar items={insertItems} farItems={insertFarItems} />
    )
}

export default InsertItems;

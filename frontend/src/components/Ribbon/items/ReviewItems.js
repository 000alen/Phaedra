import React from 'react';
import {CommandBar} from '@fluentui/react';

function ReviewItems({ notebookRef, commandBoxRef, appController, pageController }) {
    const handleMeaning = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage } = notebookRef.current.state;
        const { command } = commandBoxRef.current.state;
        notebookController.addMeaningCell(command, activePage);
        commandBoxRef.current.consume();
    };
    
    const handleSynonym = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage } = notebookRef.current.state;
        const { command } = commandBoxRef.current.state;
        notebookController.addSynonymCell(command, activePage);
        commandBoxRef.current.consume();
    };
    
    const handleAntonym = () => {
        const { notebookController } = notebookRef.current.state;
        const { activePage } = notebookRef.current.state;
        const { command } = commandBoxRef.current.state;
        notebookController.addAntonymCell(command, activePage);
        commandBoxRef.current.consume();
    };
    
    const reviewItems = [
        {
            key: 'dictionary',
            text: 'Dictionary',
            iconProps: { iconName: 'Dictionary' },
            subMenuProps: {
                items: [
                    {
                        key: 'meaning',
                        text: 'Meaning',
                        onClick: handleMeaning,
                    },
                    {
                        key: 'synonyms',
                        text: 'Synonyms',
                        onClick: handleSynonym,
                    },
                    {
                        key: 'antonyms',
                        text: 'Antonyms',
                        onClick: handleAntonym,
                    },            
                ]
            }
        }
    ];    
    
    return (
        <CommandBar items={reviewItems} />
    )
}

export default ReviewItems;

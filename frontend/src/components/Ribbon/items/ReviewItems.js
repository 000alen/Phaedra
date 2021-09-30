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
            key: 'meaning',
            text: 'Meaning',
            iconProps: { iconName: 'Add' },
            onClick: handleMeaning,
        },
        {
            key: 'synonyms',
            text: 'Synonyms',
            iconProps: { iconName: 'Add' },
            onClick: handleSynonym,
        },
        {
            key: 'antonyms',
            text: 'Antonyms',
            iconProps: { iconName: 'Add' },
            onClick: handleAntonym,
        },
    ];    
    
    return (
        <CommandBar items={reviewItems} />
    )
}

export default ReviewItems;

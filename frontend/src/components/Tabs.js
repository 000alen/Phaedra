import React from 'react'
import { initializeIcons, IconButton } from '@fluentui/react';
import { theme } from '../index';

initializeIcons();

const iconButtonStyles = {
    rootHovered: {
        backgroundColor: "transparent"
    },
    rootPressed: {
        backgroundColor: "transparent"
    }
}

function Tab({ id, title, active, onSelect, onClose }) {
    const handleSelect = () => {
        onSelect(id);
    };

    const handleClose = () => {
        onClose(id);
    };

    const tabStyle = { backgroundColor: theme.palette.neutralPrimary }
    const textStyle = { color: theme.palette.white }
    const cancelIcon = {
        iconName: "Cancel",
        styles: {
            root: { color: theme.palette.white }
        }
    };

    const activeTabStyle = { backgroundColor: theme.palette.themePrimary }
    const activeTextStyle = { color: theme.palette.white }
    const activeCancelIcon = {
        iconName: "Cancel",
        styles: {
            root: { color: theme.palette.white }
        }
    };

    return (
        <div className={`pl-2 rounded-sm flex items-center`} style={active ? activeTabStyle : tabStyle}>
            <div className={`font-medium`} onClick={handleSelect} style={active ? activeTextStyle : textStyle}>{title}</div>
            <IconButton iconProps={active ? activeCancelIcon : cancelIcon} styles={iconButtonStyles} onClick={handleClose} />
        </div>
    );
}

function Tabs({ tabs, selectedTab, onSelect, onAdd, onClose }) {
    const handleAdd = () => {
        onAdd();
    };

    const addIcon = {
        iconName: 'Add',
        styles: {
            root: { color: theme.palette.neutralPrimary }
        }
    };

    return (
        <div className="flex flex-row items-center ml-2 mt-2 space-x-2">
            {tabs.map((tab) =>
                <Tab
                    key={tab.id}
                    id={tab.id}
                    title={tab.title}
                    active={tab.id === selectedTab}
                    onSelect={onSelect}
                    onClose={onClose} />
            )}
            <IconButton iconProps={addIcon} styles={iconButtonStyles} onClick={handleAdd} />
        </div>
    )
}

export default Tabs;

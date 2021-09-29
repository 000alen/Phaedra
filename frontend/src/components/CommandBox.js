import React, { Component } from 'react';
import { TextField } from '@fluentui/react';
import '../css/CommandBox.css';

class CommandBox extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.consume = this.consume.bind(this);

        const { notebookRef } = props;

        this.state = {
            notebookRef: notebookRef,
            command: '',
        };
    }

    handleChange = (event) => {
        this.setState((state) => {
            return { ...state, command: event.target.value };
        });
    }

    consume() {
        this.setState((state) => {
            return { ...state, command: '' };
        });
    }

    render() {
        return (
            <div className="commandBox w-96">
                <TextField
                    placeholder="Command"
                    value={this.state.command}
                    onChange={this.handleChange} />
            </div>
        )
    }
}

export default CommandBox;

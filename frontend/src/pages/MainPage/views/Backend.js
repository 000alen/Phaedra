import { CompoundButton, TextField } from '@fluentui/react';
import React, { useState } from 'react';
import { getApiUrl } from '../../../API';

export default function Backend() {
    const [apiUrl, setApiUrl] = useState(getApiUrl());

    const handleUrl = (event) => {
        setApiUrl(event.target.value);
        window.localStorage.setItem('apiUrl', event.target.value);
    };

    const textFieldStyles = {
        root: { width: "500px" }
    };

    return (
        <div className="space-y-2">
            <CompoundButton
                primary
                secondaryText="Serve Phaedra's backend from Google Colaboratory"
                href="https://colab.research.google.com/github/000alen/Phaedra/blob/master/backend/PhaedraColab.ipynb"
                target="_blank">
                Create remote backend
            </CompoundButton>

            <TextField
                label="Backend URL"
                prefix="http://"
                onChange={handleUrl}
                styles={textFieldStyles}
                defaultValue={apiUrl.slice(7)} />
        </div>
    )
}

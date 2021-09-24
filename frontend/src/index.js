import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import './index.css';

export const {ipcRenderer} = window.require('electron');

window.localStorage.clear();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

const minimizeButton = document.getElementById('minimizeButton');
const maximizeRestoreButton = document.getElementById('maximizeRestoreButton');
const closeButton = document.getElementById('closeButton');

function changeMaximizeRestoreButton(isMaximizedApp) {
  if (isMaximizedApp) {
    maximizeRestoreButton.title = 'Restore';
    maximizeRestoreButton.classList.remove('maximizeButton');
    maximizeRestoreButton.classList.add('restoreButton');
  } else {
    maximizeRestoreButton.title = 'Maximize'
    maximizeRestoreButton.classList.remove('restoreButton');
    maximizeRestoreButton.classList.add('maximizeButton');
  }
}

ipcRenderer.on('isMaximized', () => {
  changeMaximizeRestoreButton(true);
});

ipcRenderer.on('isRestored', () => {
  changeMaximizeRestoreButton(false);
});

document.addEventListener('mouseup', (event) => {
  if (window.getSelection().toString().length){
    let text = window.getSelection().toString();
    console.log(text);
  }
});

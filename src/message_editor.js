// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//this is the js file for the message manager tab
const ipc = require('electron').ipcRenderer;
const templates = require('./objectTemplate.js')

var currentMessage = templates.createMessage();

// Save does not function quite right yet. Need to update message object so that double saves do not happen
//handles event from the save button
document.getElementById('save').addEventListener("click", saveFile);
function saveFile () {
  let titleValue = document.getElementById('title').value;
  let greetingValue = document.getElementById('greeting').value;
  let contentValue = document.getElementById('content').value;
  let signatureValue = document.getElementById('signature').value;
  currentMessage.change_title(titleValue);
  currentMessage.change_greeting(greetingValue);
  currentMessage.change_content(contentValue);
  currentMessage.change_signature(signatureValue);

  console.log('message to be saved: ', currentMessage)
  ipc.send('save', currentMessage)
};

// Handles the event from the open button
// Uses synchronous call for now 
document.getElementById('open').addEventListener("click", openFile);
function openFile () {
  let file = ipc.sendSync('open-file')// Sents for file 
  console.log('on renderer side' , file)
  // Loads file values to static elements
  document.getElementById('title').value = file.title
  document.getElementById('greeting').value = file.greeting
  document.getElementById('content').value = file.content
  document.getElementById('signature').value = file.signature
};
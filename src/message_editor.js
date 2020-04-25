// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//this is the js file for the message manager tab
const ipc = require('electron').ipcRenderer;
const templates = require('./objectTemplate.js')

// Take in the id and message object upon editor creation and load content
var messageId, currentMessage;
ipc.on('load', function (event, id, messageobj){ 
  messageId = id;
  currentMessage = messageobj;
  console.log('messageId: ', messageId, 'message content; ', currentMessage);
  document.getElementById('title').value = currentMessage.title
  document.getElementById('greeting').value = currentMessage.greeting
  document.getElementById('content').value = currentMessage.content
  document.getElementById('signature').value = currentMessage.signature
})

// Saves message from editor on editor closed or save button clicked 
window.onbeforeunload = function (e) { saveMessage(); };
document.getElementById('save').addEventListener("click", saveMessage);
function saveMessage () {
  currentMessage.title = document.getElementById('title').value;
  currentMessage.greeting = document.getElementById('greeting').value;
  currentMessage.content = document.getElementById('content').value;
  currentMessage.signature = document.getElementById('signature').value;

  console.log('message to be saved: ', messageId, currentMessage);
  ipc.send('save-mess', messageId, currentMessage)
};
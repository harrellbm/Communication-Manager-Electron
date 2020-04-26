// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//this is the js file for the message manager tab
const ipc = require('electron').ipcRenderer;
const templates = require('./objectTemplate.js');
const Quill = require('quill');

// Set up editors 
var greeting = new Quill('#greeting', {
  modules: { 
    toolbar: true    
  },
  placeholder: 'Type your greeting here',
  theme: 'snow'
});

var content = new Quill('#content', {
  modules: { 
    toolbar: [
      [{ 'font': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'align': [] }],
      ['video', 'image', 'link'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{'script': 'sub'}, {'script': 'super'}],
      [{'indent': '+1'}, {'indent': '-1'}],
      [{ 'direction': 'rtl' }],                   
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],          
      ['clean']          
     ],
  },
  placeholder: 'Type the content of your message here',
  theme: 'snow'
});

var signature = new Quill('#signature', {
  modules: { 
    toolbar: true    
  },
  placeholder: 'Type your signature here',
  theme: 'snow'
});

// Take in the id and message object upon editor creation and load content
var messageId, currentMessage;
ipc.on('load', function (event, id, messageobj){ 
  messageId = id;
  currentMessage = messageobj;
  console.log('messageId: ', messageId, 'message content; ', currentMessage);
  document.getElementById('title').value = currentMessage.title
  // Load saved deltas to each editor 
  greeting.setContents(currentMessage.greeting);
  content.setContents(currentMessage.content);
  signature.setContents(currentMessage.signature);
})

// Collect content from editors 

greeting.on('text-change', function() {
  currentMessage.greeting = greeting.getContents();
  var justHtml = greeting.root.innerHTML;
  console.log('message object: ', currentMessage)
});

content.on('text-change', function() {
  currentMessage.content = content.getContents();
  var justHtml = content.root.innerHTML;
  console.log('message object: ', currentMessage)
});

signature.on('text-change', function() {
  currentMessage.signature = signature.getContents();
  //var justHtml = signature.root.innerHTML;
  console.log('message object: ', currentMessage)
});

// Saves message from editor on editor closed or save button clicked 
window.onbeforeunload = function (e) { saveMessage(); };
document.getElementById('save').addEventListener("click", saveMessage);
function saveMessage () {
  currentMessage.title = document.getElementById('title').value;
  // Other text inputs are updated on the fly by Quill editors 

  console.log('message to be saved: ', messageId, currentMessage);
  ipc.send('save-mess', messageId, currentMessage)
};
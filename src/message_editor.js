// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//this is the js file for the message manager tab
const ipc = require('electron').ipcRenderer;
const clipboard = require('electron').clipboard; // For accessing the clipboard
const Quill = require('quill'); // For editor toolbar and save to delta
const QuillDeltaToHtmlConverter = require('quill-delta-to-html').QuillDeltaToHtmlConverter; // Handle custom convertion of deltas to html
const swal = require('sweetalert'); // For styled alert/confirm boxes

// Set up editors
// Editor for Greeting  
var greeting = new Quill('#greeting', {
  modules: { 
    toolbar: [
      [{ 'font': [] }, { 'size': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }, {'indent': '+1'}, {'indent': '-1'}],
      [{'script': 'sub'}, {'script': 'super'}],              
      [{ 'direction': 'rtl' }],         
      ['clean']  
    ]   
  },
  placeholder: 'Type your greeting here',
  theme: 'snow'
});

// Editor for Content
var content = new Quill('#content', {
  modules: { 
    toolbar: [
      [{ 'font': [] }, { 'size': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }, {'indent': '+1'}, {'indent': '-1'}],
      ['video', 'image', 'link'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{'script': 'sub'}, {'script': 'super'}],              
      [{ 'direction': 'rtl' }],         
      ['clean']          
     ],
  },
  placeholder: 'Type the content of your message here',
  theme: 'snow'
});

// Editor for Signature
var signature = new Quill('#signature', {
  modules: { 
    toolbar: [
      [{ 'font': [] }, { 'header': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }, {'indent': '+1'}, {'indent': '-1'}],
      [{'script': 'sub'}, {'script': 'super'}],              
      [{ 'direction': 'rtl' }],         
      ['clean']  
    ]       
  },
  placeholder: 'Type your signature here',
  theme: 'snow'
});

// Take in the id and message object upon editor creation and load content
var initativeId, messageId, currentMessage;
ipc.on('load', function (event, initId, messId, messageobj){
  // Check to see if message has been deleted from index and if so close window 
  if (messageobj == undefined) {
    window.close();
    currentMessage = messageobj; // This will be passed to escape from mess-save call on close
    };
  messageId = messId;
  initativeId = initId;
  currentMessage = messageobj;
  console.log('init Id on load from main: ', initativeId, 'messageId: ', messageId, 'message content; ', currentMessage);
  document.getElementById('title-input').value = currentMessage.title;
  // Load saved deltas to each editor 
  greeting.setContents(currentMessage.greeting);
  content.setContents(currentMessage.content);
  signature.setContents(currentMessage.signature);
})

// Collect content from editors 
greeting.on('text-change', function() {
  currentMessage.greeting = greeting.getContents();
  //var justHtml = greeting.root.innerHTML; // get basic html from editor
  //console.log('message object: ', currentMessage);
});

content.on('text-change', function() {
  currentMessage.content = content.getContents();
  //var justHtml = content.root.innerHTML;
  console.log('message object: ', currentMessage);
});

signature.on('text-change', function() {
  currentMessage.signature = signature.getContents();
  //var justHtml = signature.root.innerHTML;
  console.log('message object: ', currentMessage)
});

// Function to save message and send update to main
function saveMessage () {
  // If message has been deleted escape from save on close 
  if (currentMessage == undefined) {
    return
  };
  currentMessage.title = document.getElementById('title-input').value;
  // Other text inputs are updated on the fly by Quill editors 

  console.log('init Id on save from editor: ', initativeId, 'message to be saved: ', messageId, currentMessage);
  ipc.send('save-mess', initativeId, messageId, currentMessage);
};
// Handles event to save message on editor close 
window.onbeforeunload = function (e) { saveMessage(); };

// Handle even from the editor's save button
document.getElementById('save').addEventListener("click", saveOnClick);
// Display alert on button click save
function saveOnClick () {
  swal({ title: 'Saved!', icon: 'success', buttons: false });
  saveMessage();
};

// Sends contents to main for saving and then closes editor on index window being closed 
ipc.on('index-close', function(event) {
  window.close(); // Note: will trigger the onbeforeunload event
});

// Copies message to clipboard for use ouside of manager 
document.getElementById('copy').addEventListener("click", copyMessage);
var cfg = {}; // Configuration for converting
function copyMessage() {
  // Get delta from editors
  let delGreet = greeting.getContents(); 
  let delContt = content.getContents(); 
  let delSignt = signature.getContents();
  // put them all in an array 
  let delMess = [];
  delMess.push(delGreet.ops);
  delMess.push(delContt.ops);
  delMess.push(delSignt.ops);
  // Loop through deltas and conver to html
  let htmlMess = '';
  for (id in delMess) {
    let converter = new QuillDeltaToHtmlConverter(delMess[id], cfg);
    let html = converter.convert(); 
    htmlMess += html;
    };
  console.log('raw html before sending to clipboard', htmlMess);
  // Sent converted message to clipboard
  clipboard.writeHTML(htmlMess);
  };
  
 

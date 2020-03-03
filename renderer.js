// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const ipc = require('electron').ipcRenderer
const templates = require('./objectTemplate.js')

//handles event from the save button
document.getElementById('save').addEventListener("click", saveFile);
function saveFile () {
  let titleValue = document.getElementById('title').value
  let greetingValue = document.getElementById('greeting').value
  let contentValue = document.getElementById('content').value
  let signatureValue = document.getElementById('signature').value
  var file = {
    title: titleValue,
    greeting: greetingValue,
    content: contentValue,
    signature: signatureValue
  }
  ipc.send('save', file)
};

// Handles the event from the open button
// Uses synchronous call for now 
document.getElementById('open').addEventListener("click", openFile);
function openFile () {
  let file = ipc.sendSync('open-file')
  console.log('on renderer side' , file)
  document.getElementById('title').value = file.title
  document.getElementById('greeting').value = file.greeting
  document.getElementById('content').value = file.content
  document.getElementById('signature').value = file.signature
};



// Adds an avenue to do the DOM
document.getElementById('add').addEventListener("click", addAvenue);
var avenueCount = 0;
function addAvenue () {
  // Makes the main div to hold an avenue
  let ave = document.createElement("div");
  ave.id = `avenue${avenueCount}`;
  ave.class = "avenue";
  // Creates simple text input
  let a = document.createElement("input")
  ave.appendChild(a)
  // Creats delete button
  let b = document.createElement("input");
  b.type = "button";
  b.id = `delete${avenueCount}`;
  b.value = "delete";
  // Adds dynamic event listener to delete button
  let id = ave.id
  b.addEventListener("click", function() {deleteAvenue(id)}) //only works if it was the last one added
  ave.appendChild(b)

  console.log(ave);
  document.getElementById("avenueIn").appendChild(ave);
  ++avenueCount;
};

// Deletes an avenue from the DOM
function deleteAvenue (id) {
  var a = document.getElementById(id)
  a.parentNode.removeChild(a);
};

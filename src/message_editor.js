// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//this is the js file for the message manager tab
const ipc = require('electron').ipcRenderer;
const templates = require('../objectTemplate.js')

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

  // clear old avenues from message object
  currentMessage.remove_all_avenues()
  // unpack values from each avenue that is added
  let avenuesValue = document.getElementById('avenueIn').getElementsByClassName('avenue');
  for (ave of avenuesValue) {//each iteration goes through one avenue
    //console.log(ave)
    //let avenue = avenuesValue.item(i);
    let dropdown = ave.children[0].value;
    let sent = ave.children[4].children[0].checked;
    let description = ave.children[5].value;
    let persons = ave.children[6].value;
    let dates = ave.children[7].value;
    //console.log('specific elements',avenue, dropdown, sent, description, persons, dates)

    // TODO: Need to figure out how to only add new avenues and update old ones
    currentMessage.add_avenue(dropdown, description, persons, dates, sent)
    }
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
  oldAvenues = document.getElementById('avenueIn')
  oldAvenues.innerHTML = '' //clear all existing avenues from ui
  currentMessage.remove_all_avenues() //clear all existing avenues from message object
  // Loads each avenue from the file 
  for (ave in file.avenues) {//each iteration goes through one avenue
    let dropdown = file.avenues[ave].avenue_type;
    let sent = file.avenues[ave].sent;
    let description = file.avenues[ave].description;
    let persons = file.avenues[ave].person;
    let dates = file.avenues[ave].date;
    
    addAvenue(dropdown, sent, description, persons, dates)
    }
};


// Adds an avenue to do the DOM
document.getElementById('add').addEventListener("click", addAvenue);
function addAvenue (avenue_typeValue='', sentValue='', descriptionValue='', personsValue='', datesValue='') {

  let id = currentMessage.add_avenue()

  //creates main div to hold an individual avenue
  let ave = document.createElement("div");
  ave.setAttribute("class", "avenue");
  ave.setAttribute("id", `avenue${id}`);
  
  // Creates drop down list 
  let dropdown = document.createElement("select");
  dropdown.setAttribute("class", "dropdown");
  dropdown.setAttribute("id", `avenue_type${id}`);
  
  let options = currentMessage.avenue_types

  for (i in options){
    let opElem = document.createElement("option");
    let opText = currentMessage.avenue_types[i]
    opElem.setAttribute("value", `${opText}`);
    opElem.innerHTML = `${opText}`;
    dropdown.appendChild(opElem);
    }

  if(avenue_typeValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    dropdown.value = avenue_typeValue;
    }
  ave.appendChild(dropdown);//add the dropdown menu to the avenue
  
  // Creates title paragraphs 
  let description_title = document.createElement("p");// Title for Description 
  description_title.setAttribute("class", "description_title");
  description_title.setAttribute("id", "description_title");
  description_title.innerHTML = "Description:";
  ave.appendChild(description_title);//add the title to the avenue

  let person_title = document.createElement("p");// Title for Persons responsible 
  person_title.setAttribute("class", "persons_title");
  person_title.setAttribute("id", "persons_title");
  person_title.innerHTML = "Person:";
  ave.appendChild(person_title);//add the title to the avenue

  let date_title = document.createElement("p");// Title for Date 
  date_title.setAttribute("class", "date_title");
  date_title.setAttribute("id", "date_title");
  date_title.innerHTML = "Date:";
  ave.appendChild(date_title);//add the title to the avenue

  // Creates sent box
  let sent_box = document.createElement("p");
  sent_box.setAttribute("class", "sent_box");
  sent_box.setAttribute("id", `sent_box${id}`);

  let sent_checkbox = document.createElement("input");
  sent_checkbox.setAttribute("class", "sent_checkbox");
  sent_checkbox.setAttribute("id", `sent_checkbox${id}`);
  sent_checkbox.setAttribute("type", "checkbox");
  if(sentValue != ''){// if creating an avenue that is being pulled from a file set it's value
    sent_checkbox.checked = sentValue;
    }
  sent_box.appendChild(sent_checkbox);//add check box to the smaller area

  let sent_label = document.createElement("label");
  sent_label.setAttribute("class", "sent_label");
  sent_label.setAttribute("id", "sent_label");
  sent_label.setAttribute("for", "sent_checkbox");
  sent_label.innerHTML = "Sent";
  sent_box.appendChild(sent_label)//add label to the smaller area

  ave.appendChild(sent_box);//add smaller area to the avenue

  // Creates textareas 
  let description = document.createElement("textarea");
  description.setAttribute("class", "description");
  description.setAttribute("id", `description${id}`);
  if(descriptionValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    description.value = descriptionValue;
    }
  ave.appendChild(description);

  let persons = document.createElement("textarea");
  persons.setAttribute("class", "persons");
  persons.setAttribute("id", `persons${id}`);
  if(personsValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    persons.value = personsValue;
    }
  ave.appendChild(persons);

  let dates = document.createElement("textarea");
  dates.setAttribute("class", "dates");
  dates.setAttribute("id", `dates${id}`);
  if(datesValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    dates.value = datesValue;
    }
  ave.appendChild(dates);

  // Creates and adds dynamic event listener to delete button
  let deleteBtn = document.createElement("input")
  deleteBtn.setAttribute("class", "delete")
  deleteBtn.setAttribute("id", `delete${id}`)
  deleteBtn.setAttribute("type", "button")
  deleteBtn.setAttribute("value", "x")
  deleteBtn.addEventListener("click", function () {deleteAvenue(ave)}) 
  ave.appendChild(deleteBtn)

  // Get the main div that holds all the avenues and append the new one
  //console.log("avenue", ave);
  document.getElementById("avenueIn").appendChild(ave);
};

// Deletes an avenue from the DOM
function deleteAvenue (ave) {
  // Message object is not cleared until save or load to preserve avenue order from user
  ave.parentElement.removeChild(ave)
};
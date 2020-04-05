// This is the js file for the main window
const ipc = require('electron').ipcRenderer;
const templates = require('./objectTemplate.js');

/* Implement tabs */
function openPage(pageName, elmnt) {
    // Hide all elements with class="tabcontent" by default */
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Remove the background color of all tablinks/buttons and set bottom border
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].style.backgroundColor = "";
      tablinks[i].style.borderBottom = "groove";
      tablinks[i].style.borderWidth = "0.2vh";
      tablinks[i].style.borderColor = "ghostwhite";
    }
  
    // Show the specific tab content
    document.getElementById(pageName).style.display = "block";
  
    // Add the specific color to the button used to open the tab content
    elmnt.style.backgroundColor = 'rgb(139, 203, 224)';
    elmnt.style.borderBottomStyle = "none";
  }
  
// Get the element with id="defaultOpen" and click on it to initialize window
document.getElementById("defaultOpen").click();

// Initialize message object to be used currently 
var currentMessage = templates.createMessage();

// Save does not function quite right yet. Need to update message object so that double saves do not happen
//handles event from the save button
document.getElementById('save').addEventListener("click", saveFile);
function saveFile () {
  // clear old messeges from campaign object
  currentMessage.remove_all_avenues()
  // unpack values from each avenue that is added
  let avenuesValue = document.getElementById('messageIn').getElementsByClassName('message');
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

// need to implement initiative object to fully transition 
// Adds an message to do the DOM
document.getElementById('addMess').addEventListener("click", addMessage);
function addMessage (avenue_typeValue='', sentValue='', descriptionValue='', personsValue='', datesValue='') {

  let id = currentMessage.add_avenue()

  //creates main div to hold an individual avenue
  let ave = document.createElement("div");
  ave.setAttribute("class", "message");
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
  document.getElementById("messageIn").appendChild(ave);
};

// Deletes an avenue from the DOM
function deleteAvenue (ave) {
  // Message object is not cleared until save or load to preserve avenue order from user
  ave.parentElement.removeChild(ave)
};
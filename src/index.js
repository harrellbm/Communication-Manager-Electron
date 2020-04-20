// This is the js file for the main window
const ipc = require('electron').ipcRenderer;
const templates = require('./objectTemplate.js');

/* ---- Implement tabs ---- */
function openPage(pageName, elmnt) { // linked to directly from html
    // Hide all elements with class="tabcontent" by default 
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


/* ---- Message Manager related functions ---- */
// Initialize message object to be used currently
var currentInitiative = templates.createInitiative();

// Save does not function quite right yet. Need to update message object so that double saves do not happen
//handles event from the save button // Needs transitioned 
document.getElementById('save').addEventListener("click", saveFile);
function saveFile () {
  // clear old messeges from initiative object
  currentInitiative.messages.clear();
  // unpack values from each message that is added
  let messageValue = document.getElementById('messageIn').getElementsByClassName('message');
  for (mes of messageValue) {//each iteration goes through one avenue
    //console.log(mes)
    //let avenue = avenuesValue.item(i);
    let dropdown = mes.children[0].value;
    let sent = mes.children[4].children[0].checked;
    let description = mes.children[5].value;
    let persons = mes.children[6].value;
    let dates = mes.children[7].value;
    //console.log('specific elements',avenue, dropdown, sent, description, persons, dates)

    // TODO: Need to figure out how to only add new avenues and update old ones
    currentInitiative.add_avenue(dropdown, description, persons, dates, sent)
    }
  console.log('initiative to be saved: ', currentInitiative)
  let data = currentInitiative.pack_for_ipc()
  ipc.send('save', data)
};

// Handles the event from the open button // Needs transitioned 
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
  currentInitiative.remove_all_avenues() //clear all existing avenues from message object
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

// Adds a message to do the DOM // Needs ui out put updating 
document.getElementById('addMess').addEventListener("click", addMessage);
function addMessage (event, titleValue='', greetingValue='', contentValue='', signatureValue='', avenue_idsValue=[]) {
  let id = currentInitiative.add_message();

  //creates main div to hold an individual Message
  let mess = document.createElement("div");
  mess.setAttribute("class", "message");
  mess.setAttribute("id", `message${id}`);
  
  // Create title heading 
  let title_heading = document.createElement("p");
  title_heading.setAttribute("class", "messTitle_heading");
  title_heading.setAttribute("id", "messTitle_heading");
  title_heading.innerHTML = "Title:";
  mess.appendChild(title_heading);// Add the heading to the message
 
  // Title display
  let title = document.createElement("textarea");
  title.setAttribute("class", "messTitle");
  title.setAttribute("id", `messTitle${id}`);
  if(titleValue != ''){// if creating an avenue that is being pulled from a file set it's value
    title.value = titleValue;
    }
  mess.appendChild(title);//add check box to the smaller area

  // Avenue dropbox
  let aveDrop = document.createElement("textarea");
  aveDrop.setAttribute("class", "aveDrop");
  aveDrop.setAttribute("id", `aveDrop${id}`);
  if(aveDrop != ''){// if creating an avenue that is being pulled from a file set it's value 
    aveDrop.value = avenue_idsValue;
    }
  mess.appendChild(aveDrop);

  /* add edit options */

  // Creates and adds dynamic event listener to delete button
  let deleteBtn = document.createElement("input");
  deleteBtn.setAttribute("class", "messDelete");
  deleteBtn.setAttribute("id", `messDelete${id}`);
  deleteBtn.setAttribute("type", "button");
  deleteBtn.setAttribute("value", "x");
  deleteBtn.addEventListener("click", function () {deleteSlot(mess)}) ;
  mess.appendChild(deleteBtn);

  // Get the main div that holds all the avenues and append the new one
  console.log("message", mess);
  document.getElementById("messageIn").appendChild(mess);
};

// Adds an Avenue to do the DOM
document.getElementById('addAve').addEventListener("click", addAve);
function addAve (avenue_typeValue='', sentValue='', descriptionValue='', personsValue='', datesValue='') {

  let id = currentInitiative.add_avenue()

  //creates main div to hold an individual avenue
  let ave = document.createElement("div");
  ave.setAttribute("class", "avenue");
  ave.setAttribute("id", `avenue${id}`);
  
  // Creates drop down list 
  let dropdown = document.createElement("select");
  dropdown.setAttribute("class", "aveDropdown");
  dropdown.setAttribute("id", `avenue_type${id}`);
  
  // Set dropdown options from list held in the message object 
  let options = currentInitiative.avenue_types
  for (i in options){
    let opElem = document.createElement("option");
    let opText = currentInitiative.avenue_types[i]
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
  description_title.setAttribute("class", "aveDescription_title");
  description_title.setAttribute("id", "aveDescription_title");
  description_title.innerHTML = "Description:";
  ave.appendChild(description_title);//add the title to the avenue

  let person_title = document.createElement("p");// Title for Persons responsible 
  person_title.setAttribute("class", "avePersons_title");
  person_title.setAttribute("id", "avePersons_title");
  person_title.innerHTML = "Person:";
  ave.appendChild(person_title);//add the title to the avenue

  let date_title = document.createElement("p");// Title for Date 
  date_title.setAttribute("class", "aveDate_title");
  date_title.setAttribute("id", "aveDate_title");
  date_title.innerHTML = "Date:";
  ave.appendChild(date_title);//add the title to the avenue

  // Creates sent box
  let sent_box = document.createElement("p");
  sent_box.setAttribute("class", "aveSent_box");
  sent_box.setAttribute("id", `aveSent_box${id}`);

  let sent_checkbox = document.createElement("input");
  sent_checkbox.setAttribute("class", "aveSent_checkbox");
  sent_checkbox.setAttribute("id", `avaeSent_checkbox${id}`);
  sent_checkbox.setAttribute("type", "checkbox");
  if(sentValue != ''){// if creating an avenue that is being pulled from a file set it's value
    sent_checkbox.checked = sentValue;
    }
  sent_box.appendChild(sent_checkbox);//add check box to the smaller area

  let sent_label = document.createElement("label");
  sent_label.setAttribute("class", "aveSent_label");
  sent_label.setAttribute("id", "aveSent_label");
  sent_label.setAttribute("for", "aveSent_checkbox");
  sent_label.innerHTML = "Sent";
  sent_box.appendChild(sent_label)//add label to the smaller area

  ave.appendChild(sent_box);//add smaller area to the avenue

  // Creates textareas 
  let description = document.createElement("textarea");
  description.setAttribute("class", "aveDescription");
  description.setAttribute("id", `aveDescription${id}`);
  if(descriptionValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    description.value = descriptionValue;
    }
  ave.appendChild(description);

  let persons = document.createElement("textarea");
  persons.setAttribute("class", "avePersons");
  persons.setAttribute("id", `avePersons${id}`);
  if(personsValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    persons.value = personsValue;
    }
  ave.appendChild(persons);

  let dates = document.createElement("textarea");
  dates.setAttribute("class", "aveDates");
  dates.setAttribute("id", `aveDates${id}`);
  if(datesValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    dates.value = datesValue;
    }
  ave.appendChild(dates);

  // Creates and adds dynamic event listener to delete button
  let deleteBtn = document.createElement("input")
  deleteBtn.setAttribute("class", "aveDelete")
  deleteBtn.setAttribute("id", `aveDelete${id}`)
  deleteBtn.setAttribute("type", "button")
  deleteBtn.setAttribute("value", "x")
  deleteBtn.addEventListener("click", function () {deleteSlot(ave)}) 
  ave.appendChild(deleteBtn)

  // Get the main div that holds all the avenues and append the new one
  //console.log("avenue", ave);
  document.getElementById("avenueIn").appendChild(ave);
};

// Deletes a message or an avenue from the DOM
function deleteSlot (slot) {
  // Message object is not cleared until save or load to preserve avenue order from user
  slot.parentElement.removeChild(slot)
};
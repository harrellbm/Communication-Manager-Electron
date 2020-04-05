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


/* Message Manager related functions */
// Initialize message object to be used currently
var currentMessage = templates.createMessage();

// Save does not function quite right yet. Need to update message object so that double saves do not happen
//handles event from the save button // Needs transitioned 
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

// need to implement initiative object to fully transition and update ui that is shown
// Adds a message to do the DOM // Needs ui out put updated 
document.getElementById('addMess').addEventListener("click", addMessage);
function addMessage (avenue_typeValue='', sentValue='', descriptionValue='', personsValue='', datesValue='') {

  let id = currentMessage.add_avenue() // Needs transitioned 

  //creates main div to hold an individual Message
  let ave = document.createElement("div");
  ave.setAttribute("class", "message");
  ave.setAttribute("id", `message${id}`);
  
  // Creates drop down list // Needs transitioned 
  let dropdown = document.createElement("select");
  dropdown.setAttribute("class", "messDropdown");
  dropdown.setAttribute("id", `message_type${id}`);
  
  // Set dropdown options from list held in the message object // Needs transitioned 
  let options = currentMessage.avenue_types
  for (i in options){
    let opElem = document.createElement("option");
    let opText = currentMessage.avenue_types[i]
    opElem.setAttribute("value", `${opText}`);
    opElem.innerHTML = `${opText}`;
    dropdown.appendChild(opElem);
    }
  // Needs transitioned 
  if(avenue_typeValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    dropdown.value = avenue_typeValue;
    }
  ave.appendChild(dropdown);//add the dropdown menu to the avenue
  
  // Creates title paragraphs // Needs transitioned 
  let description_title = document.createElement("p");// Title for Description 
  description_title.setAttribute("class", "messDescription_title");
  description_title.setAttribute("id", "messDescription_title");
  description_title.innerHTML = "Description:";
  ave.appendChild(description_title);//add the title to the avenue

  let person_title = document.createElement("p");// Title for Persons responsible 
  person_title.setAttribute("class", "messPersons_title");
  person_title.setAttribute("id", "messPersons_title");
  person_title.innerHTML = "MessPerson:";
  ave.appendChild(person_title);//add the title to the avenue

  let date_title = document.createElement("p");// Title for Date 
  date_title.setAttribute("class", "messDate_title");
  date_title.setAttribute("id", "messDate_title");
  date_title.innerHTML = "Date:";
  ave.appendChild(date_title);//add the title to the avenue

  // Creates sent box // Needs transitioned 
  let sent_box = document.createElement("p");
  sent_box.setAttribute("class", "messSent_box");
  sent_box.setAttribute("id", `messSent_box${id}`);

  let sent_checkbox = document.createElement("input");
  sent_checkbox.setAttribute("class", "messSent_checkbox");
  sent_checkbox.setAttribute("id", `messSent_checkbox${id}`);
  sent_checkbox.setAttribute("type", "checkbox");
  if(sentValue != ''){// if creating an avenue that is being pulled from a file set it's value
    sent_checkbox.checked = sentValue;
    }
  sent_box.appendChild(sent_checkbox);//add check box to the smaller area

  let sent_label = document.createElement("label");
  sent_label.setAttribute("class", "messSent_label");
  sent_label.setAttribute("id", "messSent_label");
  sent_label.setAttribute("for", "messSent_checkbox");
  sent_label.innerHTML = "Sent";
  sent_box.appendChild(sent_label)//add label to the smaller area

  ave.appendChild(sent_box);//add smaller area to the avenue

  // Creates textareas // Needs transitioned 
  let description = document.createElement("textarea");
  description.setAttribute("class", "messDescription");
  description.setAttribute("id", `messDescription${id}`);
  if(descriptionValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    description.value = descriptionValue;
    }
  ave.appendChild(description);

  let persons = document.createElement("textarea");
  persons.setAttribute("class", "messPersons");
  persons.setAttribute("id", `messPersons${id}`);
  if(personsValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    persons.value = personsValue;
    }
  ave.appendChild(persons);

  let dates = document.createElement("textarea");
  dates.setAttribute("class", "messDates");
  dates.setAttribute("id", `messDates${id}`);
  if(datesValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    dates.value = datesValue;
    }
  ave.appendChild(dates);

  // Creates and adds dynamic event listener to delete button
  let deleteBtn = document.createElement("input")
  deleteBtn.setAttribute("class", "messDelete")
  deleteBtn.setAttribute("id", `messDelete${id}`)
  deleteBtn.setAttribute("type", "button")
  deleteBtn.setAttribute("value", "x")
  deleteBtn.addEventListener("click", function () {deleteSlot(ave)}) 
  ave.appendChild(deleteBtn)

  // Get the main div that holds all the avenues and append the new one
  //console.log("avenue", ave);
  document.getElementById("messageIn").appendChild(ave);
};

// Adds an Avenue to do the DOM
document.getElementById('addAve').addEventListener("click", addAve);
function addAve (avenue_typeValue='', sentValue='', descriptionValue='', personsValue='', datesValue='') {

  let id = currentMessage.add_avenue()

  //creates main div to hold an individual avenue
  let ave = document.createElement("div");
  ave.setAttribute("class", "avenue");
  ave.setAttribute("id", `avenue${id}`);
  
  // Creates drop down list 
  let dropdown = document.createElement("select");
  dropdown.setAttribute("class", "aveDropdown");
  dropdown.setAttribute("id", `avenue_type${id}`);
  
  // Set dropdown options from list held in the message object 
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
function deleteSlot (ave) {
  // Message object is not cleared until save or load to preserve avenue order from user
  ave.parentElement.removeChild(ave)
};
// This is the js file for the main window
const ipc = require('electron').ipcRenderer;
const templates = require('./objectTemplate.js');
const moment = require('moment');
const dragula = require('dragula');

// Initialize initiative object to be used currently
var currentInitiative = templates.createInitiative();

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

// Handles event from the save button
document.getElementById('messSave').addEventListener("click", saveFile);
function saveFile () {
  // Sync ui and initiative message objects before saving 
  let messKeys = currentInitiative.messages.keys(); 
  for (id of messKeys) {// Each iteration goes through one message
    let guiMess = document.getElementById(`message${id}`); // Message object from the ui
    let initMess = currentInitiative.messages.get(id); // Message object from the initiative object 

    initMess.title = guiMess.children[1].value; // Update title in initiative object 
    
    }
    //console.log('updated messages: ', currentInitiative.messages);
  // Sync ui and initiative avenue objects before saving 
  let aveKeys = currentInitiative.avenues.keys(); 
  for (id of aveKeys) {// Each iteration goes through one avenue
    let guiAve = document.getElementById(`avenue${id}`); // Avenue object from the ui
    let initAve = currentInitiative.avenues.get(id); // Avenue object from the initiative object 
    
    initAve.avenue_type = guiAve.children[0].value;
    initAve.sent = guiAve.children[4].children[0].checked;
    initAve.description = guiAve.children[5].value;
    initAve.person = guiAve.children[6].value;
    // Add timezone stamp to date chooser date before storing 
    let rawDate = guiAve.children[7].value;  
    if (moment(rawDate).isValid()){ // Only load date into initiative object if it is a valid date
      let date = moment(rawDate, 'YYYY-MM-DD', true).toString(); // Moment adds time zone stamp
      initAve.change_date(date); // String
      } 
    }
    //console.log('updated avenues: ', currentInitiative.avenues);

  //console.log('initiative to be saved: ', currentInitiative);
  let data = currentInitiative.pack_for_ipc();
  ipc.send('save', data);
};

// Handles the event from the open button // Needs transitioned 
document.getElementById('messOpen').addEventListener("click", openFile);
function openFile () {
  let file = ipc.sendSync('open-file'); // Uses synchronous call to avoid user actions before data is loaded 
  currentInitiative.unpack_from_ipc(file);
  //console.log('Unpacked initiative', currentInitiative);

  // Clear old message and avenue Ui elements 
  oldMessages = document.getElementById('messageIn');
  oldMessages.innerHTML = ''; 
  oldAvenues = document.getElementById('avenueIn');
  oldAvenues.innerHTML = '';

  // Send new initiative messages and avenues to ui
  let messKeys = currentInitiative.messages.keys();
  for ( id of messKeys ){
    addMess('load', id ); // Note: Event is not used programatically but helps with debugging input to addMess
  };
  
  let aveKeys = currentInitiative.avenues.keys();
  for ( id of aveKeys ){
    // Check to see if avenue is linked to a message
    let aveObj = currentInitiative.avenues.get(id);
    let messId = aveObj.message_id
    if (messId != '') { // If so send to respective message drop box
      addAve('load', id, `aveDrop${messId}`) // Note: event is not used programatically but helps with debugging input to addAve
      }
      else { // Else just add it to the default container
        addAve('load', id ); 
        }
  };
};

// Adds a message to do the DOM
document.getElementById('addMess').addEventListener("click", addMess);
function addMess (event='', messId='') {// If message id is passed in it will load it from the initative object. Otherwise it is treated as a new message
  // Update the current initiative object if this is a new message 
  var id; 
  var messLoad = '';
  if ( messId == '') { // If message is being added for the first time 
    id = currentInitiative.add_message();
    } else { // Else load existing message from initiative object 
      id = messId
      messLoad = currentInitiative.messages.get(id);
      //console.log(messLoad);
      }

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
  if(messLoad != ''){// if creating an avenue that is being pulled from a file set it's value
    title.value = messLoad.title;
    }
  mess.appendChild(title);//add check box to the smaller area

  // Avenue dropbox
  let aveDrop = document.createElement("div");
  aveDrop.setAttribute("class", "aveDrop");
  aveDrop.setAttribute("id", `aveDrop${id}`);
  dragDrop.containers.push(aveDrop);// Flag as drop container for dragula 
  //console.log(dragDrop.containers)
  if(messLoad != ''){// if creating an avenue that is being pulled from a file set it's value 
    aveDrop.value = messLoad.avenue_ids;
    }
  mess.appendChild(aveDrop);
  
  // Div to hold all buttons
  let btnArray = document.createElement("div");
  btnArray.setAttribute("class", "btnArray");
  btnArray.setAttribute("id", `btnArray${id}`);

    // Creates and adds dynamic event listener to edit button
    let editBtn = document.createElement("input");
    editBtn.setAttribute("class", "messEdit");
    editBtn.setAttribute("id", `messEdit${id}`);
    editBtn.setAttribute("type", "button");
    editBtn.setAttribute("value", "Edit");
    editBtn.addEventListener("click", function () {editMess(mess)}) ;
    btnArray.appendChild(editBtn);

    // Creates and adds dynamic event listener to delete button
    let deleteBtn = document.createElement("input");
    deleteBtn.setAttribute("class", "messDelete");
    deleteBtn.setAttribute("id", `messDelete${id}`);
    deleteBtn.setAttribute("type", "button");
    deleteBtn.setAttribute("value", "x");
    deleteBtn.addEventListener("click", function () {deleteMess(mess)}) ;
    btnArray.appendChild(deleteBtn);

  mess.appendChild(btnArray)

  // Get the main div that holds all the avenues and append the new one
  //console.log("message", mess);
  document.getElementById("messageIn").appendChild(mess);
};

// Deletes a message from the DOM
function deleteMess (mess) {
  // Check if message has linked avenue
  let aves = mess.getElementsByClassName('avenue');
  if (aves.length != 0 ) { 
    // Unlink avenues and place them back in avenueIn 
    while (0 < aves.length){// Collection empties as they are appended back to avenueIn
      let aveId = aves[0].id[6]; // grab id number of avenue
      let messId = mess.id[7];
      currentInitiative.unlink_ids(aveId, messId);
      //console.log('unlinked avenue: ', currentInitiative.avenues.get(aveId), 'unlinked message: ', currentInitiative.messages.get(messId));
      document.getElementById("avenueIn").appendChild(aves[0]);
      }
    }
  
  // Remove message from UI
  mess.parentElement.removeChild(mess);
  // Remove message from Initiative object 
  let id = mess.id[7]; // Take only the number off of the end of the ui id 
  currentInitiative.messages.delete(id); 
};

// Edit message 
function editMess (mess) {
  let id = mess.id[7]; // Take only the number off of the end of the ui id 
  let messContent = currentInitiative.messages.get(`${id}`); // get message object content
  //console.log('message sent to main: ', messContent);
  ipc.send('edit', id, messContent); // Send it all to main to be pinged to the editor
};

// On message editor save or close receive new message content and update
ipc.on('update-mess', function (event, messageId, messageObj) {
  let message = currentInitiative.messages.get(messageId);
  let uiTitle = document.getElementById(`messTitle${messageId}`);
  uiTitle.value = messageObj.title;
  message.change_title(messageObj.title);
  message.change_greeting(messageObj.greeting);
  message.change_content(messageObj.content);
  message.change_signature(messageObj.signature);
  //console.log('updated message', message);
})


// Adds an Avenue to do the DOM
document.getElementById('addAve').addEventListener("click", addAve);
function addAve (event='', aveId='', location='avenueIn') { // If avenue id is passed in it will load it from the initative object. Otherwise it is treated as a new avenue
  // Note: event is not used programatically but helps with debugging input form different sources
  // Update current initiative object if this is a new avenue 
  var id; 
  var aveLoad = '';
  if ( aveId == '') {// If message is being added for the first time 
    id = currentInitiative.add_avenue();
    } else { // Else load existing message from initiative object
      id = aveId
      aveLoad = currentInitiative.avenues.get(id);
      //console.log(aveLoad);
      }
    
  //creates main div to hold an individual avenue
  let ave = document.createElement("div");
  ave.setAttribute("class", "avenue");
  ave.setAttribute("id", `avenue${id}`);

  // Creates drop down list 
  let dropdown = document.createElement("select");
  dropdown.setAttribute("class", "aveDropdown");
  dropdown.setAttribute("id", `avenue_type${id}`);
  
  // Set dropdown options from list held in the message object 
  let options = currentInitiative.avenue_types;
  for (i in options){
    let opElem = document.createElement("option");
    let opText = currentInitiative.avenue_types[i]
    opElem.setAttribute("value", `${opText}`);
    opElem.innerHTML = `${opText}`;
    dropdown.appendChild(opElem);
    }
  if(aveLoad != ''){// if creating an avenue that is being pulled from a file set it's value 
    dropdown.value = aveLoad.avenue_type;
    }
  ave.appendChild(dropdown); //add the dropdown menu to the avenue
  
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
  if(aveLoad != ''){// if creating an avenue that is being pulled from a file set it's value
    sent_checkbox.checked = aveLoad.sent;
    }
  sent_box.appendChild(sent_checkbox);//add check box to the smaller area

  let sent_label = document.createElement("label");
  sent_label.setAttribute("class", "aveSent_label");
  sent_label.setAttribute("id", "aveSent_label");
  sent_label.setAttribute("for", "aveSent_checkbox");
  sent_label.innerHTML = "Sent";
  sent_box.appendChild(sent_label);//add label to the smaller area

  ave.appendChild(sent_box);//add smaller area to the avenue

  // Creates textareas 
  let description = document.createElement("textarea");
  description.setAttribute("class", "aveDescription");
  description.setAttribute("id", `aveDescription${id}`);
  if(aveLoad != '') {// if creating an avenue that is being pulled from a file set it's value 
    description.value = aveLoad.description;
    }
  ave.appendChild(description);

  let persons = document.createElement("textarea");
  persons.setAttribute("class", "avePersons");
  persons.setAttribute("id", `avePersons${id}`);
  if(aveLoad != ''){// if creating an avenue that is being pulled from a file set it's value 
    persons.value = aveLoad.person;
    }
  ave.appendChild(persons);

  // For now use Date chooser for date. Cannot handle time yet 
  let date = document.createElement("input"); 
  date.setAttribute("class", "aveDate");
  date.setAttribute("id", `aveDate${id}`);
  date.setAttribute("type", "date");
  if(aveLoad != ''){// if creating an avenue that is being pulled from a file set it's value 
    let momDate = moment(aveLoad.date, 'ddd MMM DD YYYY HH:mm:ss'); // Adjust to current timezone from saved timezone
    date.value = momDate.format('YYYY-MM-DD'); // Format for display in date chooser 
    }
  ave.appendChild(date);

  // Creates and adds dynamic event listener to delete button
  let deleteBtn = document.createElement("input");
  deleteBtn.setAttribute("class", "aveDelete");
  deleteBtn.setAttribute("id", `aveDelete${id}`);
  deleteBtn.setAttribute("type", "button");
  deleteBtn.setAttribute("value", "x");
  deleteBtn.addEventListener("click", function () {deleteAve(ave)}); 
  ave.appendChild(deleteBtn);

  // Get the container to hold the avenue and append it 
    // Note: default location is the avenueIn container
  //console.log("avenue", ave);
  document.getElementById(location).appendChild(ave);
};

// Deletes an avenue from the DOM
function deleteAve (ave) {
  // Remove message from UI
  ave.parentElement.removeChild(ave);
  // Remove message from Initiative object 
  let id = ave.id[6];
  currentInitiative.avenues.delete(id); // Take only the number off of the end of the ui id 
};

// Initalize dragula containers for drag and drop
var dragDrop = dragula([document.getElementById('avenueIn')]);// aveDrops are added dynamically when message is generated 
//console.log('drag and drop:', dragDrop);

// Link message and avenue if avenue is dropped into aveDrop
  // Else Unlink if avenue is dropped into avenueIn
dragDrop.on('drop', function (ave, target, source) {
  let type = target.getAttribute('class'); // determine where avenue was dropped by target class
  if (type == 'aveDrop') {
    let aveId = ave.id[6]; // Grab the id number off of each id
    let messId = target.id[7];
    let oldMessId = source.id[7];

    // Check to see if avenue is being moved from another message 
    let sourceClas = source.getAttribute('class'); 
    if (sourceClas == 'aveDrop' ) { // If coming from another message unlink from old message
      currentInitiative.unlink_ids(aveId, oldMessId);
      //console.log('unlinked old mess from ave: ', currentInitiative.messages.get(oldMessId));
      }

    // Link to new message 
    currentInitiative.link_ids(aveId, messId);
    //console.log('linked ave: ', currentInitiative.avenues.get(aveId), 'linked mess: ', currentInitiative.messages.get(messId));
    }
    else if (type == 'messIn' ){ // If being droped back into avenueIn unlink from old message
      // Check to see if avenue is being moved within avenueIn container 
      let sourceClas = source.getAttribute('class'); 
      if (sourceClas == 'messIn' ) { // If being moved within avenueIn return early to avoid unnecessary unlink
        return
        }
      // If being moved from a message unlink before droping into avenueIn
      let aveId = ave.id[6]; 
      let messId = source.id[7];
      currentInitiative.unlink_ids(aveId, messId);
      //console.log('unlinked ave: ', currentInitiative.avenues.get(aveId), 'unlinked mess: ', currentInitiative.messages.get(messId));
      }
});
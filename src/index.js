// This is the js file for the main window
const ipc = require('electron').ipcRenderer;
const templates = require('./objectTemplate.js');
const moment = require('moment'); // For date handling 
const dragula = require('dragula'); // For drag and drop 
const swal = require('sweetalert'); // For styled alert/confirm boxes
const clipboard = require('electron').clipboard; // For accessing the clipboard
const QuillDeltaToHtmlConverter = require('quill-delta-to-html').QuillDeltaToHtmlConverter; // Handle custom convertion of deltas to html
const Calendar = require('tui-calendar');// used for calendar on initiaive tab


var currentInitiative;
var currentInitiativeId;
// Initialize initiative object to be used currently
ipc.on('load', function (event, ipcPack) {
  currentInitiativeId = ipcPack.initId;
  currentInitiative = new templates.Initiative;
  currentInitiative.unpack_from_ipc(ipcPack.initObj);
  console.log('initiative and id on index load: ', currentInitiativeId, currentInitiative);
  // Load Initiative tab
    document.getElementById('initName').value = currentInitiative.name; // Update title from ui
    document.getElementById('initDescription').value = currentInitiative.description; // Update title from ui
    // Load Groups
      let groupKeys = currentInitiative.groups.keys();
      for ( grpId of groupKeys ){
        addGroup( 'load', grpId ); // Note: Event is not used programatically but helps with debugging input to addGroup
        // Iterate through group's contacts and add to ui 
        let group = currentInitiative.groups.get(grpId);
        let contactKeys = group.contacts.keys();
        for ( contId of contactKeys ){
          addContact( 'load', grpId, contId );
        };
      };
    // Load Goals
      let goalKeys = currentInitiative.goals.keys();
      for ( id of goalKeys ){
        addGoal('load', id ); // Note: Event is not used programatically but helps with debugging input to addMess
      };
    // Load Calendar 
    // Load avenues into Calendar on creation
      let aveKeys = currentInitiative.avenues.keys();
        for( id of aveKeys ){
          console.log('ave id for calender load', id);
          let ave = currentInitiative.avenues.get(id);
          console.log('avenue to load in calendar', ave);
          // Convert saved date into moment object for easier formatting 
          let momDate = moment(ave.date, 'ddd MMM DD YYYY HH:mm:ss'); // Adjust to current timezone from saved timezone
          console.log('moment date object', momDate)
          // Schedule object to display in calendar 
          let schedule = {
            id: id,
            calendarId: '1',
            title: ave.description,
            location: '',
            category: 'time',
            start: momDate.format('ddd MMM DD YYYY HH:mm:ss'), // Format for display in calendar 
            end: momDate.format('ddd MMM DD YYYY HH:mm:ss'),
          };
          calendar.createSchedules([schedule]);
          calendar.render();
        };
    // Display date range on top of calendar on first render
      let start = calendar.getDateRangeStart();
      let end = calendar.getDateRangeEnd();
      document.getElementById('year').value = `${end.getFullYear()}`;
      document.getElementById('month').value = `${start.getMonth() + 1}` + '.' + `${start.getDate()}` + ' - ' + `${end.getMonth() + 1}` + '.' + `${end.getDate()}`;

  // Load Message manager tab
    // Send initiative messages and avenues to ui
    let messKeys = currentInitiative.messages.keys();
    for ( id of messKeys ){
     addMess('load', id ); // Note: Event is not used programatically but helps with debugging input to addMess
    };

    aveKeys = currentInitiative.avenues.keys();
    for ( id of aveKeys ){
      console.log('ave id for mess tab load', id);
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
});


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


/* ---- Common index functions ---- */

// Function to save and pack current initative for ipc
function save () {
  // Sync ui before saving 
    // Initiative tab ui
    // Initiative Name and Description
    currentInitiative.name = document.getElementById('initName').value; // Update name from ui
    currentInitiative.description = document.getElementById('initDescription').value; // Update description from ui
    // Sync ui and initiative group objects before saving 
    let groupKeys = currentInitiative.groups.keys();
    for (id of groupKeys) {// Each iteration goes through one goal
      let guiGroup = document.getElementById(`group${id}`); // Goal object from the ui
      let initGroup = currentInitiative.groups.get(id); // Goal object from the initiative object 
      //console.log('init group', initGroup)
      initGroup.group_name = guiGroup.children[3].value;

      let contactsKeys = initGroup.contacts.keys(); 
      //console.log(contactsKeys)
      for (contId of contactsKeys) {// Each iteration goes through one goal
        let guiContact = document.getElementById(`contact${contId}`); // Contact object from the ui
        //console.log('gui', guiContact, 'object', initGroup.contacts);
        let name = guiContact.children[3].value;
        let email = guiContact.children[4].value;
        let phone = guiContact.children[5].value;
        
        initGroup.contacts.set(contId, [name, phone, email]);
        //console.log('after update', initGroup.contacts);
      };
    };
    console.log('updated group: ', currentInitiative.groups);

    // Sync ui and initiative goal objects before saving 
    let goalKeys = currentInitiative.goals.keys(); 
    for (id of goalKeys) {// Each iteration goes through one goal
      let guiGoal = document.getElementById(`goal${id}`); // Goal object from the ui
      let initGoal = currentInitiative.goals.get(id); // Goal object from the initiative object 
      //console.log(guiGoal)
      initGoal.type = guiGoal.children[3].value;
      initGoal.frequency = guiGoal.children[4].value;
      initGoal.reminder = guiGoal.children[5].value;
    };
    //console.log('updated goal: ', currentInitiative.goals);

    // Message Manager ui
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

  console.log('initiative to be saved: ', currentInitiative);
  let ipcInit = currentInitiative.pack_for_ipc();
  return ipcInit;  
};
// Handles events that trigger saving to file 
window.onbeforeunload = function (e) { indexClose(); }; // Event on closing Index window 
// Function to handle packing and sending current initative to main on window close 
function indexClose () {
  let ipcInit = save();
  ipc.send('index-close', currentInitiativeId, ipcInit);  
};
// Handles event from the message manager tab's save button 
document.getElementById('messSave').addEventListener("click", saveToMain); // Event from message manager save button 
document.getElementById('initSave').addEventListener("click", saveToMain); // Event from initiative save button
// Function to handle packing and sending current initiative to main on button save 
function saveToMain () {
  // Send alert to let user know that they have saves successfully 
  swal({ title: 'Saved!', icon: 'success', buttons: false });
  let ipcInit = save();
  ipc.send('save', currentInitiativeId, ipcInit);  
};

// Handles the event from the open button // Needs transitioned 
document.getElementById('messOpen').addEventListener("click", openFile);
function openFile () {
  let ipcPack = ipc.sendSync('open-file'); // Uses synchronous call to avoid user actions before data is loaded 
  currentInitiativeId = ipcPack.initId;
  currentInitiative.unpack_from_ipc(ipcPack.ipcInit);
  //console.log('init id on index load from file: ', currentInitiativeId, 'Unpacked initiative', currentInitiative);

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

/* ---- Message Manager related functions ---- */

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
  btnArray.setAttribute("class", "aveBtnArray");
  btnArray.setAttribute("id", `aveBtnArray${id}`);

    // Creates and adds dynamic event listener to edit button
    let editBtn = document.createElement("input");
    editBtn.setAttribute("class", "messEdit");
    editBtn.setAttribute("id", `messEdit${id}`);
    editBtn.setAttribute("type", "button");
    editBtn.setAttribute("value", "Edit");
    editBtn.addEventListener("click", function () {editMess(mess)}) ;
    btnArray.appendChild(editBtn);

    // Creates and adds dynamic event listener to copy button
    let copyBtn = document.createElement("input");
    copyBtn.setAttribute("class", "messCopy");
    copyBtn.setAttribute("id", `messCopy${id}`);
    copyBtn.setAttribute("type", "button");
    copyBtn.setAttribute("value", "Copy");
    copyBtn.addEventListener("click", function () {copyMess(mess)}) ;
    btnArray.appendChild(copyBtn);

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

/* may need to add handleing for open editors on deletion */
// Deletes a message from the DOM
function deleteMess (mess) {
  // Confirm that user wants to delete message if not return
  swal({
    title: 'Deleting Message',
    text: 'Are you sure you want to delete your Message?', 
    icon: 'warning',
    buttons: ['Cancel', 'Yes'],
    dangerMode: true
  })
  .then(function (value) {
    if (value == null) { // Escape deletion 
      return
    } else { // Proceed with deletion 
      // Check if message has linked avenues
      let aves = mess.getElementsByClassName('avenue');
      if (aves.length != 0 ) { 
        // Unlink avenues and place them back in avenueIn 
        while (0 < aves.length){// Collection empties as they are appended back to avenueIn
          let aveId = aves[0].id[6]; // grab id number of avenue
          let messId = mess.id[7];
          currentInitiative.unlink_ids(aveId, messId);
          //console.log('unlinked avenue: ', currentInitiative.avenues.get(aveId), 'unlinked message: ', currentInitiative.messages.get(messId));
          document.getElementById("avenueIn").appendChild(aves[0]);
          };
        };
  
      // Remove message from UI
      mess.parentElement.removeChild(mess);
      // Remove message from Initiative object 
      let id = mess.id[7]; // Take only the number off of the end of the ui id 
      currentInitiative.messages.delete(id); 
      // Send updates to main
      let ipcInit = currentInitiative.pack_for_ipc();
      ipc.send('save', currentInitiativeId, ipcInit);  
      };
    });
};

// Call back function for Edit button on message element 
function editMess (mess) {
  let messId = mess.id[7]; // Take only the number off of the end of the ui id 
  // Update Initiative from ui 
  let uiTitle = document.getElementById(`messTitle${messId}`);
  let messContent = currentInitiative.messages.get(`${messId}`); // get message object content
  messContent.change_title(uiTitle.value);
  //console.log('updated initiative: ', currentInitiative.messages)
  //console.log('init id on ipc to launch editor: ', currentInitiativeId, 'mess id: ', messId, 'message sent to main: ', messContent);
  // Send it all to main to be pinged to the editor
  ipc.send('edit', currentInitiativeId, messId, messContent); 
};

// Call back function for Edit button on message element 
function copyMess (mess) {
  let messId = mess.id[7]; // Take only the number off of the end of the ui id 
  // Gather message to copy from Initiative and ui 
  let uiTitle = document.getElementById(`messTitle${messId}`);
  let messContent = currentInitiative.messages.get(`${messId}`); // get message object content
  messContent.change_title(uiTitle.value);
  //console.log('message to copy: ', messContent)
  // Set up configuration for converting
  var cfg = {}; 
  // Get delta from message object
  let delGreet = messContent.greeting; 
  let delContt = messContent.content; 
  let delSignt = messContent.signature;
  // Put the ops into an array  
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
  //console.log('raw html before sending to clipboard', htmlMess);
  // Sent converted message to clipboard
  clipboard.writeHTML(htmlMess);
};

// On message editor save or close receive new message content and update
ipc.on('update-mess', function (event, messageId, messageObj) {
  // Get message linked with incoming save from editor
  let message = currentInitiative.messages.get(messageId);
  // Update the Title in the message manager tab
  let uiTitle = document.getElementById(`messTitle${messageId}`);
  uiTitle.value = messageObj.title;
  // Update initiative object 
  message.change_title(messageObj.title);
  message.change_greeting(messageObj.greeting);
  message.change_content(messageObj.content);
  message.change_signature(messageObj.signature);
  //console.log('updated message', message);
  });


// Adds an Avenue to do the DOM
   // Note: Avenue added through the unified modal popup called modalAve or loaded from file
function addAve (event='', aveId='', location='avenueIn', modalAddType='', modalAddDesc='', modalAddPers='', modalAddDate='') { // If avenue id is passed in it will load it from the initative object. Otherwise it is treated as a new avenue
  // Note: event is not used programatically but helps with debugging input form different sources
  // Update current initiative object if this is a new avenue 
  var id; 
  var aveLoad = '';
  if ( aveId == '') {// If message is being added for the first time from the modal popup
    id = currentInitiative.add_avenue(modalAddType, modalAddDesc, modalAddPers, false, '', modalAddDate);
    aveLoad = currentInitiative.avenues.get(id); // get newly created avenue to display in ui
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
  
  // Set dropdown options from list held in the initiative object 
  let options = currentInitiative.avenue_types;
  for (i in options){
    let opElem = document.createElement("option");
    let opText = currentInitiative.avenue_types[i]
    opElem.setAttribute("value", `${opText}`);
    opElem.innerHTML = `${opText}`;
    dropdown.appendChild(opElem);
    }
  if(aveLoad != ''){// if creating an avenue that is being pulled from a file or was added by modal set it's value 
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
  sent_checkbox.setAttribute("id", `aveSent_checkbox${id}`);
  sent_checkbox.setAttribute("type", "checkbox");
  if(aveLoad != ''){// if creating an avenue that is being pulled from a file or was added by modal set it's value
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
  if(aveLoad != '') {// if creating an avenue that is being pulled from a file or was added by modal set it's value 
    description.value = aveLoad.description;
    }
  ave.appendChild(description);

  let persons = document.createElement("textarea");
  persons.setAttribute("class", "avePersons");
  persons.setAttribute("id", `avePersons${id}`);
  if(aveLoad != ''){// if creating an avenue that is being pulled from a file or was added by modal set it's value 
    persons.value = aveLoad.person;
    }
  ave.appendChild(persons);

  // For now use Date chooser for date. Cannot handle time yet 
  let date = document.createElement("input"); 
  date.setAttribute("class", "aveDate");
  date.setAttribute("id", `aveDate${id}`);
  date.setAttribute("type", "date");
  if(aveLoad != ''){// if creating an avenue that is being pulled from a file or was added by modal set it's value 
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
  // Confirm that user wants to delete message if not return
  swal({
    title: 'Deleting Avenue',
    text: 'Are you sure you want to delete your Avenue?', 
    icon: 'warning',
    buttons: ['Cancel', 'Yes'],
    dangerMode: true
  })
  .then(function (value) {
    if (value == null) { // Escape deletion 
      return
    } else { // Proceed with deletion 
        // Remove message from UI
        ave.parentElement.removeChild(ave);
        // Remove message from Initiative object 
        let id = ave.id[6];
        currentInitiative.avenues.delete(id); // Take only the number off of the end of the ui id 
        // Send updates to main
        let ipcInit = currentInitiative.pack_for_ipc();
        ipc.send('save', currentInitiativeId, ipcInit);
        return
        }; 
    });
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

/* ---- Initiative tab related functions ---- */

// Adds a Goal to do the DOM
document.getElementById('addGoal').addEventListener("click", addGoal);
function addGoal (event='', goalId='') {// If Goal id is passed in it will load it from the initative object. Otherwise it is treated as a new Goal
  // Update the current initiative object if this is a new Goal 
  var id; 
  var goalLoad = '';
  if ( goalId == '') { // If goal is being added for the first time 
    id = currentInitiative.add_goal();
    } else { // Else load existing goal from initiative object 
      id = goalId
      goalLoad = currentInitiative.goals.get(id);
    }

  //creates main div to hold an individual Goal
  let goal = document.createElement("div");
  goal.setAttribute("class", "goal");
  goal.setAttribute("id", `goal${id}`);
  
  // Creates title paragraphs 
  let freq_heading = document.createElement("p");// Title for Goal Frequency  
  freq_heading.setAttribute("class", "goal_title");
  freq_heading.setAttribute("id", "goalFreq_title");
  freq_heading.innerHTML = "Frequency:";
  goal.appendChild(freq_heading);// Add the title to the goal
 
  let type_title = document.createElement("p");// Title for Goal Type 
  type_title.setAttribute("class", "goal_title");
  type_title.setAttribute("id", "goalType_title");
  type_title.innerHTML = "Type:";
  goal.appendChild(type_title);// Add the title to the goal

  let reminder_title = document.createElement("p");// Title for Goal Reminder 
  reminder_title.setAttribute("class", "goal_title");
  reminder_title.setAttribute("id", "goalReminder_title");
  reminder_title.innerHTML = "Reminder:";
  goal.appendChild(reminder_title);// Add the title to the goal

  
  // Creates drop down list 
  let dropdown = document.createElement("select");
  dropdown.setAttribute("class", "typeDropdown");
  dropdown.setAttribute("id", `goal_type${id}`);
  
  // Set dropdown options from list held in the initiative object 
  let options = currentInitiative.avenue_types;
  for (i in options){
    let opElem = document.createElement("option");
    let opText = currentInitiative.avenue_types[i]
    opElem.setAttribute("value", `${opText}`);
    opElem.innerHTML = `${opText}`;
    dropdown.appendChild(opElem);
    }
  if(goalLoad != ''){// if creating an goal that is being pulled from a file set it's value   
    dropdown.value = goalLoad.type;
  };
  goal.appendChild(dropdown); //add the dropdown menu to the goal

  // Textareas 
  let freq = document.createElement("textarea");
  freq.setAttribute("class", "frequency");
  freq.setAttribute("id", `frequency${id}`);
  if(goalId != ''){// if creating a goal that is being pulled from a file set it's value 
  freq.value = goalLoad.frequency;
    }
  goal.appendChild(freq);

  let remd = document.createElement("textarea");
  remd.setAttribute("class", "reminder");
  remd.setAttribute("id", `reminder${id}`);
  if(goalId != ''){// if creating an goal that is being pulled from a file set it's value 
  remd.value = goalLoad.reminder;
    }
  goal.appendChild(remd);

  // Creates and adds dynamic event listener to delete button
  let deleteBtn = document.createElement("input");
  deleteBtn.setAttribute("class", "goalDelete");
  deleteBtn.setAttribute("id", `goalDelete${id}`);
  deleteBtn.setAttribute("type", "button");
  deleteBtn.setAttribute("value", "x");
  deleteBtn.addEventListener("click", function () {deleteGoal(goal)}) ;

  goal.appendChild(deleteBtn);

  // Get the main div that holds all the goals and append the new one
  //console.log("goal", goal);
  document.getElementById("goalIn").appendChild(goal);
};

// Deletes a goal from the DOM
function deleteGoal (goal) {
  // Confirm that user wants to delete Goal. If not return
  swal({
    title: 'Deleting Goal',
    text: 'Are you sure you want to delete your Goal?', 
    icon: 'warning',
    buttons: ['Cancel', 'Yes'],
    dangerMode: true
  })
  .then(function (value) {
    if (value == null) { // Escape deletion 
      return
    } else { // Proceed with deletion 
      
      // Remove goal from UI
      goal.parentElement.removeChild(goal);
      // Remove goal from Initiative object 
      let id = goal.id[4]; // Take only the number off of the end of the ui id 
      //console.log("goal object in delete:", goal.id[4])
      currentInitiative.goals.delete(id); 
      // Send updates to main
      let ipcInit = currentInitiative.pack_for_ipc();
      ipc.send('save', currentInitiativeId, ipcInit);  
      };
    });
};

// Adds a group to do the DOM
document.getElementById('addGroup').addEventListener("click", addGroup);
function addGroup (event='', groupId='') {// If group id is passed in it will load it from the initative object. Otherwise it is treated as a new group
  // Update the current initiative object if this is a new group  
  var id; 
  var groupLoad = '';
  if ( groupId == '') { // If group is being added for the first time 
    id = currentInitiative.add_group();
    } else { // Else load existing group from initiative object 
      id = groupId
      groupLoad = currentInitiative.groups.get(id);
      //console.log(groupLoad);
      }

  // Creates main div to hold an individual Group 
  let group = document.createElement("div");
  group.setAttribute("class", "group");
  group.setAttribute("id", `group${id}`);
  
  // Creates title paragraphs  
  let name_title = document.createElement("p");// Title for Group 
  name_title.setAttribute("class", "group_title");
  name_title.setAttribute("id", "groupName_title");
  name_title.innerHTML = "Name:";
  group.appendChild(name_title);// Add the title to the group

  let contacts_title = document.createElement("p");// Title for Group 
  contacts_title.setAttribute("class", "group_title");
  contacts_title.setAttribute("id", "groupContacts_title");
  contacts_title.innerHTML = "Contacts:";
  group.appendChild(contacts_title);// Add the title to the group
  
  // Div to hold all buttons
  let btnArray = document.createElement("div");
  btnArray.setAttribute("class", "grpBtnArray");
  btnArray.setAttribute("id", `grpBtnArray${id}`);

  // Button to add a new contact 
  let addContactBtn = document.createElement("input");
  addContactBtn.setAttribute("class", "addContact");
  addContactBtn.setAttribute("id", `addContact${id}`);
  addContactBtn.setAttribute("type", "button");
  addContactBtn.setAttribute("value", "Add");
  addContactBtn.addEventListener("click", function () {addContact('Add', id)}) ;
  btnArray.appendChild(addContactBtn);// Add the button to the array

  // Button to copy all group emails 
  let emailBtn = document.createElement("input");
  emailBtn.setAttribute("class", "copyEmails");
  emailBtn.setAttribute("id", `copyEmails${id}`);
  emailBtn.setAttribute("type", "button");
  emailBtn.setAttribute("value", "Emails");
  emailBtn.addEventListener("click", function () {copyEmails('copy', id)}) ;
  btnArray.appendChild(emailBtn);// Add the button to the array
  
  // Button to copy all group phone numbers 
  let phoneBtn = document.createElement("input");
  phoneBtn.setAttribute("class", "copyPhones");
  phoneBtn.setAttribute("id", `copyPhones${id}`);
  phoneBtn.setAttribute("type", "button");
  phoneBtn.setAttribute("value", "Phones");
  phoneBtn.addEventListener("click", function () {copyPhones('copy', id)}) ;
  btnArray.appendChild(phoneBtn);// Add the button to the array

  // Creates and adds dynamic event listener to delete button
  let deleteBtn = document.createElement("input");
  deleteBtn.setAttribute("class", "groupDelete");
  deleteBtn.setAttribute("id", `groupDelete${id}`);
  deleteBtn.setAttribute("type", "button");
  deleteBtn.setAttribute("value", "x");
  deleteBtn.addEventListener("click", function () {deleteGroup(group)});
  btnArray.appendChild(deleteBtn); // Add the button to the array

  group.appendChild(btnArray) // Append all buttons to the group

  // Textarea for name  
  let name = document.createElement("textarea");
  name.setAttribute("class", "name");
  name.setAttribute("id", `name${id}`);
  if(groupId != ''){// if creating a group that is being pulled from a file set it's value 
  name.value = groupLoad.group_name;
    }
  group.appendChild(name);

  // Div to hold all contacts ui elements 
  let contacts = document.createElement("div");
  contacts.setAttribute("class", "contacts");
  contacts.setAttribute("id", `contacts${id}`);
  if(groupId != ''){// if creating a group that is being pulled from a file set it's value 
  contacts.value = groupLoad.contacts;
    }
  group.appendChild(contacts);

  

  // Get the main div that holds all the groups and append the new one
  //console.log("group", group, "initative", currentInitiative);
  document.getElementById("groupIn").appendChild(group);
};

// Copy all emails from group to clipboard
function copyEmails (event='', groupId='') {// Takes in a group id and adds contact to ui and group object 
  let emails = ''; // String to append emails to
  // If no group id provided throw error and return from function  
  if (groupId == '') { console.error('No group id provided'); return;}; 
  // Update the current group object from ui before copying  
  let initGroup = currentInitiative.groups.get(groupId); // Group object from the initiative object 
  //console.log('init group', initGroup)
  let contactsKeys = initGroup.contacts.keys(); // Get contact keys from group object 
  //console.log('contact keys: ', contactsKeys)
  for (contId of contactsKeys) {// Each iteration goes through one goal
    let guiContact = document.getElementById(`contact${contId}`); // Contact object from the ui
    //console.log('gui contact: ', guiContact, 'object', initGroup.contacts);
    let name = guiContact.children[3].value;
    let email = guiContact.children[4].value;
    let phone = guiContact.children[5].value;
    
    initGroup.contacts.set(contId, [name, phone, email]);
    if (email != '') { // If email field is not blank add to string
      emails += '\n' + email.trim(); // remove any whitespace and then add back one new line
      console.log('emails: ', emails);
    };
  };
  
  console.log('updated group: ', currentInitiative.groups);
  clipboard.writeText(emails);
};

// Copy all emails from group to clipboard
function copyPhones (event='', groupId='') {// Takes in a group id and adds contact to ui and group object 
  let phones = ''; // String to append emails to
  // If no group id provided throw error and return from function  
  if (groupId == '') { console.error('No group id provided'); return;}; 
  // Update the current group object from ui before copying  
  let initGroup = currentInitiative.groups.get(groupId); // Group object from the initiative object 
  //console.log('init group', initGroup)
  let contactsKeys = initGroup.contacts.keys(); // Get contact keys from group object 
  //console.log('contact keys: ', contactsKeys)
  for (contId of contactsKeys) {// Each iteration goes through one goal
    let guiContact = document.getElementById(`contact${contId}`); // Contact object from the ui
    //console.log('gui contact: ', guiContact, 'object', initGroup.contacts);
    let name = guiContact.children[3].value;
    let email = guiContact.children[4].value;
    let phone = guiContact.children[5].value;
    
    initGroup.contacts.set(contId, [name, phone, email]);
    if (phone != '') { // If phone number field is not blank add to string
      phones += '\n' + phone.trim(); // remove any whitespace and then add back one new line
      console.log('phones: ', phones);
    };
  };
  
  console.log('updated group: ', currentInitiative.groups);
  
  clipboard.writeText(phones);
};

// Deletes a group from the DOM
function deleteGroup (group) {
  // Confirm that user wants to delete message if not return
  swal({
    title: 'Deleting Group',
    text: 'Are you sure you want to delete your Group?', 
    icon: 'warning',
    buttons: ['Cancel', 'Yes'],
    dangerMode: true
  })
  .then(function (value) {
    if (value == null) { // Escape deletion 
      return
    } else { // Proceed with deletion 
      
      // Remove message from UI
      group.parentElement.removeChild(group);
      // Remove message from Initiative object 
      let id = group.id[5]; // Take only the number off of the end of the ui id 
      //console.log("group object in delete:", group.id[5])
      currentInitiative.groups.delete(id); 
      // Send updates to main
      let ipcInit = currentInitiative.pack_for_ipc();
      ipc.send('save', currentInitiativeId, ipcInit);  
      };
    });
};

function addContact (event='', groupId='', contactId='') {// Takes in a group id and adds contact to ui and group object 
  // If no group id provided throw error and return from function  
  if (groupId == '') { console.error('No group id provided'); return;}; 
  // Update the current initiative object if this is a new contact 
  let id;
  let group = currentInitiative.groups.get(groupId);
  let contact;
  if ( contactId == '') { // If contact is being added for the first time 
    id = group.add_contact();
  } else { // Else load existing contact from group object 
    contact = group.contacts.get(contactId);
    id = contactId;
    //console.log(contact);
  }

  // Creates main div to hold an individual Contact 
  let contactUi = document.createElement("div");
  contactUi.setAttribute("class", "contact");
  contactUi.setAttribute("id", `contact${id}`);
  
  // Creates title paragraphs  
  let name_title = document.createElement("p");// Title for Group 
  name_title.setAttribute("class", "cont_title");
  name_title.setAttribute("id", "contName_title");
  name_title.innerHTML = "Name:";
  contactUi.appendChild(name_title);// Add the title to the group

  let email_title = document.createElement("p");// Title for Group 
  email_title.setAttribute("class", "cont_title");
  email_title.setAttribute("id", "contactEmail_title");
  email_title.innerHTML = "Email:";
  contactUi.appendChild(email_title);// Add the title to the group

let phone_title = document.createElement("p");// Title for Group 
  phone_title.setAttribute("class", "cont_title");
  phone_title.setAttribute("id", "contactPhone_title");
  phone_title.innerHTML = "Phone:";
  contactUi.appendChild(phone_title);// Add the title to the group

  // Textareas for name  
  let name = document.createElement("textarea");
  name.setAttribute("class", "contactIn");
  name.setAttribute("id", `name${id}`);
  if(contactId != ''){// if creating a contact that is being pulled from a file set it's value 
  name.value = contact[0];
    }
  contactUi.appendChild(name);

  
  let email = document.createElement("textarea");
  email.setAttribute("class", "contactIn");
  email.setAttribute("id", `email${id}`);
  if(contactId != ''){// if creating a contact that is being pulled from a file set it's value 
  email.value = contact[2];
  }
  contactUi.appendChild(email);

  let phone = document.createElement("textarea");
  phone.setAttribute("class", "contactIn");
  phone.setAttribute("id", `phone${id}`);
  if(contactId != ''){// if creating a contact that is being pulled from a file set it's value 
  phone.value = contact[1];
    }
  contactUi.appendChild(phone);

  // Creates and adds dynamic event listener to delete button
  let deleteBtn = document.createElement("input");
  deleteBtn.setAttribute("class", "contactDelete");
  deleteBtn.setAttribute("id", `contactDelete${id}`);
  deleteBtn.setAttribute("type", "button");
  deleteBtn.setAttribute("value", "x");
  deleteBtn.addEventListener("click", function () {deleteContact(groupId, contactUi)}) ;
  contactUi.appendChild(deleteBtn);

  // Get the main div that holds all the contact's info and append to groups contact container
  //console.log("contact", contactUi);
  document.getElementById(`contacts${groupId}`).appendChild(contactUi);
};

// Deletes a contact from the DOM
function deleteContact (groupId, contactUi) {
  // Confirm that user wants to delete message if not return
  swal({
    title: 'Deleting Contact',
    text: 'Are you sure you want to delete your Contact?', 
    icon: 'warning',
    buttons: ['Cancel', 'Yes'],
    dangerMode: true
  })
  .then(function (value) {
    if (value == null) { // Escape deletion 
      return
    } else { // Proceed with deletion 
      
      // Remove Contact from UI
      contactUi.parentElement.removeChild(contactUi);
      // Remove Contact from group object 
      let contId = contactUi.id[7] + contactUi.id[8]; 
      //console.log("contact object in delete:", contId)
      let group = currentInitiative.groups.get(groupId); 
      //console.log("group object:", group)
      group.contacts.delete(contId);
      // Send updates to main
      let ipcInit = currentInitiative.pack_for_ipc();
      ipc.send('save', currentInitiativeId, ipcInit);  
      };
    });
};

const themeConfig = {
  };

// Calendar object for initiative tab
var calendar = new Calendar('#calendar', {
  defaultView: 'month',
  taskView: true,    // Can be also ['milestone', 'task']
  scheduleView: true,  // Can be also ['allday', 'time']
  useCreationPopup: true,
  useDetailPopup: true,
  template: {
    /*popupIsAllDay: function() {
      return 'All Day';
    },
    popupStateBusy: function() {
      return 'Crazy';
    },
    popupStateFree: function() {
      return 'Free';
    },
    titlePlaceholder: function() {
      return 'Subject';
    },
    locationPlaceholder: function() {
      return 'Location';
    },
    startDatePlaceholder: function() {
      return 'Start date';
    },
    endDatePlaceholder: function() {
      return 'End date';
    },
    popupSave: function() {
      return 'Save';
    },
    popupUpdate: function() {
      return 'Update';
    },
    popupDetailDate: function(isAllDay, start, end) {
      var isSameDate = moment(start).isSame(end);
      var endFormat = (isSameDate ? '' : 'YYYY.MM.DD ') + 'hh:mm a';
  
      if (isAllDay) {
        return moment(start).format('YYYY.MM.DD') + (isSameDate ? '' : ' - ' + moment(end).format('YYYY.MM.DD'));
      }
  
      return (moment(start).format('YYYY.MM.DD hh:mm a') + ' - ' + moment(end).format(endFormat));
    },
    popupDetailLocation: function(schedule) {
      return 'Location : ' + schedule.location;
    },
    popupDetailUser: function(schedule) {
      return 'User : ' + (schedule.attendees || []).join(', ');
    },
    popupDetailState: function(schedule) {
      return 'State : ' + schedule.state || 'Busy';
    },
    popupDetailRepeat: function(schedule) {
      return 'Repeat : ' + schedule.recurrenceRule;
    },
    popupDetailBody: function(schedule) {
      return 'Body : ' + schedule.body;
    },
    popupEdit: function() {
      return 'Edit';
    },
    popupDelete: function() {
      return 'Delete';
    }*/
  },
  month: {
    daynames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    startDayOfWeek: 0,
    narrowWeekend: true
  },
  week: {
    daynames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    startDayOfWeek: 0,
    narrowWeekend: true
  }
});
  
// Events from calendar object 
calendar.on('clickSchedule', function() {
  console.log('clickSchedule');
})

calendar.on('clickMore', function() {
  console.log('clickMore');
})

calendar.on('clickDayname', function() {
  console.log('clickDayname');
})

calendar.on({
  // Create schedule from popup
  'beforeCreateSchedule': function(event) {
    let startTime = event.start;
    let endTime = event.end;
    let iisAllDay = event.isAllDay;
    let guide = event.guide;
    let triggerEventName = event.triggerEventName;
    let title = event.title;
    let location = event.location;
    let state = event.state;
    let schedule = {
      id: '1',
      calendarId: '1',
      title: title,
      location: location,
      category: 'time',
      dueDateClass: '',
      start: startTime,
      end: endTime,
    };
    console.log('event: ', event, 'guide: ', event.guide)
    /*if (triggerEventName === 'click') {
      // open writing simple schedule popup
      schedule = {
        calendarId: '1',
        id: '1',
        title: title,
        location: location,
        start: startTime,
        end: endTime,
        isAllDay: isAllDay,
        state: state
      };
    } /*else if (triggerEventName === 'dblclick') {
      // open writing detail schedule popup
      schedule = {...};
    }*/
    console.log('schedule', schedule);
    calendar.createSchedules([schedule]);
    calendar.render();
  },
  // Update schedule on drag
  'beforeUpdateSchedule': function(event) {
    let schedule = event.schedule;
    let changes = event.changes;
    console.log('schedule', schedule, 'changes', changes)
    calendar.updateSchedule(schedule.id, schedule.calendarId, changes);
  },
  // Delete schedule from popup 
  'beforeDeleteSchedule': function(e) {
    console.log('beforeDeleteSchedule', e);
    calendar.deleteSchedule(e.schedule.id, e.schedule.calendarId);
  }
});

// Navigate Calendar 
// Go back a month
document.getElementById('prev').addEventListener('click', function (event) {
  calendar.prev();
  let start = calendar.getDateRangeStart();
  let end = calendar.getDateRangeEnd();
  console.log('prev', start, end);
  // Display date range on top of calendar 
  document.getElementById('year').value = `${end.getFullYear()}`;
  document.getElementById('month').value = `${start.getMonth() + 1}` + '.' + `${start.getDate()}` + ' - ' + `${end.getMonth() + 1}` + '.' + `${end.getDate()}`;
});

// Go to today
document.getElementById('today').addEventListener('click', function (event) {
  calendar.today();
  let start = calendar.getDateRangeStart();
  let end = calendar.getDateRangeEnd();
  console.log('today', start.getDate(), end);
  // Display date range on top of calendar 
  document.getElementById('year').value = `${end.getFullYear()}`;
  document.getElementById('month').value = `${start.getMonth() + 1}` + '.' + `${start.getDate()}` + ' - ' + `${end.getMonth() + 1}` + '.' + `${end.getDate()}`;
});

// Go to next month
document.getElementById('next').addEventListener('click', function (event) {
  calendar.next();
  let start = calendar.getDateRangeStart();
  let end = calendar.getDateRangeEnd();
  console.log('next', start, end);
  // Display date range on top of calendar 
  document.getElementById('year').value = `${end.getFullYear()}`;
  document.getElementById('month').value = `${start.getMonth() + 1}` + '.' + `${start.getDate()}` + ' - ' + `${end.getMonth() + 1}` + '.' + `${end.getDate()}`;
});

/* ---- Unified modal popup to add Avenues across tabs ---- */

// Get the modal
var modal = document.getElementById("aveModal");

// Get the button that opens the modal on the message manager tab 
document.getElementById("addAve").addEventListener("click", modalLaunch);

// When the user clicks on the button, open the modal
function modalLaunch() {
  // Set dropdown options from list held in the initiative object 
  let dropdown = document.getElementById('aveDropModal')
  let options = currentInitiative.avenue_types;
  for (i in options){
    let opElem = document.createElement("option");
    let opText = currentInitiative.avenue_types[i]
    opElem.setAttribute("value", `${opText}`);
    opElem.innerHTML = `${opText}`;
    dropdown.appendChild(opElem);
    }
  // Display modal 
 modal.style.display = "block";
}

// Get the save button from modal 
document.getElementById('saveModal').addEventListener("click", aveModalSave );

function aveModalSave (){
  let type = document.getElementById('aveDropModal');
  let date = document.getElementById('aveDateModal');
  let description = document.getElementById('aveDescModal');
  let person = document.getElementById('avePersModal');
  console.log('type', type.value, '\ndate', date.value, '\ndescription', description.value, '\nperson', person.value);
  // Make sure date and description are filled out 
  if (date.value != '' && description.value != ''){
    console.log('adding avenue')
    // Add avenue to initative and message manager ui
    addAve('modalAdd', '', 'avenueIn', type.value, description.value, person.value, date.value);
    // Close modal
    modal.style.display = "none";
    // Reset modal
    type.value = 'Email'
    date.value = ''; 
    description.value = '';
    person.value = '';
    // Reset backgroup of date and description incase they had been changed on unfilled attempt to save
    date.style.backgroundColor = 'white';
    description.style.backgroundColor = 'white';
  } else { // Change backgroup of date or description if not filled out 
      if (date.value == ''){
        date.style.backgroundColor = 'rgb(225, 160, 140)';
      };
      if (description.value == ''){
        description.style.backgroundColor = 'rgb(225, 160, 140)';
      };
    };
};

// Get the <span> element that closes the modal and attach listener
document.getElementsByClassName("close")[0].addEventListener("click", function() {
  modal.style.display = "none";
  // Reset modal
  let type = document.getElementById('aveDropModal');
  let date = document.getElementById('aveDateModal');
  let description = document.getElementById('aveDescModal');
  let person = document.getElementById('avePersModal');
  type.value = 'Email'
  date.value = ''; 
  description.value = '';
  person.value = '';
  // Reset backgroup of date and description incase they had been changed on unfilled attempt to save
  date.style.backgroundColor = 'white';
  description.style.backgroundColor = 'white';
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    // Reset modal
    let type = document.getElementById('aveDropModal');
    let date = document.getElementById('aveDateModal');
    let description = document.getElementById('aveDescModal');
    let person = document.getElementById('avePersModal');
    type.value = 'Email'
    date.value = ''; 
    description.value = '';
    person.value = '';
    // Reset backgroup of date and description incase they had been changed on unfilled attempt to save
    date.style.backgroundColor = 'white';
    description.style.backgroundColor = 'white';
  };
};
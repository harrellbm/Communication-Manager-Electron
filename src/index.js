// This is the js file for the main window
const ipc = require('electron').ipcRenderer;
const templates = require('./objectTemplate.js');
const moment = require('moment'); // For date handling 
const dragula = require('dragula'); // For drag and drop 
const swal = require('sweetalert'); // For styled alert/confirm boxes
const clipboard = require('electron').clipboard; // For accessing the clipboard
const QuillDeltaToHtmlConverter = require('quill-delta-to-html').QuillDeltaToHtmlConverter; // Handle custom convertion of deltas to html
const Calendar = require('tui-calendar');// used for calendar on initiaive tab

// Note: there are three main date formats used between elements
   // Moment's toString and Tui's TZDate function toDate generates dates formated 'ddd MMM DD YYYY HH:mm:ss' which is used to save dates in initative object and display on calendar
   // the date picker displays and returns dates in format 'YYYY-MM-DD'
// Note: Element ids hold a tag on the front in the from 'elementTypeNumber' i.e 'avenue0' or 'group0' this makes for easy access using getElementById
   // In objects the tag is removed so that only the number is saved this makes for easier manipulation under the hood
// Note: Avenues that are linked to a Goal are associated with calendar id 2 all other avenues are associated with calendar id 1
/* ---- Common index functions ---- */ 
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
  // Load avenues to both message manager and initiative tab
  aveKeys = currentInitiative.avenues.keys();
  for ( id of aveKeys ){
    console.log('ave id for mess tab load', id);
    // Check to see if avenue is linked to a message or goal
    let aveObj = currentInitiative.avenues.get(id);
    let messId = aveObj.message_id;
    let goalId = aveObj.goal_id;
    if (goalId != '') { // If linked to goal send special event to addAve function 
      if (messId != '') { // If also linked to message send avenue element on the message manager tab to the linked message dropbox
        addAve('goalUp', id, `aveDrop${messId}`) ;
      } else { // Else just add it to the default container on the message manager tab
        addAve('goalUp', id );
      };
    } else { // If not connected to goal load nomally an check for connected message
      if (messId != '') { // If so send to respective message drop box
        addAve('load', id, `aveDrop${messId}`) ;// Note: event is not used programatically but helps with debugging input to addAve
      } else { // Else just add it to the default container
        addAve('load', id ); 
      };
    };
  };
});

// Function to save and pack current initative for ipc
function save () {
  // Sync ui before saving 
    // Initiative tab ui
    // Initiative Name and Description
    currentInitiative.name = document.getElementById('initName').value; // Update name from ui
    currentInitiative.description = document.getElementById('initDescription').value; // Update description from ui
    // Sync ui and initiative group objects before saving 
    let groupKeys = currentInitiative.groups.keys();
    for (id of groupKeys) {// Each iteration goes through one group
      let guiGroup = document.getElementById(`group${id}`); // Group object from the ui
      let initGroup = currentInitiative.groups.get(id); // Group object from the initiative object 
      //console.log('init group', initGroup)
      initGroup.group_name = guiGroup.children[3].value;

      let contactsKeys = initGroup.contacts.keys(); 
      //console.log(contactsKeys)
      for (contId of contactsKeys) {// Each iteration goes through one contact
        let guiContact = document.getElementById(`contact${contId}`); // Contact object from the ui
        //console.log('gui', guiContact, 'object', initGroup.contacts);
        let name = guiContact.children[3].value;
        let email = guiContact.children[4].value;
        let phone = guiContact.children[5].value;
        
        initGroup.contacts.set(contId, [name, phone, email]);
        //console.log('after update', initGroup.contacts);
      };
    };
    //console.log('updated group: ', currentInitiative.groups);

    // Sync ui and initiative goal objects before saving 
    let goalKeys = currentInitiative.goals.keys(); 
    for (goalId of goalKeys) {// Each iteration goes through one goal
      let guiGoal = document.getElementById(`goal${goalId}`); // Goal object from the ui
      let initGoal = currentInitiative.goals.get(goalId); // Goal object from the initiative object 
      //console.log(guiGoal)
      let startDate = moment(guiGoal.children[5].children[0].value, 'YYYY-MM-DD', true);
      let untilDate = moment(guiGoal.children[5].children[5].value, 'YYYY-MM-DD', true);
      // Make sure that until date is not before start date
        // Note: If window is closed with invalid dates the goal will not be updated and last successful save will be retained in the initiative object to avoid data corruption 
      if ( startDate.isSameOrBefore(untilDate) ) {
        initGoal.description = guiGoal.children[3].value;
        initGoal.type = guiGoal.children[4].value;
        initGoal.frequency = [ // Get frequency specifics and save in array as format: [ frequency, denomination, unitl ]
            startDate.toString(),
            guiGoal.children[5].children[2].value, 
            guiGoal.children[5].children[3].value, 
            untilDate.toString()
        ]; 
        initGoal.reminder = guiGoal.children[6].value;
        // Updated dates from goal frequency 
        let newDates = currentInitiative.goal_generate_dates(goalId);
        // If there are more dates than avenues add new ones 
        if (initGoal.linked_aves.length < newDates.length) { 
          // Add additional avenues 
          let oldAveIds = [...initGoal.linked_aves]; // hold reference to initial avenues linked to goal
          let dif = newDates.length - initGoal.linked_aves.length; // Get the difference between number of current Avenues and new generated dates
          console.log('difference of aves and dates', dif);
          // Add extra avenues 
          for (dif; dif >0; dif--) {
            let date = newDates.pop();
            // Generate new linked avenues in initiative object
            let aveId = currentInitiative.add_avenue(initGoal.type, initGoal.description, '', false, '', date, goalId);
            // Link new avenue to goal
            initGoal.linked_aves.push(aveId);
            console.log('goal linked aves', currentInitiative.goals.get(goalId) );
            // Load new avenue to both message manager and initiative tab
            addAve('goalUp', aveId );  // Event is used to change ui options depending on type of add
          };
        
          // Update old linked avenues
          let i = 0; // To access new dates in proper order from newDates array
          for ( aveId of oldAveIds ) {
            let guiAve = document.getElementById(`avenue${aveId}`); // Avenue object from the message manager ui
            let initAve = currentInitiative.avenues.get(aveId); // Avenue object from the initiative object 
        
            // Update avenue in initiative object
            initAve.avenue_type = guiGoal.children[4].value;  // Update type from goal 
            initAve.sent = guiAve.children[4].children[0].checked; // Update sent from message manager tab
            initAve.description = guiGoal.children[3].value; // Update description from goal
            initAve.person = guiAve.children[6].value; // Update person from message manager tab /* need to shift to goal */
            initAve.change_date(newDates[i]); // Update from newly generated goal dates
            console.log('updated ave from goal', initAve);

            // Update Message manager tab
            guiAve.children[0].value = guiGoal.children[4].value; // Type
            guiAve.children[5].value = guiGoal.children[3].value; // Description
            guiAve.children[6].value = guiAve.children[6].value; // Person /* need to shift to goal */
            let newDate = moment(newDates[i], 'ddd MMM DD YYYY HH:mm:ss')
            guiAve.children[7].value = newDate.format('YYYY-MM-DD'); // Date

            // Update Schedule object on calendar 
            calendar.updateSchedule(aveId, '2', {
              title: guiGoal.children[3].value,
              start: newDate.format('ddd DD MMM YYYY HH:mm:ss'),
              end:  newDate.format('ddd DD MMM YYYY HH:mm:ss')
            });
            ++i;
          }; 
        } else if (initGoal.linked_aves.length > newDates.length) { // If there are more avenues than new dates remove the extras 
          // Remove extra Avenues 
          let dif = initGoal.linked_aves.length - newDates.length; // Get the difference between number of current Avenues and new generated dates 
          console.log('difference of aves and dates', dif);
          // Remove extra linked avenues from ui and initiative object 
          for (dif; dif > 0; dif--) {
            let aveId = initGoal.linked_aves.pop();
            // Remove avenue from message manager tab UI
            let ave = document.getElementById(`avenue${aveId}`);
            ave.parentElement.removeChild(ave);
            // Remove Schedule object on calendar 
            calendar.deleteSchedule(aveId, '2'); // Note: may need to store various calendars that are associated with different goals later
            console.log('avenue id after ui remove', aveId);
            // Remove avenue from Initiative object 
            currentInitiative.avenues.delete(aveId);
          };

          // Update linked avenues
          let i = 0; // To access new dates in proper order from newDates array
          for ( aveId of initGoal.linked_aves ) {
            let guiAve = document.getElementById(`avenue${aveId}`); // Avenue object from the message manager ui
            let initAve = currentInitiative.avenues.get(aveId); // Avenue object from the initiative object 
        
            // Update avenue in initiative object
            initAve.avenue_type = guiGoal.children[4].value;  // Update type from goal 
            initAve.sent = guiAve.children[4].children[0].checked; // Update sent from message manager tab
            initAve.description = guiGoal.children[3].value; // Update description from goal
            initAve.person = guiAve.children[6].value; // Update person from message manager tab /* need to shift to goal */
            initAve.change_date(newDates[i]); // Update from newly generated goal dates
            console.log('updated ave from goal', initAve);

            // Update Message manager tab
            guiAve.children[0].value = guiGoal.children[4].value; // Type
            guiAve.children[5].value = guiGoal.children[3].value; // Description
            guiAve.children[6].value = guiAve.children[6].value; // Person /* need to shift to goal */
            let newDate = moment(newDates[i], 'ddd MMM DD YYYY HH:mm:ss')
            guiAve.children[7].value = newDate.format('YYYY-MM-DD'); // Date

            // Update Schedule object on calendar 
            calendar.updateSchedule(aveId, '2', {
              title: guiGoal.children[3].value,
              start: newDate.format('ddd DD MMM YYYY HH:mm:ss'),
              end:  newDate.format('ddd DD MMM YYYY HH:mm:ss')
            });
            ++i;
          }; 
        } else { // Else if they are equal just update all avenues with new input from ui 
          // Update linked avenues
          let i = 0; // To access new dates in proper order from newDates array
          for ( aveId of  initGoal.linked_aves ) {
            console.log('same amount of aves and new dates');
            let guiAve = document.getElementById(`avenue${aveId}`); // Avenue object from the message manager ui
            let initAve = currentInitiative.avenues.get(aveId); // Avenue object from the initiative object 
        
            // Update avenue in initiative object
            initAve.avenue_type = guiGoal.children[4].value;  // Update type from goal 
            initAve.sent = guiAve.children[4].children[0].checked; // Update sent from message manager tab
            initAve.description = guiGoal.children[3].value; // Update description from goal
            initAve.person = guiAve.children[6].value; // Update person from message manager tab /* need to shift to goal */
            initAve.change_date(newDates[i]); // Update from newly generated goal dates
            console.log('updated ave from goal', initAve);

            // Update Message manager tab
            guiAve.children[0].value = guiGoal.children[4].value; // Type
            guiAve.children[5].value = guiGoal.children[3].value; // Description
            guiAve.children[6].value = guiAve.children[6].value; // Person /* need to shift to goal */
            let newDate = moment(newDates[i], 'ddd MMM DD YYYY HH:mm:ss')
            guiAve.children[7].value = newDate.format('YYYY-MM-DD'); // Date

            // Update Schedule object on calendar 
            calendar.updateSchedule(aveId, '2', {
              title: guiGoal.children[3].value,
              start: newDate.format('ddd DD MMM YYYY HH:mm:ss'),
              end:  newDate.format('ddd DD MMM YYYY HH:mm:ss')
            });
            ++i;
          }; 
        }; 
      } else { console.log ('until date before start date')};
    };
    console.log('updated goal: ', currentInitiative.goals, 'updated linked aves: ', currentInitiative.avenues);

    // Message Manager ui
    // Sync ui and initiative message objects before saving 
    let messKeys = currentInitiative.messages.keys(); 
    for (id of messKeys) {// Each iteration goes through one message
      let guiMess = document.getElementById(`message${id}`); // Message object from the ui
      let initMess = currentInitiative.messages.get(id); // Message object from the initiative object 
      initMess.title = guiMess.children[1].value; // Update title in initiative object 
    };
    //console.log('updated messages: ', currentInitiative.messages);
    // Sync ui and initiative avenue objects before saving 
    let aveKeys = currentInitiative.avenues.keys(); 
    for (id of aveKeys) {// Each iteration goes through one avenue
      //console.log('avenue id to save', id)
      let initAve = currentInitiative.avenues.get(id); // Avenue object from the initiative object 
      // Only update if the avenue is not connected to a goal otherwise assume it was updated with it's linked goal
      if (initAve.goal_id == '') {
        let guiAve = document.getElementById(`avenue${id}`); // Avenue object from the ui
        initAve.avenue_type = guiAve.children[0].value;
        initAve.sent = guiAve.children[4].children[0].checked;
        initAve.description = guiAve.children[5].value;
        initAve.person = guiAve.children[6].value;
        // Add timezone stamp to date chooser date before storing 
        let rawDate = guiAve.children[7].value;  
        if (moment(rawDate).isValid()){ // Only load date into initiative object if it is a valid date
          let date = moment(rawDate, 'YYYY-MM-DD', true).toString(); // Moment adds time zone stamp

          initAve.change_date(date); // String
        }; 
      };
    };
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
  // Preliminary check to make sure goal dates have not been changed to an invalid pair before saving
  let goalKeys = currentInitiative.goals.keys();
  let validGoal = true; 
  for (goalId of goalKeys) {// Each iteration goes through one goal
    let guiGoal = document.getElementById(`goal${goalId}`); // Goal object from the ui
    let startDate = moment(guiGoal.children[5].children[0].value, 'YYYY-MM-DD', true);
    let untilDate = moment(guiGoal.children[5].children[5].value, 'YYYY-MM-DD', true);

    // Make sure that until date is not before start date
    validGoal = startDate.isSameOrBefore(untilDate);
    // If it is not abort save
    if (validGoal == false){
      guiGoal.children[5].children[0].style.backgroundColor = 'rgb(225, 160, 140)';
      guiGoal.children[5].children[5].style.backgroundColor = 'rgb(225, 160, 140)';
      swal({ title: 'Unable to save!', 
      text: 'Hmmm... It looks like there are some invalid date ranges.\nCheck your goals to make sure they start and end correctly before saving again.', 
      icon: 'warning',
      dangerMode: true, 
      buttons: false });
      return 
    };
    // If everything is okay make sure background is white
    guiGoal.children[5].children[0].style.backgroundColor = 'rgb(245, 245,230)';
    guiGoal.children[5].children[5].style.backgroundColor = 'rgb(245, 245,230)';
  }; 
  // Send alert to let user know that they have saves successfully 
  swal({ title: 'Saved!', icon: 'success', buttons: false });
    let ipcInit = save();
    ipc.send('save', currentInitiativeId, ipcInit);
};

// Handles the event from the open button // Needs transitioned 
document.getElementById('initOpen').addEventListener("click", openFile);
function openFile () {
  let ipcPack = ipc.sendSync('open-file'); // Uses synchronous call to avoid user actions before data is loaded 
  console.log('returned from main', ipcPack);
  currentInitiativeId = ipcPack.initId;
  currentInitiative.unpack_from_ipc(ipcPack.initObj);
  console.log('init id on index load from file: ', currentInitiativeId, 'Unpacked initiative', currentInitiative);

  // Clear old Initative tab ui elements 
  oldMessages = document.getElementById('initName');
  oldMessages.innerHTML = ''; 
  oldMessages = document.getElementById('initDescription');
  oldMessages.innerHTML = ''; 
  oldMessages = document.getElementById('groupIn');
  oldMessages.innerHTML = ''; 
  oldAvenues = document.getElementById('goalIn');
  oldAvenues.innerHTML = '';
  calendar.clear();

  // Clear old Message manager tab ui elements
  oldMessages = document.getElementById('messageIn');
  oldMessages.innerHTML = ''; 
  oldAvenues = document.getElementById('avenueIn');
  oldAvenues.innerHTML = '';

  // Send values to Initiative tab ui
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

    // Display date range on top of calendar
      let start = calendar.getDateRangeStart();
      let end = calendar.getDateRangeEnd();
      document.getElementById('year').value = `${end.getFullYear()}`;
      document.getElementById('month').value = `${start.getMonth() + 1}` + '.' + `${start.getDate()}` + ' - ' + `${end.getMonth() + 1}` + '.' + `${end.getDate()}`;

  // Send values to Message manager tab ui
    // Load messages 
    let messKeys = currentInitiative.messages.keys();
    for ( id of messKeys ){
     addMess('load', id ); // Note: Event is not used programatically but helps with debugging input to addMess
    };

  // Load avenues to both message manager and initiative tab
  aveKeys = currentInitiative.avenues.keys();
  for ( id of aveKeys ){
    //console.log('ave id for mess tab load', id);
    // Check to see if avenue is linked to a message or goal
    let aveObj = currentInitiative.avenues.get(id);
    let messId = aveObj.message_id;
    let goalId = aveObj.goal_id;
    if (goalId != '') { // If linked to goal send special event to addAve function 
      if (messId != '') { // If also linked to message send avenue element on the message manager tab to the linked message dropbox
        addAve('goalUp', id, `aveDrop${messId}`) ;
      } else { // Else just add it to the default container on the message manager tab
        addAve('goalUp', id );
      };
    } else { // If not connected to goal load nomally an check for connected message
      if (messId != '') { // If so send to respective message drop box
        addAve('load', id, `aveDrop${messId}`) ;// Note: event is not used programatically but helps with debugging input to addAve
      } else { // Else just add it to the default container
        addAve('load', id ); 
      };
    };
  };
  // Refresh Initative tab calendar when everthing is finished 
  calendar.render();
};


/* ---- Implement tabs for whole window ---- */
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
    tablinks[i].style.backgroundImage =  'linear-gradient(to right, rgb(108, 108, 108) 0%, rgb(118, 118, 118) 60%, rgb(139, 203, 224) 100%)';
  };

  // Show the specific tab content
  document.getElementById(pageName).style.display = "block";
  
  // Refresh calendar when switching to initiative tab
  if (pageName == 'Initiative') {
    if (calendar != undefined) {
      // Sync ui and initiative avenue objects before switching tabs 
      let aveKeys = currentInitiative.avenues.keys(); 
      for (id of aveKeys) {// Each iteration goes through one avenue
        console.log('avenue id to save', id)
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
          if (initAve.goal_id != '') { // If attached to goal /* this could get taken out at some point */
            // Update Schedule object on calendar 
            calendar.updateSchedule(id, '2', {
              title: guiAve.children[5].value,
              start: date,
              end: date
            });
          } else { // Else if it is a single avenue update it 
            // Update Schedule object on calendar 
            calendar.updateSchedule(id, '1', {
              title: guiAve.children[5].value,
              start: date,
              end: date
            });
          };
        }; 
         
      };
      console.log('updated avenues: ', currentInitiative.avenues);
       
      calendar.render();
    };
  };

  // Add the specific color to the button used to open the tab content
  elmnt.style.backgroundImage =  'linear-gradient(to right, rgb(139, 203, 224) 0%, rgb(118, 118, 118) 60%, rgb(139, 203, 224) 100%)';
};

// Get the element with id="defaultOpen" and click on it to initialize window
document.getElementById("defaultOpen").click();


/* ---- Avenue related functions ---- */
// Adds an Avenue to do the DOM of the Initiative and Message Manager tab 
   // Note: Avenue are added through the unified modal popup called modalAve, or loaded from file on reopen
function addAve (event='', aveId='', location='avenueIn', modalAddSent=false, modalAddType='', modalAddDesc='', modalAddPers='', modalAddDate='') { // If avenue id is passed in it will load it from the initative object. Otherwise it is treated as a new avenue
    // Event is used to change ui options depending on type of add
    // Update current initiative object if this is a new avenue 
    var id; 
    var aveLoad = '';
    var momDate = '';
    if ( aveId == '') {// If message is being added for the first time from the modal popup
      id = currentInitiative.add_avenue(modalAddType, modalAddDesc, modalAddPers, modalAddSent, '', modalAddDate);
      aveLoad = currentInitiative.avenues.get(id); // get newly created avenue to display in ui
      momDate = moment(aveLoad.date, 'ddd MMM DD YYYY HH:mm:ss'); // Adjust to current timezone from saved timezone
      console.log('new avenue added from modal', aveLoad)
      } else { // Else load existing message from initiative object
        id = aveId
        aveLoad = currentInitiative.avenues.get(id);
        momDate = moment(aveLoad.date, 'ddd MMM DD YYYY HH:mm:ss'); // Adjust to current timezone from saved timezone
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
    };
    // If creating an avenue that is being pulled from a file or was added by modal set it's value 
    if(aveLoad != ''){
      dropdown.value = aveLoad.avenue_type;
    };
    // If avenue is connected to a goal disable the type dropdown 
    if (aveLoad.goal_id != '') {
      dropdown.setAttribute("disabled", "true")
    };
    ave.appendChild(dropdown); //add the dropdown menu to the avenue
    
    // Creates title paragraphs 
    let description_title = document.createElement("p");// Title for Description 
    description_title.setAttribute("class", "aveDescription_title");
    description_title.setAttribute("id", "aveDescription_title");
    description_title.innerHTML = "Description";
    ave.appendChild(description_title);//add the title to the avenue
  
    let person_title = document.createElement("p");// Title for Persons responsible 
    person_title.setAttribute("class", "avePersons_title");
    person_title.setAttribute("id", "avePersons_title");
    person_title.innerHTML = "Person";
    ave.appendChild(person_title);//add the title to the avenue
  
    let date_title = document.createElement("p");// Title for Date 
    date_title.setAttribute("class", "aveDate_title");
    date_title.setAttribute("id", "aveDate_title");
    date_title.innerHTML = "Date";
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
    // If creating an avenue that is being pulled from a file or was added by modal set it's value 
    if(aveLoad != '') {
      description.value = aveLoad.description;
      }
    // If avenue is connected to a goal disable the textarea 
    if (aveLoad.goal_id != '') {
      description.setAttribute("readonly", "true")
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
    // If creating an avenue that is being pulled from a file or was added by modal set it's value 
    if(aveLoad != ''){
      date.value = momDate.format('YYYY-MM-DD'); // Format for display in date chooser 
      }
    // If avenue is connected to a goal disable the date input 
    if (aveLoad.goal_id != '') {
      date.setAttribute("readonly", "true")
    }
    ave.appendChild(date);
  
  
    // Adds an Icon to note that avenue is linked with goal 
    let goalIcn = document.createElement("div");
    //goalIcn.setAttribute("class", "goalIcn");
    goalIcn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path class="goalIcn" fill-rule="evenodd" clip-rule="evenodd" d="M18 13V5C18 3.89543 17.1046 3 16 3H4C2.89543 3 2 3.89543 2 5V13C2 14.1046 2.89543 15 4 15H7L10 18L13 15H16C17.1046 15 18 14.1046 18 13ZM5 7C5 6.44772 5.44772 6 6 6H14C14.5523 6 15 6.44772 15 7C15 7.55228 14.5523 8 14 8H6C5.44772 8 5 7.55228 5 7ZM6 10C5.44772 10 5 10.4477 5 11C5 11.5523 5.44772 12 6 12H9C9.55229 12 10 11.5523 10 11C10 10.4477 9.55229 10 9 10H6Z" fill="#4A5568"/> </svg>';
    // If avenue is connected to a goal add special icon  
    if (aveLoad.goal_id != '') {
      ave.appendChild(goalIcn);
    };
    
    // Creates and adds dynamic event listener to delete button
    let deleteBtn = document.createElement("span");
    deleteBtn.setAttribute("class", "aveDelete");
    deleteBtn.setAttribute("id", `aveDelete${id}`);
    deleteBtn.innerHTML = '&times;'; 
    // If avenue is connected to a goal disable the delete button 
    if (aveLoad.goal_id != '') {
      deleteBtn.setAttribute("style", "display: none;");
    }
    deleteBtn.addEventListener("click", function () {deleteAveMess(ave)}); 
    ave.appendChild(deleteBtn);
  
    // Get the container to hold the avenue and append it 
      // Note: default location is the avenueIn container
    //console.log("avenue", ave);
    document.getElementById(location).appendChild(ave);

    // Set calendar display based on type of add
    let calId;
    if (event == 'goalGen' || event == 'goalUp') { // Set linked to goal
      calId = '2';
    } else { // Set as Single avenue 
      calId = '1';
    };

    // Add avenue to calendar 
    // Fill calendar schedule object with avenue info
    let schedule = {
      id: id,
      calendarId: calId,
      title: aveLoad.description,
      category: 'time',
      start: momDate.format('ddd DD MMM YYYY HH:mm:ss'),
      end:  momDate.format('ddd DD MMM YYYY HH:mm:ss')
    };
    console.log('schedule', schedule);
    // Add to calendar and render 
    calendar.createSchedules([schedule]);
};
  
// Deletes an avenue from the Delete button on the Message Manager tab
function deleteAveMess (ave) {
    // Confirm that user wants to delete avenue if not return
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
          // Remove avenue from UI
          ave.parentElement.removeChild(ave);
          // Delete Schedule object on calendar 
          let id = ave.id.replace('avenue', ''); // remove ui tag off of id
          calendar.deleteSchedule(id, '1');
          console.log('avenue id after remove', id);
          // Remove avenue from Initiative object 
          currentInitiative.avenues.delete(id); // Take only the number off of the end of the ui id 
          // Send updates to main
          let ipcInit = currentInitiative.pack_for_ipc();
          ipc.send('save', currentInitiativeId, ipcInit);
          return
          }; 
      });
};

  /* -- Unified modal popup to add Avenues across tabs -- */
  // Get the modal and button that opens it from message manager tab
      // Note: on the initaitive tab the modal is opened via the beforeCreateSchedule event
  var aveModal = document.getElementById("aveModal");
  document.getElementById("addAve").addEventListener("click", function () { avePopLaunch('avenAdd', 'aven') });
  
  // Launch the modal with basic settings. Can take in a date from calendar event to display on creation
  function avePopLaunch(calEvent='', launchType='') {
    // Set dropdown options from list held in the initiative object 
    let dropdown = document.getElementById('aveDropModal');
    let options = currentInitiative.avenue_types;
    for (i in options){
      let opElem = document.createElement("option");
      let opText = currentInitiative.avenue_types[i]
      opElem.setAttribute("value", `${opText}`);
      opElem.innerHTML = `${opText}`;
      dropdown.appendChild(opElem);
      }
    // If created from clicking on calendar set the date of day clicked 
    if (calEvent.triggerEventName == 'mouseup'){
      let calDate = calEvent.start;
      //console.log('calendar event', calDate.toDate());
      let momDate = moment(calDate.toDate(), 'ddd MMM DD YYYY HH:mm:ss'); // Turn date into moment object to format for date picker display
      //console.log('moment date', momDate)
      document.getElementById('aveDateModal').value = momDate.format('YYYY-MM-DD');
    };
    // If creating from click on message manager tab hide the delete button
    if ( launchType == 'aven' || launchType == 'calCreate' ){
      document.getElementById('aveDeleteModal').style.display = "none";
      document.getElementById('aveDeleteModal').style.position = "fixed";
    }; 
    // Display modal 
    aveModal.style.display = "block";
  };
  
  // Get the save button from modal 
  document.getElementById('aveSaveModal').addEventListener("click", aveModalSave );
  
  // Save contents from the modal. Then update Initiative object, Message Manager tab and Initiative tab
  function aveModalSave (){
    let sent = document.getElementById('aveSentModal');
    let type = document.getElementById('aveDropModal');
    let date = document.getElementById('aveDateModal');
    let description = document.getElementById('aveDescModal');
    let person = document.getElementById('avePersModal');
    let aveId = document.getElementById('aveIdModal');
    console.log('sent', sent.checked, '\ntype', type.value, '\ndate', date.value, '\ndescription', description.value, '\nperson', person.value, '\naveId', aveId.value);
    // Make sure date and description are filled out 
    if (date.value != '' && description.value != ''){
      // Turn date into moment object to format for adding or updating avenue in initiative object and ui
      let momDate = moment(date.value, 'YYYY-MM-DD', true); 
      // If no id provided assume this is a new avenue
      if (aveId.value == '' || aveId.value == undefined ){
        // Add avenue to initiative object, initative tab and message manager tab. 
        addAve('modalAdd', '', 'avenueIn', sent.checked, type.value, description.value, person.value, momDate.toString()); // use Moment date format
         // Save everything to main
         let ipcInit = currentInitiative.pack_for_ipc();
         ipc.send('save', currentInitiativeId, ipcInit);
      } else if ( parseInt(aveId.value) >= 0 ) {
        // Update Initiative object 
        let initAve = currentInitiative.avenues.get(aveId.value); // Avenue object from the initiative object
        initAve.avenue_type = type.value;
        initAve.sent = sent.checked;
        initAve.description = description.value;
        initAve.person = person.value;
        initAve.change_date(momDate.toString());
        // Update Message manager tab
        let guiAve = document.getElementById(`avenue${aveId.value}`); // Avenue object from the ui
      
        guiAve.children[0].value = type.value; // Type
        guiAve.children[4].children[0].checked = sent.checked; // Sent
        guiAve.children[5].value = description.value; // Description
        guiAve.children[6].value = person.value; // Person
        guiAve.children[7].value = momDate.format('YYYY-MM-DD');
        // Update Schedule object on calendar 
        calendar.updateSchedule(aveId.value, '1', {
          title: description.value,
          start: momDate.format('ddd DD MMM YYYY HH:mm:ss'),
          end:  momDate.format('ddd DD MMM YYYY HH:mm:ss')
        });
        // Save everything to main
        let ipcInit = currentInitiative.pack_for_ipc();
        ipc.send('save', currentInitiativeId, ipcInit);
      };
      // Close modal
      aveModal.style.display = "none";
      // Reset modal
      sent.checked = false;
      let i, L= type.options.length - 1;
      for(i = L; i >= 0; i--) {
        type.remove(i);
      };
      date.value = ''; 
      description.value = '';
      person.value = '';
      aveId.value = '';
      // Reset backgroup of date and description incase they had been changed on unfilled attempt to save
      date.style.backgroundColor = 'rgb(245, 245,230)';
      description.style.backgroundColor = 'rgb(245, 245,230)';
      // Reset modal if it was opened from an avenue connected with a goal 
      type.disabled = false;
      description.readOnly = false;
      date.readOnly = false;
      document.getElementById('aveDeleteModal').style.display = "block";
      document.getElementById('aveDeleteModal').style.position = "initial";
    } else { // Change backgroup of date or description if not filled out 
        if (date.value == ''){
          date.style.backgroundColor = 'rgb(225, 160, 140)';
        };
        if (description.value == ''){
          description.style.backgroundColor = 'rgb(225, 160, 140)';
        };
      };
  };

  // Get the save button from modal 
  document.getElementById('aveDeleteModal').addEventListener("click", aveModalDelete );
  
  // Delete contents from the modal. Then update Initiative object, Message Manager tab and Initiative tab
  function aveModalDelete (){
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
        // Get id from DOM
        let aveId = document.getElementById('aveIdModal');
        // Remove avenue from message manager UI
        let messAve = document.getElementById(`avenue${aveId.value}`);
        messAve.parentElement.removeChild(messAve);
        // Delete Schedule object on calendar 
        calendar.deleteSchedule(aveId.value, '1');
        // Remove avenue from Initiative object 
        let id = aveId.value;
        currentInitiative.avenues.delete(id); // Take only the number off of the end of the ui id
        // Send updates to main
        let ipcInit = currentInitiative.pack_for_ipc();
        ipc.send('save', currentInitiativeId, ipcInit);
          
        // Close modal
        aveModal.style.display = "none";
        // Reset modal
        aveId.value = '';
        document.getElementById('aveSentModal').checked = false; // Sent
        let types = document.getElementById('aveDropModal'); // Type
        let i, L= types.options.length - 1;
        for(i = L; i >= 0; i--) {
          types.remove(i);
        };
        document.getElementById('avePersModal').value = ''; // Person
        document.getElementById('aveDateModal').value = ''; // Date Value
        document.getElementById('aveDescModal').value = ''; // Description Value
        // Reset backgroup of date and description incase they had been changed on unfilled attempt to save
        document.getElementById('aveDateModal').style.backgroundColor = 'rgb(245, 245,230)'; // Date Style
        document.getElementById('aveDescModal').style.backgroundColor = 'rgb(245, 245,230)'; // Description Style
        return
      }; 
    });
  };
  
  // Get the <span> element that closes the modal and attach listener
  document.getElementsByClassName("close")[1].addEventListener("click", function() {
    aveModal.style.display = "none";
    // Refresh calendar 
    calendar.render();
    // Reset modal
    let sent = document.getElementById('aveSentModal');
    let type = document.getElementById('aveDropModal');
    let date = document.getElementById('aveDateModal');
    let description = document.getElementById('aveDescModal');
    let person = document.getElementById('avePersModal');
    let aveId = document.getElementById('aveIdModal');
    sent.checked = false;
    let i, L= type.options.length - 1;
    for(i = L; i >= 0; i--) {
      type.remove(i);
    };
    date.value = ''; 
    description.value = '';
    person.value = '';
    aveId.value = '';
    // Reset backgroup of date and description incase they had been changed on unfilled attempt to save
    date.style.backgroundColor = 'rgb(245, 245,230)';
    description.style.backgroundColor = 'rgb(245, 245,230)';
    // Reset modal if it was opened from an avenue connected with a goal 
    type.disabled = false;
    description.readOnly = false;
    date.readOnly = false;
    document.getElementById('aveDeleteModal').style.display = "block";
    document.getElementById('aveDeleteModal').style.position = "initial";
  });
  
  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener('click', function(event) {
    if (event.target == aveModal) {
      aveModal.style.display = "none";
      // Refresh calendar 
      calendar.render();
      // Reset modal
      let sent = document.getElementById('aveSentModal');
      let type = document.getElementById('aveDropModal');
      let date = document.getElementById('aveDateModal');
      let description = document.getElementById('aveDescModal');
      let person = document.getElementById('avePersModal');
      let aveId = document.getElementById('aveIdModal');
      sent.checked = false;
      let i, L= type.options.length - 1;
      for(i = L; i >= 0; i--) {
        type.remove(i);
      };
      date.value = ''; 
      description.value = '';
      person.value = '';
      aveId.value = '';
      // Reset backgroup of date and description incase they had been changed on unfilled attempt to save
      date.style.backgroundColor = 'rgb(245, 245,230)';
      description.style.backgroundColor = 'rgb(245, 245,230)';
      // Reset modal if it was opened from an avenue connected with a goal 
      type.disabled = false;
      description.readOnly = false;
      date.readOnly = false;
      document.getElementById('aveDeleteModal').style.display = "block";
      document.getElementById('aveDeleteModal').style.position = "initial";
    };
  });  


  /* ---- Message related functions ---- */
// Adds a message to do the DOM of Message Manager tab 
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
  title_heading.innerHTML = "Title";
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
    let editBtn = document.createElement("svg");
    btnArray.appendChild(editBtn);
    editBtn.outerHTML = `<svg class="messEdit" id="messEdit${id}" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> <path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z"/></svg>`;
    btnArray.children[0].addEventListener("click", function () {editMess(mess)});

    // Creates and adds dynamic event listener to copy button
    let copyBtn = document.createElement("svg");
    btnArray.appendChild(copyBtn);
    copyBtn.outerHTML = `<svg class="messCopy" id="messCopy${id}" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> <path d="M8 2C7.44772 2 7 2.44772 7 3C7 3.55228 7.44772 4 8 4H10C10.5523 4 11 3.55228 11 3C11 2.44772 10.5523 2 10 2H8Z"/> <path d="M3 5C3 3.89543 3.89543 3 5 3C5 4.65685 6.34315 6 8 6H10C11.6569 6 13 4.65685 13 3C14.1046 3 15 3.89543 15 5V11H10.4142L11.7071 9.70711C12.0976 9.31658 12.0976 8.68342 11.7071 8.29289C11.3166 7.90237 10.6834 7.90237 10.2929 8.29289L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071L10.2929 15.7071C10.6834 16.0976 11.3166 16.0976 11.7071 15.7071C12.0976 15.3166 12.0976 14.6834 11.7071 14.2929L10.4142 13H15V16C15 17.1046 14.1046 18 13 18H5C3.89543 18 3 17.1046 3 16V5Z"/> <path d="M15 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H15V11Z"/> </svg>`;
    btnArray.children[1].addEventListener("click", function () {copyMess(mess)});
     
    // Creates and adds dynamic event listener to delete button
    let deleteBtn = document.createElement("span");
    deleteBtn.setAttribute("class", "messDelete");
    deleteBtn.setAttribute("id", `messDelete${id}`);
    deleteBtn.innerHTML = '&times;';
    deleteBtn.addEventListener("click", function () {deleteMess(mess)}) ;
    btnArray.appendChild(deleteBtn);

  mess.appendChild(btnArray)

  // Get the main div that holds all the avenues and append the new one
  //console.log("message", mess);
  document.getElementById("messageIn").appendChild(mess);
};

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
          let aveId = aves[0].id.replace('avenue', ''); // remove ui tag from id
          let messId = mess.id.replace('message', '');
          currentInitiative.unlink_ids(aveId, messId);
          //console.log('unlinked avenue: ', currentInitiative.avenues.get(aveId), 'unlinked message: ', currentInitiative.messages.get(messId));
          document.getElementById("avenueIn").appendChild(aves[0]);
          };
        };
  
      // Remove message from UI
      mess.parentElement.removeChild(mess);
      // Remove message from Initiative object 
      let id = mess.id.replace('message', ''); // remove ui tag from id 
      currentInitiative.messages.delete(id); 
      // Send updates to main
      let ipcInit = currentInitiative.pack_for_ipc();
      ipc.send('save', currentInitiativeId, ipcInit);  
      };
    });
};

// Call back function from editor 
function editMess (mess) {
  let messId = mess.id.replace('message', ''); // remove ui tag from id  
  // Update Initiative from ui 
  let uiTitle = document.getElementById(`messTitle${messId}`);
  let messContent = currentInitiative.messages.get(`${messId}`); // get message object content
  messContent.change_title(uiTitle.value);
  //console.log('updated initiative: ', currentInitiative.messages)
  //console.log('init id on ipc to launch editor: ', currentInitiativeId, 'mess id: ', messId, 'message sent to main: ', messContent);
  // Send it all to main to be pinged to the editor
  ipc.send('edit', currentInitiativeId, messId, messContent); 
};

// Copy contents of message from initiative object to clipboard 
function copyMess (mess) {
  let messId = mess.id.replace('message', ''); // remove ui tag from id  
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


/* ---- Goal related functions ---- */
// Adds a Goal to do DOM of Initiative tab 

function addGoal (event='', goalId='', start='', freq='', denomination='', until='', type='', reminder='', description='') {
  // If Goal id is passed in it will load it from the initative object. Otherwise it is treated as a new Goal
  // Update the current initiative object if this is a new Goal 
  var id; 
  var goalLoad = '';
  if ( goalId == '') { // If goal is being added for the first time 
    id = currentInitiative.add_goal([ start, freq, denomination, until ], type, reminder, '', description);
    goalLoad = currentInitiative.goals.get(id);
    } else { // Else load existing goal from initiative object 
      id = goalId
      goalLoad = currentInitiative.goals.get(id);
    }

  console.log('goalload', goalLoad)
  //creates main div to hold an individual Goal
  let goal = document.createElement("div");
  goal.setAttribute("class", "goal");
  goal.setAttribute("id", `goal${id}`);
  
  // Creates title paragraphs 
  let freq_heading = document.createElement("p");// Title for Goal Frequency  
  freq_heading.setAttribute("class", "goal_title");
  freq_heading.setAttribute("id", "goalFreq_title");
  freq_heading.innerHTML = "Frequency";
  goal.appendChild(freq_heading);// Add the title to the goal
 
  let Desc_title = document.createElement("p");// Title for Goal Type 
  Desc_title.setAttribute("class", "goal_title");
  Desc_title.setAttribute("id", "goalDesc_title");
  Desc_title.innerHTML = "Description";
  goal.appendChild(Desc_title);// Add the title to the goal

  let reminder_title = document.createElement("p");// Title for Goal Reminder 
  reminder_title.setAttribute("class", "goal_title");
  reminder_title.setAttribute("id", "goalReminder_title");
  reminder_title.innerHTML = "Reminder";
  goal.appendChild(reminder_title);// Add the title to the goal
  
  // Textarea for Goal Description
  let goalDesc = document.createElement("textarea");
  goalDesc.setAttribute("class", "goalDescription");
  goalDesc.setAttribute("id", `goalDesc${id}`);
  if(goalLoad != ''){// if creating an goal that is being pulled from a file set it's value 
    goalDesc.value = goalLoad.description;
  };
  goal.appendChild(goalDesc);

  // Create goal type drop down list 
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

  // Div to hold goal frequency options 
  let freqDiv = document.createElement("div");
  freqDiv.setAttribute("class", "frequency");
  freqDiv.setAttribute("id", `frequency${id}`);

    // Create date start input for frequency 
    let startDate = document.createElement("input");
    startDate.setAttribute("class", "startDate")
    startDate.setAttribute("id", `startDate${id}`)
    startDate.setAttribute("type", "date");
    if(goalLoad != ''){// if creating a goal that is being pulled from a file set it's value   
      let momDate = moment(goalLoad.frequency[0], 'ddd MMM DD YYYY HH:mm:ss'); // Adjust to current timezone from saved timezone
      startDate.value = momDate.format('YYYY-MM-DD');
    };
    freqDiv.appendChild(startDate); //add the date until input to the div

    // Create filler title for readablity  
    let everyTitle = document.createElement("p");
    everyTitle.setAttribute("class", "everyTitle");
    everyTitle.innerHTML = "Every";
    freqDiv.appendChild(everyTitle); //add the paragraph to the div

    // Create number input for frequency 
    let freqNum = document.createElement("input");
    freqNum.setAttribute("class", "freqNum")
    freqNum.setAttribute("id", `freqNum${id}`)
    freqNum.setAttribute("type", "number");
    freqNum.setAttribute("value", "1");
    freqNum.setAttribute("min", "1");
    freqNum.setAttribute("max", "30");
    if(goalLoad != ''){// if creating a goal that is being pulled from a file set it's value   
      console.log(goalLoad.frequency)
      freqNum.value = goalLoad.frequency[1];
    };
    freqDiv.appendChild(freqNum); //add the num input to the div

    // Create frequency denomination drop down list 
    let freqDropdown = document.createElement("select");
    freqDropdown.setAttribute("class", "freqDropdown");
    freqDropdown.setAttribute("id", `freq_type${id}`);

    // Set frequency denomination dropdown options  
    let freqOptions = ['days', 'weeks', 'months', 'years'];
    for (i in freqOptions){
      let freqOpElem = document.createElement("option");
      let freqOpText = freqOptions[i]
      freqOpElem.setAttribute("value", `${freqOpText}`);
      freqOpElem.innerHTML = `${freqOpText}`;
      freqDropdown.appendChild(freqOpElem);
    };
    if(goalLoad != ''){// if creating a goal that is being pulled from a file set it's value   
      freqDropdown.value = goalLoad.frequency[2];
    };
    freqDiv.appendChild(freqDropdown); //add the dropdown to the div

     // Create filler title for readablity  
     let untilTitle = document.createElement("p");
     untilTitle.setAttribute("class", "untilTitle");
     untilTitle.innerHTML = "Until";
     freqDiv.appendChild(untilTitle); //add the paragraph to the div

    // Create date until input for frequency 
    let untilDate = document.createElement("input");
    untilDate.setAttribute("class", "freqDate")
    untilDate.setAttribute("id", `freqDate${id}`)
    untilDate.setAttribute("type", "date");
    if(goalLoad != ''){// if creating a goal that is being pulled from a file set it's value   
      let momDate = moment(goalLoad.frequency[3], 'ddd MMM DD YYYY HH:mm:ss'); // Adjust to current timezone from saved timezone
      untilDate.value = momDate.format('YYYY-MM-DD');
    };
    freqDiv.appendChild(untilDate); //add the date until input to the div

    goal.appendChild(freqDiv); //add the freqDiv to the goal

  // Textarea for reminder /* place holder for now */
  let remi = document.createElement("textarea");
  remi.setAttribute("class", "reminder");
  remi.setAttribute("id", `reminder${id}`);
  if(goalLoad != ''){// if creating an goal that is being pulled from a file set it's value 
    remi.value = goalLoad.reminder;
  };
  goal.appendChild(remi);

  
  // Creates and adds dynamic event listener to delete button
  let deleteBtn = document.createElement("span");
  deleteBtn.setAttribute("class", "goalDelete");
  deleteBtn.setAttribute("id", `goalDelete${id}`);
  deleteBtn.innerHTML = '&times;';
  deleteBtn.addEventListener("click", function () {deleteGoal(goal)}) ;

  goal.appendChild(deleteBtn);

  // Get the main div that holds all the goals and append the new one
  console.log("goal", goal);
  document.getElementById("goalIn").appendChild(goal);
  // Return goal's id for capture if needed 
  return id;
};

// Deletes a goal from the DOM
function deleteGoal (goal) {
  // Confirm that user wants to delete Goal. If not return
  swal({
    title: 'Deleting Goal',
    text: 'Are you sure you want to delete your Goal?\n\nAll attached Avenues will be deleted as well.', 
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
      let id = goal.id.replace('goal', ''); // remove ui tag from id

      // Remove all linked avenues from ui and initiative object 
      let initGoal = currentInitiative.goals.get(id);
      for (aveId of initGoal.linked_aves) {
        // Remove avenue from message manager tab UI
        let ave = document.getElementById(`avenue${aveId}`);
        ave.parentElement.removeChild(ave);
        // Remove Schedule object on calendar 
        calendar.deleteSchedule(aveId, '2');
        console.log('avenue id after ui remove', aveId);
        // Remove avenue from Initiative object 
        currentInitiative.avenues.delete(aveId);
      };
      //console.log("goal object in delete:", id)
      currentInitiative.goals.delete(id); 
      // Send updates to main
      let ipcInit = currentInitiative.pack_for_ipc();
      ipc.send('save', currentInitiativeId, ipcInit);  
      };
    });
};

/* -- Unified modal popup to add Goals -- */
  // Get the modal and button that opens it from initiative tab
    document.getElementById("addGoal").addEventListener("click", goalPopLaunch);
      // Launch the modal with basic settings. Can take in a date from calendar event to display on creation
      function goalPopLaunch() {
        // Set dropdown options from type of goal  // Note: list held in the initiative object 
        let goalType = document.getElementById('goalTypeModal');
        let options = currentInitiative.avenue_types;
        for (i in options){
          let opElem = document.createElement("option");
          let opText = currentInitiative.avenue_types[i]
          opElem.setAttribute("value", `${opText}`);
          opElem.innerHTML = `${opText}`;
          goalType.appendChild(opElem);
        };
        // Set inital value of frequency
        document.getElementById('goalFreqModal').value = '1';
        // Set dropdown options from list held in the initiative object 
        let goalDeno = document.getElementById('goalDenoModal');
        let freqOptions = ['days', 'weeks', 'months', 'years'];
        for (i in freqOptions){
          let opElem = document.createElement("option");
          let opText = freqOptions[i]
          opElem.setAttribute("value", `${opText}`);
          opElem.innerHTML = `${opText}`;
          goalDeno.appendChild(opElem);
        };
        // Display modal 
        goalModal.style.display = "block";
      };
      
      // Get the save button from modal 
      document.getElementById('goalSaveModal').addEventListener("click", goalModalSave );
      
      // Save contents from the modal. Then update Initiative object, Message Manager tab and Initiative tab
      function goalModalSave (){
        let description = document.getElementById('goalDescModal');
        let start = document.getElementById('goalStartModal'); 
        let freqNum = document.getElementById('goalFreqModal');
        let denomination = document.getElementById('goalDenoModal');
        let until = document.getElementById('goalUntilModal'); 
        let type = document.getElementById('goalTypeModal');
        let reminder = document.getElementById('goalRemiModal');
        
        console.log( 'description', description.value, '\nstart', start.value, '\ntype', type.value, '\nfreqNum', freqNum.value, '\ndenomination', denomination.value, '\nuntil', until.value, '\nreminder', reminder.value);
        // Make sure date until is filled out  
        if ( description.value != '' && start.value != '' && until.value != '' ){
          // Turn date until into moment object to format for adding or updating avenue in initiative object and ui
          let startDate = moment(start.value, 'YYYY-MM-DD', true); 
          let untilDate = moment(until.value, 'YYYY-MM-DD', true); 
          // Make sure that until date is not before start date
          if ( startDate.isSameOrBefore(untilDate) ) {
            // Add goal to initiative object and initative tab. 
            let goalId = addGoal('modalAdd', '', startDate.toString(), freqNum.value, denomination.value, untilDate.toString(), type.value, reminder.value, description.value); // use Moment date format
          
            // Generate linked avenues in initiative object
            currentInitiative.goal_generate_aves(goalId);
            // Load avenues to both message manager and initiative tab
            let goal = currentInitiative.goals.get(goalId);
            for ( id of goal.linked_aves ){
              console.log('ave id for ave ui load on goal generation', id);
              addAve('goalGen', id ); // Event is used to change ui options depending on type of add
            };

            // Save everything to main
            let ipcInit = currentInitiative.pack_for_ipc();
            ipc.send('save', currentInitiativeId, ipcInit);
            // Close modal
            goalModal.style.display = "none";
            // Reset modal
            description.value = '';
            freqNum.value = 1;
            let i, L= denomination.options.length - 1;
            for(i = L; i >= 0; i--) {
              denomination.remove(i);
            };
            start.value = '';
            until.value = '';
            i = 0;
            L = type.options.length - 1;
            for(i = L; i >= 0; i--) {
              type.remove(i);
            };
            reminder.value = '';
            // Reset backgroup of date until incase they had been changed on unfilled attempt to save
            description.style.backgroundColor = 'rgb(245, 245,230)';
            start.style.backgroundColor = 'rgb(245, 245,230)';
            until.style.backgroundColor = 'rgb(245, 245,230)';
          } else { // If date until is before start date change backgrounds
            until.style.backgroundColor = 'rgb(225, 160, 140)';
            start.style.backgroundColor = 'rgb(225, 160, 140)';
          };
        } else { // Change backgroup of date or description if not filled out 
            if (description.value == ''){
              description.style.backgroundColor = 'rgb(225, 160, 140)';
            };
            if (until.value == ''){
              until.style.backgroundColor = 'rgb(225, 160, 140)';
            };
            if (start.value == ''){
              start.style.backgroundColor = 'rgb(225, 160, 140)';
            };
          };
      };
      
      // Get the <span> element that closes the modal and attach listener
      document.getElementsByClassName("close")[0].addEventListener("click", function() {
        goalModal.style.display = "none";
        // Refresh calendar 
        calendar.render();
        // Reset modal
        let description = document.getElementById('goalDescModal');
        let start = document.getElementById('goalStartModal'); 
        let freqNum = document.getElementById('goalFreqModal');
        let denomination = document.getElementById('goalDenoModal');
        let until = document.getElementById('goalUntilModal'); 
        let type = document.getElementById('goalTypeModal');
        let reminder = document.getElementById('goalRemiModal');
        description.value = '';
        freqNum.value = 1;
        let i, L= denomination.options.length - 1;
        for(i = L; i >= 0; i--) {
          denomination.remove(i);
        };
        start.value = '';
        until.value = '';
        i = 0;
        L= type.options.length - 1;
        for(i = L; i >= 0; i--) {
          type.remove(i);
        };
        reminder.value = '';
        // Reset backgroup of date until incase they had been changed on unfilled attempt to save
        description.style.backgroundColor = 'rgb(245, 245,230)';
        start.style.backgroundColor = 'rgb(245, 245,230)';
        until.style.backgroundColor = 'rgb(245, 245,230)';
      });
      
      // When the user clicks anywhere outside of the modal, close it
      window.addEventListener('click', function(event) {
        if (event.target == goalModal) {
          goalModal.style.display = "none";
          // Refresh calendar 
          calendar.render();
          // Reset modal
          let description = document.getElementById('goalDescModal');
          let start = document.getElementById('goalStartModal'); 
          let freqNum = document.getElementById('goalFreqModal');
          let denomination = document.getElementById('goalDenoModal');
          let until = document.getElementById('goalUntilModal'); 
          let type = document.getElementById('goalTypeModal');
          let reminder = document.getElementById('goalRemiModal');
          description.value = '';
          freqNum.value = 1;
          let i, L= denomination.options.length - 1;
          for(i = L; i >= 0; i--) {
            denomination.remove(i);
          };
          start.value = '';
          until.value = '';
          i = 0;
          L= type.options.length - 1;
          for(i = L; i >= 0; i--) {
            type.remove(i);
          };
          reminder.value = '';
          // Reset backgroup of date until incase they had been changed on unfilled attempt to save
          description.style.backgroundColor = 'rgb(245, 245,230)';
          start.style.backgroundColor = 'rgb(245, 245,230)';
          until.style.backgroundColor = 'rgb(245, 245,230)';
        };
      });  
    

/* ---- Group related functions ---- */
// Adds a group to do DOM of Initiative tab 
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
  name_title.innerHTML = "Name";
  group.appendChild(name_title);// Add the title to the group

  let contacts_title = document.createElement("p");// Title for Group 
  contacts_title.setAttribute("class", "group_title");
  contacts_title.setAttribute("id", "groupContacts_title");
  contacts_title.innerHTML = "Contacts";
  group.appendChild(contacts_title);// Add the title to the group
  
  // Div to hold all buttons
  let btnArray = document.createElement("div");
  btnArray.setAttribute("class", "grpBtnArray");
  btnArray.setAttribute("id", `grpBtnArray${id}`);

    // Button to add a new contact 
    let addContactBtn = document.createElement("span");
    addContactBtn.setAttribute("class", "addContact");
    addContactBtn.setAttribute("id", `addContact${id}`);
    addContactBtn.innerHTML = '&plus;';
    addContactBtn.addEventListener("click", function () {addContact('Add', id)});
    btnArray.appendChild(addContactBtn);// Add the button to the array

    // Button to copy all group emails 
    let emailBtn = document.createElement("svg");
    btnArray.appendChild(emailBtn);// Add the button to the array
    emailBtn.outerHTML = `<svg class="copyEmails" id="copyEmails${id}" width="20" height="20" viewBox="0 0 20 20" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M2.00333 5.88355L9.99995 9.88186L17.9967 5.8835C17.9363 4.83315 17.0655 4 16 4H4C2.93452 4 2.06363 4.83318 2.00333 5.88355Z"/><path d="M18 8.1179L9.99995 12.1179L2 8.11796V14C2 15.1046 2.89543 16 4 16H16C17.1046 16 18 15.1046 18 14V8.1179Z"/></svg>`
    btnArray.children[1].addEventListener("click", function () {copyEmails('copy', id)});
  
    // Button to copy all group phone numbers 
    let phoneBtn = document.createElement("svg");
    btnArray.appendChild(phoneBtn);// Add the button to the array
    phoneBtn.outerHTML = `<svg class="copyPhones" id="copyPhones${id}" width="20" height="20" viewBox="0 0 20 20" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M2 3C2 2.44772 2.44772 2 3 2H5.15287C5.64171 2 6.0589 2.35341 6.13927 2.8356L6.87858 7.27147C6.95075 7.70451 6.73206 8.13397 6.3394 8.3303L4.79126 9.10437C5.90756 11.8783 8.12168 14.0924 10.8956 15.2087L11.6697 13.6606C11.866 13.2679 12.2955 13.0492 12.7285 13.1214L17.1644 13.8607C17.6466 13.9411 18 14.3583 18 14.8471V17C18 17.5523 17.5523 18 17 18H15C7.8203 18 2 12.1797 2 5V3Z"/></svg>`
    btnArray.children[2].addEventListener("click", function () {copyPhones('copy', id)});
  

    // Creates and adds dynamic event listener to delete button
    let deleteBtn = document.createElement("span");
    deleteBtn.setAttribute("class", "groupDelete");
    deleteBtn.setAttribute("id", `groupDelete${id}`);
    deleteBtn.innerHTML = '&times;';
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
      let id = group.id.replace('group', ''); // remove ui tag from id 
      //console.log("group object in delete:", id)
      currentInitiative.groups.delete(id); 
      // Send updates to main
      let ipcInit = currentInitiative.pack_for_ipc();
      ipc.send('save', currentInitiativeId, ipcInit);  
      };
    });
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
  for (contId of contactsKeys) {// Each iteration goes through one contact
    let guiContact = document.getElementById(`contact${contId}`); // Contact object from the ui
    //console.log('gui contact: ', guiContact, 'object', initGroup.contacts);
    let name = guiContact.children[3].value;
    let email = guiContact.children[4].value;
    let phone = guiContact.children[5].value;
    
    initGroup.contacts.set(contId, [name, phone, email]);
    if (email != '') { // If email field is not blank add to string
      emails += '\n' + email.trim(); // remove any whitespace and then add back one new line
      //console.log('emails: ', emails);
    };
  };
  
  //console.log('updated group: ', currentInitiative.groups);
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
  for (contId of contactsKeys) {// Each iteration goes through one contact
    let guiContact = document.getElementById(`contact${contId}`); // Contact object from the ui
    //console.log('gui contact: ', guiContact, 'object', initGroup.contacts);
    let name = guiContact.children[3].value;
    let email = guiContact.children[4].value;
    let phone = guiContact.children[5].value;
    
    initGroup.contacts.set(contId, [name, phone, email]);
    if (phone != '') { // If phone number field is not blank add to string
      phones += '\n' + phone.trim(); // remove any whitespace and then add back one new line
      //console.log('phones: ', phones);
    };
  };
  
  //console.log('updated group: ', currentInitiative.groups);
  clipboard.writeText(phones);
};


/* ---- Contact realted functions ---- */
// Adds contact withing group on Initiative tab 
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
  name_title.innerHTML = "Name";
  contactUi.appendChild(name_title);// Add the title to the group

  let email_title = document.createElement("p");// Title for Group 
  email_title.setAttribute("class", "cont_title");
  email_title.setAttribute("id", "contactEmail_title");
  email_title.innerHTML = "Email";
  contactUi.appendChild(email_title);// Add the title to the group

let phone_title = document.createElement("p");// Title for Group 
  phone_title.setAttribute("class", "cont_title");
  phone_title.setAttribute("id", "contactPhone_title");
  phone_title.innerHTML = "Phone";
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
  let deleteBtn = document.createElement("span");
  deleteBtn.setAttribute("class", "contactDelete");
  deleteBtn.setAttribute("id", `contactDelete${id}`);
  deleteBtn.innerHTML = '&times;';
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
      let contId = contactUi.id.replace('contact', ''); // remove ui tag from id 
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


/* ---- Message Manager Tab specific functions ---- */
// Initalize dragula containers for drag and drop of avenues 
var dragDrop = dragula([document.getElementById('avenueIn')]);// aveDrops are added dynamically when message is generated 
//console.log('drag and drop:', dragDrop);

// Link message and avenue if avenue is dropped into aveDrop
  // Else Unlink if avenue is dropped into avenueIn
dragDrop.on('drop', function (ave, target, source) {
  let type = target.getAttribute('class'); // determine where avenue was dropped by target class
  if (type == 'aveDrop') {
    let aveId = ave.id.replace('avenue', ''); // remove ui tag from id
    let messId = target.id.replace('aveDrop', ''); 
    let oldMessId = source.id.replace('aveDrop', '');
    //console.log('aveid', aveId, 'messid', messId, 'oldMessid', oldMessId)
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
      let aveId = ave.id.replace('avenue', ''); // remove ui tag from id 
      let messId = source.id.replace('aveDrop', '');
      currentInitiative.unlink_ids(aveId, messId);
      //console.log('unlinked ave: ', currentInitiative.avenues.get(aveId), 'unlinked mess: ', currentInitiative.messages.get(messId));
      }
});

// Sort Avenues in avenueIn according to date
let sortDate = document.getElementById('sortDate');
sortDate.addEventListener("toggle", function () {
  if (sortDate.open){
    sortByDate();
  } else {
    console.log('not sorting')
  };
});

function sortByDate () {
  // Get all of the avenues in the avenueIn to sort 
  let aves = document.getElementById('avenueIn').children;
  let sortedAves = [...aves];
  for (let i=0; i < aves.length; i++){
    console.log('ave to sort', aves[i].children[7].value)
  };
  sortedAves.sort(function(a, b) {
    let aDate = moment(a.children[7].value, 'YYYY-MM-DD', true);
    let bDate = moment(b.children[7].value, 'YYYY-MM-DD', true);
    if ( aDate.isBefore(bDate) ){
      return -1;
    } else {
      return 1;
    };
  });
  // Clear avenueIn
  let aveIn = document.getElementById('avenueIn');
  aveIn.innerHTML = '';
  // Add avenues to dom in new order 
  sortedAves.forEach( function ( ave ) {
    aveIn.appendChild(ave);
  });
};

/* ---- Initiative Tab specific functions ---- */
const themeConfig = {
  'common.backgroundColor': 'rgb(245, 245, 230)',
  };

// Calendar object for initiative tab
var calendar = new Calendar('#calendar', {
  defaultView: 'month',
  theme: themeConfig,
  taskView: true,    // Can be also ['milestone', 'task']
  scheduleView: true,  // Can be also ['allday', 'time']
  useCreationPopup: false,
  useDetailPopup: false,
  template: {
    /*titlePlaceholder: function() {
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
    },*/
    time: function(schedule) { // Note if an avenue is connected to a goal based on style
      if (schedule.calendarId == '2') {
        // Note: can add note on type or other customazation here later
        let html = [];
        html.push('<img src="../assets/sm-lock-closed.svg" class="goalAve"></img>')
        html.push(' ' + schedule.title);
        return html.join('');
      } else {
        return schedule.title;
      };
    },
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
calendar.on('clickMore', function() {
  console.log('clickMore');
})

calendar.on('clickDayname', function() {
  console.log('clickDayname');
})

calendar.on({
  // Create schedule from add avenue popup
  'beforeCreateSchedule': function(event) {
    //console.log('event on cal click',event);
    // Launch the popup
    avePopLaunch(event, 'calCreate');
  },
  // Open popup on schedule click
  'clickSchedule': function(event) {
    //console.log('calendar event on click schedule', event);
    // Launch avenue popup with saved values
    // Send Id to be held until saved 
    document.getElementById('aveIdModal').value = event.schedule.id;
    // Set dropdown options from list held in the initiative object 
    let dropdown = document.getElementById('aveDropModal')
    let options = currentInitiative.avenue_types;
    for (i in options){
      let opElem = document.createElement("option");
      let opText = currentInitiative.avenue_types[i]
      opElem.setAttribute("value", `${opText}`);
      opElem.innerHTML = `${opText}`;
      dropdown.appendChild(opElem);
    };
    // Get stored avenue by shared schedule and Avenue id 
    let ave = currentInitiative.avenues.get(`${event.schedule.id}`);
    //console.log('avenue to send to ui', ave);
    // Send Avenue Type to ui
    document.getElementById('aveDropModal').value = ave.avenue_type;
    // Send Sent to ui
    document.getElementById('aveSentModal').checked = ave.sent;
    // Send Description to ui 
    document.getElementById('aveDescModal').value = ave.description;
    // Send Person to ui 
    document.getElementById('avePersModal').value = ave.person;
    // Send date to ui 
    let momDate = moment(ave.date, 'ddd MMM DD YYYY HH:mm:ss'); // Turn date into moment object to format for date picker display
    //console.log('moment date', momDate)
    document.getElementById('aveDateModal').value = momDate.format('YYYY-MM-DD');

    if (ave.goal_id != '') {
      document.getElementById('aveDropModal').setAttribute('disabled', 'true');
      document.getElementById('aveDescModal').setAttribute('readonly', 'true');
      document.getElementById('aveDateModal').setAttribute('readonly', 'true');
      document.getElementById('aveDeleteModal').style.display = "none";
      document.getElementById('aveDeleteModal').style.position = "fixed";
    };
    
    // Display modal 
    aveModal.style.display = "block";
  },
  // Update Avenue on schedule drag in calendar
  'beforeUpdateSchedule': function(event) {
    let schedule = event.schedule;
    let changes = event.changes;
    console.log('drag schedule', schedule, 'changes', changes);
    // Check to see if ave is linked to goal
    if (schedule.calendarId == '1') { // If not connected update on drag
      // Update Initiative object 
      let initAve = currentInitiative.avenues.get(schedule.id); // Avenue object from the initiative object
      let momDate = moment(changes.start.toDate(), 'ddd MMM DD YYYY HH:mm:ss'); // Adjust to current timezone from saved timezone
      initAve.change_date(momDate.toString());
      //console.log('ave from init', initAve);

      // Update Message manager tab
      let guiAve = document.getElementById(`avenue${schedule.id}`); // Avenue object from the ui
      guiAve.children[7].value = momDate.format('YYYY-MM-DD');

      // Update Schedule object on calendar 
      calendar.updateSchedule(schedule.id, '1', {
        start: momDate.format('ddd DD MMM YYYY HH:mm:ss'),
        end:  momDate.format('ddd DD MMM YYYY HH:mm:ss')
      });

      // Save everything to main
      let ipcInit = currentInitiative.pack_for_ipc();
      ipc.send('save', currentInitiativeId, ipcInit);
    } else if (schedule.calendarId == '2') { // If it is connected to a goal reject drag
      return
    };
  }
});

// Navigate Calendar 
  // Go back a month
  document.getElementById('prev').addEventListener('click', function (event) {
    calendar.prev();
    let start = calendar.getDateRangeStart();
    let end = calendar.getDateRangeEnd();
    //console.log('prev', start, end);
    // Display date range on top of calendar 
    document.getElementById('year').value = `${end.getFullYear()}`;
    document.getElementById('month').value = `${start.getMonth() + 1}` + '.' + `${start.getDate()}` + ' - ' + `${end.getMonth() + 1}` + '.' + `${end.getDate()}`;
  });

  // Go to today
  document.getElementById('today').addEventListener('click', function (event) {
    calendar.today();
    let start = calendar.getDateRangeStart();
    let end = calendar.getDateRangeEnd();
    //console.log('today', start.getDate(), end);
    // Display date range on top of calendar 
    document.getElementById('year').value = `${end.getFullYear()}`;
    document.getElementById('month').value = `${start.getMonth() + 1}` + '.' + `${start.getDate()}` + ' - ' + `${end.getMonth() + 1}` + '.' + `${end.getDate()}`;
  });

  // Go to next month
  document.getElementById('next').addEventListener('click', function (event) {
    calendar.next();
    let start = calendar.getDateRangeStart();
    let end = calendar.getDateRangeEnd();
    //console.log('next', start, end);
    // Display date range on top of calendar 
    document.getElementById('year').value = `${end.getFullYear()}`;
    document.getElementById('month').value = `${start.getMonth() + 1}` + '.' + `${start.getDate()}` + ' - ' + `${end.getMonth() + 1}` + '.' + `${end.getDate()}`;
  });

  // Syles for calendar Schedule objects that are not linked to a goal 
  calendar.setCalendarColor('1', {
    color: '#111',
    bgColor: '#585858',
    borderColor: '#111',
    dragBgColor: '#585858',
  });
  // Syles for calendar Schedule objects that are linked to a goal 
  calendar.setCalendarColor('2', {
    color: '#000',
    bgColor: '#12afdf',
    borderColor: '#12afdf',
    dragBgColor: '#12afdf',
  });
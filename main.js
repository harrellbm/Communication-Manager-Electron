// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, MenuItem} = require('electron');
const ipc = require('electron').ipcMain;
const fs = require('fs');
const templates = require('./src/objectTemplate.js');
// Handle installation by squirrel
if(require('electron-squirrel-startup')) app.quit();
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

const windows = new Map(); // Object to hold references to the webcontents for all windows 
var collection = new templates.initiativeCollection(); // Object to hold all of the initiatives 
collection.add_initiative(); // For now just add a single initiative 

function createIndex (name, tag, html) {
  // Create Message editor window
  let newWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      spellcheck: true
    }
  });

  // Add name and tag to window
  newWindow.__name = name;
  newWindow.__tag = tag;

  // And load the html of the window
    // Add __dirname so that electron-reload can watch render processes
  newWindow.loadFile(html);

  // Set up right click menu for spellchecker
  const session =  newWindow.webContents.session;
  session.setSpellCheckerLanguages(['en-US']);
  newWindow.webContents.on('context-menu', (_e, params) => {
    if(params.dictionarySuggestions && params.dictionarySuggestions.length)
    {
      const objMenu = new Menu();
      const objMenuHead = new MenuItem({
        label: 'Corrections',
        enabled: false
      });
      objMenu.append(objMenuHead);
      const objMenuSep = new MenuItem({
        type: 'separator'
      });
      objMenu.append(objMenuSep);
      params.dictionarySuggestions.map(strSuggestion => {
        const objMenuItem = new MenuItem({
          click(_this, objWindow)
          {
            objWindow.webContents.insertText(strSuggestion);
            objMenu.closePopup(this);
          },
          label: strSuggestion
        });
        objMenu.append(objMenuItem);
      });
      objMenu.popup({
        window: newWindow,
        x: params.x,
        y: params.y
      });
    }
  });

  /* need to handle multiple initiatives */
  // When loaded show 
  newWindow.once('ready-to-show', () => {
    // For now just initiate with blank initiative
    let temp = new templates.Initiative;
    let initiativeObj = temp.pack_for_ipc();
    let initiativeId = '0'
    let ipcPack = {};
    ipcPack.initId = initiativeId;
    ipcPack.initObj = initiativeObj;
    //console.log('initiative on initiatization: ', ipcPack)
    newWindow.webContents.send('load', ipcPack);
    newWindow.maximize(); // maximize to full screen // Possibly move this to webpreferences with fullscreen option
    newWindow.show();
  });

  // Emitted when the window is closed.
  newWindow.on('closed', function () {
    // Dereference the window object and delete from set
    windows.delete('index');
    newWindow = null;
  });

  // Add reference to webcontents so ipcs to the window can be assigned later
  windows.set('index', newWindow.webContents); 
  return newWindow;
};

function createEditor (name, tag, html, initativeId, messageId, messageObj) {
  // Create Message editor window
  let newWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      spellcheck: true
    }
  });

  // Add name and tag to window
  newWindow.__name = name;
  newWindow.__tag = tag;

  // And load the html of the window
    // Add __dirname so that electron-reload can watch render processes
  newWindow.loadFile(html);

  // Set up right click menu for spellchecker
  const session =  newWindow.webContents.session;
  session.setSpellCheckerLanguages(['en-US']);
  newWindow.webContents.on('context-menu', (_e, params) => {

    if(params.dictionarySuggestions && params.dictionarySuggestions.length)
    {
      const objMenu = new Menu();
      const objMenuHead = new MenuItem({
        label: 'Corrections',
        enabled: false
      });
      objMenu.append(objMenuHead);
      const objMenuSep = new MenuItem({
        type: 'separator'
      });
      objMenu.append(objMenuSep);
      params.dictionarySuggestions.map(strSuggestion => {

        const objMenuItem = new MenuItem({
          click(_this, objWindow)
          {
            objWindow.webContents.insertText(strSuggestion);
            objMenu.closePopup(this);
          },
          label: strSuggestion
        });
        objMenu.append(objMenuItem);
      });
      objMenu.popup({
        window: newWindow,
        x: params.x,
        y: params.y
      });
    }
  });

  // When loaded show 
  newWindow.once('ready-to-show', function () {
    // Send the initiative id, message id, and message object to the editor's JavaScript process
    //console.log('init id on editor creation: ', initativeId);
    newWindow.webContents.send('load', initativeId, messageId, messageObj); 
    newWindow.show();
  });
  
  // Emitted when the window is closed.
  newWindow.on('closed', function () {
    // Dereference the window object and delete from set
    windows.delete(messageId);
    newWindow = null;
  });

  // Add reference to webcontents so ipcs to the editor can be assigned later
  windows.set(messageId, [newWindow.webContents, initativeId, messageId] );
  return newWindow;
};

// Create all the initial windows 
function setUpWindows() {
  createIndex('message_manager','index', './src/index.html');
  //console.log(windows)
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', setUpWindows);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //collection = null; // need to check when this event is triggered and when would be a better time to dereference 
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Called right after window-all-closed event to save everything right before quitting 
app.on('will-quit', function () {
  let file = collection.pack_for_file(); // Pack collection into Json 
  saveToFile(file);
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createIndex();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/* --- Index Related functions and ipcs --- */
// On index close save current initiative and open editors before closing everything
ipc.on('index-close', function(event, initId, ipc) {
  // Update collection with anything new from index window
  //console.log('init id on index close', initId, 'initiative to be saved', ipc);
  collection.update_init(initId, ipc);
  // Send close event to all open editors
   // Note: Saving content from editors is handled on the save-mess channel  
  windows.forEach( function (win, key) {
    let webCont = win[0];
    if (key != 'index') {
      webCont.send('index-close');
      // Note: Editor window references hold an array of [Webcontents, initativeId, messageId] 
    };
  })
  // Note: saveToFile function is called on the will-quit event to prevent unecessary multiple saves 
});

// Save the current initiative from index as Json after manual save 
ipc.on('save', function(event, initId, ipc) {
  // need to update open editors on index save 
  //console.log('init id right before being sent to file', initId);
  collection.update_init(initId, ipc);
  let file = collection.pack_for_file(); // Pack collection into Json 
  saveToFile(file);
  // Update any open editors with any changes from index 
  windows.forEach( function (win, key) {
    if (key != 'index') {
      // Note: Editor window references hold an array of [Webcontents, initativeId, messageId] 
      let webCont = win[0];
      let initId = win[1];
      let messId = win[2];
      let initative = collection.initiatives.get(initId);
      let message = initative.messages.get(messId);
      // Send updates to editor 
      webCont.send('load', initId, messId, message);
      };
    });
});

// Function to save to file from packed Collection object 
function saveToFile (file) {
  file = JSON.stringify(file);
  console.log("made it to main save function", file);
  fs.writeFile('data.json', file, function (err) {
    if (err) throw err;
    console.log('Saved successfully!');
  });
};

// Open the initative saved in file 
ipc.on('open-file', function (event, args) { 
  let fileData = openFromFile(); // Get raw Json 
  collection.unpack_from_file(fileData); // Unpack into active Collection object

  // For now just return the first initiative until better initative handleing is implemented
  let initId = '0';
  let initiative = collection.initiatives.get(initId);
  let ipcInit = initiative.pack_for_ipc();
  // Pack initiative id and packed initiative into one object for returning by ipc
  let ipcPack = {};
  ipcPack.initId = initId;
  ipcPack.ipcInit = ipcInit;
  event.returnValue = ipcPack; // Return packed initiative 
});

// Function to open from data.json file
function openFromFile () {
  let rawData = fs.readFileSync('data.json');
  let fileData = JSON.parse(rawData);
  //console.log(fileData);
  return fileData;
  };

// Message Manager ipcs
// Pass the message id and content to the newly created editor
ipc.on('edit', function (event, initId, messageId, messageObj) { 
  //console.log('init id right before editor creation: ', initId)
  createEditor('message_editor', 'editor','./src/message_editor.html', initId, messageId, messageObj);
});

/* --- Message Editor ipcs --- */
// Receive the edited message from closed or saved message editor
  // Note: This event will also be triggered on index-close necessitating the extra if check
ipc.on('save-mess', function (event, initId,  messageId, currentMessage) {
  //console.log('initiative id on save from editor: ', initId, 'editor id: ', messageId, 'saved from editor: ', currentMessage);
  // Update collection object 
  collection.update_mess(initId, messageId, currentMessage); 
  //console.log('collection after message update', collection.initiatives)
  
  // Send message to update the main window and save to file
  let index = windows.get('index'); // Pull up reference to webcontents for index window
  if(index != undefined) { // Check whether this event was been triggered on index close in which case skip 
    //console.log('index has not been destroyed');
    index.webContents.send('update-mess', messageId, currentMessage);
    let file = collection.pack_for_file();
    saveToFile(file);
    }
});
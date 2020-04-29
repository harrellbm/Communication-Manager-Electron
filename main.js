// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const ipc = require('electron').ipcMain
const fs = require('fs')
const templates = require('./src/objectTemplate.js')
const debug = require('electron-debug')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

// Open devTools for all browser windows
//debug({'devToolsMode': 'right'});

const windows = new Map(); // Object to hold references to the webcontents for all windows 
var collection = new templates.initiativeCollection(); // Object to hold all of the initiatives 
collection.add_initiative(); // For now just add a single initiative 



function createIndex (name, tag, html) {
  // Create Message editor window
  let newWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Add name and tag to window
  newWindow.__name = name;
  newWindow.__tag = tag;

  // And load the html of the window
    // Add __dirname so that electron-reload can watch render processes
  newWindow.loadFile(html);

  // When loaded show 
  newWindow.once('ready-to-show', () => {
    newWindow.maximize(); // maximize to full screen
    newWindow.show();
  });

  // Emitted when the window is closed.
  newWindow.on('closed', function () {
    // Dereference the window object and delete from set
    delete windows[name];
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
      nodeIntegration: true
    }
  });

  // Add name and tag to window
  newWindow.__name = name;
  newWindow.__tag = tag;

  // And load the html of the window
    // Add __dirname so that electron-reload can watch render processes
  newWindow.loadFile(html);

  // When loaded show 
  newWindow.once('ready-to-show', function () {
    // Send the initiative id, message id, and message object to the editor's JavaScript process
    newWindow.webContents.send('load', initativeId, messageId, messageObj); 
    newWindow.show();
  });
  
  // Emitted when the window is closed.
  newWindow.on('closed', function () {
    // Dereference the window object and delete from set
    delete windows[name];
    newWindow = null;
  });

  // Add reference to webcontents so ipcs to the editor can be assigned later
  windows.set(messageId, newWindow.webContents);
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
  collection = null;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createIndex();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// Save the current initiative to file as Json
ipc.on('save', function(event, id, ipc) {
  collection.update_init(id, ipc);
  let file = collection.pack_for_file(); // Pack collection into Json 
  saveToFile(file);
});

// Function to save from packed Collection object 
function saveToFile (file) {
  file = JSON.stringify(file);
  console.log("made it to main save function", file);
  fs.writeFile('data.json', file, function (err) {
    if (err) throw err;
    console.log('Saved successfully!');
  })
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
  event.returnValue = ipcPack // Return packed initiative 
});

// Function to open from data.json file
function openFromFile () {
  let rawData = fs.readFileSync('data.json')
  let fileData = JSON.parse(rawData)
  console.log(fileData)
  return fileData
  };

// Message Manager ipcs
// Pass the message id and content to the newly created editor
ipc.on('edit', function (event, initativeId, messageId, messageObj) { 
  createEditor('message_editor', 'editor','./src/message_editor.html', initativeId, messageId, messageObj);
});

// Message Editor ipcs
// Receive the edited message from closed or saved message editor
ipc.on('save-mess', function (event, initId,  messageId, currentMessage) {
  //console.log('initiative id: ', initId, 'editor id: ', messageId, 'saved from editor: ', currentMessage);
  // Send message to update the main window
  let index = windows.get('index'); // Pull up reference to webcontents for index window
  index.webContents.send('update-mess', messageId, currentMessage);
  // Update collection object 
  console.log('init id: ', initId, 'message content: ', currentMessage);
  console.log(collection);
  collection.update_mess(initId, messageId, currentMessage); 
  let file = collection.pack_for_file();
  saveToFile(file); 
});
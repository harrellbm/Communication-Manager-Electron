// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const ipc = require('electron').ipcMain
const fs = require('fs')
const template = require('./src/objectTemplate.js')
const debug = require('electron-debug')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

// Open devTools for all browser windows
//debug({'devToolsMode': 'right'});

const windows = new Map();
var initatives = new template.initiativeCollection(); 

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

function createEditor (name, tag, html, messageId, messageObj) {
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
    newWindow.webContents.send('load', messageId, messageObj); // Send the message id and message object to the editor's JavaScript
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
ipc.on('save', function(event, args) {save ( event, args)});

function save (event, args) {
  file = JSON.stringify(args);
  console.log("made it to main", file);
  fs.writeFile('data.json', file, function (err) {
    if (err) throw err;
    console.log('Replaced!');
  })
};

// Open the initative saved in file 
ipc.on('open-file', function (event, args) {
  let rawData = fs.readFileSync('data.json')
  let fileData = JSON.parse(rawData)
  console.log(fileData)
  event.returnValue = fileData
});

// Message Manager ipc
// Pass the message id and content to the newly created editor
ipc.on('edit', function (event, messageId, messageObj) { 
  createEditor('message_editor', 'editor','./src/message_editor.html', messageId, messageObj);
});

ipc.on('update-init', function (event, args){
  initatives.get
  console.log('updating from index: ', args)
});

// Message Editor ipcs
// Receive the edited message from closed or saved message editor
ipc.on('save-mess', function (event, messageId, currentMessage) {
  //console.log('editor id: ', messageId, 'saved from editor: ', currentMessage);
  let index = windows.get('index'); // Pull up reference to webcontents for index window
  index.webContents.send('update-mess', messageId, currentMessage); // Send message to the main window 
});
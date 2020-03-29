// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const ipc = require('electron').ipcMain
const fs = require('fs')
const debug = require('electron-debug')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

/*let mainWindow
(async () => {
	await app.whenReady();
	mainWindow = new BrowserWindow();
})();*/

const windows = new Set();

function createWindow (name, tag, html) {
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
  // and load the index.html of the app.
  newWindow.loadFile(html);

  // When loaded show 
  newWindow.once('ready-to-show', () => {
    newWindow.show();
  });

  // Open the DevTools.
  //newWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  newWindow.on('closed', function () {
    // Dereference the window object and delete from set
    windows.delete(newWindow);
    newWindow = null;
  });

  windows.add(newWindow);
  return newWindow;
};

// Create all the initial windows 
function setUpWindows() {
  createWindow('message_manager','manager', 'message_manager.html');
  createWindow('message_editor','editor','message_editor.html');
  console.log(windows)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', setUpWindows)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipc.on('save', function (event, arg) {
  file = JSON.stringify(arg)
  console.log("made it to main", file)
  fs.writeFile('data.json', file, function (err) {
    if (err) throw err;
    console.log('Replaced!')
  })
  /*if (arg[title]){

  }*/
})

ipc.on('open-file', function (event, arg) {
  let rawData = fs.readFileSync('data.json')
  let fileData = JSON.parse(rawData)
  //console.log(fileData)
  event.returnValue = fileData
})

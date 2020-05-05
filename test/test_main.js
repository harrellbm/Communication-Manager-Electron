const Application = require('spectron').Application;
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const BrowserWindow = require('electron').BrowserWindow;
const path = require('path');
const chai = require('chai');
chai.use(require('chai-datetime'));
const expect = require('chai').expect;
const templates = require('../src/objectTemplate.js');
const fs = require('fs'); // For verifying file saves 

describe('Test index process', function () {
  this.slow(10000);
  this.timeout(15000);
  var app;
  
  beforeEach(function () {
    app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..')]
      });
    return app.start();
    });
  
  afterEach( function () {
   if (app && app.isRunning()) {
      return app.stop();
      }; 
    });
  
  /* --- Main related tests --- */
  // Test save everything from index on index close
  it('should save everything from index on app close', async () => {
    await app.client.waitUntilWindowLoaded();
    // Switch to message manager tab 
    await app.client.click('#messageTab');
    // Add a message 
    await app.client.click('#addMess');
    await app.client.$('#messTitle0').setValue('This is a test Title');
    //Add an avenue
    await app.client.click('#addAve');
    await app.client.$('#aveDescription0').setValue('Test Avenue Description');
    // Quit the app
    await app.stop();
    // Read the file and verify things saved 
    let rawData = fs.readFileSync('data.json');
    let fileData = JSON.parse(rawData);
    //console.log(fileData.initiatives['0']);
    // Verify message title
    let messTitle = fileData.initiatives['0'].messages['0'].title
    expect(messTitle, 'Message title incorrect').to.be.a('string').that.equals('This is a test Title')
    // Verify avenue description
    let aveDescription = fileData.initiatives['0'].avenues['0'].description
    expect(aveDescription, 'Avenue desctription incorrect').to.be.a('string').that.equals('Test Avenue Description')
    });

    
    // test save on click index 
    // test save on click editor
    // need save and open file from collection object 
    //open-file from index
    //window-all-close and will-quit events to save everything to file
});
  

describe('Test Communication with Main process', function () {
  this.slow(10000);
  this.timeout(15000);
  var app;

  beforeEach(function () {
    app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..')]
      });
    return app.start();
    });

  afterEach(function () {
    if (app && app.isRunning()) {
      return app.stop();
      }
    });
    

 //edit from index and paired load set to created editor
 //save which comes from index on delete message, delete avenue and manual save which sends load to all open editors
 //index-close sent from index and index-close then sent to open editors
 
  /* --- Index related ipc tests --- */
  // Test passing initiative to main, letting it save in the collection in main and then reloading
  it('should pack, send and then unpack an initiative', async () => {
    await app.client.waitUntilWindowLoaded();
    // Make an updated initiative and mimic being sent over ipc
    let testInit = new templates.Initiative();
    testInit.change_description('This is the updated description');
    testInit.change_group('Ben my roomate');
    // Pack for ipc
    let ipcInit = await testInit.pack_for_ipc();
    // Send
    await app.electron.ipcRenderer.send('save', '0', ipcInit);
    // Call to open it back up 
    let ipcPack = await app.electron.ipcRenderer.sendSync('open-file');
    //console.log('returned file: ', ipcPack);
    // Unpack from ipc
    // Note: currently no need for ipcPack.initId but probably in the future 
    let afterInit = new templates.Initiative();
    await afterInit.unpack_from_ipc(ipcPack.ipcInit);
    //console.log('unpacked initative: ', afterInit);
    expect(afterInit, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
    expect(afterInit.description, 'Does not have the proper description').to.be.a('string').that.equals('This is the updated description');
    expect(afterInit.groups, 'Does not have the proper groups').to.be.an('array').that.includes('Ben my roomate');
    });

    /* --- Editor related ipc tests --- */
    // save-mess from editor, and paired update-mess sent to index
});

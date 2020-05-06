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
  
  /* save on manual save */ 

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

  
  /* add avenues and messages */

  /* open/load correctly */

  /* update main on message and avenue delete */
  // test from file 

  /* update index on new things coming from editor */

  /* drag and drop avenues */
});
  
// Note: These tests us ipcs to verify functionality indirectly for things that are impossible otherwise with Spectron's limitations
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

  /* index-close sent from index and index-close then sent to open editors */

  /* --- Editor related ipc tests --- */
    /*
  // Verify editor close on message delete 
  it('should close editor on message delete', async () => {
    note pass in undefined message through ipc to main's save message 
    await app.client.waitUntilWindowLoaded();
    // Switch to message manager tab 
    await app.client.click('#messageTab');
    // Add a message 
    await app.client.click('#addMess');
    // Click to open editor
    await app.client.click('#messEdit0');
    // Verify editor opened
    let count = await app.client.getWindowCount();
    expect(count, 'Editor did not open').to.equal(2);
    // Make sure editor loads first 
    await app.client.switchWindow('Message Editor');
    await app.client.waitUntilWindowLoaded();
    let edit = await app.webContents.isDestroyed();
    console.log('open', edit);
    // Delete message 
    await app.client.switchWindow('Message Manager');
    await app.client.click('#messDelete0');
    let btn = await app.client.$$('.swal-button');
    console.log(btn);
    await btn[1].click();
    //await app.client.click('//body/div[4]/div/div[4]/div[2]/button');
    await app.client.waitUntilWindowLoaded();
    //await btn.click(); // Click confirm button
    // Add a message 
    await app.client.click('#addMess');
    await app.client.waitUntilWindowLoaded();
    let mess = await app.client.$('#messageIn').getHTML();
    console.log(mess);
    await app.client.switchWindow('Message Editor');
    //await app.client.windowByIndex(1); //getTitle();
    await app.client.waitUntilWindowLoaded();
    edit = await app.webContents.isDestroyed();
     //await app.webcontents.isDestroyed();
    await console.log('edit', edit);
    //edit.isDisplayed();
    // Verify editor closed
    count = await app.client.getWindowCount();
    expect(count, 'Editor did not close').to.equal(1);
    await app.client.switchWindow('Message Manager');
    
  });
  */
});

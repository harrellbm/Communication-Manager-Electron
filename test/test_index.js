const Application = require('spectron').Application;
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const BrowserWindow = require('electron').BrowserWindow;
const path = require('path');
const chai = require('chai');
chai.use(require('chai-datetime'));
chai.use(require('chai-as-promised'));
const expect = require('chai').expect;
const templates = require('../src/objectTemplate.js');
const fs = require('fs'); // For verifying file saves 

describe('Test Index process', function () {
  this.slow(10000);
  this.timeout(15000);
  let app;
  
  beforeEach(function () {
    app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..',  'main.js')],
      startTimeout: 10000
      });
    return app.start();
    });
  
  afterEach( function () {
   if (app && app.isRunning()) {
      return app.stop().then(function (){
        app = null;
      });
      }; 
    });
  
  // Add and remove message in ui  
  it('should add message, then delete it', async () => {
    await app.client.waitUntilWindowLoaded();
    // Switch to message manager tab 
    await app.client.click('#messageTab');
    // Add message 
    await app.client.click('#addMess');
    // Manually save
    await app.client.click('#messSave');
    // Dismiss popup
    await app.client.execute(function () {
      let elem = document.getElementsByClassName('swal-overlay swal-overlay--show-modal');
      elem[0].click();
    });
    // Verify message was added in file
    await function () { new Promise(resolve => setTimeout(console.log(resolve), 5))};
    let rawData = await fs.readFileSync('data.json');
    await function () { new Promise(resolve => setTimeout(console.log(resolve), 5))};
    let fileData = await JSON.parse(rawData);
    //console.log(fileData.initiatives['0']);
    let mess = fileData.initiatives['0'].messages['0'];
    expect(mess, 'Message does not exist').to.be.an('object').with.keys('title', 'greeting', 'content', 'signature', 'avenue_ids');
    // Verify message was added in ui 
    expect(app.client.$('#message0'), 'Message does not exist').to.eventually.exist;    
    // Delete message 
    await app.client.click('#messDelete0');
    // Click confirm on popup
    await app.client.execute(function () {
      let elem = document.getElementsByClassName("swal-button swal-button--confirm swal-button--danger");
      elem[0].click();
    });
    // Verify elements are deleted in ui
    let container = await app.client.$('#messageIn').getHTML();
    //console.log(container);
    expect(container, 'Message exists').to.equal('<div id="messageIn" class="messIn"></div>');
    // Read the file and verify deleted in file 
    await function () { new Promise(resolve => setTimeout(console.log(resolve), 5))}; 
    rawData = await fs.readFileSync('data.json');
    await function () { new Promise(resolve => setTimeout(console.log(resolve), 5))};
    fileData = await JSON.parse(rawData);
    //console.log(fileData.initiatives['0']);
    messTitle = fileData.initiatives['0'].messages['0']
    expect(messTitle, 'Message title incorrect').to.be.undefined;
  });

    // Add and remove avenue in ui  
 it('should add avenue, then delete it', async () => {
    await app.client.waitUntilWindowLoaded();
    // Switch to message manager tab 
    await app.client.click('#messageTab');
    // Add avenue
    await app.client.click('#addAve');
    // Manually save
    await app.client.click('#messSave');
    // Dismiss popup
    await app.client.execute(function () {
      let elem = document.getElementsByClassName('swal-overlay swal-overlay--show-modal');
      elem[0].click();
    });
    // Verify message was added in file
    await function () { new Promise(resolve => setTimeout(console.log(resolve), 5))};
    let rawData = await fs.readFileSync('data.json');
    await function () { new Promise(resolve => setTimeout(console.log(resolve), 5))};
    let fileData = await JSON.parse(rawData);
    //console.log(fileData.initiatives['0']);
    let ave = fileData.initiatives['0'].avenues['0'];
    expect(ave, 'Avenue does not exist').to.be.an('object').with.keys('sent', 'avenue_type', 'description', 'person', 'message_id', 'date');
    // Verify message was added in ui 
    expect(app.client.$('#avenue0'), 'Avenue does not exist').to.eventually.exist;
    // Delete avenue 
    await app.client.click('#aveDelete0');
    // Click confirm on popup
    await app.client.execute(function () {
      let elem = document.getElementsByClassName("swal-button swal-button--confirm swal-button--danger");
      elem[0].click();
    });
    // Verify elements are deleted in ui
    let container = await app.client.$('#avenueIn').getHTML();
    //console.log(container);
    expect(container, 'Avenue exists').to.equal('<div id="avenueIn" class="messIn"></div>');
    // Read the file and verify deleted in file 
    await function () { new Promise(resolve => setTimeout(console.log(resolve), 5))};
    rawData = await fs.readFileSync('data.json');
    await function () { new Promise(resolve => setTimeout(console.log(resolve), 5))};
    fileData = await JSON.parse(rawData);
    //console.log(fileData.initiatives['0']);
    // Verify message title
    messTitle = fileData.initiatives['0'].avenues['0']
    expect(messTitle, 'Message title incorrect').to.be.undefined;
  });

  // save on manual save 
 it('should save from index on manual save', async () => {
    await app.client.waitUntilWindowLoaded();
    // Switch to message manager tab 
    await app.client.click('#messageTab');
    // Add a message 
    await app.client.click('#addMess');
    await app.client.$('#messTitle0').setValue('This is a test Title');
    //Add an avenue
    await app.client.click('#addAve');
    await app.client.$('#aveDescription0').setValue('Test Avenue Description');
    // Manually save
    await app.client.click('#messSave');
    // Read the file and verify things saved 
    await function () { new Promise(resolve => setTimeout(console.log(resolve), 5))};
    let rawData = await fs.readFileSync('data.json');
    await function () { new Promise(resolve => setTimeout(console.log(resolve), 5))};
    let fileData = await JSON.parse(rawData);
    //console.log(fileData.initiatives['0']);
    // Verify message title
    let messTitle = fileData.initiatives['0'].messages['0'].title
    expect(messTitle, 'Message title incorrect').to.be.a('string').that.equals('This is a test Title')
    // Verify avenue description
    let aveDescription = fileData.initiatives['0'].avenues['0'].description
    expect(aveDescription, 'Avenue desctription incorrect').to.be.a('string').that.equals('Test Avenue Description')
    });

  // save from index on index close
  it('should save from index on app close', async () => {
    
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
    await function () { new Promise(resolve => setTimeout(console.log(resolve), 5))};
    let rawData = await fs.readFileSync('data.json');
    await function () { new Promise(resolve => setTimeout(console.log(resolve), 5))};
    let fileData = await JSON.parse(rawData);
    //console.log(fileData.initiatives['0']);
    // Verify message title
    let messTitle = fileData.initiatives['0'].messages['0'].title
    expect(messTitle, 'Message title incorrect').to.be.a('string').that.equals('This is a test Title');
    // Verify avenue description;
    let aveDescription = fileData.initiatives['0'].avenues['0'].description;
    expect(aveDescription, 'Avenue desctription incorrect').to.be.a('string').that.equals('Test Avenue Description');
    });

  // Open/load correctly 
  it('should load correctly', async () => {
    await app.client.waitUntilWindowLoaded();
    // Make an updated initiative and mimic being sent over ipc
    let testInit = new templates.Initiative();
    testInit.add_message('this is a message title', 'Hello,', 'Here is what I have to say.', 'Signed me', '1');
    testInit.add_avenue('text', 'Text Blast', 'Bill', false, '0', '');
    testInit.add_avenue('email', 'Email Blast', 'Phil', false, '', '');
    // Pack for ipc
    let ipcInit = await testInit.pack_for_ipc();
    // Send
    await app.electron.ipcRenderer.send('save', '0', ipcInit);
    // Switch to message manager tab 
    await app.client.click('#messageTab');
    // Open initiative from file 
    await app.client.click('#messOpen');
    await app.client.waitUntilWindowLoaded();
    // Check that loaded values are correct 
    let title = await app.client.$('#messTitle0').getValue();
    expect(title, 'Message title incorrect').to.be.a('string').that.equals('this is a message title');
    let description0 = await app.client.$('#aveDescription0').getValue();
    expect(description0, 'Avenue description incorrect').to.be.a('string').that.equals('Text Blast');
    let  description1 = await app.client.$('#aveDescription1').getValue();
    expect(description1, 'Avenue description incorrect').to.be.a('string').that.equals('Email Blast');
    // Check that things are loaded in proper container
    let container = await app.client.$('#messageIn').getHTML();
    expect(container, 'Message and avenue did not load correctly').to.equal('<div id="messageIn" class="messIn"><div class="message" id="message0"><p class="messTitle_heading" id="messTitle_heading">Title:</p><textarea class="messTitle" id="messTitle0"></textarea><div class="aveDrop" id="aveDrop0"><div class="avenue" id="avenue0"><select class="aveDropdown" id="avenue_type0"><option value="Email">Email</option><option value="Text">Text</option><option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="Handout">Handout</option><option value="Poster">Poster</option><option value="Other">Other</option></select><p class="aveDescription_title" id="aveDescription_title">Description:</p><p class="avePersons_title" id="avePersons_title">Person:</p><p class="aveDate_title" id="aveDate_title">Date:</p><p class="aveSent_box" id="aveSent_box0"><input class="aveSent_checkbox" id="aveSent_checkbox0" type="checkbox"><label class="aveSent_label" id="aveSent_label" for="aveSent_checkbox">Sent</label></p><textarea class="aveDescription" id="aveDescription0"></textarea><textarea class="avePersons" id="avePersons0"></textarea><input class="aveDate" id="aveDate0" type="date"><input class="aveDelete" id="aveDelete0" type="button" value="x"></div></div><div class="btnArray" id="btnArray0"><input class="messEdit" id="messEdit0" type="button" value="Edit"><input class="messCopy" id="messCopy0" type="button" value="Copy"><input class="messDelete" id="messDelete0" type="button" value="x"></div></div></div>');
    container = await app.client.$('#avenueIn').getHTML();
    expect(container, 'Avenue did not load correctly').to.equal('<div id="avenueIn" class="messIn"><div class="avenue" id="avenue1"><select class="aveDropdown" id="avenue_type1"><option value="Email">Email</option><option value="Text">Text</option><option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="Handout">Handout</option><option value="Poster">Poster</option><option value="Other">Other</option></select><p class="aveDescription_title" id="aveDescription_title">Description:</p><p class="avePersons_title" id="avePersons_title">Person:</p><p class="aveDate_title" id="aveDate_title">Date:</p><p class="aveSent_box" id="aveSent_box1"><input class="aveSent_checkbox" id="aveSent_checkbox1" type="checkbox"><label class="aveSent_label" id="aveSent_label" for="aveSent_checkbox">Sent</label></p><textarea class="aveDescription" id="aveDescription1"></textarea><textarea class="avePersons" id="avePersons1"></textarea><input class="aveDate" id="aveDate1" type="date"><input class="aveDelete" id="aveDelete1" type="button" value="x"></div></div>');
    });

  // Update index on save from editor
  it('should update index on editor save', async () => {
    await app.client.waitUntilWindowLoaded();
    // Switch to message manager tab 
    await app.client.click('#messageTab');
    // Add a message 
    await app.client.click('#addMess');
    // Click to open editor
    await app.client.click('#messEdit0');
    await app.client.switchWindow('Message Editor');
    await app.client.waitUntilWindowLoaded();
    // Set message values
    await app.client.$('#title').setValue('This is a test Title'); 
                      
    // Save Ui
    await app.client.click('#save');
    // Check that index updated 
    await app.client.switchWindow('Message Manager');
    let title = await app.client.$('#messTitle0').getValue();
    expect(title, 'Message title incorrect').to.be.a('string').that.equals('This is a test Title');
  });
  
  // Verify toolbar copy button sents all contents to clipboard 
  it('should copy to clipboard', async () => {
    await app.client.waitUntilWindowLoaded();
    // Switch to message manager tab 
    await app.client.click('#messageTab');
    // Add a message 
    await app.client.click('#addMess');
    // Click to open editor
    await app.client.click('#messEdit0');
    await app.client.switchWindow('Message Editor');
    await app.client.waitUntilWindowLoaded();
    // Set message values in editor
    await Promise.all([ app.client.$('#greeting').$('div').setValue('This is a test greeting'), 
                        app.client.$('#content').$('div').setValue('This is test content.  Blah Blah Blah.'), 
                        app.client.$('#signature').$('div').setValue('Testing that I can Sign it')
                      ]);
    // Close editor
    await app.browserWindow.close();
    // Switch to message manager tab
    await app.client.switchWindow('Message Manager');
    // Copy to clipboard  
    await app.client.click('#messCopy0');
    // Verify content on clipboard 
    let content = await app.electron.clipboard.readHTML();
    //console.log(content);
    expect(content, 'Content on clipboard incorrect').to.be.a('string').that.includes('<p>This is a test greeting</p><p>This is test content.  Blah Blah Blah.</p><p>Testing that I can Sign it</p>');
  }); 

  // Should drag and drop avenue into message drop 
  it('should drag and drop avenue', async () => {
    await app.client.waitUntilWindowLoaded();
    // Switch to message manager tab 
    await app.client.click('#messageTab');
    // Add a message and avenue
    await app.client.click('#addMess');
    await app.client.click('#addAve');
    await app.client.$('#avenue0').dragAndDrop('#aveDrop0');
    // Make sure avenue is in message dropbox
    let container = await app.client.$('#avenueIn').getHTML();
    //console.log(container);
    expect(container, 'Avenue still in avenueIn').to.equal('<div id="avenueIn" class="messIn"></div>');
    container = await app.client.$('#messageIn').getHTML()
    //console.log(container);
    expect(container, 'Avenue not in message dropbox').to.equal('<div id="messageIn" class="messIn"><div class="message" id="message0"><p class="messTitle_heading" id="messTitle_heading">Title:</p><textarea class="messTitle" id="messTitle0"></textarea><div class="aveDrop" id="aveDrop0"><div class="avenue" id="avenue0"><select class="aveDropdown" id="avenue_type0"><option value="Email">Email</option><option value="Text">Text</option><option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="Handout">Handout</option><option value="Poster">Poster</option><option value="Other">Other</option></select><p class="aveDescription_title" id="aveDescription_title">Description:</p><p class="avePersons_title" id="avePersons_title">Person:</p><p class="aveDate_title" id="aveDate_title">Date:</p><p class="aveSent_box" id="aveSent_box0"><input class="aveSent_checkbox" id="aveSent_checkbox0" type="checkbox"><label class="aveSent_label" id="aveSent_label" for="aveSent_checkbox">Sent</label></p><textarea class="aveDescription" id="aveDescription0"></textarea><textarea class="avePersons" id="avePersons0"></textarea><input class="aveDate" id="aveDate0" type="date"><input class="aveDelete" id="aveDelete0" type="button" value="x"></div></div><div class="btnArray" id="btnArray0"><input class="messEdit" id="messEdit0" type="button" value="Edit"><input class="messCopy" id="messCopy0" type="button" value="Copy"><input class="messDelete" id="messDelete0" type="button" value="x"></div></div></div>');
    // Drag back to avenueIn
    await app.client.$('#avenue0').dragAndDrop('#avenueIn');
    // Make sure avenue is in message dropbox
    container = await app.client.$('#avenueIn').getHTML();
    //console.log(container);
    expect(container, 'Avenue not in avenueIn').to.equal('<div id="avenueIn" class="messIn"><div class="avenue" id="avenue0"><select class="aveDropdown" id="avenue_type0"><option value="Email">Email</option><option value="Text">Text</option><option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="Handout">Handout</option><option value="Poster">Poster</option><option value="Other">Other</option></select><p class="aveDescription_title" id="aveDescription_title">Description:</p><p class="avePersons_title" id="avePersons_title">Person:</p><p class="aveDate_title" id="aveDate_title">Date:</p><p class="aveSent_box" id="aveSent_box0"><input class="aveSent_checkbox" id="aveSent_checkbox0" type="checkbox"><label class="aveSent_label" id="aveSent_label" for="aveSent_checkbox">Sent</label></p><textarea class="aveDescription" id="aveDescription0"></textarea><textarea class="avePersons" id="avePersons0"></textarea><input class="aveDate" id="aveDate0" type="date"><input class="aveDelete" id="aveDelete0" type="button" value="x"></div></div>');
    container = await app.client.$('#messageIn').getHTML()
    //console.log(container);
    expect(container, 'Avenue still in message dropbox').to.equal('<div id="messageIn" class="messIn"><div class="message" id="message0"><p class="messTitle_heading" id="messTitle_heading">Title:</p><textarea class="messTitle" id="messTitle0"></textarea><div class="aveDrop" id="aveDrop0"></div><div class="btnArray" id="btnArray0"><input class="messEdit" id="messEdit0" type="button" value="Edit"><input class="messCopy" id="messCopy0" type="button" value="Copy"><input class="messDelete" id="messDelete0" type="button" value="x"></div></div></div>');
  }); 
});
  
// Note: These tests us ipcs to verify functionality indirectly for things that are impossible otherwise with Spectron's limitations
describe('Test Communication with Main process', function () {
  this.slow(10000);
  this.timeout(15000);
  let app;

  beforeEach(function () {
    app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..')]
      });
    return app.start();
    });

  afterEach(function () {
    if (app && app.isRunning()) {
      return app.stop().then(function (){
        app = null;
      });
      };
    });
    
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
    afterInit.unpack_from_ipc(ipcPack.ipcInit);
    await function () { new Promise(resolve => setTimeout(console.log(resolve), 5))};
    //console.log('unpacked initative: ', afterInit);
    expect(afterInit, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
    expect(afterInit.description, 'Does not have the proper description').to.be.a('string').that.equals('This is the updated description');
    expect(afterInit.groups, 'Does not have the proper groups').to.be.an('array').that.includes('Ben my roomate');
    });
});
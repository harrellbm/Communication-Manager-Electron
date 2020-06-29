const Application = require('spectron').Application;
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const BrowserWindow = require('electron').BrowserWindow;
const path = require('path');
const chai = require('chai');
chai.use(require('chai-datetime'));
chai.use(require('chai-as-promised'));
const expect = require('chai').expect;
const templates = require('../src/objectTemplate.js');
const fs = require('fs').promises; // For verifying file saves 
const moment = require('moment'); // For date handling 

describe('Test Index process', function () {
  this.slow(10000);
  this.timeout(15000);
  let app;
  
  beforeEach( async () => {
    app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..')],
      chromeDriverLogPath: [path.join(__dirname, './logs/chromeDriverlog')]
      });
    console.log (app.getSettings());
    await app.start()
      .catch(console.error)
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
    // Clean out Initiative of any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
    // Switch to message manager tab
    await app.client.click('#messageTab');
    await app.client.waitUntilWindowLoaded();
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
    let rawData = await fs.readFile('data.json');
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
    rawData = await fs.readFile('data.json');
    fileData = await JSON.parse(rawData);
    //console.log(fileData.initiatives['0']);
    messTitle = fileData.initiatives['0'].messages['0']
    expect(messTitle, 'Message title incorrect').to.be.undefined;
  });

    // Add and remove avenue in ui  
 it('should add avenue, then delete it', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative for any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
    // Switch to message manager tab
    await app.client.click('#messageTab');
    await app.client.waitUntilWindowLoaded();
    // Add avenue
    await app.client.click('#addAve');
    await app.client.$('#aveDateModal').setValue('11-30-2022');
    await app.client.$('#aveDescModal').setValue('This is an new avenue');
    // Save from Popup
    await app.client.click('#aveSaveModal');
    // Verify avenue was added in file
    let rawData = await fs.readFile('data.json');
    let fileData = await JSON.parse(rawData);
    //console.log(fileData.initiatives['0'].avenues['0']);
    let ave = fileData.initiatives['0'].avenues['0'];
    expect(ave, 'Avenue does not exist').to.be.an('object').with.keys('sent', 'avenue_type', 'description', 'person', 'message_id', 'date', 'goal_id');
    expect(ave.date, 'Incorrect Date').to.be.a('string').that.equals('Wed Nov 30 2022 00:00:00 GMT-0700');
    expect(ave.description, 'Incorrect description').to.be.a('string').that.equals('This is an new avenue');
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
    rawData = await fs.readFile('data.json');
    fileData = await JSON.parse(rawData);
    //console.log(fileData.initiatives['0']);
    // Verify avenue deleted in file message title
    ave = fileData.initiatives['0'].avenues['0'];
    expect(ave, 'Avenue not deleted').to.be.undefined;
  });

  // save on manual save 
 it('should save from index on manual save', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative of any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
    // Switch to message manager tab
    await app.client.click('#messageTab');
    await app.client.waitUntilWindowLoaded();
    // Add a message 
    await app.client.click('#addMess');
    await app.client.$('#messTitle0').setValue('This is a test Title');
    //Add an avenue
    await app.client.click('#addAve');
    await app.client.$('#aveDateModal').setValue('11-30-2022');
    await app.client.$('#aveDescModal').setValue('Test Avenue Description');
    // Save from Popup
    await app.client.click('#aveSaveModal');
    // Manually Save to file
    await app.client.click('#messSave')
    // Dismiss popup
    await app.client.execute(function () {
      let elem = document.getElementsByClassName('swal-overlay swal-overlay--show-modal');
      elem[0].click();
    });
    // Read the file and verify things saved 
    let rawData = await fs.readFile('data.json');
    let fileData = await JSON.parse(rawData);
    //console.log(fileData.initiatives['0']);
    // Verify message title
    let messTitle = fileData.initiatives['0'].messages['0'].title;
    expect(messTitle, 'Message title incorrect').to.be.a('string').that.equals('This is a test Title');
    // Verify avenue description
    let aveDescription = fileData.initiatives['0'].avenues['0'].description;
    expect(aveDescription, 'Avenue desctription incorrect').to.be.a('string').that.equals('Test Avenue Description');
  });

  // save from index on index close
  it('should save from index on app close', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative of any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
    // Switch to message manager tab
    await app.client.click('#messageTab');
    await app.client.waitUntilWindowLoaded();
    // Add a message 
    await app.client.click('#addMess');
    await app.client.$('#messTitle0').setValue('This is a test Title');
    //Add an avenue
    await app.client.click('#addAve');
    await app.client.$('#aveDateModal').setValue('11-30-2022');
    await app.client.$('#aveDescModal').setValue('Test Avenue Description');
    // Save from Popup
    await app.client.click('#aveSaveModal');
    // Quit the app
    await app.stop();
    // Read the file and verify things saved 
    let rawData = await fs.readFile('data.json');
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
    testInit.add_avenue('text', 'Text Blast', 'Bill', false, '0', moment('2020-02-15', 'YYYY-MM-DD').toString(), '');
    testInit.add_avenue('email', 'Email Blast', 'Phil', false, '', moment('2020-02-13', 'YYYY-MM-DD').toString(), '');
    // Pack for ipc
    let ipcInit = await testInit.pack_for_ipc();
    // Send
    await app.electron.ipcRenderer.send('save', '0', ipcInit);
    // Open initiative from file 
    await app.client.click('#initOpen');
    // Switch to message manager tab
    await app.client.click('#messageTab');
    await app.client.waitUntilWindowLoaded();
    // Check that loaded values are correct 
    let title0 = await app.client.$('#messTitle0').getValue();
    expect(title0, 'Message title incorrect').to.be.a('string').that.equals('this is a message title');
    let description0 = await app.client.$('#aveDescription0').getValue();
    expect(description0, 'Avenue description incorrect').to.be.a('string').that.equals('Text Blast');
    let  date0 = await app.client.$('#aveDate0').getValue();
    expect(date0, 'Avenue date is incorrect').to.be.a('string').that.includes('2020-02-15');
    let  description1 = await app.client.$('#aveDescription1').getValue();
    expect(description1, 'Avenue description incorrect').to.be.a('string').that.equals('Email Blast');
    let  date1 = await app.client.$('#aveDate1').getValue();
    expect(date1, 'Avenue date is incorrect').to.be.a('string').that.includes('2020-02-13');
    // Check that things are loaded in proper container
    let container = await app.client.$('#messageIn').getHTML();
    expect(container, 'Message and avenue did not load correctly').to.equal('<div id="messageIn" class="messIn"><div class="message" id="message0"><p class="messTitle_heading" id="messTitle_heading">Title</p><textarea class="messTitle" id="messTitle0"></textarea><div class="aveDrop" id="aveDrop0"><div class="avenue" id="avenue0"><select class="aveDropdown" id="avenue_type0"><option value="Email">Email</option><option value="Text">Text</option><option value="Phone Call">Phone Call</option><option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="Card">Card</option><option value="Handout">Handout</option><option value="Poster">Poster</option><option value="Other">Other</option></select><p class="aveDescription_title" id="aveDescription_title">Description</p><p class="avePersons_title" id="avePersons_title">Person</p><p class="aveDate_title" id="aveDate_title">Date</p><p class="aveSent_box" id="aveSent_box0"><input class="aveSent_checkbox" id="aveSent_checkbox0" type="checkbox"><label class="aveSent_label" id="aveSent_label" for="aveSent_checkbox">Sent</label></p><textarea class="aveDescription" id="aveDescription0"></textarea><textarea class="avePersons" id="avePersons0"></textarea><input class="aveDate" id="aveDate0" type="date"><span class="aveDelete" id="aveDelete0">×</span></div></div><div class="aveBtnArray" id="aveBtnArray0"><svg class="messEdit" id="messEdit0" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> <path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z"></path></svg><svg class="messCopy" id="messCopy0" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> <path d="M8 2C7.44772 2 7 2.44772 7 3C7 3.55228 7.44772 4 8 4H10C10.5523 4 11 3.55228 11 3C11 2.44772 10.5523 2 10 2H8Z"></path> <path d="M3 5C3 3.89543 3.89543 3 5 3C5 4.65685 6.34315 6 8 6H10C11.6569 6 13 4.65685 13 3C14.1046 3 15 3.89543 15 5V11H10.4142L11.7071 9.70711C12.0976 9.31658 12.0976 8.68342 11.7071 8.29289C11.3166 7.90237 10.6834 7.90237 10.2929 8.29289L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071L10.2929 15.7071C10.6834 16.0976 11.3166 16.0976 11.7071 15.7071C12.0976 15.3166 12.0976 14.6834 11.7071 14.2929L10.4142 13H15V16C15 17.1046 14.1046 18 13 18H5C3.89543 18 3 17.1046 3 16V5Z"></path> <path d="M15 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H15V11Z"></path> </svg><span class="messDelete" id="messDelete0">×</span></div></div></div>');
    container = await app.client.$('#avenueIn').getHTML();
    expect(container, 'Avenue did not load correctly').to.equal('<div id="avenueIn" class="messIn"><div class="avenue" id="avenue1"><select class="aveDropdown" id="avenue_type1"><option value="Email">Email</option><option value="Text">Text</option><option value="Phone Call">Phone Call</option><option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="Card">Card</option><option value="Handout">Handout</option><option value="Poster">Poster</option><option value="Other">Other</option></select><p class="aveDescription_title" id="aveDescription_title">Description</p><p class="avePersons_title" id="avePersons_title">Person</p><p class="aveDate_title" id="aveDate_title">Date</p><p class="aveSent_box" id="aveSent_box1"><input class="aveSent_checkbox" id="aveSent_checkbox1" type="checkbox"><label class="aveSent_label" id="aveSent_label" for="aveSent_checkbox">Sent</label></p><textarea class="aveDescription" id="aveDescription1"></textarea><textarea class="avePersons" id="avePersons1"></textarea><input class="aveDate" id="aveDate1" type="date"><span class="aveDelete" id="aveDelete1">×</span></div></div>');
  });

  // Update index on save from editor
  it('should update index on editor save', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative of any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
    // Switch to message manager tab
    await app.client.click('#messageTab');
    await app.client.waitUntilWindowLoaded();
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
  
  // Verify toolbar copy button sends all contents to clipboard 
  it('should copy to clipboard', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative for any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
    // Switch to message manager tab
    await app.client.click('#messageTab');
    await app.client.waitUntilWindowLoaded();
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
    // Clean out Initiative of any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
    // Switch to message manager tab
    await app.client.click('#messageTab');
    await app.client.waitUntilWindowLoaded();
    // Add a message
    await app.client.click('#addMess');
    //Add an avenue
    await app.client.click('#addAve');
    await app.client.$('#aveDateModal').setValue('11-30-2022');
    await app.client.$('#aveDescModal').setValue('Test Avenue Description');
    await app.client.click('#aveSaveModal');
    // Drag avenue to message 
    await app.client.$('#avenue0').dragAndDrop('#aveDrop0');
    // Make sure avenue is in message dropbox
    let container = await app.client.$('#avenueIn').getHTML();
    //console.log(container);
    expect(container, 'Avenue still in avenueIn').to.equal('<div id="avenueIn" class="messIn"></div>');
    container = await app.client.$('#messageIn').getHTML()
    //console.log(container);
    expect(container, 'Avenue not in message dropbox').to.equal('<div id="messageIn" class="messIn"><div class="message" id="message0"><p class="messTitle_heading" id="messTitle_heading">Title</p><textarea class="messTitle" id="messTitle0"></textarea><div class="aveDrop" id="aveDrop0"><div class="avenue" id="avenue0"><select class="aveDropdown" id="avenue_type0"><option value="Email">Email</option><option value="Text">Text</option><option value="Phone Call">Phone Call</option><option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="Card">Card</option><option value="Handout">Handout</option><option value="Poster">Poster</option><option value="Other">Other</option></select><p class="aveDescription_title" id="aveDescription_title">Description</p><p class="avePersons_title" id="avePersons_title">Person</p><p class="aveDate_title" id="aveDate_title">Date</p><p class="aveSent_box" id="aveSent_box0"><input class="aveSent_checkbox" id="aveSent_checkbox0" type="checkbox"><label class="aveSent_label" id="aveSent_label" for="aveSent_checkbox">Sent</label></p><textarea class="aveDescription" id="aveDescription0"></textarea><textarea class="avePersons" id="avePersons0"></textarea><input class="aveDate" id="aveDate0" type="date"><span class="aveDelete" id="aveDelete0">×</span></div></div><div class="aveBtnArray" id="aveBtnArray0"><svg class="messEdit" id="messEdit0" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> <path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z"></path></svg><svg class="messCopy" id="messCopy0" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> <path d="M8 2C7.44772 2 7 2.44772 7 3C7 3.55228 7.44772 4 8 4H10C10.5523 4 11 3.55228 11 3C11 2.44772 10.5523 2 10 2H8Z"></path> <path d="M3 5C3 3.89543 3.89543 3 5 3C5 4.65685 6.34315 6 8 6H10C11.6569 6 13 4.65685 13 3C14.1046 3 15 3.89543 15 5V11H10.4142L11.7071 9.70711C12.0976 9.31658 12.0976 8.68342 11.7071 8.29289C11.3166 7.90237 10.6834 7.90237 10.2929 8.29289L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071L10.2929 15.7071C10.6834 16.0976 11.3166 16.0976 11.7071 15.7071C12.0976 15.3166 12.0976 14.6834 11.7071 14.2929L10.4142 13H15V16C15 17.1046 14.1046 18 13 18H5C3.89543 18 3 17.1046 3 16V5Z"></path> <path d="M15 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H15V11Z"></path> </svg><span class="messDelete" id="messDelete0">×</span></div></div></div>');
    // Drag back to avenueIn
    await app.client.$('#avenue0').dragAndDrop('#avenueIn');
    // Make sure avenue is in message dropbox
    container = await app.client.$('#avenueIn').getHTML();
    //console.log(container);
    expect(container, 'Avenue not in avenueIn').to.equal('<div id="avenueIn" class="messIn"><div class="avenue" id="avenue0"><select class="aveDropdown" id="avenue_type0"><option value="Email">Email</option><option value="Text">Text</option><option value="Phone Call">Phone Call</option><option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="Card">Card</option><option value="Handout">Handout</option><option value="Poster">Poster</option><option value="Other">Other</option></select><p class="aveDescription_title" id="aveDescription_title">Description</p><p class="avePersons_title" id="avePersons_title">Person</p><p class="aveDate_title" id="aveDate_title">Date</p><p class="aveSent_box" id="aveSent_box0"><input class="aveSent_checkbox" id="aveSent_checkbox0" type="checkbox"><label class="aveSent_label" id="aveSent_label" for="aveSent_checkbox">Sent</label></p><textarea class="aveDescription" id="aveDescription0"></textarea><textarea class="avePersons" id="avePersons0"></textarea><input class="aveDate" id="aveDate0" type="date"><span class="aveDelete" id="aveDelete0">×</span></div></div>');
    container = await app.client.$('#messageIn').getHTML()
    //console.log(container);
    expect(container, 'Avenue still in message dropbox').to.equal('<div id="messageIn" class="messIn"><div class="message" id="message0"><p class="messTitle_heading" id="messTitle_heading">Title</p><textarea class="messTitle" id="messTitle0"></textarea><div class="aveDrop" id="aveDrop0"></div><div class="aveBtnArray" id="aveBtnArray0"><svg class="messEdit" id="messEdit0" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> <path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z"></path></svg><svg class="messCopy" id="messCopy0" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> <path d="M8 2C7.44772 2 7 2.44772 7 3C7 3.55228 7.44772 4 8 4H10C10.5523 4 11 3.55228 11 3C11 2.44772 10.5523 2 10 2H8Z"></path> <path d="M3 5C3 3.89543 3.89543 3 5 3C5 4.65685 6.34315 6 8 6H10C11.6569 6 13 4.65685 13 3C14.1046 3 15 3.89543 15 5V11H10.4142L11.7071 9.70711C12.0976 9.31658 12.0976 8.68342 11.7071 8.29289C11.3166 7.90237 10.6834 7.90237 10.2929 8.29289L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071L10.2929 15.7071C10.6834 16.0976 11.3166 16.0976 11.7071 15.7071C12.0976 15.3166 12.0976 14.6834 11.7071 14.2929L10.4142 13H15V16C15 17.1046 14.1046 18 13 18H5C3.89543 18 3 17.1046 3 16V5Z"></path> <path d="M15 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H15V11Z"></path> </svg><span class="messDelete" id="messDelete0">×</span></div></div></div>');
  }); 
});
  
// Note: These tests us ipcs to verify functionality indirectly for things that are impossible otherwise with Spectron's limitations
/*describe('Test Communication with Main process', function () {
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
});*/
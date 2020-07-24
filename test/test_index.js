const Application = require('spectron').Application;
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const BrowserWindow = require('electron').BrowserWindow;
const path = require('path');
const chai = require('chai');
chai.use(require('chai-datetime'));
chai.use(require('chai-as-promised'));
const expect = require('chai').expect;
const templates = require('../src/objectTemplate.js');
const moment = require('moment'); // For date handling 

describe('Test Index process', function () {
  this.slow(10000);
  this.timeout(15000);
  let app;
  
  beforeEach( async () => {
    app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..')],
      //startTimeout: 10000
      });
    //console.log (app.getSettings());
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
    // Change title
    await app.client.$('#messTitle0').setValue('New Message Title')
    // Manually save
    await app.client.click('#messSave');
    // Dismiss popup
    await app.client.execute(function () {
      let elem = document.getElementsByClassName('swal-overlay swal-overlay--show-modal');
      elem[0].click();
    });
    // Verify message was added in ui 
    let container = await app.client.$('#messageIn').getHTML();
    //console.log(container);
    expect(container, 'Message does not exist').to.equal('<div id="messageIn" class="messIn"><div class="message" id="message0"><p class="messTitle_heading" id="messTitle_heading">Title</p><textarea class="messTitle" id="messTitle0"></textarea><div class="aveDrop" id="aveDrop0"></div><div class="aveBtnArray" id="aveBtnArray0"><svg class="messEdit" id="messEdit0" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> <path d="M17.4142 2.58579C16.6332 1.80474 15.3668 1.80474 14.5858 2.58579L7 10.1716V13H9.82842L17.4142 5.41421C18.1953 4.63316 18.1953 3.36683 17.4142 2.58579Z"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 6C2 4.89543 2.89543 4 4 4H8C8.55228 4 9 4.44772 9 5C9 5.55228 8.55228 6 8 6H4V16H14V12C14 11.4477 14.4477 11 15 11C15.5523 11 16 11.4477 16 12V16C16 17.1046 15.1046 18 14 18H4C2.89543 18 2 17.1046 2 16V6Z"></path></svg><svg class="messCopy" id="messCopy0" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> <path d="M8 2C7.44772 2 7 2.44772 7 3C7 3.55228 7.44772 4 8 4H10C10.5523 4 11 3.55228 11 3C11 2.44772 10.5523 2 10 2H8Z"></path> <path d="M3 5C3 3.89543 3.89543 3 5 3C5 4.65685 6.34315 6 8 6H10C11.6569 6 13 4.65685 13 3C14.1046 3 15 3.89543 15 5V11H10.4142L11.7071 9.70711C12.0976 9.31658 12.0976 8.68342 11.7071 8.29289C11.3166 7.90237 10.6834 7.90237 10.2929 8.29289L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071L10.2929 15.7071C10.6834 16.0976 11.3166 16.0976 11.7071 15.7071C12.0976 15.3166 12.0976 14.6834 11.7071 14.2929L10.4142 13H15V16C15 17.1046 14.1046 18 13 18H5C3.89543 18 3 17.1046 3 16V5Z"></path> <path d="M15 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H15V11Z"></path> </svg><span class="messDelete" id="messDelete0">×</span></div></div></div>');
    // Verify title is correct 
    let title = await app.client.$('#messTitle0').getValue()
    expect( title, 'Incorrect message title').to.be.a('string').that.equals('New Message Title');    
    // Delete message 
    await app.client.click('#messDelete0');
    // Click confirm on popup
    await app.client.execute(function () {
      let elem = document.getElementsByClassName("swal-button swal-button--confirm swal-button--danger");
      elem[0].click();
    });
    // Open initiative from file 
    await app.client.click('#defaultOpen');
    await app.client.click('#initOpen');
    await app.client.click('#messageTab');
    await app.client.waitUntilWindowLoaded();
    // Verify message is deleted in ui
    container = await app.client.$('#messageIn').getHTML();
    //console.log(container);
    expect(container, 'Message exists').to.equal('<div id="messageIn" class="messIn"></div>');
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
    // Verify avenue was added in ui 
    let container = await app.client.$('#avenueIn').getHTML();
    //console.log(container);
    expect(container, 'Avenue does not exist').to.equal('<div id="avenueIn" class="messIn"><div class="avenue" id="avenue0"><select class="aveDropdown" id="avenue_type0"><option value="Email">Email</option><option value="Text">Text</option><option value="Phone Call">Phone Call</option><option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="Card">Card</option><option value="Handout">Handout</option><option value="Poster">Poster</option><option value="Other">Other</option></select><p class="aveDescription_title" id="aveDescription_title">Description</p><p class="avePersons_title" id="avePersons_title">Person</p><p class="aveDate_title" id="aveDate_title">Date</p><p class="aveSent_box" id="aveSent_box0"><input class="aveSent_checkbox" id="aveSent_checkbox0" type="checkbox"><label class="aveSent_label" id="aveSent_label" for="aveSent_checkbox">Sent</label></p><textarea class="aveDescription" id="aveDescription0"></textarea><textarea class="avePersons" id="avePersons0"></textarea><input class="aveDate" id="aveDate0" type="date"><span class="aveDelete" id="aveDelete0">×</span></div></div>');
    // Verify date and description are correct 
    let date = await app.client.$('#aveDate0').getValue()
    expect( date, 'Incorrect avenue date').to.be.a('string').that.equals('2022-11-30');  
    let desc = await app.client.$('#aveDescription0').getValue()
    expect( desc, 'Incorrect avenue description').to.be.a('string').that.equals('This is an new avenue');      
    // Delete avenue 
    await app.client.click('#aveDelete0');
    // Click confirm on popup
    await app.client.execute(function () {
      let elem = document.getElementsByClassName("swal-button swal-button--confirm swal-button--danger");
      elem[0].click();
    });

    // Open initiative from file 
    await app.client.click('#defaultOpen');
    await app.client.click('#initOpen');
    await app.client.click('#messageTab');
    await app.client.waitUntilWindowLoaded();
    // Verify elements are deleted in ui
    container = await app.client.$('#avenueIn').getHTML();
    //console.log(container);
    expect(container, 'Avenue exists').to.equal('<div id="avenueIn" class="messIn"></div>');
  });

  // Add and remove group in ui  
  it('should add group, then delete it', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative for any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
    await app.client.waitUntilWindowLoaded();
    // Add group
    await app.client.click('#addGroup');
    // Verify avenue was added in ui 
    let container = await app.client.$('#groupIn').getHTML();
    //console.log(container);
    expect(container, 'Group does not exist').to.equal('<div id="groupIn"><div class="group" id="group0"><p class="group_title" id="groupName_title">Name</p><p class="group_title" id="groupContacts_title">Contacts</p><div class="grpBtnArray" id="grpBtnArray0"><span class="addContact" id="addContact0">+</span><svg class="copyEmails" id="copyEmails0" width="20" height="20" viewBox="0 0 20 20" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M2.00333 5.88355L9.99995 9.88186L17.9967 5.8835C17.9363 4.83315 17.0655 4 16 4H4C2.93452 4 2.06363 4.83318 2.00333 5.88355Z"></path><path d="M18 8.1179L9.99995 12.1179L2 8.11796V14C2 15.1046 2.89543 16 4 16H16C17.1046 16 18 15.1046 18 14V8.1179Z"></path></svg><svg class="copyPhones" id="copyPhones0" width="20" height="20" viewBox="0 0 20 20" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M2 3C2 2.44772 2.44772 2 3 2H5.15287C5.64171 2 6.0589 2.35341 6.13927 2.8356L6.87858 7.27147C6.95075 7.70451 6.73206 8.13397 6.3394 8.3303L4.79126 9.10437C5.90756 11.8783 8.12168 14.0924 10.8956 15.2087L11.6697 13.6606C11.866 13.2679 12.2955 13.0492 12.7285 13.1214L17.1644 13.8607C17.6466 13.9411 18 14.3583 18 14.8471V17C18 17.5523 17.5523 18 17 18H15C7.8203 18 2 12.1797 2 5V3Z"></path></svg><span class="groupDelete" id="groupDelete0">×</span></div><textarea class="name" id="name0"></textarea><div class="contacts" id="contacts0"></div></div></div>');
    // Delete group  
    await app.client.click('#groupDelete0');
    // Click confirm on popup
    await app.client.execute(function () {
      let elem = document.getElementsByClassName("swal-button swal-button--confirm swal-button--danger");
      elem[0].click();
    });

    // Open initiative from file 
    await app.client.click('#initOpen');
    await app.client.waitUntilWindowLoaded();
    // Verify elements are deleted in ui
    container = await app.client.$('#groupIn').getHTML();
    //console.log(container);
    expect(container, 'Group exists').to.equal('<div id="groupIn"></div>');
  });

  // Add and remove contact in ui  
  it('should add contact, then delete it', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative for any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
    await app.client.waitUntilWindowLoaded();
    // Add group and then contact
    await app.client.click('#addGroup');
    await app.client.click('#addContact0');
    // Verify avenue was added in ui 
    let container = await app.client.$('#contacts0').getHTML();
    //console.log(container);
    expect(container, 'Contact does not exist').to.equal('<div class="contacts" id="contacts0"><div class="contact" id="contact00"><p class="cont_title" id="contName_title">Name</p><p class="cont_title" id="contactEmail_title">Email</p><p class="cont_title" id="contactPhone_title">Phone</p><textarea class="contactIn" id="name00"></textarea><textarea class="contactIn" id="email00"></textarea><textarea class="contactIn" id="phone00"></textarea><span class="contactDelete" id="contactDelete00">×</span></div></div>');
    // Delete group  
    await app.client.click('#contactDelete00');
    // Click confirm on popup
    await app.client.execute(function () {
      let elem = document.getElementsByClassName("swal-button swal-button--confirm swal-button--danger");
      elem[0].click();
    });

    // Open initiative from file 
    await app.client.click('#initOpen');
    await app.client.waitUntilWindowLoaded();
    // Verify elements are deleted in ui
    container = await app.client.$('#contacts0').getHTML();
    //console.log(container);
    expect(container, 'Contacts exists').to.equal('<div class="contacts" id="contacts0"></div>');
  });

  // Copy emails  
  it('should copy emails', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative for any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
    await app.client.waitUntilWindowLoaded();
    // Add group and then contact
    
    await app.client.click('#addGroup');
    await app.client.click('#addContact0');
    await app.client.$('#email00').setValue('john245@email.com');
    await app.client.click('#addContact0');
    await app.client.$('#email01').setValue('phil375@email.com');
    await app.client.click('#addContact0');
    await app.client.$('#email02').setValue('bill612@email.com');
    
    // Copy emails to clipboard
    await app.client.click('#copyEmails0');
    // Verify content on clipboard 
    let content = await app.electron.clipboard.readText();
    //console.log(content);
    expect(content, 'Content on clipboard incorrect').to.be.a('string').that.includes('john245@email.com').and.includes('phil375@email.com').and.includes('bill612@email.com');
  });

  // Copy phone numbers  
  it('should copy phone numbers', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative for any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
    await app.client.waitUntilWindowLoaded();
    // Add group and then contact
    
    await app.client.click('#addGroup');
    await app.client.click('#addContact0');
    await app.client.$('#phone00').setValue('543-542-4556');
    await app.client.click('#addContact0');
    await app.client.$('#phone01').setValue('775-234-5634');
    await app.client.click('#addContact0');
    await app.client.$('#phone02').setValue('876-453-5455');
    
    // Copy emails to clipboard
    await app.client.click('#copyPhones0');
    // Verify content on clipboard 
    let content = await app.electron.clipboard.readText();
    //console.log(content);
    expect(content, 'Content on clipboard incorrect').to.be.a('string').that.includes('543-542-4556').and.includes('775-234-5634').and.includes('876-453-5455');
  });

  // Navigate calendar  
  it('should navigate calendar', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative for any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
      await app.client.waitUntilWindowLoaded();
    // Get starting dates
    let yearStart = await app.client.$('#year').getValue();
    let monthStart = await app.client.$('#month').getValue();
    let monthSplit = monthStart.split(' - ');
    let s1 = [yearStart, monthSplit[0]].join('.');
    let s2 = [yearStart, monthSplit[1]].join('.');
    //console.log('start and end date of date range: ', s1, s2);
      // Convert dates to moment objects for easier comparision 
      let dateStart1 = moment(s1, ['YYYY.MM.DD', 'YYYY.M.D']);
      let dateStart2 = moment(s2, ['YYYY.MM.DD', 'YYYY.M.D']);

    // Navigate forward
    await app.client.click('#next');
    // Split out each individual date and join with year
    let year = await app.client.$('#year').getValue();
    let month = await app.client.$('#month').getValue();
    monthSplit = month.split(' - ');
    let d1 = [year, monthSplit[0]].join('.');
    let d2 = [year, monthSplit[1]].join('.');
    //console.log('start and end date of date range: ', d1, d2);
      // Convert dates to moment objects for easier comparision 
      let date1 = moment(d1, ['YYYY.MM.DD', 'YYYY.M.D']);
      let date2 = moment(d2, ['YYYY.MM.DD', 'YYYY.M.D']);
      // Verify date changed correctly
      let n1 = dateStart1.clone();
      n1.add(1, 'M');
      let n2 = dateStart2.clone();
      n2.add(1, 'M');
      expect(date1.isSame(n1, 'month'), 'Beginning date incorrect').to.be.true;
      expect(date2.isSame(n2, 'month'), 'Ending date incorrect').to.be.true;
    // Navigate to today 
    await app.client.click('#today');
    // Split out each individual date and join with year
    year = await app.client.$('#year').getValue();
    month = await app.client.$('#month').getValue();
    monthSplit = month.split(' - ');
    d1 = [year, monthSplit[0]].join('.');
    d2 = [year, monthSplit[1]].join('.');
    //console.log('start and end date of date range: ', d1, d2);
      // Convert dates to moment objects for easier comparision 
      date1 = moment(d1, ['YYYY.MM.DD', 'YYYY.M.D']);
      date2 = moment(d2, ['YYYY.MM.DD', 'YYYY.M.D']);
      // Verify date changed correctly
      expect(date1.isSame(dateStart1, 'month'), 'Beginning date incorrect').to.be.true;
      expect(date2.isSame(dateStart2, 'month'), 'Ending date incorrect').to.be.true;
    // Navigate backward 
    await app.client.click('#prev');
    // Split out each individual date and join with year
    year = await app.client.$('#year').getValue();
    month = await app.client.$('#month').getValue();
    monthSplit = month.split(' - ');
    d1 = [year, monthSplit[0]].join('.');
    d2 = [year, monthSplit[1]].join('.');
    //console.log('start and end date of date range: ', d1, d2);
      // Convert dates to moment objects for easier comparision 
      date1 = moment(d1, ['YYYY.MM.DD', 'YYYY.M.D']);
      date2 = moment(d2, ['YYYY.MM.DD', 'YYYY.M.D']);
      // Verify date changed correctly
      n1 = dateStart1.clone();
      n1.subtract(1, 'M');
      n2 = dateStart2.clone();
      n2.subtract(1, 'M');
      expect(date1.isSame(n1, 'month'), 'Beginning date incorrect').to.be.true;
      expect(date2.isSame(n2, 'month'), 'Ending date incorrect').to.be.true;
  });

   // Add and remove goal in ui  
  it('should add goal, then delete it', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative for any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
      await app.client.waitUntilWindowLoaded();
    // Add Goal
    await app.client.click('#addGoal');
    await app.client.$('#goalDescModal').setValue('This is a new goal');
    await app.client.$('#goalStartModal').setValue('10-02-2022');
    await app.client.$('#goalUntilModal').setValue('10-07-2022');
    // Save from Popup
    await app.client.click('#goalSaveModal');
    // Verify avenue was added in ui 
    let container = await app.client.$('#goalIn').getHTML();
    //console.log(container);
    expect(container, 'Goal does not exist').to.equal('<div id="goalIn"><div class="goal" id="goal0"><p class="goal_title" id="goalFreq_title">Frequency</p><p class="goal_title" id="goalDesc_title">Description</p><p class="goal_title" id="goalReminder_title">Reminder</p><textarea class="goalDescription" id="goalDesc0"></textarea><select class="typeDropdown" id="goal_type0"><option value="Email">Email</option><option value="Text">Text</option><option value="Phone Call">Phone Call</option><option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="Card">Card</option><option value="Handout">Handout</option><option value="Poster">Poster</option><option value="Other">Other</option></select><div class="frequency" id="frequency0"><input class="startDate" id="startDate0" type="date"><p class="everyTitle">Every</p><input class="freqNum" id="freqNum0" type="number" value="1" min="1" max="30"><select class="freqDropdown" id="freq_type0"><option value="days">days</option><option value="weeks">weeks</option><option value="months">months</option><option value="years">years</option></select><p class="untilTitle">Until</p><input class="freqDate" id="freqDate0" type="date"></div><textarea class="reminder" id="reminder0"></textarea><span class="goalDelete" id="goalDelete0">×</span></div></div>');
    // Verify dates and description are correct 
    let desc = await app.client.$('#goalDesc0').getValue()
    expect( desc, 'Incorrect avenue description').to.be.a('string').that.equals('This is a new goal');    
    let startDate = await app.client.$('#startDate0').getValue()
    expect( startDate, 'Incorrect avenue date').to.be.a('string').that.equals('2022-10-02'); 
    let untilDate = await app.client.$('#freqDate0').getValue()
    expect( untilDate, 'Incorrect avenue date').to.be.a('string').that.equals('2022-10-07');   
    // Delete avenue 
    await app.client.click('#goalDelete0');
    // Click confirm on popup
    await app.client.execute(function () {
      let elem = document.getElementsByClassName("swal-button swal-button--confirm swal-button--danger");
      elem[0].click();
    });
  
    // Open initiative from file 
    await app.client.click('#initOpen');
    await app.client.waitUntilWindowLoaded();
    // Verify elements are deleted in ui
    container = await app.client.$('#goalIn').getHTML();
    //console.log(container);
    expect(container, 'Goal exists').to.equal('<div id="goalIn"></div>');
  });
  
  // Manual save 
  it('should save initiative tab on manual save', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative of any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
      await app.client.waitUntilWindowLoaded();
    // Add new initiative title and description 
    await app.client.$('#initName').setValue('New Initiative');
    await app.client.$('#initDescription').setValue('This is a test description');
    // Add a goal
    await app.client.click('#addGoal');
    await app.client.$('#goalDescModal').setValue('This is a new goal');
    await app.client.$('#goalStartModal').setValue('10-02-2022');
    await app.client.$('#goalUntilModal').setValue('10-07-2022');
    await app.client.$('#goalTypeModal').selectByVisibleText('Text');
      // Save from Popup
      await app.client.click('#goalSaveModal');
    // Add group and then contact
    await app.client.click('#addGroup');
    await app.client.click('#addContact0');
    await app.client.$('#name00').setValue('Bob Phisher');
    // Manually Save to fileSave
    await app.client.click('#initSave');
    // Dismiss popup
    await app.client.execute(function () {
      let elem = document.getElementsByClassName('swal-overlay swal-overlay--show-modal');
      elem[0].click();
    });
    // Open initiative from file 
    await app.client.click('#initOpen');
    await app.client.waitUntilWindowLoaded();
    // Verify initiative title and description
    let title = await app.client.$('#initName').getValue();
    expect(title, 'Initiative title incorrect').to.be.a('string').that.equals('New Initiative');
    let desc = await app.client.$('#initDescription').getValue();
    expect(desc, 'Initiative desctription incorrect').to.be.a('string').that.equals('This is a test description');
    // Verify initiative goal
    let goalDesc = await app.client.$('#goalDesc0').getValue();
    expect( goalDesc, 'Incorrect avenue description').to.be.a('string').that.equals('This is a new goal');    
    let startDate = await app.client.$('#startDate0').getValue();
    expect( startDate, 'Incorrect avenue date').to.be.a('string').that.equals('2022-10-02'); 
    let untilDate = await app.client.$('#freqDate0').getValue();
    expect( untilDate, 'Incorrect avenue date').to.be.a('string').that.equals('2022-10-07');
    let type = await app.client.$('#goal_type0').getValue();
    expect( type, 'Incorrect goal type').to.be.a('string').that.equals('Text');
    // Verify Group 
    let contName = await app.client.$('#name00').getValue();
    expect( contName, 'Incorrect contact name').to.be.a('string').that.equals('Bob Phisher');
  });

  // save from initiative tab on index close
  it('should save initiative tab on app close', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative of any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      await app.client.click('#initOpen');
    // Add new initiative title and description 
    await app.client.$('#initName').setValue('New Initiative');
    await app.client.$('#initDescription').setValue('This is a test description');
    // Add a goal
    await app.client.click('#addGoal');
    await app.client.$('#goalDescModal').setValue('This is a new goal');
    await app.client.$('#goalStartModal').setValue('10-02-2022');
    await app.client.$('#goalUntilModal').setValue('10-07-2022');
    await app.client.$('#goalTypeModal').selectByVisibleText('Text');
      // Save from Popup
      await app.client.click('#goalSaveModal');
    // Add group and then contact
    await app.client.click('#addGroup');
    await app.client.click('#addContact0');
    await app.client.$('#name00').setValue('Bob Phisher');
    // Quit the app
    await app.stop();
    await app.start();
    await app.client.waitUntilWindowLoaded();
    await app.client.click('#defaultOpen');
    await app.client.waitUntilWindowLoaded();
    // Verify initiative title and description
    let title = await app.client.$('#initName').getValue();
    expect(title, 'Initiative title incorrect').to.be.a('string').that.equals('New Initiative');
    let desc = await app.client.$('#initDescription').getValue();
    expect(desc, 'Initiative desctription incorrect').to.be.a('string').that.equals('This is a test description');
    // Verify initiative goal
    let goalDesc = await app.client.$('#goalDesc0').getValue();
    expect( goalDesc, 'Incorrect avenue description').to.be.a('string').that.equals('This is a new goal');    
    let startDate = await app.client.$('#startDate0').getValue();
    expect( startDate, 'Incorrect avenue date').to.be.a('string').that.equals('2022-10-02'); 
    let untilDate = await app.client.$('#freqDate0').getValue();
    expect( untilDate, 'Incorrect avenue date').to.be.a('string').that.equals('2022-10-07');
    let type = await app.client.$('#goal_type0').getValue();
    expect( type, 'Incorrect goal type').to.be.a('string').that.equals('Text');
    // Verify Group 
    let contName = await app.client.$('#name00').getValue();
    expect( contName, 'Incorrect contact name').to.be.a('string').that.equals('Bob Phisher');
  });

  // save on manual save 
 it('should save message manager tab from index on manual save', async () => {
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
    // Open initiative from file 
    await app.client.click('#defaultOpen');
    await app.client.click('#initOpen');
    await app.client.click('#messageTab');
    await app.client.waitUntilWindowLoaded();
    // Verify message title
    let messTitle = await app.client.$('#messTitle0').getValue();
    expect(messTitle, 'Message title incorrect').to.be.a('string').that.equals('This is a test Title');
    // Verify avenue description
    let date = await app.client.$('#aveDate0').getValue()
    expect( date, 'Incorrect avenue date').to.be.a('string').that.equals('2022-11-30'); 
    let desc = await app.client.$('#aveDescription0').getValue();
    expect(desc, 'Avenue desctription incorrect').to.be.a('string').that.equals('Test Avenue Description');
  });

  // save from index on index close
  it('should save message manager tab on app close', async () => {
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
    await app.start();
    // Open initiative from file 
    await app.client.waitUntilWindowLoaded();
    await app.client.click('#messageTab');
    await app.client.waitUntilWindowLoaded();
    // Verify message title
    let messTitle = await app.client.$('#messTitle0').getValue();
    expect(messTitle, 'Message title incorrect').to.be.a('string').that.equals('This is a test Title');
    // Verify avenue description
    let date = await app.client.$('#aveDate0').getValue()
    expect( date, 'Incorrect avenue date').to.be.a('string').that.equals('2022-11-30'); 
    let desc = await app.client.$('#aveDescription0').getValue();
    expect(desc, 'Avenue desctription incorrect').to.be.a('string').that.equals('Test Avenue Description');
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
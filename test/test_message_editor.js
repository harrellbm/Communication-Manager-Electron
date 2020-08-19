const Application = require('spectron').Application;
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');
const expect = require('chai').expect;
const templates = require('../src/objectTemplate.js');
const { constants } = require('fs');


describe('Test Message Editor Functionality', function () {
  this.slow(12000);
  this.timeout(30000);
  let app;

  beforeEach( async () => {
    app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..')]
    });
    //console.log(app)
    await app.start()
      .catch(console.error);
  });

  afterEach(function () {
    if (app && app.isRunning()) {
      return app.stop().then(function (){
        app = null;
      });
    };
  });
  

  /* will need to write test for multiple open editors eventually */

  // Unit test ipc to launch editor
  it('should open editor by ipc', async () => {
    await app.client.waitUntilWindowLoaded();
    // Make a message object that mimics being sent over ipc 
    let testMess = {};
    testMess.title = 'This is the updated message';
    testMess.greeting = 'Hi,';
    testMess.content = 'Change of plans.';
    testMess.signature = 'Your Boss';
    // Launch editor
    await app.electron.ipcRenderer.send('edit', '0', '0', testMess);
  
    let count = await app.client.getWindowCount();
    expect(count, 'Editor did not open').to.equal(2);
  });

  // Verify manual save  
  it('should launch editor and save manually', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative of any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      const initOpen = await app.client.$('#initOpen');
      await initOpen.click();
    // Switch to message manager tab 
    const messageTab = await app.client.$('#messageTab');
    await messageTab.click();
    // Add a message 
    const addMess = await app.client.$('#addMess');
    await addMess.click();
    // Click to open editor
    const messEdit0 = await app.client.$('#messEdit0');
    await messEdit0.click();
    await app.client.switchWindow('Message Editor');
    await app.client.waitUntilWindowLoaded();
    // Set message values
    const titleInput = await app.client.$('#title-input');
    await titleInput.setValue('This is a test Title'); 
    const greetingWrap = await app.client.$('#greeting');
    const greeting = await greetingWrap.$('div');
    await greeting.setValue('This is a test greeting');
    const contentWrap = await app.client.$('#content');
    const content = await contentWrap.$('div');
    await content.setValue('This is test content.  Blah Blah Blah.'); 
    const signatureWrap = await app.client.$('#signature');
    const signature = await signatureWrap.$('div');
    await signature.setValue('Testing that I can Sign it');

    // Save Ui
    const save = await app.client.$('#save');
    await save.click();

    // Quit the app
    await app.browserWindow.close(); // Close editor
    await app.client.switchWindow('Message Manager');
    // Click to re-open editor
    await messEdit0.click();
    await app.client.switchWindow('Message Editor');
    await app.client.waitUntilWindowLoaded();
    // Pull out message values 
    const messTitleElem = await app.client.$('#title-input');
    const messTitle = await messTitleElem.getValue();
    const messGreetingWrap= await app.client.$('#greeting');
    const messGreetingElem = await messGreetingWrap.$('div');
    const messGreeting = await messGreetingElem.getText();
    const messContentWrap= await app.client.$('#content');
    const messContentElem = await messContentWrap.$('div');
    const messContent = await messContentElem.getText();
    const messSignatureWrap = await app.client.$('#signature');
    const messSignatureElem = await messSignatureWrap.$('div');
    const messSignature = await messSignatureElem.getText();
    //console.log(messTitle, messGreeting, messContent, messSignature)
    // Verify message values are saved correctly 
    expect(messTitle, 'Message title incorrect').to.be.a('string').that.equals('This is a test Title');
    expect(messGreeting, 'Message greeting incorrect').to.be.a('string').that.equals('This is a test greeting');
    expect(messContent, 'Message content incorrect').to.be.a('string').that.equals('This is test content.  Blah Blah Blah.');
    expect(messSignature, 'Message signature incorrect').to.be.a('string').that.equals('Testing that I can Sign it');
  });

  // Verify old message load on editor launch 
  it('should save everything from editor on close and load on editor launch', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative of any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      const initOpen = await app.client.$('#initOpen');
      await initOpen.click();
    // Switch to message manager tab 
    const messageTab = await app.client.$('#messageTab');
    await messageTab.click();
    // Add a message 
    const addMess = await app.client.$('#addMess');
    await addMess.click();
    // Click to open editor
    const messEdit0 = await app.client.$('#messEdit0');
    await messEdit0.click();
    await app.client.switchWindow('Message Editor');
    await app.client.waitUntilWindowLoaded();
    // Set message values
    const titleInput = await app.client.$('#title-input');
    await titleInput.setValue('This is a test Title'); 
    const greetingWrap = await app.client.$('#greeting');
    const greetingElem = await greetingWrap.$('div');
    await greetingElem.setValue('This is a test greeting');
    const contentWrap = await app.client.$('#content');
    const contentElem = await contentWrap.$('div');
    await contentElem.setValue('This is test content.  Blah Blah Blah.'); 
    const signatureWrap = await app.client.$('#signature');
    const signatureElem = await signatureWrap.$('div');
    await signatureElem.setValue('Testing that I can Sign it');
    // Close editor
    await app.browserWindow.close();
    // Relaunch editor
    await app.client.switchWindow('Message Manager');
    await messEdit0.click();
    await app.client.switchWindow('Message Editor');
    await app.client.waitUntilWindowLoaded();
    // Verify load on editor launch 
    const titleWrap = await app.client.$('#title-input');
    const title = await titleWrap.getValue();
    const greeting = await greetingWrap.getText();
    const content = await contentWrap.getText();
    const signature = await signatureWrap.getText();
    expect(title, 'Message title incorrect').to.be.a('string').that.equals('This is a test Title');
    expect(greeting, 'Message greeting incorrect').to.be.a('string').that.equals('This is a test greeting');
    expect(content, 'Message content incorrect').to.be.a('string').that.equals('This is test content.  Blah Blah Blah.');
    expect(signature, 'Message signature incorrect').to.be.a('string').that.equals('Testing that I can Sign it');
  }); 

  // Verify load title from index with new message on editor launch  
  it('should load title from index on editor launch', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative of any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      const initOpen = await app.client.$('#initOpen');
      await initOpen.click();
    // Switch to message manager tab 
    const messageTab = await app.client.$('#messageTab');
    await messageTab.click();
    // Add a message and title 
    const addMess = await app.client.$('#addMess');
    await addMess.click();
    const messTitle0 = await app.client.$('#messTitle0');
    await messTitle0.setValue('This is a message Title');
    // Click to open editor
    const messEdit0 = await app.client.$('#messEdit0');
    await messEdit0.click();
    await app.client.switchWindow('Message Editor');
    await app.client.waitUntilWindowLoaded();
    const titleInput = await app.client.$('#title-input');
    let title = await titleInput.getValue();                   
    expect(title, 'Loaded message title incorrect').to.be.a('string').that.equals('This is a message Title');
  }); 

  // Verify editor copy button sents all contents to clipboard 
  it('should copy to clipboard', async () => {
    await app.client.waitUntilWindowLoaded();
    // Clean out Initiative of any old objects in file 
      let testInit = new templates.Initiative();
      // Pack for ipc
      let ipcInit = await testInit.pack_for_ipc();
      // Send
      await app.electron.ipcRenderer.send('save', '0', ipcInit);
      // Open initiative from file 
      const initOpen = await app.client.$('#initOpen');
      await initOpen.click();
    // Switch to message manager tab 
    const messageTab = await app.client.$('#messageTab');
    await messageTab.click();
    // Add a message 
    const addMess = await app.client.$('#addMess');
    await addMess.click();
    // Click to open editor
    const messEdit0 = await app.client.$('#messEdit0');
    await messEdit0.click();
    await app.client.switchWindow('Message Editor');
    await app.client.waitUntilWindowLoaded();
    // Set message values in editor
    const greetingWrap = await app.client.$('#greeting');
    const greetingElem = await greetingWrap.$('div');
    await greetingElem.setValue('This is a test greeting');
    const contentWrap = await app.client.$('#content');
    const contentElem = await contentWrap.$('div');
    await contentElem.setValue('This is test content.  Blah Blah Blah.'); 
    const signatureWrap = await app.client.$('#signature');
    const signatureElem = await signatureWrap.$('div');
    await signatureElem.setValue('Testing that I can Sign it');
    // Copy to clipboard  
    const copy = await app.client.$('#copy');
    await copy.click();
    // Verify content on clipboard 
    let content = await app.electron.clipboard.readHTML();
    //console.log(content);
    expect(content, 'Content on clipboard incorrect').to.be.a('string').that.includes('<p>This is a test greeting</p><p>This is test content.  Blah Blah Blah.</p><p>Testing that I can Sign it</p>');
  }); 
});

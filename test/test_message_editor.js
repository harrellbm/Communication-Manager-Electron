const Application = require('spectron').Application;
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');
const expect = require('chai').expect;
const fs = require('fs'); // For verifying file saves 


describe('Test Message Editor Functionality', function () {
  this.slow(12000);
  this.timeout(16000);
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
    // Switch to message manager tab 
    await app.client.click('#messageTab');
    // Add a message 
    await app.client.click('#addMess');
    // Click to open editor
    await app.client.click('#messEdit0');
    await app.client.switchWindow('Message Editor');
    await app.client.waitUntilWindowLoaded();
    // Set message values
    await Promise.all([ app.client.$('#title').setValue('This is a test Title'), 
                        app.client.$('#greeting').$('div').setValue('This is a test greeting'), 
                        app.client.$('#content').$('div').setValue('This is test content.  Blah Blah Blah.'), 
                        app.client.$('#signature').$('div').setValue('Testing that I can Sign it')
                        ]);

    // Save Ui
    await app.client.click('#save');

    // Read the file and verify things saved 
    let rawData = fs.readFileSync('data.json');
    let fileData = JSON.parse(rawData);
    //console.log(fileData.initiatives['0'].messages['0'].greeting);
    // Pull out message values 
    let messTitle = fileData.initiatives['0'].messages['0'].title;
    let messGreeting = fileData.initiatives['0'].messages['0'].greeting;
    let messContent = fileData.initiatives['0'].messages['0'].content;
    let messSignature = fileData.initiatives['0'].messages['0'].signature;
    // Verify message values are saved correctly 
    expect(messTitle, 'Message title incorrect').to.be.a('string').that.equals('This is a test Title');
    expect(messGreeting.ops[0].insert, 'Message greeting incorrect').to.be.a('string').that.equals('This is a test greeting\n');
    expect(messContent.ops[0].insert, 'Message content incorrect').to.be.a('string').that.equals('This is test content.  Blah Blah Blah.\n');
    expect(messSignature.ops[0].insert, 'Message signature incorrect').to.be.a('string').that.equals('Testing that I can Sign it\n');
  });

  // Verify save on editor close 
  it('should save everything from editor on close', async () => {
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
    await Promise.all([ app.client.$('#title').setValue('This is a test Title'), 
                        app.client.$('#greeting').$('div').setValue('This is a test greeting'), 
                        app.client.$('#content').$('div').setValue('This is test content.  Blah Blah Blah.'), 
                        app.client.$('#signature').$('div').setValue('Testing that I can Sign it')
                      ]);
    
    // Quit the app
    await app.browserWindow.close(); // Close editor
    await app.stop();
    // Read the file and verify things saved 
    let rawData = fs.readFileSync('data.json');
    let fileData = JSON.parse(rawData);
    //console.log(fileData.initiatives['0'].messages['0'].greeting);
    // Pull out message values 
    let messTitle = fileData.initiatives['0'].messages['0'].title;
    let messGreeting = fileData.initiatives['0'].messages['0'].greeting;
    let messContent = fileData.initiatives['0'].messages['0'].content;
    let messSignature = fileData.initiatives['0'].messages['0'].signature;
    // Verify message values are saved correctly 
    expect(messTitle, 'Message title incorrect').to.be.a('string').that.equals('This is a test Title');
    expect(messGreeting.ops[0].insert, 'Message greeting incorrect').to.be.a('string').that.equals('This is a test greeting\n');
    expect(messContent.ops[0].insert, 'Message content incorrect').to.be.a('string').that.equals('This is test content.  Blah Blah Blah.\n');
    expect(messSignature.ops[0].insert, 'Message signature incorrect').to.be.a('string').that.equals('Testing that I can Sign it\n');
  });

  // Verify load title from index with new message on editor launch  
  it('should load title from index on editor launch', async () => {
    await app.client.waitUntilWindowLoaded();
    // Switch to message manager tab 
    await app.client.click('#messageTab');
    // Add a message and title 
    await app.client.click('#addMess');
    await app.client.$('#messTitle0').setValue('This is a message Title');
    // Click to open editor
    await app.client.click('#messEdit0');
    await app.client.switchWindow('Message Editor');
    await app.client.waitUntilWindowLoaded();
    let title = await app.client.$('#title').getValue();                   
    expect(title, 'Loaded message title incorrect').to.be.a('string').that.equals('This is a message Title');
  }); 

  // Verify old message load on editor launch 
  it('should load an active message on editor launch', async () => {
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
    await Promise.all([ app.client.$('#title').setValue('This is a test Title'), 
                        app.client.$('#greeting').$('div').setValue('This is a test greeting'), 
                        app.client.$('#content').$('div').setValue('This is test content.  Blah Blah Blah.'), 
                        app.client.$('#signature').$('div').setValue('Testing that I can Sign it')
                      ]);
    // Close editor
    await app.browserWindow.close();
    // Relaunch editor
    await app.client.switchWindow('Message Manager');
    await app.client.click('#messEdit0');
    await app.client.switchWindow('Message Editor');
    await app.client.waitUntilWindowLoaded();
    // Verify load on editor launch 
    let title;
    let greeting;
    let content;
    let signature;
    await Promise.all([ app.client.$('#title').getValue(), 
                        app.client.$('#greeting').getText(), 
                        app.client.$('#content').getText(),
                        app.client.$('#signature').getText()
                  ]).then(function (values) {
                        //console.log(values)
                        title = values[0]
                        greeting = values[1]
                        content = values[2]
                        signature = values[3]
                        });
    expect(title, 'Message title incorrect').to.be.a('string').that.equals('This is a test Title');
    expect(greeting, 'Message greeting incorrect').to.be.a('string').that.equals('This is a test greeting');
    expect(content, 'Message content incorrect').to.be.a('string').that.equals('This is test content.  Blah Blah Blah.');
    expect(signature, 'Message signature incorrect').to.be.a('string').that.equals('Testing that I can Sign it');
  }); 

   // Verify save on editor close 
   it('should save everything from editor on close', async () => {
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
    await Promise.all([ app.client.$('#title').setValue('This is a test Title'), 
                        app.client.$('#greeting').$('div').setValue('This is a test greeting'), 
                        app.client.$('#content').$('div').setValue('This is test content.  Blah Blah Blah.'), 
                        app.client.$('#signature').$('div').setValue('Testing that I can Sign it')
                      ]);
    
    // Quit the app
    await app.browserWindow.close(); // Close editor
    await app.stop();
    // Read the file and verify things saved 
    let rawData = fs.readFileSync('data.json');
    let fileData = JSON.parse(rawData);
    //console.log(fileData.initiatives['0'].messages['0'].greeting);
    // Pull out message values 
    let messTitle = fileData.initiatives['0'].messages['0'].title;
    let messGreeting = fileData.initiatives['0'].messages['0'].greeting;
    let messContent = fileData.initiatives['0'].messages['0'].content;
    let messSignature = fileData.initiatives['0'].messages['0'].signature;
    
    // Verify message values are saved correctly 
    expect(messTitle, 'Message title incorrect').to.be.a('string').that.equals('This is a test Title');
    expect(messGreeting.ops[0].insert, 'Message greeting incorrect').to.be.a('string').that.equals('This is a test greeting\n');
    expect(messContent.ops[0].insert, 'Message content incorrect').to.be.a('string').that.equals('This is test content.  Blah Blah Blah.\n');
    expect(messSignature.ops[0].insert, 'Message signature incorrect').to.be.a('string').that.equals('Testing that I can Sign it\n');
  });

  // Verify editor copy button sents all contents to clipboard 
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
    // Copy to clipboard  
    await app.client.click('#copy');
    // Verify content on clipboard 
    let content = await app.electron.clipboard.readHTML();
    //console.log(content);
    expect(content, 'Content on clipboard incorrect').to.be.a('string').that.equals('<p>This is a test greeting</p><p>This is test content.  Blah Blah Blah.</p><p>Testing that I can Sign it</p>');
  }); 
});

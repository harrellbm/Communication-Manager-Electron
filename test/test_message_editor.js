const Application = require('spectron').Application;
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');
const expect = require('chai').expect;
const fs = require('fs'); // For verifying file saves 


describe('Test Message Editor Functionality', function () {
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
  
    let count = await app.client.getWindowCount()
    expect(count, 'Editor did not open').to.equal(2);
    });

  // Test save everything from an open editor on close 
  it('should save everything from editor on close', async () => {
    await app.client.waitUntilWindowLoaded();
    // Switch to message manager tab 
    await app.client.click('#messageTab');
    // Add a message 
    await app.client.click('#addMess');
    // Click to open editor
    await app.client.click('#messEdit0');
    await app.client.waitUntilWindowLoaded();
    await app.client.switchWindow('Message Editor');
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
    let messTitle;
    let messGreeting;
    let messContent;
    let messSignature;
    await Promise.all([ fileData.initiatives['0'].messages['0'].title, 
                        fileData.initiatives['0'].messages['0'].greeting, 
                        fileData.initiatives['0'].messages['0'].content,
                        fileData.initiatives['0'].messages['0'].signature
                      ]).then(function (values) {
                        messTitle = values[0]
                        messGreeting = values[1]
                        messContent = values[2]
                        messSignature = values[3]
                      });
    // Verify message values are saved correctly 
    expect(messTitle).to.be.a('string').that.equals('This is a test Title');
    expect(messGreeting.ops[0].insert).to.be.a('string').that.equals('This is a test greeting\n'); //.includes({ ops: [ { insert: 'This is a test greeting\n' } ] });
    expect(messContent.ops[0].insert).to.be.a('string').that.equals('This is test content.  Blah Blah Blah.\n');
    expect(messSignature.ops[0].insert).to.be.a('string').that.equals('Testing that I can Sign it\n');
    });

  // Test edit ipc to main, and manual save
  it('should launch editor and save manually', async () => {
    /* change to launch editor from ui */
    await app.client.waitUntilWindowLoaded();
    // Make a message object that mimics being sent over ipc 
    let testMess = {};
    testMess.title = 'This is the updated message';
    testMess.greeting = 'Hi,';
    testMess.content = 'Change of plans.';
    testMess.signature = 'Your Boss';
    // Launch editor
    await app.electron.ipcRenderer.send('edit','0', '0', testMess);
    //await app.client.waitUntilWindowLoaded();
    await app.client.switchWindow('Message Editor');

    // Set message values
    await Promise.all([ app.client.$('#title').setValue('This is a test Title'), 
                        app.client.$('#greeting').$('div').setValue('This is a test greeting'), 
                        app.client.$('#content').$('div').setValue('This is test content.  Blah Blah Blah.'), 
                        app.client.$('#signature').$('div').setValue('Testing that I can Sign it')
                        ]);

    // Save Ui
    await app.client.click('#save');
    
    // Clear Ui
    await Promise.all([ app.client.$('#title').setValue(''), 
                        app.client.$('#greeting').$('div').setValue(''),
                        app.client.$('#content').$('div').setValue(''), 
                        app.client.$('#signature').$('div').setValue('')
                      ]);
      // Verify elements clear
      let titleC;
      let greetingC;
      let contentC;
      let signatureC;
      await Promise.all([ app.client.$('#title').getValue(), 
                          app.client.$('#greeting').$('div').getValue(), 
                          app.client.$('#content').$('div').getValue(),
                          app.client.$('#signature').$('div').getValue()
                        ]).then(function (values) {
                          titleC = values[0]
                          greetingC = values[1]
                          contentC = values[2]
                          signatureC = values[3]
                        });
      expect(titleC).is.a('string').that.is.equal('');
      expect(greetingC).to.equal(null); // Note: Quill editors have a value of null when there is nothing in them 
      expect(contentC).to.equal(null);
      expect(signatureC).to.equal(null);

    /* verify from file that it all saved */ 
    
    });
  
});

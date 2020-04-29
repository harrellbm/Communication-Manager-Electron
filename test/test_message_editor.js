const Application = require('spectron').Application
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
const expect = require('chai').expect;


describe('Test Message Editor Functionality', function () {
  this.slow(6000);
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
    await app.electron.ipcRenderer.send('edit', '0', testMess);
  
    let count = await app.client.getWindowCount()
    expect(count, 'Editor did not open').to.equal(2);
    });

  // Test full launch editor, input, click save then open loop
  it('should successfuly implement full input, save, to open loop', async () => {
    await app.client.waitUntilWindowLoaded();
    // Make a message object that mimics being sent over ipc 
    let testMess = {};
    testMess.title = 'This is the updated message';
    testMess.greeting = 'Hi,';
    testMess.content = 'Change of plans.';
    testMess.signature = 'Your Boss';
    // Launch editor
    await app.electron.ipcRenderer.send('edit', '0', testMess);
    await app.client.waitUntilWindowLoaded();
    await app.client.switchWindow('Message Editor');

    /*let titleCon = await app.client.$('#title').setValue('This is a test Title');
    let greetCon = await app.client.$('#greeting').$('div').setValue('This is a test greeting');
    let contentCon = await app.client.$('#content').$('div').setValue('This is test content.  Blah Blah Blah.');
    let signCon = await app.client.$('#signature').$('div').setValue('Testing that I can Sign it');
    */
    
    // Set message values
    await Promise.all([ app.client.$('#title').setValue('This is a test Title'), 
                        app.client.$('#greeting').$('div').setValue('This is a test greeting'), 
                        app.client.$('#content').$('div').setValue('This is test content.  Blah Blah Blah.'), 
                        app.client.$('#signature').$('div').setValue('Testing that I can Sign it')
                        ])

    // Save Ui
    await app.client.click('#save');
    
    // Clear Ui
    await Promise.all([ app.client.$('#title').setValue(''), 
                        app.client.$('#greeting').$('div').setValue(''),
                        app.client.$('#content').$('div').setValue(''), 
                        app.client.$('#signature').$('div').setValue('')
                      ])
      // Verify elements clear
      let titleC
      let greetingC
      let contentC
      let signatureC
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
    /* figure out how to test loading 
    // Open saved ui 
    await app.client.click('#open');
      // Get Values from Message Editor window
      let title
      let greeting   
      let content
      let signature
      await Promise.all([ app.client.$('#title').getValue(), 
                          app.client.$('#greeting').getValue(), 
                          app.client.$('#content').getValue(),
                          app.client.$('#signature').getValue()
                        ]).then(function (values) {
                          title = values[0]
                          greeting = values[1]
                          content = values[2]
                          signature = values[3]
                        }) 
        // Verify message editor loaded
        //console.log('title: ', title , '\nGreeting: ', greeting, '\nContent: ', content, '\nSignature: ', signature)
        expect(title).to.be.a('string').that.is.equal('This is a test Title');
        expect(greeting).to.be.a('string').that.is.equal('This is a test greeting');
        expect(content).to.be.a('string').that.is.equal('This is test content.  Blah Blah Blah.');
        expect(signature).to.be.a('string').that.is.equal('Testing that I can Sign it'); */
    });
  
});

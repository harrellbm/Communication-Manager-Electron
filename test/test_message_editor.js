const Application = require('spectron').Application
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
const expect = require('chai').expect;


var app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')]
  })

describe('Test Message Editor Functionality', function () {
  this.slow(6000);
  this.timeout(15000);

  beforeEach(function () {
    return app.start()
    });

  afterEach(function () {
      return app.stop()
    });
  
  // Test full input, save to open loop
  it('should successfuly implement full input, save, to open loop', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.client.switchWindow('Message Editor');
    // Set message values
    await Promise.all([ app.client.$('#title').setValue('This is a test Title'), 
                        app.client.$('#greeting').setValue('This is a test greeting'), 
                        app.client.$('#content').setValue('This is test content.  Blah Blah Blah.'), 
                        app.client.$('#signature').setValue('Testing that I can Sign it')
                      ])

    // Save Ui
    await app.client.click('#save');
    
    // Clear Ui
    await Promise.all([ app.client.$('#title').setValue(''), 
                        app.client.$('#greeting').setValue(''),
                        app.client.$('#content').setValue(''), 
                        app.client.$('#signature').setValue('')
                      ])
      // Verify elements clear
      let titleC
      let greetingC
      let contentC
      let signatureC
      await Promise.all([ app.client.$('#title').getValue(), 
                          app.client.$('#greeting').getValue(), 
                          app.client.$('#content').getValue(),
                          app.client.$('#signature').getValue()
                        ]).then(function (values) {
                          titleC = values[0]
                          greetingC = values[1]
                          contentC = values[2]
                          signatureC = values[3]
                        });
      expect(titleC).is.a('string').that.is.equal('');
      expect(greetingC).is.a('string').that.is.equal('');
      expect(contentC).is.a('string').that.is.equal('');
      expect(signatureC).is.a('string').that.is.equal('');
    
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
        expect(signature).to.be.a('string').that.is.equal('Testing that I can Sign it');
    });
  
});

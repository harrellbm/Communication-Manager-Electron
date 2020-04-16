const Application = require('spectron').Application
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
const expect = require('chai').expect;


var app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')]
  })

describe('Test Communication with Main process', function () {
  this.slow(10000);
  this.timeout(20000);

  beforeEach(function () {
    return app.start()
    });

  afterEach(function () {
    if (app && app.isRunning()) {
      return app.stop()
    }
    });
  
  // Test ipc messages to main
  it('should send ipc to main', async () => {
    await app.client.waitUntilWindowLoaded();
    let file = await app.electron.ipcRenderer.send('open-file');
    console.log('file: ', file);
       /* expect(title).to.be.a('string').that.is.equal('This is a test Title');
        expect(greeting).to.be.a('string').that.is.equal('This is a test greeting');
        expect(content).to.be.a('string').that.is.equal('This is test content.  Blah Blah Blah.');
        expect(signature).to.be.a('string').that.is.equal('Testing that I can Sign it');*/
    });
  
});

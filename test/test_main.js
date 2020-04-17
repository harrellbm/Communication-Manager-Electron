const Application = require('spectron').Application
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
const expect = require('chai').expect;


var app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')]
  })

describe('Test Communication with Main process', function () {
  this.slow(5000);
  this.timeout(10000);

  beforeEach(function () {
    return app.start();
    });

  afterEach(function () {
      return app.stop();
    });
  
  // Test ipc messages to main
  it('should send ipc to main', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.electron.ipcRenderer.send('save', 'save save save')
    let file = await app.electron.ipcRenderer.sendSync('open-file');
    console.log('test return file: ', file);
       /* expect(title).to.be.a('string').that.is.equal('This is a test Title');
        expect(greeting).to.be.a('string').that.is.equal('This is a test greeting');
        expect(content).to.be.a('string').that.is.equal('This is test content.  Blah Blah Blah.');
        expect(signature).to.be.a('string').that.is.equal('Testing that I can Sign it');*/
    });
  
});

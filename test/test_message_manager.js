const Application = require('spectron').Application
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
const expect = require('chai').expect;
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

var app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')]
  })

describe('Application launch', function () {
  this.timeout(10000)

  beforeEach(function () {
    return app.start()
  })

  afterEach(function () {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it('shows an initial window', function () {
   
    //console.log(app.client)
    let test = app.client.click('#save')
        .then(function () { return app.client.getText('#title')}) 
    
    app.client.inspect
    })
})
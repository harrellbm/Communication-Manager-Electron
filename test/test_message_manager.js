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

  it('test clicking open button', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.client.click('#open');
    const title = await app.client.$('#title').getValue();
    const greeting = await app.client.$('#greeting').getValue();   
    const content = await app.client.$('#content').getValue();
    const signature = await app.client.$('#signature').getValue();
    console.log('title: ', title , '\nGreeting: ', greeting, '\nContent: ', content, '\nSignature: ', signature)
    expect(title).a('string').that.is.not.equal('');
    expect(greeting).a('string').that.is.not.equal('');
    expect(content).a('string').that.is.not.equal('');
    expect(signature).a('string').that.is.not.equal('');
    let ave = 1
    while (ave <= 3){
      let ave_type = await app.client.$(`//div/div/div[${ave}]/select`).getValue();
      let check = await app.client.$(`//div/div/div[${ave}]/p/input`).getAttribute('checked'); // will return null or true
      let description = await app.client.$(`//div/div/div[${ave}]/textarea[1]`).getValue();
      let person = await app.client.$(`//div/div/div[${ave}]/textarea[2]`).getValue();
      let date = await app.client.$(`//div/div/div[${ave}]/textarea[3]`).getValue();
      console.log(`Avenue ${ave}\nAvenue Type: `, ave_type, '\nCheck: ', check, '\nDescription: ', description, '\nPerson: ', person, '\nDates: ', date);
      ++ave
    };
  });
})
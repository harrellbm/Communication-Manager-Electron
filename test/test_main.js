const Application = require('spectron').Application;
const electronPath = require('electron'); // Require Electron from the binaries included in node_modules.
const path = require('path');
const chai = require('chai');
chai.use(require('chai-datetime'));
const expect = require('chai').expect;
const template = require('../src/objectTemplate.js');

describe('Test Main process functions', function () {
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
  
    /* --- Main related tests --- */

    // need save and open file from collection object 
  });
  

describe('Test Communication with Main process', function () {
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

  /* --- Index related ipc tests --- */
  // Test ipc messages to main
  it('should send data to save over ipc and receive it back from main', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.electron.ipcRenderer.send('save', 'Test data to main');
    let file = await app.electron.ipcRenderer.sendSync('open-file');
    //console.log('returned file: ', file);
    expect(file).to.be.a('string').that.equals('Test data to main');
    });
  
  // Test passing initiatives to main and then reloading
  it('should pack, send and then unpack an initiative', async () => {
    await app.client.waitUntilWindowLoaded();
    // Create initiative 
    let test_initiative;
    test_initiative = template.createInitiative();
    test_initiative.change_description('This is an initiavtive to communicate with people');
    test_initiative.change_group('my peeps')
    test_initiative.add_goal(5, 'text', 'tomorrow');
    test_initiative.add_message('This is the title of the first message', 'this is its greeting', 'this is the content.', 'this is the signature', ['avenue1', 'avenue2']);
    test_initiative.add_avenue('email', 'for all my peeps', 'Bob', true, 'message23', '2016-01-08T00:00:00-06:00');
    //console.log('Initiative before sending: ', test_initiative);
    // Pack for compatability with Json and then send to main over ipc
    let returned_initiative = test_initiative.pack_for_ipc();
    await app.electron.ipcRenderer.send('save', returned_initiative);
    // Open from file and repack into a new initiative object
    let file = await app.electron.ipcRenderer.sendSync('open-file');
    //console.log('returned file: ', file);
    let after_initiative;
    after_initiative = new template.Initiative();
    after_initiative.unpack_from_ipc(file);
    //console.log('unpacked initiative: ', after_initiative);
    expect(after_initiative, 'Initiative does not have proper keys').to.be.an('object').that.has.keys('description', 'groups', 'goals', 'messages', 'avenues', 'avenue_types');
    expect(after_initiative.description, 'Description is not correct').to.be.a('string').that.equals('This is an initiavtive to communicate with people');
    expect(after_initiative.groups, 'Groups are not correct').to.be.a('array').that.includes('my peeps');
    
    // Nested Goals object
    expect(after_initiative.goals, 'Goals is not a map').to.be.instanceOf(Map);
    let goal1 = after_initiative.goals.get('0');
    //console.log(goal1)
    expect(goal1, 'Not a goal object').to.be.instanceOf(template.Goal);
    expect(goal1, 'Goal does not have proper keys').to.have.keys('frequency', 'type', 'reminder');
    expect(goal1.frequency, 'Frequency is not correct').to.be.a('number').that.equals(5);
    expect(goal1.type, 'Type is not correct').to.be.a('string').that.equals('text');
    expect(goal1.reminder, 'Reminder is not correct').to.be.a('string').that.equals('tomorrow');
    
    // Nested Message object
    expect(after_initiative.messages, 'Messages is not a map').to.be.instanceOf(Map);
    let message1 = after_initiative.messages.get('0');
    //console.log(message1)
    expect(message1, 'Not a message object').to.be.instanceOf(template.Message);
    expect(message1, 'Message does not have proper keys').to.have.keys('title', 'greeting', 'content', 'signature', 'avenue_ids');
    expect(message1.title, 'Title is not correct').to.be.a('string').that.equals('This is the title of the first message');
    expect(message1.greeting, 'Greeting is not correct').to.be.a('string').that.equals('this is its greeting');
    expect(message1.content, 'Content is not correct').to.be.a('string').that.equals('this is the content.');
    expect(message1.signature, 'Signature is not correct').to.be.a('string').that.equals('this is the signature');
    expect(message1.avenue_ids, 'Avenue_ids is not correct').to.be.a('array').that.includes('avenue1').and.includes('avenue2');
    
    // Nested Avenues object
    expect(after_initiative.avenues, 'Avenues is not a map').to.be.instanceOf(Map);
    let avenue1 = after_initiative.avenues.get('0');
    //console.log(avenue1)
    expect(avenue1, 'Not an avenue object').to.be.instanceOf(template.Avenue);
    expect(avenue1, 'Avenue does not have proper keys').to.have.keys('avenue_type', 'description', 'person', 'date', 'sent', 'message_id');
    expect(avenue1.avenue_type, 'Avenue_type is not correct').to.be.a('string').that.equals('email');
    expect(avenue1.description, 'Description is not correct').to.be.a('string').that.equals('for all my peeps');
    expect(avenue1.person, 'Person is not correct').to.be.an('array').that.includes('Bob');
    expect(avenue1.date, 'Date is not correct').to.be.a('string').and.equals('2016-01-08T00:00:00-06:00');
    expect(avenue1.sent, 'Sent is not correct').to.be.true; 
    expect(avenue1.message_id, 'Message_id is not correct').to.be.a('string').that.includes('message23'); 

    // Avenue types
    expect(after_initiative.avenue_types, 'avenue types are not correct').to.be.a('array').that.includes('Email').and.includes('Text').and.includes('Facebook').and.includes('Instagram').and.includes('Handout').and.includes('Poster').and.includes('Other');
    });

  /* --- Editor Related ipc tests --- */
  // need to finish 
  // Test open editor
  it('should open editor by ipc', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.electron.ipcRenderer.send('edit', 'open editor');
    //expect(file).to.be.a('string').that.equals('Test data to main');
    });
});

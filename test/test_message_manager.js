const Application = require('spectron').Application
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
const expect = require('chai').expect;


var app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')]
  })

describe('Test Message Manager Functionality', function () {
  this.slow(10000);
  this.timeout(20000);

  beforeEach(function () {
    return app.start()
  })

  afterEach(function () {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  // Make sure add and delete buttons working 
  it('should add and delete an avenue', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.client.click('#add'); //click add button
    let avenue = await app.client.isExisting('//div/div/div[1]');
    expect(avenue).to.be.true;
    await app.client.click('//div/div/div[1]/input'); //click delete button
    avenue = await app.client.isExisting('//div/div/div[1]');
    expect(avenue).to.be.false;
    })

   // Test full input, save to open loop
  it('should successfuly implement full input, save, to open loop', async () => {
    await app.client.waitUntilWindowLoaded();
    // Set message values
    await Promise.all(
        app.client.$('#title').setValue('This is a test Title');
        app.client.$('#greeting').setValue('This is a test greeting');
        app.client.$('#content').setValue('This is test content.  Blah Blah Blah.');
        app.client.$('#signature').setValue('Testing that I can Sign it');
      );
    // Add and fill avenues
      // Avenue 1
      await app.client.click('#add');
      await app.client.$('#avenue_type0').selectByVisibleText('Text'); //Avenue Type 
      await app.client.click('#sent_checkbox0');; //Check Box 
      await app.client.$('#description0').setValue('This is a text'); //Description
      await app.client.$('#persons0').setValue('Bob'); //Person
      await app.client.$('#dates0').setValue('12-12-12'); //Date
      // Avenue 2
      await app.client.click('#add');
      await app.client.$('#avenue_type1').selectByVisibleText('Email'); //Avenue Type //need to figure out how to set select element // possibly use executeScript function
      await app.client.click('#sent_checkbox1'); //Check Box 
      await app.client.$('#description1').setValue('This is an email'); //Description
      await app.client.$('#persons1').setValue('Phil, Joe'); //Person
      await app.client.$('#dates1').setValue('9-9-9, 1-1-1'); //Date

    // Save Ui
    await app.client.click('#save');
    
    // Clear Ui
      // Clear main message frame
      await app.client.$('#title').setValue('');
      await app.client.$('#greeting').setValue('');
      await app.client.$('#content').setValue('');
      await app.client.$('#signature').setValue('');
        // Verify elements clear
        let titleC = await app.client.$('#title').getValue();
        let greetingC = await app.client.$('#greeting').getValue();   
        let contentC = await app.client.$('#content').getValue();
        let signatureC = await app.client.$('#signature').getValue();
        expect(titleC).is.a('string').that.is.equal('');
        expect(greetingC).is.a('string').that.is.equal('');
        expect(contentC).is.a('string').that.is.equal('');
        expect(signatureC).is.a('string').that.is.equal('');
      // Clear avenue frame
        // Clear avenue 1
        await app.client.click('#delete0'); //click delete button
          // Verify Avenue deleted 
          let ave1 = await app.client.isExisting('#avenue0');
          expect(ave1).to.be.false;
        // Clear avenue 2
        await app.client.click('#delete1'); //click delete button
          // Verify Avenue deleted 
          let ave2 = await app.client.isExisting('#avenue1');
          expect(ave2).to.be.false;

    // Open saved ui 
    await app.client.click('#open');
      // Main message window 
      let title = await app.client.$('#title').getValue();
      let greeting = await app.client.$('#greeting').getValue();   
      let content = await app.client.$('#content').getValue();
      let signature = await app.client.$('#signature').getValue();
        // Verify message frame loaded
        //console.log('title: ', title , '\nGreeting: ', greeting, '\nContent: ', content, '\nSignature: ', signature)
        expect(title).to.be.a('string').that.is.equal('This is a test Title');
        expect(greeting).to.be.a('string').that.is.equal('This is a test greeting');
        expect(content).to.be.a('string').that.is.equal('This is test content.  Blah Blah Blah.');
        expect(signature).to.be.a('string').that.is.equal('Testing that I can Sign it');
      // Verify avenue window loaded
        // Avenue 1
        let ave_type = await app.client.$('#avenue_type0').getText('option:checked');
        let check = await app.client.$('#sent_checkbox0').getAttribute('checked'); // will return null or true
        let description = await app.client.$('#description0').getValue();
        let person = await app.client.$('#persons0').getValue();
        let date = await app.client.$('#dates0').getValue();
        //console.log(`Avenue 1\nAvenue Type: `, ave_type, '\nChecked: ', check, '\nDescription: ', description, '\nPerson: ', person, '\nDates: ', date);
        expect(ave_type).to.be.a('string').that.is.equal('Text');
        expect(check).to.be.a('string').that.equals('true');
        expect(description).to.be.a('string').that.is.equal('This is a text');
        expect(person).to.be.a('string').that.is.equal('Bob');
        expect(date).to.be.a('string').that.is.equal('12-12-12');
        // Avenue 2
        let ave_type2 = await app.client.$('#avenue_type1').getText('option:checked');
        let check2 = await app.client.$('#sent_checkbox1').getAttribute('checked'); // will return null or true
        let description2 = await app.client.$('#description1').getValue();
        let person2 = await app.client.$('#persons1').getValue();
        let date2 = await app.client.$('#dates1').getValue();
        //console.log(`Avenue 2\nAvenue Type: `, ave_type2, '\nChecked: ', check2, '\nDescription: ', description2, '\nPerson: ', person2, '\nDates: ', date2);
        expect(ave_type2).to.be.a('string').that.is.equal('Email');
        expect(check2).to.be.a('string').that.equals('true');
        expect(description2).to.be.a('string').that.is.equal('This is an email');
        expect(person2).to.be.a('string').that.is.equal('Phil, Joe');
        expect(date2).to.be.a('string').that.is.equal('9-9-9, 1-1-1');
    });
  
  // Test avenue keys with dynamically adding and deleting avenues
  it('should keep keys consistent even with dynamic adding and deleting of avenues', async () => {
    await app.client.waitUntilWindowLoaded();
    // Add and fill initial avenues
      // Avenue 1
      await app.client.click('#add');
      await app.client.$('#avenue_type0').selectByVisibleText('Text'); //Avenue Type //need to figure out how to set select element // possibly use executeScript function
      await app.client.click('#sent_checkbox0');; //Check Box 
      await app.client.$('#description0').setValue('This is a text'); //Description
      await app.client.$('#persons0').setValue('Bob'); //Person
      await app.client.$('#dates0').setValue('12-12-12'); //Date
      // Avenue 2
      await app.client.click('#add');
      await app.client.$('#avenue_type1').selectByVisibleText('Email'); //Avenue Type //need to figure out how to set select element // possibly use executeScript function
      await app.client.click('#sent_checkbox1'); //Check Box 
      await app.client.$('#description1').setValue('This is an email'); //Description
      await app.client.$('#persons1').setValue('Phil, Joe'); //Person
      await app.client.$('#dates1').setValue('9-9-9, 1-1-1'); //Date

    // Save Ui
    await app.client.click('#save');
    
    // Delete avenue 1
    await app.client.click('#delete0'); //click delete button
      // Verify Avenue deleted 
      let ave1 = await app.client.isExisting('#avenue0');
      expect(ave1).to.be.false;

    // Add a third Avenue 
    await app.client.click('#add');
    await app.client.$('#avenue_type2').selectByVisibleText('Facebook'); //Avenue Type 
    await app.client.click('#sent_checkbox2');; //Check Box 
    await app.client.$('#description2').setValue('This is a facebook post'); //Description
    await app.client.$('#persons2').setValue('Tommy, Jill'); //Person
    await app.client.$('#dates2').setValue('3-27-20'); //Date

    // Save Ui
    await app.client.click('#save');

    // Open saved ui 
    await app.client.click('#open');
      // Verify avenue window loaded
        // Second Avenue
        let ave_type2 = await app.client.$('#avenue_type0').getText('option:checked');
        let check2 = await app.client.$('#sent_checkbox0').getAttribute('checked'); // will return null or true
        let description2 = await app.client.$('#description0').getValue();
        let person2 = await app.client.$('#persons0').getValue();
        let date2 = await app.client.$('#dates0').getValue();
        //console.log(`Avenue 2\nAvenue Type: `, ave_type2, '\nChecked: ', check2, '\nDescription: ', description2, '\nPerson: ', person2, '\nDates: ', date2);
        expect(ave_type2).to.be.a('string').that.is.equal('Email');
        expect(check2).to.be.a('string').that.equals('true');
        expect(description2).to.be.a('string').that.is.equal('This is an email');
        expect(person2).to.be.a('string').that.is.equal('Phil, Joe');
        expect(date2).to.be.a('string').that.is.equal('9-9-9, 1-1-1');
        // Third Avenue
        let ave_type3 = await app.client.$('#avenue_type1').getText('option:checked');
        let check3 = await app.client.$('#sent_checkbox1').getAttribute('checked'); // will return null or true
        let description3 = await app.client.$('#description1').getValue();
        let person3 = await app.client.$('#persons1').getValue();
        let date3 = await app.client.$('#dates1').getValue();
        //console.log(`Avenue 3\nAvenue Type: `, ave_type3, '\nChecked: ', check3, '\nDescription: ', description3, '\nPerson: ', person3, '\nDates: ', date3);
        expect(ave_type3).to.be.a('string').that.is.equal('Facebook');
        expect(check3).to.be.a('string').that.equals('true');
        expect(description3).to.be.a('string').that.is.equal('This is a facebook post');
        expect(person3).to.be.a('string').that.is.equal('Tommy, Jill');
        expect(date3).to.be.a('string').that.is.equal('3-27-20');
    });


  // test clicking open
  /*it('test clicking open button', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.client.click('#open');
    // Main message window 
    const title = await app.client.$('#title').getValue();
    const greeting = await app.client.$('#greeting').getValue();   
    const content = await app.client.$('#content').getValue();
    const signature = await app.client.$('#signature').getValue();
    console.log('title: ', title , '\nGreeting: ', greeting, '\nContent: ', content, '\nSignature: ', signature)
    expect(title).is.a('string').that.is.not.equal('');
    expect(greeting).is.a('string').that.is.not.equal('');
    expect(content).is.a('string').that.is.not.equal('');
    expect(signature).is.a('string').that.is.not.equal('');
    // Avenue window
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
  });*/
})

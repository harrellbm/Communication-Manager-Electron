const chai = require('chai');
chai.use(require('chai-datetime'));
const expect = require('chai').expect;
const templates = require('../src/objectTemplate.js');

describe("Initiative object", function () {
    /*
    Test initiative constructor
    */
    var test_initiative;
    
    this.beforeEach( function () {
        test_initiative = templates.createInitiative()
    })

    it('should have all initial Initiative object keys', function () {
       let test_initiative = templates.createInitiative();
       //console.log(test_initiative);
       expect(test_initiative, 'Missing a key').to.include.keys('description', 'groups', 'goals', 'messages', 'avenues')
       expect(test_initiative.description, 'description is not a string').is.a('string');
       expect(test_initiative.groups, 'groups is not an array').is.a('array');
       expect(test_initiative.goals, 'goals is not an object').is.an('object');
       expect(test_initiative.messages, 'messages is not an object').is.an('object');
       expect(test_initiative.avenues, 'avenues is not an object').is.an('object');
       expect(test_initiative.avenue_types, 'avenue_types is not an array').is.an('array');
    })

    // test adding avenue_type method 
    it('should add new avenue_type', () => {
        let new_avenue_type = 'Facebook'
        test_initiative.add_type(new_avenue_type)
        //console.log('avenue types', test_initiative.avenue_types)
        expect(test_initiative.avenue_types).to.be.an('array').that.includes('Facebook')
    })

    // test filling lowest id method 
    it('should return lowest available id', () => {
        // base test 
        //console.log(test_initiative);
        let test = test_initiative.id_fill();
        //console.log(test);
        expect(test).to.be.a('number').that.equals(0);

        // Test different fill scenerios 
            // Fill the center 
            test_initiative.avenues = {'0': 'avenue', '2': 'avenue3'};
            //console.log(test_initiative.avenues);
            test = test_initiative.id_fill(test_initiative.avenues);
            //console.log(test);
            expect(test).to.be.a('number').that.equals(1);
            // Fill the beginning 
            test_initiative.avenues = {'1': 'avenue2', '2': 'avenue3'};
            //console.log(test_initiative.avenues);
            test = test_initiative.id_fill(test_initiative.avenues);
            //console.log(test);
            expect(test).to.be.a('number').that.equals(0);
            // Fill the end 
            test_initiative.avenues = {'0': 'avenue0', '1': 'avenue1', '2': 'avenue2'};
            //console.log(test_initiative.avenues);
            test = test_initiative.id_fill(test_initiative.avenues);
            //console.log(test);
            expect(test).to.be.a('number').that.equals(3);
    })

    // test adding avenue method 
    it('should add a new avenue', () => {
        // test giving array of people, and message ids, as well as date object values
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, ['message1', 'message2', 'message3'], 2020, 9, 23, 12, 30);
        // test single string values for people, and message ids  
        test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message1', 2019, 11, 4, 9, 12);
        //console.log('new avenues', test_initiative.avenues);
        expect(test_initiative.avenues[0].avenue_type).to.be.an('string').that.includes('email');
        expect(test_initiative.avenues[0].description).to.be.an('string').that.includes('this is an email');
        expect(test_initiative.avenues[0].person).to.be.an('array').that.includes('Bob').and.includes('Jill');
        expect(test_initiative.avenues[0].sent).to.be.true;
        expect(test_initiative.avenues[0].message_id).to.be.an('array').that.includes('message1').and.includes('message2').and.includes('message3');
        expect(test_initiative.avenues[0].date).to.be.instanceOf(Date).and.equalTime(new Date('October 23 2020 12:30'));
        expect(test_initiative.avenues[1].avenue_type).to.be.an('string').that.includes('text');
        expect(test_initiative.avenues[1].description).to.be.an('string').that.includes('this is a text');
        expect(test_initiative.avenues[1].person).to.be.an('array').that.includes('Bill');
        expect(test_initiative.avenues[1].sent).to.be.true;
        expect(test_initiative.avenues[1].message_id).to.be.an('array').that.includes('message1');
        expect(test_initiative.avenues[1].date).to.be.instanceOf(Date).and.equalTime(new Date('December 4 2019 9:12'));
    })

    // test the return of the add avenue method 
    it('should return the id of the avenue from add avenue method return', () => {
        let id = test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, ['message1', 'message2', 'message3'], 2020, 9, 23, 12, 30);
        let id2 = test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message4', 2019, 11, 4, 9, 12);
        let id3 = test_initiative.add_avenue('facebook', 'this is a facebook post', 'Bonny', true, 'message2', 2031, 3, 1, 15, 49);
        //console.log('new avenues', test_initiative.avenues);
        //console.log('avenue 1 id: ', id, '\navenue 2 id: ', id2, '\navenue 3 id: ', id3);
        expect(id).to.equal(0);
        expect(id2).to.equal(1);
        expect(id3).to.equal(2);
    })

    // test removing avenue method 
    it('should remove an avenue then re-add', () => {
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, ['message1', 'message2', 'message3'], 2020, 9, 23, 12, 30);
        test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message4', 2019, 11, 4, 9, 12);
        //console.log('new avenues', test_initiative.avenues);
        test_initiative.remove_avenue(0);
        //console.log('removed avenues', test_initiative.avenues);
        expect(test_initiative.avenues[0]).to.not.exist;
        expect(test_initiative.avenues[1].avenue_type).to.be.an('string').that.includes('text');
        expect(test_initiative.avenues[1].description).to.be.an('string').that.includes('this is a text');
        expect(test_initiative.avenues[1].person).to.be.an('array').that.includes('Bill');
        expect(test_initiative.avenues[1].sent).to.be.true;
        expect(test_initiative.avenues[1].message_id).to.be.an('array').that.includes('message4');
        expect(test_initiative.avenues[1].date).to.be.instanceOf(Date).and.equalTime(new Date('December 4 2019 9:12'));

        // Test re-add avenue
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, ['message1', 'message2', 'message3'], 2020, 9, 23, 12, 30);
        expect(test_initiative.avenues[0]).to.exist
        expect(test_initiative.avenues[0].avenue_type).to.be.an('string').that.includes('email');
        expect(test_initiative.avenues[0].description).to.be.an('string').that.includes('this is an email');
        expect(test_initiative.avenues[0].person).to.be.an('array').that.includes('Bob').and.includes('Jill');
        expect(test_initiative.avenues[0].sent).to.be.true;
        expect(test_initiative.avenues[0].message_id).to.be.an('array').that.includes('message1').and.includes('message2').and.includes('message3');
        expect(test_initiative.avenues[0].date).to.be.instanceOf(Date).and.equalTime(new Date('October 23 2020 12:30'));

        // Test adding additional avenue after that
        test_initiative.add_avenue('facebook', 'this is a facebook post', ['Tim', 'Bently'], true, 'message1', 2000, 1, 5, 23, 00);
        expect(test_initiative.avenues[2]).to.exist
        expect(test_initiative.avenues[2].avenue_type).to.be.an('string').that.includes('facebook');
        expect(test_initiative.avenues[2].description).to.be.an('string').that.includes('this is a facebook post');
        expect(test_initiative.avenues[2].person).to.be.an('array').that.includes('Tim').and.includes('Bently');
        expect(test_initiative.avenues[2].sent).to.be.true;
        expect(test_initiative.avenues[2].message_id).to.be.an('array').that.includes('message1');
        expect(test_initiative.avenues[2].date).to.be.instanceOf(Date).and.equalTime(new Date('February 5 2000 23:00'));
        
    })
    
    it('should clear all avenues', () => {
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, ['message1', 'message2', 'message3'], 2020, 9, 23, 12, 30);
        test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message4', 2019, 11, 4, 9, 12);
        test_initiative.add_avenue('facebook', 'this is a facebook post', 'Bonny', true, 'message2', 2031, 3, 1, 15, 49);
        //console.log('new avenues', test_initiative.avenues);
        test_initiative.remove_all_avenues()
        //console.log('no avenues', test_initiative.avenues);
        expect(test_initiative.avenues[0]).to.not.exist;
        expect(test_initiative.avenues[1]).to.not.exist;
        expect(test_initiative.avenues[2]).to.not.exist;
    })
})

describe("Goal object", function () {
    /*
    Test Goal constructor
    */
   it('should have all initial Goal object keys', function () {
       let test_goal = templates.createGoal();
       //console.log(test_goal);
       expect(test_goal, 'Missing a key').to.include.keys('frequency', 'type', 'reminder')
       expect(test_goal.frequency, 'frequency is not a number').is.a('number');
       expect(test_goal.type, 'type is not a string').is.a('string');
       expect(test_goal.reminder, 'reminder is not an object').is.an('object');
    })

})

describe("Message object", function() {
    /*
    Tests all methods of the message class
    */
    var test_message;
    
    this.beforeEach( function () {
        test_message = templates.createMessage()
    })
    // Initiate Message - need to finish 
    it('should have all initial message object keys', () => {
        //console.log(test_message)
        expect(test_message).to.include.keys('title', 'greeting', 'content', 'signature', 'avenue_ids')
        expect(test_message.title, 'title is not a string').is.a('string');
        expect(test_message.greeting, 'greeting is not a string').is.a('string');
        expect(test_message.content, 'content is not a string').is.a('string');
        expect(test_message.signature, 'signature is not a string').is.a('string');
        expect(test_message.avenue_ids, 'avenue_ids is not an array').is.a('array');
    })

    // test change title method 
    it('should change title', () => {
        let new_title = 'This is a new Title'
        test_message.change_title(new_title)
        //console.log(test_message)
        expect(test_message.title, 'title was not changed').to.be.a('string').that.includes('This is a new Title')
    })

    // test change greeting method 
    it('should change greeting', () => {
        let new_greeting = 'This is a new Greeting'
        test_message.change_greeting(new_greeting)
        //console.log('Greeting', test_message)
        expect(test_message.greeting).to.be.a('string').that.includes('This is a new Greeting')
    })

    // test change content method 
    it('should change content', () => {
        let new_content = 'This is new Content'
        test_message.change_content(new_content)
        //console.log('Content', test_message)
        expect(test_message.content).to.be.a('string').that.includes('This is new Content')
    })
    
     // test change signature method 
    it('should change signature', () => {
        let new_signature = 'This is a new Signature'
        test_message.change_signature(new_signature)
        //console.log('Signature', test_message)
        expect(test_message.signature).to.be.a('string').that.includes('This is a new Signature')
    })
})

describe("Avenue object", function () {
    /*
    Test Avenue constructor
    */
   var test_avenue;
    
    this.beforeEach( function () {
        test_avenue = templates.createAvenue()
    })

   it('should have all initial Avenue object keys', function () {
       //console.log(test_avenue);
       expect(test_avenue, 'Missing a key').to.include.keys('avenue_type', 'description', 'person', 'date', 'sent', 'message_id')
       expect(test_avenue.avenue_type, 'avenue_type is not a string').is.a('string');
       expect(test_avenue.description, 'descrition is not a string').is.a('string');
       expect(test_avenue.person, 'person is not an array').is.an('array');
       expect(test_avenue.date, 'date is not a date').is.instanceOf(Date);
       expect(test_avenue.sent, 'sent is not a boolean').is.an('boolean');
       expect(test_avenue.message_id, 'message_id are not an array').is.an('array');

    })

    // test change avenue type
    it('should change avenue type', () => {
        test_avenue.change_avenue_type('Aliens');
        //console.log('new avenue types', test_avenue);
        expect(test_avenue.avenue_type).to.be.an('string').that.includes('Aliens');
        test_avenue.change_avenue_type('Facebook');
        expect(test_avenue.avenue_type).to.be.an('string').that.includes('Facebook');
    })
  
    // test return avenue types
    it('should return avenue type', () => {
        test_avenue.change_avenue_type('Facebook');
        // get the new type
        let avenue_type = test_avenue.get_avenue_type(0);
        //console.log('returned avenue type:', avenue_type);
        expect(avenue_type).to.be.an('string').that.includes('Facebook');
    })
  
    // test change description
    it('should change description', () => {
        test_avenue.change_description('This is a new description');
        //console.log('new description:', test_avenue);
        expect(test_avenue.description).to.be.an('string').that.includes('This is a new description');
    })
    
    // test return description
    it('should return description', () => {
        test_avenue.change_description('This is a new description');
        let avenue_description = test_avenue.get_description();
        //console.log('returned description:', avenue_description);
        expect(avenue_description).to.be.an('string').that.includes('This is a new description');
    })
    
    // test change person
    it('should change person responsible', () => {
        test_avenue.change_person('Jill');
        //console.log('new person', test_avenue);
        expect(test_avenue.person).to.be.an('string').that.includes('Jill');
    })
    
    // test add person - keep working on 
    it('should add a new person', () => {
        test_avenue.add_person('Jill');
        test_avenue.add_person('Bob');
        test_avenue.add_person('Tim');
        test_avenue.add_person('Bill');
        //console.log('new people:', test_avenue);
        expect(test_avenue.person).to.be.an('array').that.includes('Jill').and.includes('Bob').and.includes("Tim").and.includes('Bill');
    })
    
    // test return people
    it('should return people', () => {
        test_avenue.add_person('Joe');
        test_avenue.add_person('Phil');
        test_avenue.add_person('Jill');
        test_avenue.add_person('John');
        let avenue_people = test_avenue.get_people();
        //console.log('returned people', avenue_people);
        expect(avenue_people).to.be.a('string').that.includes('Joe').and.includes('Phil').and.includes('Jill').and.includes('John');
    })
   
    // test change date
    it('should change date', () => {
        //console.log('base date:', test_avenue.date);
        test_avenue.change_date(2019, 6, 30, 3, 49);
        //console.log('new dates', test_avenue.date);
        expect(test_avenue.date).to.be.instanceOf(Date).and.equalTime(new Date('July 30 2019 3:49'));
    })
   
    // test return dates
    it('should return dates', () => {
        test_avenue.change_date(2019, 6, 30, 3, 49);
        //console.log('changed date:', test_avenue.date);
        let avenue_date = test_avenue.get_dates();
        //console.log('returned date:', avenue_date);
        expect(avenue_date).to.be.instanceOf(Date).and.equalTime(new Date('July 30 2019 3:49'));
    })
  
    // test change sent
    it('should change sent value', () => {
        test_avenue.change_sent(true);
        //console.log('new sent', test_avenue);
        expect(test_avenue.sent).to.be.true;
    })
})
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
       expect(test_initiative.description, 'Description is not a string').is.a('string');
       expect(test_initiative.groups, 'Groups is not an array').is.a('array');
       expect(test_initiative.goals, 'Goals is not an object').is.instanceOf(Map);
       expect(test_initiative.messages, 'Messages is not an object').is.instanceOf(Map);
       expect(test_initiative.avenues, 'Avenues is not an object').is.instanceOf(Map);
       expect(test_initiative.avenue_types, 'Avenue_types is not an array').is.an('array');
    })

    // test filling lowest id method 
    it('should return lowest available id', () => {
        // base test 
        //console.log(test_initiative);
        let test = test_initiative.id_fill(test_initiative.avenues);
        //console.log(test);
        expect(test, 'Does not return proper id').to.be.a('string').that.equals('0');

        // Test different fill scenerios 
            // Fill the center 
            test_initiative.avenues.set('0', 'avenue1')
            test_initiative.avenues.set('2', 'avenue3');
            //console.log(test_initiative.avenues);
            test = test_initiative.id_fill(test_initiative.avenues);
            //console.log(test);
            expect(test, 'Does not return proper id').to.be.a('string').that.equals('1');
            // Fill the beginning
            test_initiative.avenues.clear()
            test_initiative.avenues.set('1', 'avenue2');
            test_initiative.avenues.set('2', 'avenue3');
            //console.log(test_initiative.avenues);
            test = test_initiative.id_fill(test_initiative.avenues);
            //console.log(test);
            expect(test, 'Does not return proper id').to.be.a('string').that.equals('0');
            // Fill the end 
            test_initiative.avenues.clear()
            test_initiative.avenues.set('0', 'avenue1');
            test_initiative.avenues.set('1', 'avenue2')
            test_initiative.avenues.set('2', 'avenue3');
            //console.log(test_initiative.avenues);
            test = test_initiative.id_fill(test_initiative.avenues);
            //console.log(test);
            expect(test, 'Does not return proper id').to.be.a('string').that.equals('3');
    })

    // test adding goal method 
    it('should add a new goal', () => {
        // test giving array of avenue ids
        test_initiative.add_goal(10, 'email', {'0': 'tomorrow', '1':'next week'});
        // test single string values for avenue ids  
        test_initiative.add_goal(5, 'text', {'0': 'tonight'});
        //console.log('new goals', test_initiative.goals);

        let goal0 = test_initiative.goals.get('0')
        //console.log('goal0:', test_initiative.goals.get('0'))
        expect(goal0.frequency, 'Goal does not have correct frequency').to.equal(10);
        expect(goal0.type, 'Goal does not have correct type').to.be.a('string').that.includes('email');
        expect(goal0.reminder, 'Goal does not have correct reminder').to.be.an('object').that.includes({'0': 'tomorrow'}).and.to.includes({'1': 'next week'});

        let goal1 = test_initiative.goals.get('1')
        //console.log('goal1:', test_initiative.goals.get('1'))
        expect(goal1.frequency, 'Goal does not have correct frequency').to.equal(5);
        expect(goal1.type, 'Goal does not have correct type').to.be.a('string').that.includes('text');
        expect(goal1.reminder, 'Goal does not have correct reminder').to.be.an('object').that.includes({'0': 'tonight'});

    })

    // test the return of the add goal method 
    it('should return the id of the goal from add goal method return', () => {
        let id = test_initiative.add_goal(10, 'email', {'0': 'tomorrow', '1':'next week'}); 
        let id1 = test_initiative.add_goal(5, 'text', {'0': 'tonight'});
        //console.log('new goals', test_initiative.goals);
        //console.log('goal 1 id: ', id, '\ngoal 2 id: ', id1);
        expect(id, "Does not return correct id").to.equal('0');
        expect(id1, "Does not return correct id").to.equal('1');
    })

    // test dynamic preformace of goals map 
    it('should remove a goal then re-add', () => {
        test_initiative.add_goal(10, 'email', {'0': 'tomorrow', '1':'next week'}); 
        test_initiative.add_goal(5, 'text', {'0': 'tonight'});
        //console.log('new goals', test_initiative.goals);
        // remove avenue and test
        test_initiative.goals.delete('0');
        //console.log('removed messages', test_initiative.goals);
        let goal0 = test_initiative.goals.has('0')
        expect(goal0).to.be.false;
        let goal1 = test_initiative.goals.get('1')
        //console.log('goal1:', test_initiative.goals.get('1'))
        expect(goal1.frequency, 'Goal does not have correct frequency').to.equal(5);
        expect(goal1.type, 'Goal does not have correct type').to.be.a('string').that.includes('text');
        expect(goal1.reminder, 'Goal does not have correct reminder').to.be.an('object').that.includes({'0': 'tonight'});
        
        // Test re-add avenue
        test_initiative.add_goal(10, 'email', {'0': 'tomorrow', '1':'next week'}); 
        //console.log('re-added message:', test_initiative.goals)
        goal0 = test_initiative.goals.get('0')
        //console.log('goal0:', test_initiative.goals.get('0'))
        expect(goal0.frequency, 'Goal does not have correct frequency').to.equal(10);
        expect(goal0.type, 'Goal does not have correct type').to.be.a('string').that.includes('email');
        expect(goal0.reminder, 'Goal does not have correct reminder').to.be.an('object').that.includes({'0': 'tomorrow'}).and.to.includes({'1': 'next week'});

        // Test adding additional avenue after that
        test_initiative.add_goal(9, 'facebook', {'0': 'in a month', '1':'when I need to'}); 
        //console.log('added additional goal:', test_initiative.goals) 
        goal2 = test_initiative.goals.get('2')
        //console.log('goal2:', test_initiative.goals.get('2'))
        expect(goal2.frequency, 'Goal does not have correct frequency').to.equal(9);
        expect(goal2.type, 'Goal does not have correct type').to.be.a('string').that.includes('facebook');
        expect(goal2.reminder, 'Goal does not have correct reminder').to.be.an('object').that.includes({'0': 'in a month'}).and.to.includes({'1': 'when I need to'});
    })

    // test adding message method 
    it('should add a new message', () => {
        // test giving array of avenue ids
        test_initiative.add_message('This is my title', 'Hi Hello,', 'This is my content. Blah blah blah.', 'Signed Me', ['avenue1', 'avenue2', 'avenue3']);
        // test single string values for avenue ids  
        test_initiative.add_message('Title of my message', 'Hello this is a greeting,', 'This is my message content.', 'This is my signature', 'avenue1');
        //console.log('new avenues', test_initiative.avenues);

        let message0 = test_initiative.messages.get('0')
        //console.log('message0:', test_initiative.messages.get('0'))
        expect(message0.title, 'Message does not have correct title').to.be.a('string').that.includes('This is my title');
        expect(message0.greeting, 'Message does not have correct greeting').to.be.a('string').that.includes('Hi Hello');
        expect(message0.content, 'Message does not have correct content').to.be.a('string').that.includes('This is my content. Blah blah blah.');
        expect(message0.signature, 'Message does not have correct signature').to.be.a('string').that.includes('Signed Me');
        expect(message0.avenue_ids, 'Message does not have correct avenue ids').to.be.an('array').that.includes('avenue1').and.includes('avenue2').and.includes('avenue3');
       

        let message1 = test_initiative.messages.get('1')
        //console.log('message1:', test_initiative.messages.get('1'))
        expect(message1.title, 'Message does not have correct title').to.be.a('string').that.includes('Title of my message');
        expect(message1.greeting, 'Message does not have correct').to.be.a('string').that.includes('Hello this is a greeting,');
        expect(message1.content, 'Message does not have correct content').to.be.a('string').that.includes('This is my message content.');
        expect(message1.signature, 'Message does not have correct signature').to.be.a('string').that.includes('This is my signature');
        expect(message1.avenue_ids, 'Message does not have correct avenue ids').to.be.an('array').that.includes('avenue1');
    })

    // test the return of the add message method 
    it('should return the id of the message from add message method return', () => {
        let id = test_initiative.add_message('This is my title', 'Hi Hello,', 'This is my content. Blah blah blah.', 'Signed Me', ['avenue1', 'avenue2', 'avenue3']); 
        let id1 = test_initiative.add_message('Title of my message', 'Hello this is a greeting,', 'This is my message content.', 'This is my signature', 'avenue1');
        //console.log('new messages', test_initiative.messages);
        //console.log('message 1 id: ', id, '\nmessage 2 id: ', id1);
        expect(id, "Does not return correct id").to.equal('0');
        expect(id1, "Does not return correct id").to.equal('1');
    })

    // test dynamic preformace of messages map 
    it('should remove a message then re-add', () => {
        test_initiative.add_message('This is my title', 'Hi Hello,', 'This is my content. Blah blah blah.', 'Signed Me', ['avenue1', 'avenue2', 'avenue3']); 
        test_initiative.add_message('Title of my message', 'Hello this is a greeting,', 'This is my message content.', 'This is my signature', 'avenue1');
        //console.log('new messages', test_initiative.messages);
        // remove avenue and test
        test_initiative.messages.delete('0');
        //console.log('removed messages', test_initiative.messages);
        let message0 = test_initiative.messages.has('0')
        expect(message0, 'message was not deleted').to.be.false;
        let message1 = test_initiative.messages.get('1')
        //console.log('message1:', test_initiative.messages.get('1'))
        expect(message1.title, 'Message does not have correct title').to.be.a('string').that.includes('Title of my message');
        expect(message1.greeting, 'Message does not have correct').to.be.a('string').that.includes('Hello this is a greeting,');
        expect(message1.content, 'Message does not have correct content').to.be.a('string').that.includes('This is my message content.');
        expect(message1.signature, 'Message does not have correct signature').to.be.a('string').that.includes('This is my signature');
        expect(message1.avenue_ids, 'Message does not have correct avenue ids').to.be.an('array').that.includes('avenue1');

        // Test re-add avenue
        test_initiative.add_message('This is my title', 'Hi Hello,', 'This is my content. Blah blah blah.', 'Signed Me', ['avenue1', 'avenue2', 'avenue3']);
        message0 = test_initiative.messages.get('0')
        //console.log('re-added message:', test_initiative.messages)
        expect(message0.title, 'Message does not have correct title').to.be.a('string').that.includes('This is my title');
        expect(message0.greeting, 'Message does not have correct greeting').to.be.a('string').that.includes('Hi Hello');
        expect(message0.content, 'Message does not have correct content').to.be.a('string').that.includes('This is my content. Blah blah blah.');
        expect(message0.signature, 'Message does not have correct signature').to.be.a('string').that.includes('Signed Me');
        expect(message0.avenue_ids, 'Message does not have correct avenue ids').to.be.an('array').that.includes('avenue1').and.includes('avenue2').and.includes('avenue3');

        // Test adding additional avenue after that
        test_initiative.add_message('This is another message title', 'Oh hi there,', 'I have some things to say.', 'Good day young man', 'avenue3');
        message2 = test_initiative.messages.get('2')
        //console.log('added additional message:', test_initiative.messages)
        expect(message2.title, 'Message does not have correct title').to.be.a('string').that.includes('This is another message title');
        expect(message2.greeting, 'Message does not have correct greeting').to.be.a('string').that.includes('Oh hi there,');
        expect(message2.content, 'Message does not have correct content').to.be.a('string').that.includes('I have some things to say.');
        expect(message2.signature, 'Message does not have correct signature').to.be.a('string').that.includes('Good day young man');
        expect(message2.avenue_ids, 'Message does not have correct avenue ids').to.be.an('array').that.includes('avenue3');
       
    })

    // test adding avenue method 
    it('should add a new avenue', () => {
        // test giving array of people, and message ids, as well as date object values
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, ['message1', 'message2', 'message3'], 2020, 9, 23, 12, 30);
        // test single string values for people, and message ids  
        test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message1', 2019, 11, 4, 9, 12);
        //console.log('new avenues', test_initiative.avenues);

        let avenue0 = test_initiative.avenues.get('0')
        //console.log('avenue0:', test_initiative.avenues.get('0'))
        expect(avenue0.avenue_type, 'Does not have proper avenue_type').to.be.an('string').that.includes('email');
        expect(avenue0.description, 'Does not have proper description').to.be.an('string').that.includes('this is an email');
        expect(avenue0.person, 'Does not have proper people').to.be.an('array').that.includes('Bob').and.includes('Jill');
        expect(avenue0.sent, 'Does not have proper sent value').to.be.true;
        expect(avenue0.message_id, 'Does not have proper message ids').to.be.an('array').that.includes('message1').and.includes('message2').and.includes('message3');
        expect(avenue0.date, 'Does not have proper date').to.be.instanceOf(Date).and.equalTime(new Date('October 23 2020 12:30'));

        let avenue1 = test_initiative.avenues.get('1')
        //console.log('avenue1:', test_initiative.avenues.get('1'))
        expect(avenue1.avenue_type,'Does not have proper avenue_type').to.be.an('string').that.includes('text');
        expect(avenue1.description, 'Does not have proper description').to.be.an('string').that.includes('this is a text');
        expect(avenue1.person, 'Does not have proper people').to.be.an('array').that.includes('Bill');
        expect(avenue1.sent, 'Does not have proper sent value').to.be.true;
        expect(avenue1.message_id, 'Does not have proper message ids').to.be.an('array').that.includes('message1');
        expect(avenue1.date, 'Does not have proper date').to.be.instanceOf(Date).and.equalTime(new Date('December 4 2019 9:12'));
    })

    // test the return of the add avenue method 
    it('should return the id of the avenue from add avenue method return', () => {
        let id = test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, ['message1', 'message2', 'message3'], 2020, 9, 23, 12, 30);
        let id1 = test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message4', 2019, 11, 4, 9, 12);
        //console.log('new avenues', test_initiative.avenues);
        //console.log('avenue 1 id: ', id, '\navenue 2 id: ', id1);
        expect(id,"Does not return correct id").to.equal('0');
        expect(id1, "Does not return correct id").to.equal('1');
    })

    // test dynamic preformace of avenues map  
    it('should remove an avenue then re-add', () => {
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, ['message1', 'message2', 'message3'], 2020, 9, 23, 12, 30);
        test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message4', 2019, 11, 4, 9, 12);
        //console.log('new avenues', test_initiative.avenues);
        // remove avenue and test
        test_initiative.avenues.delete('0');
        //console.log('removed avenues', test_initiative.avenues);
        let avenue0 = test_initiative.avenues.has('0')
        expect(avenue0).to.be.false;
        let avenue1 = test_initiative.avenues.get('1')
        //console.log('avenue1:', test_initiative.avenues.get('1'))
        expect(avenue1.avenue_type, 'Does not have proper avenue type').to.be.an('string').that.includes('text');
        expect(avenue1.description, 'Does not have proper description').to.be.an('string').that.includes('this is a text');
        expect(avenue1.person, 'Does not have proper people').to.be.an('array').that.includes('Bill');
        expect(avenue1.sent, 'Does not have proper sent value').to.be.true;
        expect(avenue1.message_id, 'Does not have proper message ids').to.be.an('array').that.includes('message4');
        expect(avenue1.date, 'Does not have proper date').to.be.instanceOf(Date).and.equalTime(new Date('December 4 2019 9:12'));

        // Test re-add avenue
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, ['message1', 'message2', 'message3'], 2020, 9, 23, 12, 30);
        avenue0 = test_initiative.avenues.get('0')
        //console.log('re-added avenue:', test_initiative.avenues)
        expect(avenue0).to.exist
        expect(avenue0.avenue_type, 'Does not have proper avenue type').to.be.an('string').that.includes('email');
        expect(avenue0.description, 'Does not have proper description').to.be.an('string').that.includes('this is an email');
        expect(avenue0.person, 'Does not have proper people').to.be.an('array').that.includes('Bob').and.includes('Jill');
        expect(avenue0.sent, 'Does not have proper sent value').to.be.true;
        expect(avenue0.message_id, 'Does not have proper message ids').to.be.an('array').that.includes('message1').and.includes('message2').and.includes('message3');
        expect(avenue0.date, 'Does not have proper date').to.be.instanceOf(Date).and.equalTime(new Date('October 23 2020 12:30'));

        // Test adding additional avenue after that
        test_initiative.add_avenue('facebook', 'this is a facebook post', ['Tim', 'Bently'], true, 'message1', 2000, 1, 5, 23, 00);
        //console.log('added asditional avenue:', test_initiative.avenues)
        let avenue2 = test_initiative.avenues.get('2')
        //console.log('avenue2:', test_initiative.avenues.get('2'))
        expect(avenue2, 'Avenue was not removed').to.exist
        expect(avenue2.avenue_type, 'Does not have proper avenue type').to.be.an('string').that.includes('facebook');
        expect(avenue2.description, 'Does not have proper description').to.be.an('string').that.includes('this is a facebook post');
        expect(avenue2.person, 'Does not have proper people').to.be.an('array').that.includes('Tim').and.includes('Bently');
        expect(avenue2.sent, 'Does not have proper sent value').to.be.true;
        expect(avenue2.message_id, 'Does not have proper message ids').to.be.an('array').that.includes('message1');
        expect(avenue2.date, 'Does not have proper date').to.be.instanceOf(Date).and.equalTime(new Date('February 5 2000 23:00'));
    })

   // test adding avenue_type method 
   it('should add new avenue_type', () => {
    let new_avenue_type = 'Facebook'
    test_initiative.add_type(new_avenue_type)
    //console.log('avenue types', test_initiative.avenue_types)
    expect(test_initiative.avenue_types, 'Does not have proper avenue type').to.be.an('array').that.includes('Facebook')
    })
});

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
});

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
        expect(test_message.title, 'Title was not changed').to.be.a('string').that.includes('This is a new Title')
    })

    // test change greeting method 
    it('should change greeting', () => {
        let new_greeting = 'This is a new Greeting'
        test_message.change_greeting(new_greeting)
        //console.log('Greeting', test_message)
        expect(test_message.greeting, 'Greeting was not changed').to.be.a('string').that.includes('This is a new Greeting')
    })

    // test change content method 
    it('should change content', () => {
        let new_content = 'This is new Content'
        test_message.change_content(new_content)
        //console.log('Content', test_message)
        expect(test_message.content, 'Content was not changed').to.be.a('string').that.includes('This is new Content')
    })
    
     // test change signature method 
    it('should change signature', () => {
        let new_signature = 'This is a new Signature'
        test_message.change_signature(new_signature)
        //console.log('Signature', test_message)
        expect(test_message.signature, 'Signature was not changed').to.be.a('string').that.includes('This is a new Signature')
    })
});

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
        test_avenue.change_avenue_type('Facebook');
        //console.log('new avenue types', test_avenue);
        expect(test_avenue.avenue_type, 'Avenue_type was not changed').to.be.an('string').that.includes('Facebook');
    })
  
    // test return avenue types
    it('should return avenue type', () => {
        test_avenue.change_avenue_type('Facebook');
        // get the new type
        let avenue_type = test_avenue.get_avenue_type(0);
        //console.log('returned avenue type:', avenue_type);
        expect(avenue_type, 'Avenue type was not returned').to.be.an('string').that.includes('Facebook');
    })
  
    // test change description
    it('should change description', () => {
        test_avenue.change_description('This is a new description');
        //console.log('new description:', test_avenue);
        expect(test_avenue.description, 'Description was not changed').to.be.an('string').that.includes('This is a new description');
    })
    
    // test return description
    it('should return description', () => {
        test_avenue.change_description('This is a new description');
        let avenue_description = test_avenue.get_description();
        //console.log('returned description:', avenue_description);
        expect(avenue_description, 'Avenue description was not returned').to.be.an('string').that.includes('This is a new description');
    })
    
    // test change person
    it('should change person responsible', () => {
        test_avenue.change_person('Jill');
        //console.log('new person', test_avenue);
        expect(test_avenue.person, 'Person was not changed').to.be.an('string').that.includes('Jill');
    })
    
    // test add person - keep working on 
    it('should add a new person', () => {
        test_avenue.add_person('Jill');
        test_avenue.add_person('Bob');
        test_avenue.add_person('Tim');
        test_avenue.add_person('Bill');
        //console.log('new people:', test_avenue);
        expect(test_avenue.person, 'New people were not added').to.be.an('array').that.includes('Jill').and.includes('Bob').and.includes("Tim").and.includes('Bill');
    })
    
    // test return people
    it('should return people', () => {
        test_avenue.add_person('Joe');
        test_avenue.add_person('Phil');
        test_avenue.add_person('Jill');
        test_avenue.add_person('John');
        let avenue_people = test_avenue.get_people();
        //console.log('returned people', avenue_people);
        expect(avenue_people, 'People were not returned').to.be.a('string').that.includes('Joe').and.includes('Phil').and.includes('Jill').and.includes('John');
    })
   
    // test change date
    it('should change date', () => {
        //console.log('base date:', test_avenue.date);
        test_avenue.change_date(2019, 6, 30, 3, 49);
        //console.log('new dates', test_avenue.date);
        expect(test_avenue.date).to.be.instanceOf(Date).and.equalTime(new Date('July 30 2019 3:49'));
    })
   
    // test return dates
    it('should return date', () => {
        test_avenue.change_date(2019, 6, 30, 3, 49);
        //console.log('changed date:', test_avenue.date);
        let avenue_date = test_avenue.get_dates();
        //console.log('returned date:', avenue_date);
        expect(avenue_date, 'Date was not returned').to.be.instanceOf(Date).and.equalTime(new Date('July 30 2019 3:49'));
    })
  
    // test change sent
    it('should change sent value', () => {
        test_avenue.change_sent(true);
        //console.log('new sent', test_avenue);
        expect(test_avenue.sent, 'Sent value was not changed').to.be.true;
    })
})
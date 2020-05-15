const chai = require('chai');
chai.use(require('chai-datetime'));
const expect = require('chai').expect;
const templates = require('../src/objectTemplate.js');

describe("initiativeCollection object", function () {
    /*
    Test initiativeCollection constructor
    */
    var test_collection;
    
    this.beforeEach( function () {
        test_collection = new templates.initiativeCollection();
    });

    it('should have all initial initiativeCollection object keys', function () {
       //console.log(test_collection);
       expect(test_collection, 'Missing a key').to.include.keys('initiatives');
       expect(test_collection.initiatives, 'Initiatives is not a Map').is.instanceOf(Map);
    });
    
    // test filling lowest id method 
    it('should return lowest available id', () => {
        // base test 
        //console.log(test_collection);
        let test = test_collection.id_fill(test_collection.initiatives);
        //console.log(test);
        expect(test, 'Does not return proper id').to.be.a('string').that.equals('0');

        // Test different fill scenerios 
            // Fill the center 
            test_collection.initiatives.set('0', 'initiative1')
            test_collection.initiatives.set('2', 'initiative3');
            //console.log(test_collection.initiatives);
            test = test_collection.id_fill(test_collection.initiatives);
            //console.log(test);
            expect(test, 'Does not return proper id').to.be.a('string').that.equals('1');
            // Fill the beginning
            test_collection.initiatives.clear()
            test_collection.initiatives.set('1', 'initiative2');
            test_collection.initiatives.set('2', 'initiative3');
            //console.log(test_collection.initiatives);
            test = test_collection.id_fill(test_collection.initiatives);
            //console.log(test);
            expect(test, 'Does not return proper id').to.be.a('string').that.equals('0');
            // Fill the end 
            test_collection.initiatives.clear()
            test_collection.initiatives.set('0', 'initiative1');
            test_collection.initiatives.set('1', 'initiative2')
            test_collection.initiatives.set('2', 'initiative3');
            //console.log(test_collection.initiatives);
            test = test_collection.id_fill(test_collection.initiatives);
            //console.log(test);
            expect(test, 'Does not return proper id').to.be.a('string').that.equals('3');
    });

    // test adding initiative method 
    it('should add a new initiative', () => {
        // test giving array of avenue ids
        test_collection.add_initiative('my init', 'this is a new initiative', ['my peeps', 'everyone']);
        //console.log('new initiative', test_collection.initiatives);

        let initiative0 = test_collection.initiatives.get('0')
        //console.log('initiative0:', test_collection.initiatives.get('0'))
        expect(initiative0, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative0.name, 'Does not have the proper name').to.be.a('string').that.equals('my init');
        expect(initiative0.description, 'Does not have the proper description').to.be.a('string').that.equals('this is a new initiative');
        expect(initiative0.groups, 'Does not have the proper groups').to.be.an('array').that.includes('my peeps').and.includes('everyone');
    });

    // test the return id of the add initiative method 
    it('should return the id of the initiative from add initiative method return', () => {
        let id = test_collection.add_initiative('my init', 'this is a new initiative', ['my peeps', 'everyone']);
        
        //console.log('new initiative', test_collection.initiatives);
        expect(id, "Does not return correct id").to.equal('0');
    });

    // test dynamic preformace of initiativeCollection map 
    it('should remove an initiative then re-add', () => {
        test_collection.add_initiative('my init', 'This is the first initiative', 'some people');
        test_collection.add_initiative('Youth', 'this is a new initiative', ['my peeps', 'everyone']);
        //console.log('new initiative: ', test_collection.initiatives);
        // remove initiative and test
        test_collection.initiatives.delete('0');
        //console.log('removed initiative: ', test_collection.initiatives);
        let initiative0 = test_collection.initiatives.has('0');
        expect(initiative0).to.be.false;
        let initiative1 = test_collection.initiatives.get('1');
        //console.log('initiative1:', test_collection.initiatives.get('1'));
        expect(initiative1, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative1.name, 'Does not have the proper name').to.be.a('string').that.equals('Youth');
        expect(initiative1.description, 'Does not have the proper description').to.be.a('string').that.equals('this is a new initiative');
        expect(initiative1.groups, 'Does not have the proper groups').to.be.an('array').that.includes('my peeps').and.includes('everyone');
        // Test re-add avenue
        test_collection.add_initiative('my init', 'This is the first initiative', 'some people');
        //console.log('re-added initiative: ', test_collection.initiatives);
        initiative0 = test_collection.initiatives.get('0');
        //console.log('initiative0:',  test_collection.initiatives.get('0'));
        expect(initiative0, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative0.name, 'Does not have the proper name').to.be.a('string').that.equals('my init');
        expect(initiative0.description, 'Does not have the proper description').to.be.a('string').that.equals('This is the first initiative');
        expect(initiative0.groups, 'Does not have the proper groups').to.be.an('array').that.includes('some people');
        // Test adding additional avenue after that
        test_collection.add_initiative('Golf Team','This is another initiative', 'my best friends');
        //console.log('added additional initiative: ', test_collection.initiatives) 
        initiative2 = test_collection.initiatives.get('2');
        //console.log('initiative2: ', test_collection.initiatives.get('2'))
        expect(initiative2, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative2.name, 'Does not have the proper name').to.be.a('string').that.equals('Golf Team');
        expect(initiative2.description, 'Does not have the proper description').to.be.a('string').that.equals('This is another initiative');
        expect(initiative2.groups, 'Does not have the proper groups').to.be.an('array').that.includes('my best friends');
    });

    // Test update collection with initiative coming from ipc/file
    it('should update the collection with new initiative values', () => {
        // Add an initial initiative 
        test_collection.add_initiative('my init', 'this is a new initiative', ['my peeps', 'everyone']);
        //console.log('initial initiative: ', test_collection.initiatives);
        initiative0 = test_collection.initiatives.get('0');
        expect(initiative0, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative0.name, 'Does not have the proper name').to.be.a('string').that.equals('my init');
        expect(initiative0.description, 'Does not have the proper description').to.be.a('string').that.equals('this is a new initiative');
        expect(initiative0.groups, 'Does not have the proper groups').to.be.an('array').that.includes('my peeps').and.includes('everyone');
        
        // Make an updated initiative and mimic being sent over ipc
        let testInit = new templates.Initiative();
        testInit.change_name('new initiative name')
        testInit.change_description('This is the updated description');
        testInit.change_group('Ben my roomate');
        let updateInit = testInit.pack_for_ipc();
        // Update initative in the collection
        test_collection.update_init('0', updateInit);
        //console.log('updated initiative: ', test_collection.initiatives);
        initiative0 = test_collection.initiatives.get('0');
        expect(initiative0, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative0.name, 'Does not have the proper name').to.be.a('string').that.equals('new initiative name');
        expect(initiative0.description, 'Does not have the proper description').to.be.a('string').that.equals('This is the updated description');
        expect(initiative0.groups, 'Does not have the proper groups').to.be.an('array').that.includes('Ben my roomate');
    });

    // Test update message coming from ipc
    it('should update it\'s respective initiative with new message value in the collection', () => {
        // Add an initial initiative and message
        test_collection.add_initiative('my init', 'this is a new initiative', ['my peeps', 'everyone']);
        let initiative = test_collection.initiatives.get('0');
        initiative.add_message('This is a message', 'Hello,', 'Lets make sure we get the project done.', 'Your Boss', ['avenue2', 'avenue3']);
        //console.log('initial initiative: ', test_collection.initiatives);
        let initiative0 = test_collection.initiatives.get('0');
        expect(initiative0, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative0.name, 'Does not have the proper name').to.be.a('string').that.equals('my init');
        expect(initiative0.description, 'Does not have the proper description').to.be.a('string').that.equals('this is a new initiative');
        expect(initiative0.groups, 'Does not have the proper groups').to.be.an('array').that.includes('my peeps').and.includes('everyone');
        //console.log('initial message: ', initiative0.messages)
        let message0 = initiative0.messages.get('0')
        expect(message0.title, 'Message does not have correct title').to.be.a('string').that.includes('This is a message');
        expect(message0.greeting, 'Message does not have correct greeting').to.be.a('string').that.includes('Hello,');
        expect(message0.content, 'Message does not have correct content').to.be.a('string').that.includes('Lets make sure we get the project done.');
        expect(message0.signature, 'Message does not have correct signature').to.be.a('string').that.includes('Your Boss');
        expect(message0.avenue_ids, 'Message does not have correct avenue ids').to.be.an('array').that.includes('avenue2').and.includes('avenue3');
        
        // Make a message update that mimics being sent over ipc 
        let testMess = {}
        testMess.title = 'This is the updated message';
        testMess.greeting = 'Hi,';
        testMess.content = 'Change of plans.';
        testMess.signature = 'Your Boss';

        
        // Update initative in the collection
        test_collection.update_mess('0', '0', testMess);
        //console.log('same initiative: ', test_collection.initiatives);
        initiative0 = test_collection.initiatives.get('0');
        expect(initiative0, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative0.name, 'Does not have the proper name').to.be.a('string').that.equals('my init');
        expect(initiative0.description, 'Does not have the proper description').to.be.a('string').that.equals('this is a new initiative');
        expect(initiative0.groups, 'Does not have the proper groups').to.be.an('array').that.includes('my peeps').and.includes('everyone');
        //console.log('updated message: ', initiative0.messages)
        message0 = initiative0.messages.get('0')
        expect(message0.title, 'Message does not have correct title').to.be.a('string').that.includes('This is the updated message');
        expect(message0.greeting, 'Message does not have correct greeting').to.be.a('string').that.includes('Hi,');
        expect(message0.content, 'Message does not have correct content').to.be.a('string').that.includes('Change of plans.');
        expect(message0.signature, 'Message does not have correct signature').to.be.a('string').that.includes('Your Boss');
        expect(message0.avenue_ids, 'Message does not have correct avenue ids').to.be.an('array').that.includes('avenue2').and.includes('avenue3');
    });

    // Test pack for Json or ipc 
    it('should convert and pack all initiatives into vanilla objects', () => {
        test_collection.add_initiative();
        test_collection.add_initiative();
        //console.log('Collection before packing:', test_collection);
        let returned_collection = test_collection.pack_for_file();
        //console.log('Packed collection:', returned_collection);
        expect(returned_collection, 'Collection does not have proper keys').to.be.an('object').that.has.keys('initiatives');
        expect(returned_collection.initiatives[0], 'initiative does not have proper keys').to.be.an('object').that.has.keys('name', 'description', 'groups', 'goals', 'messages', 'avenues', 'avenue_types');
        expect(returned_collection.initiatives[1], 'initiative does not have proper keys').to.be.an('object').that.has.keys('name', 'description', 'groups', 'goals', 'messages', 'avenues', 'avenue_types');
    });
    
    // test converting back to maps from json string 
    it('should unpack collection', () => {
        test_collection.add_initiative();
        test_collection.add_initiative();
        //console.log('Collection before packing:', test_collection);
        returned_collection = test_collection.pack_for_file();
        test_collection.unpack_from_file(returned_collection);
        //console.log('converted objects:', test_collection);
        expect(test_collection, 'Collection does not have proper keys').to.be.instanceOf(templates.initiativeCollection).that.has.keys('initiatives');
        let initiative0 = test_collection.initiatives.get('0');
        expect(initiative0, 'initiative does not have proper keys').to.be.instanceOf(templates.Initiative).that.has.keys('name', 'description', 'groups', 'goals', 'messages', 'avenues', 'avenue_types');
        let initiative1 = test_collection.initiatives.get('1');
        expect(initiative1, 'initiative does not have proper keys').to.be.instanceOf(templates.Initiative).that.has.keys('name', 'description', 'groups', 'goals', 'messages', 'avenues', 'avenue_types');
    });
});


describe("Initiative object", function () {
    /*
    Test initiative constructor
    */
    var test_initiative;
    
    this.beforeEach( function () {
        test_initiative = new templates.Initiative();
    });

    it('should have all initial Initiative object keys', function () {
       //console.log(test_initiative);
       expect(test_initiative, 'Missing a key').to.include.keys('name','description', 'groups', 'goals', 'messages', 'avenues')
       expect(test_initiative.name, 'Name is not a string').is.a('string');
       expect(test_initiative.description, 'Description is not a string').is.a('string');
       expect(test_initiative.groups, 'Groups is not an array').is.a('array');
       expect(test_initiative.goals, 'Goals is not an object').is.instanceOf(Map);
       expect(test_initiative.messages, 'Messages is not an object').is.instanceOf(Map);
       expect(test_initiative.avenues, 'Avenues is not an object').is.instanceOf(Map);
       expect(test_initiative.avenue_types, 'Avenue_types is not an array').is.an('array');
    });

    // test change name
    it('should change name', () => {
        test_initiative.change_name('This is a new name');
        //console.log('new description:', test_initiative);
        expect(test_initiative.name, 'Name was not changed').to.be.an('string').that.includes('This is a new name');
    });
    
    // test return name
    it('should return name', () => {
        test_initiative.change_name('This is a new name');
        let initiative_name = test_initiative.get_name();
        //console.log('returned description:', initiative_name);
        expect(initiative_name, 'Initiative name was not returned').to.be.an('string').that.includes('This is a new name');
    });

    // test change description
    it('should change description', () => {
        test_initiative.change_description('This is a new description');
        //console.log('new description:', test_initiative);
        expect(test_initiative.description, 'Description was not changed').to.be.an('string').that.includes('This is a new description');
    });
    
    // test return description
    it('should return description', () => {
        test_initiative.change_description('This is a new description');
        let initiative_description = test_initiative.get_description();
        //console.log('returned description:', initiative_description);
        expect(initiative_description, 'Initiative description was not returned').to.be.an('string').that.includes('This is a new description');
    });
    
    // test change group
    it('should change group', () => {
        test_initiative.change_group('Youth');
        //console.log('new group', test_initiative);
        expect(test_initiative.groups, 'Group was not changed').to.be.an('array').that.includes('Youth');
    });
    
    // test add group  
    it('should add a new group', () => {
        test_initiative.add_group('Youth');
        test_initiative.add_group('Parents');
        test_initiative.add_group('School Families');
        test_initiative.add_group('Members');
        //console.log('new groups:', test_initiative);
        expect(test_initiative.groups, 'New groups were not added').to.be.an('array').that.includes('Youth').and.includes('Parents').and.includes('School Families').and.includes('Members');
    });
    
    // test return groups
    it('should return groups', () => {
        test_initiative.add_group('Youth');
        test_initiative.add_group('Parents');
        test_initiative.add_group('School Families');
        test_initiative.add_group('Members');
        let groups = test_initiative.get_groups();
        //console.log('returned groups', groups);
        expect(groups, 'Groups were not returned').to.be.an('array').that.includes('Youth').and.includes('Parents').and.includes('School Families').and.includes('Members');
    });
   
     // test clear groups people  
     it('should clear groups', () => {
        test_initiative.add_group('Youth');
        test_initiative.add_group('Parents');
        test_initiative.add_group('School Families');
        test_initiative.add_group('Members');
        //console.log('new groups:', test_initiative);;
        test_initiative.clear_groups();
        //console.log('cleared groups:', test_initiative);;
        expect(test_initiative.groups, 'Groups were not cleared').to.be.an('array').and.to.have.length(0);
    });

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
    });

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

    });

    // test the return of the add goal method 
    it('should return the id of the goal from add goal method return', () => {
        let id = test_initiative.add_goal(10, 'email', {'0': 'tomorrow', '1':'next week'}); 
        let id1 = test_initiative.add_goal(5, 'text', {'0': 'tonight'});
        //console.log('new goals', test_initiative.goals);
        //console.log('goal 1 id: ', id, '\ngoal 2 id: ', id1);
        expect(id, "Does not return correct id").to.equal('0');
        expect(id1, "Does not return correct id").to.equal('1');
    });

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
    });

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
    });

    // test the return of the add message method 
    it('should return the id of the message from add message method return', () => {
        let id = test_initiative.add_message('This is my title', 'Hi Hello,', 'This is my content. Blah blah blah.', 'Signed Me', ['avenue1', 'avenue2', 'avenue3']); 
        let id1 = test_initiative.add_message('Title of my message', 'Hello this is a greeting,', 'This is my message content.', 'This is my signature', 'avenue1');
        //console.log('new messages', test_initiative.messages);
        //console.log('message 1 id: ', id, '\nmessage 2 id: ', id1);
        expect(id, "Does not return correct id").to.equal('0');
        expect(id1, "Does not return correct id").to.equal('1');
    });

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
       
    });

    // test adding avenue method 
    it('should add a new avenue', () => {
        // test giving array of people, and message ids, as well as date object values
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, 'message2', '2016-01-08T00:00:00-06:00');
        // test single string values for people, and message ids  
        test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message1', '2020-06-28T00:00:00-06:00');
        //console.log('new avenues', test_initiative.avenues);

        let avenue0 = test_initiative.avenues.get('0')
        //console.log('avenue0:', test_initiative.avenues.get('0'))
        expect(avenue0.avenue_type, 'Does not have proper avenue_type').to.be.an('string').that.includes('email');
        expect(avenue0.description, 'Does not have proper description').to.be.an('string').that.includes('this is an email');
        expect(avenue0.person, 'Does not have proper people').to.be.an('array').that.includes('Bob').and.includes('Jill');
        expect(avenue0.sent, 'Does not have proper sent value').to.be.true;
        expect(avenue0.message_id, 'Does not have proper message id').to.be.an('string').that.equals('message2');
        expect(avenue0.date, 'Does not have proper date').to.be.a('string').and.equals('2016-01-08T00:00:00-06:00');

        let avenue1 = test_initiative.avenues.get('1')
        //console.log('avenue1:', test_initiative.avenues.get('1'))
        expect(avenue1.avenue_type,'Does not have proper avenue_type').to.be.an('string').that.includes('text');
        expect(avenue1.description, 'Does not have proper description').to.be.an('string').that.includes('this is a text');
        expect(avenue1.person, 'Does not have proper people').to.be.an('array').that.includes('Bill');
        expect(avenue1.sent, 'Does not have proper sent value').to.be.true;
        expect(avenue1.message_id, 'Does not have proper message id').to.be.an('string').that.equals('message1');
        expect(avenue1.date, 'Does not have proper date').to.be.a('string').and.equals('2020-06-28T00:00:00-06:00');
    });

    // test the return of the add avenue method 
    it('should return the id of the avenue from add avenue method return', () => {
        let id = test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, 'message2', '2016-01-08T00:00:00-06:00');
        let id1 = test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message4', '2020-06-28T00:00:00-06:00');
        //console.log('new avenues', test_initiative.avenues);
        //console.log('avenue 1 id: ', id, '\navenue 2 id: ', id1);
        expect(id,"Does not return correct id").to.equal('0');
        expect(id1, "Does not return correct id").to.equal('1');
    });

    // test dynamic preformace of avenues map  
    it('should remove an avenue then re-add', () => {
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, 'message1', '2016-01-08T00:00:00-06:00');
        test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message4', '2020-06-28T00:00:00-06:00');
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
        expect(avenue1.message_id, 'Does not have proper message id').to.be.an('string').that.equals('message4');
        expect(avenue1.date, 'Does not have proper date').to.be.a('string').and.equals('2020-06-28T00:00:00-06:00');

        // Test re-add avenue
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, 'message3', '2016-01-08T00:00:00-06:00');
        avenue0 = test_initiative.avenues.get('0')
        //console.log('re-added avenue:', test_initiative.avenues)
        expect(avenue0).to.exist
        expect(avenue0.avenue_type, 'Does not have proper avenue type').to.be.an('string').that.includes('email');
        expect(avenue0.description, 'Does not have proper description').to.be.an('string').that.includes('this is an email');
        expect(avenue0.person, 'Does not have proper people').to.be.an('array').that.includes('Bob').and.includes('Jill');
        expect(avenue0.sent, 'Does not have proper sent value').to.be.true;
        expect(avenue0.message_id, 'Does not have proper message id').to.be.an('string').that.equals('message3');
        expect(avenue0.date, 'Does not have proper date').to.be.a('string').and.equals('2016-01-08T00:00:00-06:00');

        // Test adding additional avenue after that
        test_initiative.add_avenue('facebook', 'this is a facebook post', ['Tim', 'Bently'], true, 'message1', '2022-11-12T00:00:00-06:00');
        //console.log('added asditional avenue:', test_initiative.avenues)
        let avenue2 = test_initiative.avenues.get('2')
        //console.log('avenue2:', test_initiative.avenues.get('2'))
        expect(avenue2, 'Avenue was not removed').to.exist
        expect(avenue2.avenue_type, 'Does not have proper avenue type').to.be.an('string').that.includes('facebook');
        expect(avenue2.description, 'Does not have proper description').to.be.an('string').that.includes('this is a facebook post');
        expect(avenue2.person, 'Does not have proper people').to.be.an('array').that.includes('Tim').and.includes('Bently');
        expect(avenue2.sent, 'Does not have proper sent value').to.be.true;
        expect(avenue2.message_id, 'Does not have proper message ids').to.be.an('string').that.equals('message1');
        expect(avenue2.date, 'Does not have proper date').to.be.a('string').and.equals('2022-11-12T00:00:00-06:00');
    });

    // test adding add_type method 
    it('should add new a avenue type to the initiative', () => {
    let new_avenue_type = 'Facebook'
    test_initiative.add_type(new_avenue_type);
    //console.log('avenue types', test_initiative.avenue_types);
    expect(test_initiative.avenue_types, 'Does not have proper avenue type').to.be.an('array').that.includes('Facebook')
    });

    // test return from get_types method
    it('should return the avenue types held in initiative', () => {
        let new_avenue_type = 'Alien Harmonica'
        test_initiative.add_type(new_avenue_type)
        let avenue_types = test_initiative.get_types();
        //console.log('returned avenue types:', avenue_types);
        expect(avenue_types, 'Avenue types were not returned').to.be.an('array').that.includes('Alien Harmonica');
    });

    // test linking messages and avenues 
    it('should link message and avenue', () => {
        test_initiative.add_message('This is my title', 'Hi Hello,', 'This is my content. Blah blah blah.', 'Signed Me');
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, '', '2016-01-08T00:00:00-06:00'); 
        test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message1', '2022-11-12T00:00:00-06:00');
        test_initiative.link_ids('0', '0');
        // Link one avenue and message
        let avenue0 = test_initiative.avenues.get('0')
        expect(avenue0.message_id, 'Linked message id incorrect').to.be.an('string').that.equals('0');
        let message = test_initiative.messages.get('0')
        expect(message.avenue_ids, 'Linked avenue id incorrect').to.be.an('array').that.includes('0');

        // Link additional avenue to message
        test_initiative.link_ids('1', '0');
        let avenue1 = test_initiative.avenues.get('1')
        expect(avenue1.message_id, 'Linked message id incorrect').to.be.an('string').that.equals('0');
        expect(message.avenue_ids, 'Linked avenue id incorrect').to.be.an('array').that.includes('0').that.includes('1');
        //console.log('Linked avenues: ', test_initiative.avenues, '\nLinked messages: ', test_initiative.messages);
    });

    // test unlinking messages and avenues 
    it('should unlink message and avenue', () => {
        test_initiative.add_message('This is my title', 'Hi Hello,', 'This is my content. Blah blah blah.', 'Signed Me');
        test_initiative.add_message(); // dummy message
        test_initiative.add_message('Title for message 3', 'Hey there, ', 'This is what I have to say.', 'The Big man');
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, '', 2020, 9, 23, 12, 30); 
        test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message1', 2019, 11, 4, 9, 12);
        test_initiative.add_avenue(); // dummy avenue
        test_initiative.add_avenue('mail', 'this is a postcard', 'Tom', true, 'message1', 2021, 11, 5, 9, 12)
        // Link smaller numbers 
        test_initiative.link_ids('0', '0');
        test_initiative.link_ids('1', '0');
        // console.log('Linked avenues: ', test_initiative.avenues, '\nLinked messages: ', test_initiative.messages);
        
        // Unlink one avenue and message
        test_initiative.unlink_ids('0', '0');
        let message0 = test_initiative.messages.get('0');
        let avenue0 = test_initiative.avenues.get('0');
        expect(avenue0.message_id, 'Unlinked message id incorrect').to.be.an('string').that.does.not.equal('0');
        expect(message0.avenue_ids, 'Unlinked avenue id incorrect').to.be.an('array').that.does.not.includes('0');
        
        // Unlink additional avenue
        test_initiative.unlink_ids('1','0');
        let avenue1 = test_initiative.avenues.get('1');
        expect(avenue1.message_id, 'Unlinked message id incorrect').to.be.an('string').that.does.not.equal('0');
        expect(message0.avenue_ids, 'Unlinked avenue id incorrect').to.be.an('array').that.does.not.includes('1');
        // console.log('Unlinked avenues: ', test_initiative.avenues, '\nUnlinked messages: ', test_initiative.messages);
       
        // Link varied numbers 
        test_initiative.link_ids('1', '2');
        test_initiative.link_ids('3', '2');
        test_initiative.link_ids('0', '2');
        // Unlink varied avenues and message
        test_initiative.unlink_ids('1', '2');
        let message2 = test_initiative.messages.get('2');
        avenue1 = test_initiative.avenues.get('1');
        expect(avenue1.message_id, 'Unlinked message id incorrect').to.be.an('string').that.does.not.equal('2');
        expect(message2.avenue_ids, 'Unlinked avenue id incorrect').to.be.an('array').that.does.not.includes('1');

         // Unlink varied avenues and message
         test_initiative.unlink_ids('3', '2');
         message2 = test_initiative.messages.get('2');
         let avenue3 = test_initiative.avenues.get('3');
         expect(avenue3.message_id, 'Unlinked message id incorrect').to.be.an('string').that.does.not.equal('2');
         expect(message2.avenue_ids, 'Unlinked avenue id incorrect').to.be.an('array').that.does.not.includes('3');
    
    });

    // test pack for Json or ipc 
    it('should convert and pack all objects to vanilla', () => {
        test_initiative.change_name('My Initiative');
        test_initiative.change_description('This is an initiavtive to communicate with people');
        test_initiative.change_group('my peeps')
        test_initiative.add_goal(5, 'text', 'tomorrow');
        test_initiative.add_message('This is the title of the first message', 'this is its greeting', 'this is the content.', 'this is the signature', ['avenue1', 'avenue2']);
        test_initiative.add_avenue('email', 'for all my peeps', 'Bob', true, 'message23', '2022-01-12T00:00:00-06:00');
        //console.log('Initiative before packing:', test_initiative);
        let returned_initiative = test_initiative.pack_for_ipc();
        //console.log('Packed initiative:', returned_initiative);
        expect(returned_initiative, 'Initiative does not have proper keys').to.be.an('object').that.has.keys('name', 'description', 'groups', 'goals', 'messages', 'avenues', 'avenue_types');
        expect(returned_initiative.name, 'Name is not correct').to.be.a('string').that.equals('My Initiative');
        expect(returned_initiative.description, 'Description is not correct').to.be.a('string').that.equals('This is an initiavtive to communicate with people');
        expect(returned_initiative.groups, 'Groups are not correct').to.be.a('array').that.includes('my peeps');
        
        // Nested Goals object
        expect(returned_initiative.goals, 'Goals is not a map').to.be.instanceOf(Object);
        let goal1 = returned_initiative.goals['0'];
        //console.log(goal1)
        expect(goal1, 'Goal does not have proper keys').to.be.an('object').that.has.keys('frequency', 'type', 'reminder');
        expect(goal1.frequency, 'Frequency is not correct').to.be.a('number').that.equals(5);
        expect(goal1.type, 'Type is not correct').to.be.a('string').that.equals('text');
        expect(goal1.reminder, 'Reminder is not correct').to.be.a('string').that.equals('tomorrow');
        
        // Nested Message object
        expect(returned_initiative.messages, 'Messages is not a map').to.be.instanceOf(Object);
        let message1 = returned_initiative.messages['0'];
        //console.log(message1)
        expect(message1, 'Message does not have proper keys').to.be.an('object').that.has.keys('title', 'greeting', 'content', 'signature', 'avenue_ids');
        expect(message1.title, 'Title is not correct').to.be.a('string').that.equals('This is the title of the first message');
        expect(message1.greeting, 'Greeting is not correct').to.be.a('string').that.equals('this is its greeting');
        expect(message1.content, 'Content is not correct').to.be.a('string').that.equals('this is the content.');
        expect(message1.signature, 'Signature is not correct').to.be.a('string').that.equals('this is the signature');
        expect(message1.avenue_ids, 'Avenue_ids is not correct').to.be.a('array').that.includes('avenue1').and.includes('avenue2');
        
        // Nested Avenues object
        expect(returned_initiative.avenues, 'Avenues is not a map').to.be.instanceOf(Object);
        let avenue1 = returned_initiative.avenues['0'];
        //console.log(avenue1)
        expect(avenue1, 'Avenue does not have proper keys').to.be.an('object').that.has.keys('avenue_type', 'description', 'person', 'date', 'sent', 'message_id');
        expect(avenue1.avenue_type, 'Avenue_type is not correct').to.be.a('string').that.equals('email');
        expect(avenue1.description, 'Description is not correct').to.be.a('string').that.equals('for all my peeps');
        expect(avenue1.person, 'Person is not correct').to.be.an('array').that.includes('Bob');
        expect(avenue1.date, 'Date is not correct').to.be.a('string').and.equals('2022-01-12T00:00:00-06:00');
        expect(avenue1.sent, 'Sent is not correct').to.be.true; 
        expect(avenue1.message_id, 'Message_id is not correct').to.be.a('string').that.includes('message23'); 
    
        // Avenue types
        expect(returned_initiative.avenue_types, 'avenue types are not correct').to.be.a('array').that.includes('Email').and.includes('Text').and.includes('Facebook').and.includes('Instagram').and.includes('Handout').and.includes('Poster').and.includes('Other');
    });
    
    // test converting back to maps and date objects from json string 
    it('should return unpacked objects', () => {
        test_initiative.change_name('My Initiative');
        test_initiative.change_description('This is an initiavtive to communicate with people');
        test_initiative.change_group('my peeps')
        test_initiative.add_goal(5, 'text', 'tomorrow');
        test_initiative.add_message('This is the title of the first message', 'this is its greeting', 'this is the content.', 'this is the signature', ['avenue1', 'avenue2']);
        test_initiative.add_avenue('email', 'for all my peeps', 'Bob', true, 'message23', '2016-01-08T00:00:00-06:00');
        //console.log('Initiative before packing:', test_initiative);
        returned_initiative = test_initiative.pack_for_ipc();
        test_initiative.unpack_from_ipc(returned_initiative);
        //console.log('converted objects:', test_initiative);
        expect(test_initiative, 'Initiative does not have proper keys').to.be.instanceOf(templates.Initiative).that.has.keys('name', 'description', 'groups', 'goals', 'messages', 'avenues', 'avenue_types');
        expect(returned_initiative.name, 'Name is not correct').to.be.a('string').that.equals('My Initiative');
        expect(test_initiative.description, 'Description is not correct').to.be.a('string').that.equals('This is an initiavtive to communicate with people');
        expect(test_initiative.groups, 'Groups are not correct').to.be.a('array').that.includes('my peeps');
        
        // Nested Goals object
        expect(test_initiative.goals, 'Goals is not a map').to.be.instanceOf(Map);
        let goal1 = test_initiative.goals.get('0');
        //console.log(goal1)
        expect(goal1, 'Not a goal object').to.be.instanceOf(templates.Goal);
        expect(goal1, 'Goal does not have proper keys').to.have.keys('frequency', 'type', 'reminder');
        expect(goal1.frequency, 'Frequency is not correct').to.be.a('number').that.equals(5);
        expect(goal1.type, 'Type is not correct').to.be.a('string').that.equals('text');
        expect(goal1.reminder, 'Reminder is not correct').to.be.a('string').that.equals('tomorrow');
        
        // Nested Message object
        expect(test_initiative.messages, 'Messages is not a map').to.be.instanceOf(Map);
        let message1 = test_initiative.messages.get('0');
        //console.log(message1)
        expect(message1, 'Not a message object').to.be.instanceOf(templates.Message);
        expect(message1, 'Message does not have proper keys').to.have.keys('title', 'greeting', 'content', 'signature', 'avenue_ids');
        expect(message1.title, 'Title is not correct').to.be.a('string').that.equals('This is the title of the first message');
        expect(message1.greeting, 'Greeting is not correct').to.be.a('string').that.equals('this is its greeting');
        expect(message1.content, 'Content is not correct').to.be.a('string').that.equals('this is the content.');
        expect(message1.signature, 'Signature is not correct').to.be.a('string').that.equals('this is the signature');
        expect(message1.avenue_ids, 'Avenue_ids is not correct').to.be.a('array').that.includes('avenue1').and.includes('avenue2');
        
        // Nested Avenues object
        expect(test_initiative.avenues, 'Avenues is not a map').to.be.instanceOf(Map);
        let avenue1 = test_initiative.avenues.get('0');
        //console.log(avenue1)
        expect(avenue1, 'Not an avenue object').to.be.instanceOf(templates.Avenue);
        expect(avenue1, 'Avenue does not have proper keys').to.be.an('object').that.has.keys('avenue_type', 'description', 'person', 'date', 'sent', 'message_id');
        expect(avenue1.avenue_type, 'Avenue_type is not correct').to.be.a('string').that.equals('email');
        expect(avenue1.description, 'Description is not correct').to.be.a('string').that.equals('for all my peeps');
        expect(avenue1.person, 'Person is not correct').to.be.an('array').that.includes('Bob');
        expect(avenue1.date, 'Date is not correct').to.be.a('string').and.equals('2016-01-08T00:00:00-06:00');
        expect(avenue1.sent, 'Sent is not correct').to.be.true; 
        expect(avenue1.message_id, 'Message_id is not correct').to.be.a('string').that.includes('message23'); 
    
        // Avenue types
        expect(test_initiative.avenue_types, 'avenue types are not correct').to.be.a('array').that.includes('Email').and.includes('Text').and.includes('Facebook').and.includes('Instagram').and.includes('Handout').and.includes('Poster').and.includes('Other');
    });
});

describe("Goal object", function () {
    /*
    Test Goal constructor
    */
   var test_goal;
    
   this.beforeEach( function () {
       test_goal = new templates.Goal();
   });

   it('should have all initial Goal object keys', function () {
       //console.log(test_goal);
       expect(test_goal, 'Missing a key').to.include.keys('frequency', 'type', 'reminder')
       expect(test_goal.frequency, 'frequency is not a number').is.a('number');
       expect(test_goal.type, 'type is not a string').is.a('string');
       expect(test_goal.reminder, 'reminder is not an object').is.an('object');
    });

    // test change frequency 
    it('should change goal frequency', () => {
        test_goal.change_frequency(10);
        //console.log('new goal frequency', test_goal);
        expect(test_goal.frequency, 'Frequency was not changed').to.equal(10);
    });
  
    // test return frequency
    it('should return frequency', () => {
        test_goal.change_frequency(12);
        // get the new frequency
        let frequency =  test_goal.get_frequency();
        //console.log('returned frequency', frequency);
        expect(frequency, 'Frequency was not returned').to.equal(12);
    });

     // test change frequency 
     it('should change goal type', () => {
        test_goal.change_type('email');
        //console.log('new goal type', test_goal);
        expect(test_goal.type, 'Type was not changed').to.be.a('string').that.equals('email');
    });
  
    // test return frequency
    it('should return type', () => {
        test_goal.change_type('text');
        // get the new frequency
        let type =  test_goal.get_type();
        //console.log('returned type', type);
        expect(type, 'Type was not returned').to.be.a('string').that.equals('text');
    });

});

describe("Message object", function() {
    /*
    Tests all methods of the message class
    */
    var test_message;
    
    this.beforeEach( function () {
        test_message = new templates.Message();
    });
    // Initiate Message - need to finish 
    it('should have all initial message object keys', () => {
        //console.log(test_message)
        expect(test_message).to.include.keys('title', 'greeting', 'content', 'signature', 'avenue_ids')
        expect(test_message.title, 'title is not a string').is.a('string');
        expect(test_message.greeting, 'greeting is not a string').is.a('string');
        expect(test_message.content, 'content is not a string').is.a('string');
        expect(test_message.signature, 'signature is not a string').is.a('string');
        expect(test_message.avenue_ids, 'avenue_ids is not an array').is.a('array');
    });

    // test change title method 
    it('should change title', () => {
        let new_title = 'This is a new Title'
        test_message.change_title(new_title)
        //console.log(test_message)
        expect(test_message.title, 'Title was not changed').to.be.a('string').that.includes('This is a new Title')
    });

    // test return title 
    it('should return title', () => {
        test_message.change_title('This is a different title');
        let message_title = test_message.get_title();
        //console.log('returned title:', message_title);
        expect(message_title, 'Message title was not returned').to.be.an('string').that.equals('This is a different title');
    });

    // test change greeting method 
    it('should change greeting', () => {
        let new_greeting = 'This is a new Greeting'
        test_message.change_greeting(new_greeting)
        //console.log('Greeting', test_message)
        expect(test_message.greeting, 'Greeting was not changed').to.be.a('string').that.includes('This is a new Greeting')
    });

     // test return greeting 
     it('should return greeting', () => {
        test_message.change_greeting('This is a new Greeting');
        let message_greeting = test_message.get_greeting();
        //console.log('returned greeting:', message_greeting);
        expect(message_greeting, 'Message greeting was not returned').to.be.an('string').that.equals('This is a new Greeting');
    });

    // test change content method 
    it('should change content', () => {
        let new_content = 'This is new Content'
        test_message.change_content(new_content)
        //console.log('Content', test_message)
        expect(test_message.content, 'Content was not changed').to.be.a('string').that.includes('This is new Content')
    });
    
    // test return content 
    it('should return content', () => {
        test_message.change_content('This is new Content');
        let message_content = test_message.get_content();
        //console.log('returned content:', message_content);
        expect(message_content, 'Message content was not returned').to.be.an('string').that.equals('This is new Content');
    });

     // test change signature method 
    it('should change signature', () => {
        let new_signature = 'This is a new Signature'
        test_message.change_signature(new_signature)
        //console.log('Signature', test_message)
        expect(test_message.signature, 'Signature was not changed').to.be.a('string').that.includes('This is a new Signature')
    });

    // test return signature 
    it('should return signature', () => {
        test_message.change_signature('This is a new Signature');
        let message_signature = test_message.get_signature();
        //console.log('returned signature:', message_signature);
        expect(message_signature, 'Message signature was not returned').to.be.an('string').that.equals('This is a new Signature');
    });

     // test change avenue ids
     it('should change avenue ids', () => {
        test_message.change_avenue_id('avenue1');
        //console.log('new avenue id', test_message);
        expect(test_message.avenue_ids, 'Avenue id was not changed').to.be.an('array').that.includes('avenue1');
    });
    
    // test add avenue id 
    it('should add an avenue id', () => {
        test_message.add_avenue_id('avenue0');
        test_message.add_avenue_id('avenue1');
        test_message.add_avenue_id('avenue2');
        test_message.add_avenue_id('avenue3');
        //console.log('new avenue ids:', test_message);
        expect(test_message.avenue_ids, 'New avenue ids were not added').to.be.an('array').that.includes('avenue0').and.includes('avenue1').and.includes('avenue2').and.includes('avenue3');
    });
    
    // test return avenue ids 
    it('should return avenue ids', () => {
        test_message.add_avenue_id('avenue0');
        test_message.add_avenue_id('avenue1');
        test_message.add_avenue_id('avenue2');
        test_message.add_avenue_id('avenue3');
        let avenue_ids = test_message.get_avenue_ids();
        //console.log('new avenue ids:', test_message);;
        expect(avenue_ids, 'Avenue ids were not returned').to.be.an('array').that.includes('avenue0').and.includes('avenue1').and.includes('avenue2').and.includes('avenue3');
    });

    // test clear avenue ids 
    it('should clear avenue ids', () => {
        test_message.add_avenue_id('avenue0');
        test_message.add_avenue_id('avenue1');
        test_message.add_avenue_id('avenue2');
        test_message.add_avenue_id('avenue3');
        //console.log('new avenue ids:', test_message);;
        test_message.clear_avenue_ids();
        //console.log('cleared avenue ids:', test_message);;
        expect(test_message.avenue_ids, 'Avenue ids were not cleared').to.be.an('array').and.to.have.length(0);
    });
});

describe("Avenue object", function () {
    /*
    Test Avenue constructor
    */
   var test_avenue;
    
    this.beforeEach( function () {
        test_avenue = new templates.Avenue();
    });

   it('should have all initial Avenue object keys', function () {
       //console.log(test_avenue);
       expect(test_avenue, 'Missing a key').to.include.keys('avenue_type', 'description', 'person', 'date', 'sent', 'message_id')
       expect(test_avenue.avenue_type, 'avenue_type is not a string').is.a('string');
       expect(test_avenue.description, 'descrition is not a string').is.a('string');
       expect(test_avenue.person, 'person is not an array').is.an('array');
       expect(test_avenue.date, 'date is not a date').is.instanceOf(Date);
       expect(test_avenue.sent, 'sent is not a boolean').is.an('boolean');
       expect(test_avenue.message_id, 'message_id is not a string').is.an('string');

    });

    // test change avenue type
    it('should change avenue type', () => {
        test_avenue.change_avenue_type('Facebook');
        //console.log('new avenue types', test_avenue);
        expect(test_avenue.avenue_type, 'Avenue_type was not changed').to.be.an('string').that.includes('Facebook');
    });
  
    // test return avenue types
    it('should return avenue type', () => {
        test_avenue.change_avenue_type('Facebook');
        // get the new type
        let avenue_type = test_avenue.get_avenue_type(0);
        //console.log('returned avenue type:', avenue_type);
        expect(avenue_type, 'Avenue type was not returned').to.be.an('string').that.includes('Facebook');
    });
  
    // test change description
    it('should change description', () => {
        test_avenue.change_description('This is a new description');
        //console.log('new description:', test_avenue);
        expect(test_avenue.description, 'Description was not changed').to.be.an('string').that.includes('This is a new description');
    });
    
    // test return description
    it('should return description', () => {
        test_avenue.change_description('This is a new description');
        let avenue_description = test_avenue.get_description();
        //console.log('returned description:', avenue_description);
        expect(avenue_description, 'Avenue description was not returned').to.be.an('string').that.includes('This is a new description');
    });
    
    // test change person
    it('should change person responsible', () => {
        test_avenue.change_person('Jill');
        //console.log('new person', test_avenue);
        expect(test_avenue.person, 'Person was not changed').to.be.an('array').that.includes('Jill');
    });
    
    // test add person - keep working on 
    it('should add a new person', () => {
        test_avenue.add_person('Jill');
        test_avenue.add_person('Bob');
        test_avenue.add_person('Tim');
        test_avenue.add_person('Bill');
        //console.log('new people:', test_avenue);
        expect(test_avenue.person, 'New people were not added').to.be.an('array').that.includes('Jill').and.includes('Bob').and.includes("Tim").and.includes('Bill');
    });
    
    // test return people
    it('should return people', () => {
        test_avenue.add_person('Joe');
        test_avenue.add_person('Phil');
        test_avenue.add_person('Jill');
        test_avenue.add_person('John');
        let avenue_people = test_avenue.get_people();
        //console.log('returned people', avenue_people);
        expect(avenue_people, 'People were not returned').to.be.a('string').that.includes('Joe').and.includes('Phil').and.includes('Jill').and.includes('John');
    });
   
     // test clear people  
     it('should clear people', () => {
        test_avenue.add_person('Joe');
        test_avenue.add_person('Phil');
        test_avenue.add_person('Jill');
        test_avenue.add_person('John');
        //console.log('new people:', test_avenue);;
        test_avenue.clear_people();
        //console.log('cleared people:', test_avenue);;
        expect(test_avenue.person, 'People were not cleared').to.be.an('array').and.to.have.length(0);
    });

    // test change date
    it('should change date', () => {
        //console.log('base date:', test_avenue.date);
        test_avenue.change_date('2016-01-08T00:00:00-06:00');
        //console.log('new dates', test_avenue.date);
        expect(test_avenue.date).to.be.a('string').and.equals('2016-01-08T00:00:00-06:00');
    });
   
    // test return dates
    it('should return date', () => {
        test_avenue.change_date('2016-01-08T00:00:00-06:00');
        //console.log('changed date:', test_avenue.date);
        let avenue_date = test_avenue.get_dates();
        //console.log('returned date:', avenue_date);
        expect(avenue_date, 'Date was not returned').to.be.a('string').and.equals('2016-01-08T00:00:00-06:00');
    });
  
    // test change sent
    it('should change sent value', () => {
        test_avenue.change_sent(true);
        //console.log('new sent', test_avenue);
        expect(test_avenue.sent, 'Sent value was not changed').to.be.true;
    });

    // test return sent 
    it('should return sent value', () => {
        test_avenue.change_sent(true);
        let avenue_sent = test_avenue.get_sent();
        //console.log('returned sent value:', avenue_sent);
        expect(avenue_sent, 'Avenue sent value was not returned').to.be.an('boolean').that.equals(true);
    });

    // test change message id
    it('should change message id', () => {
        test_avenue.change_message_id('message1');
       //console.log('new message id', test_avenue);
        expect(test_avenue.message_id, 'Message_id was not changed').to.be.an('string').that.equals('message1');
    });
  
    // test return message id 
    it('should return message id', () => {
        test_avenue.change_message_id('message1');
        // get the new type
        let message_id = test_avenue.get_message_id();
        //console.log('returned message id:', message_id);
        expect(message_id, 'Message_id was not returned').to.be.an('string').that.equals('message1');
    });

    // test clear message id 
    it('should clear message id', () => {
        test_avenue.change_message_id('message1');
        //console.log('message id added:', test_avenue);
        // get the new type
        test_avenue.clear_message_id();
        //console.log('cleared message id:', test_avenue);
        expect(test_avenue.message_id, 'Message ids were not cleared').to.be.an('string').that.equals('');
    });
});
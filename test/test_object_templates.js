const chai = require('chai');
chai.use(require('chai-datetime'));
const expect = require('chai').expect;
const templates = require('../src/objectTemplate.js');
const moment = require('moment'); // For date handling 

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
       expect(test_collection, 'Missing a key').to.have.keys('initiatives');
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
        test_collection.add_initiative('my init', 'this is a new initiative');
        //console.log('new initiative', test_collection.initiatives);

        let initiative0 = test_collection.initiatives.get('0')
        //console.log('initiative0:', test_collection.initiatives.get('0'))
        expect(initiative0, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative0.name, 'Does not have the proper name').to.be.a('string').that.equals('my init');
        expect(initiative0.description, 'Does not have the proper description').to.be.a('string').that.equals('this is a new initiative');
    });

    // test the return id of the add initiative method 
    it('should return the id of the initiative from add initiative method return', () => {
        let id = test_collection.add_initiative('my init', 'this is a new initiative', ['my peeps', 'everyone']);
        
        //console.log('new initiative', test_collection.initiatives);
        expect(id, "Does not return correct id").to.equal('0');
    });

    // test dynamic preformace of initiativeCollection map 
    it('should remove an initiative then re-add', () => {
        test_collection.add_initiative('my init', 'This is the first initiative');
        test_collection.add_initiative('Youth', 'this is a new initiative');
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
        // Test re-add initiative 
        test_collection.add_initiative('my init', 'This is the first initiative');
        //console.log('re-added initiative: ', test_collection.initiatives);
        initiative0 = test_collection.initiatives.get('0');
        //console.log('initiative0:',  test_collection.initiatives.get('0'));
        expect(initiative0, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative0.name, 'Does not have the proper name').to.be.a('string').that.equals('my init');
        expect(initiative0.description, 'Does not have the proper description').to.be.a('string').that.equals('This is the first initiative');
        // Test adding additional initiative after that
        test_collection.add_initiative('Golf Team','This is another initiative');
        //console.log('added additional initiative: ', test_collection.initiatives) 
        initiative2 = test_collection.initiatives.get('2');
        //console.log('initiative2: ', test_collection.initiatives.get('2'))
        expect(initiative2, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative2.name, 'Does not have the proper name').to.be.a('string').that.equals('Golf Team');
        expect(initiative2.description, 'Does not have the proper description').to.be.a('string').that.equals('This is another initiative');
    });

    // Test update collection with initiative coming from ipc/file
    it('should update the collection with new initiative values', () => {
        // Add an initial initiative 
        test_collection.add_initiative('my init', 'this is a new initiative');
        //console.log('initial initiative: ', test_collection.initiatives);
        initiative0 = test_collection.initiatives.get('0');
        expect(initiative0, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative0.name, 'Does not have the proper name').to.be.a('string').that.equals('my init');
        expect(initiative0.description, 'Does not have the proper description').to.be.a('string').that.equals('this is a new initiative');
        
        // Make an updated initiative and mimic being sent over ipc
        let testInit = new templates.Initiative();
        testInit.change_name('new initiative name')
        testInit.change_description('This is the updated description');
        let updateInit = testInit.pack_for_ipc();
        // Update initative in the collection
        test_collection.update_init('0', updateInit);
        //console.log('updated initiative: ', test_collection.initiatives);
        initiative0 = test_collection.initiatives.get('0');
        expect(initiative0, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative0.name, 'Does not have the proper name').to.be.a('string').that.equals('new initiative name');
        expect(initiative0.description, 'Does not have the proper description').to.be.a('string').that.equals('This is the updated description');
    });

    // Test update message coming from ipc
    it('should update it\'s respective initiative with new message value in the collection', () => {
        // Add an initial initiative and message
        test_collection.add_initiative('my init', 'this is a new initiative');
        let initiative = test_collection.initiatives.get('0');
        initiative.add_message('This is a message', 'Hello,', 'Lets make sure we get the project done.', 'Your Boss', ['avenue2', 'avenue3']);
        //console.log('initial initiative: ', test_collection.initiatives);
        let initiative0 = test_collection.initiatives.get('0');
        expect(initiative0, 'Initiative is not an instance of the initiative object').to.be.instanceOf(templates.Initiative);
        expect(initiative0.name, 'Does not have the proper name').to.be.a('string').that.equals('my init');
        expect(initiative0.description, 'Does not have the proper description').to.be.a('string').that.equals('this is a new initiative');
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
       expect(test_initiative, 'Missing a key').to.have.keys('name','description', 'groups', 'goals', 'messages', 'avenues', 'avenue_types')
       expect(test_initiative.name, 'Name is not a string').is.a('string');
       expect(test_initiative.description, 'Description is not a string').is.a('string');
       expect(test_initiative.groups, 'Groups is not a Map').is.instanceof(Map);
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

    // test adding group method 
    it('should add a new group', () => {
        // test adding groups to initiative object
        test_initiative.add_group('my peeps', [ ['Phil', '342-235-7653', 'myEmail@email.com'] ]);
        test_initiative.add_group('Youth group', [ ['Kevin', '235-345-3454', 'heythere@email.com'] ]);
        //console.log('new groups', test_initiative.groups);
        // Verify each group
        let group0 = test_initiative.groups.get('0')
        //console.log('group0:', test_initiative.groups.get('0'))
        expect(group0.group_name, 'name incorrect').to.be.a('string').that.equals('my peeps');
        let contact0 = group0.contacts.get('00');
        expect(contact0, 'contact incorrect').to.be.an('array').that.includes('Phil').that.includes('342-235-7653').and.includes('myEmail@email.com');
       
        let group1 = test_initiative.groups.get('1')
        //console.log('group1:', test_initiative.groups.get('1'))
        expect(group1.group_name, 'name incorrect').to.be.a('string').that.equals('Youth group');
        let contact1 = group1.contacts.get('10');
        expect(contact1, 'contact incorrect').to.be.an('array').that.includes('Kevin').that.includes('235-345-3454').and.includes('heythere@email.com');
    });

    // test the return of the add group method 
    it('should return the id of the group from add group method return', () => {
        let id = test_initiative.add_group('my peeps', [ ['Phil', ['342-235-7653', 'myEmail@email.com']] ]);
        let id1 = test_initiative.add_group('Youth group', [ ['Kevin', ['235-345-3454', 'heythere@email.com']] ]);
        //console.log('new groups', test_initiative.groups);
        //console.log('group 1 id: ', id, '\ngroup 2 id: ', id1);
        expect(id, "Does not return correct id").to.equal('0');
        expect(id1, "Does not return correct id").to.equal('1');
    });

    // test dynamic preformace of group map 
    it('should remove a group then re-add', () => {
        test_initiative.add_group('my peeps', [ ['Phil', '342-235-7653', 'myEmail@email.com'] ]);
        test_initiative.add_group('Youth group', [ ['Kevin', '235-345-3454', 'heythere@email.com'] ]);
        //console.log('new groups', test_initiative.groups);
        // remove group and test
        test_initiative.groups.delete('0');
        //console.log('removed group', test_initiative.groups);
        let group0 = test_initiative.groups.has('0');
        expect(group0).to.be.false;
        let group1 = test_initiative.groups.get('1');
        //console.log('groups1:', test_initiative.groups.get('1'));
        expect(group1.group_name, 'name incorrect').to.be.a('string').that.equals('Youth group');
        let contact1 = group1.contacts.get('10');
        expect(contact1, 'contact incorrect').to.be.an('array').that.includes('Kevin').that.includes('235-345-3454').and.includes('heythere@email.com');
        
        // Test re-add group
        test_initiative.add_group('my peeps', [ ['Phil', '342-235-7653', 'myEmail@email.com'] ]); 
        //console.log('re-added group:', test_initiative.groups)
        group0 = test_initiative.groups.get('0')
        //console.log('group0:', test_initiative.groups.get('0'))
        expect(group0.group_name, 'name incorrect').to.be.a('string').that.equals('my peeps');
        let contact0 = group0.contacts.get('00');
        expect(contact0, 'contact incorrect').to.be.an('array').that.includes('Phil').that.includes('342-235-7653').and.includes('myEmail@email.com');

        // Test adding additional group after that
        test_initiative.add_group('My best friends', [ ['Don', '564-434-5354', 'don.don@email.com'] ]);  
        //console.log('added additional group:', test_initiative.groups) 
        let group2 = test_initiative.groups.get('2')
        //console.log('group0:', test_initiative.groups.get('0'))
        expect(group2.group_name, 'name incorrect').to.be.a('string').that.equals('My best friends');
        let contact2 = group2.contacts.get('20');
        expect(contact2, 'contact incorrect').to.be.an('array').that.includes('Don').that.includes('564-434-5354').and.includes('don.don@email.com');
    });

    // test adding goal method 
    it('should add a new goal', () => {
        let start =  moment('2020-06-08', 'YYYY-MM-DD', true);
        let until =  moment('2020-08-12', 'YYYY-MM-DD', true);
        test_initiative.add_goal([ start.toString(), 1, 'days', until.toString() ], 'email', {'0': 'tomorrow', '1':'next week'}, [ '0', '1' ],  'this is a new description');
        //console.log('new goals', test_initiative.goals);

        let goal0 = test_initiative.goals.get('0')
        //console.log('goal0:', test_initiative.goals.get('0'))
        expect(goal0.frequency[0], 'Goal does not have correct frequency start').to.be.a('string').that.includes('Mon Jun 08 2020 00:00:00');
        expect(goal0.frequency[1], 'Goal does not have correct frequency').to.equal(1);
        expect(goal0.frequency[2], 'Goal does not have correct frequency denomination').to.be.a('string').that.equals('days');
        expect(goal0.frequency[3], 'Goal does not have correct frequency date until').to.be.a('string').that.includes('Wed Aug 12 2020 00:00:00');
        expect(goal0.type, 'Goal does not have correct type').to.be.a('string').that.includes('email');
        expect(goal0.reminder, 'Goal does not have correct reminder').to.be.an('object').that.includes({'0': 'tomorrow'}).and.to.includes({'1': 'next week'});
        expect(goal0.linked_aves, 'Goal does not have correct ave ids linked').to.be.an('array').that.includes('0').and.includes('1');
        expect(goal0.description, 'Goal does not have correct description').to.be.an('string').that.equals('this is a new description');
    });

    // test the return of the add goal method 
    it('should return the id of the goal from add goal method return', () => {
        let start =  moment('2020-06-08', 'YYYY-MM-DD', true);
        let until =  moment('2020-07-25', 'YYYY-MM-DD', true);
        let id = test_initiative.add_goal([ start.toString(), 1, 'days', until.toString() ], 'email', {'0': 'tomorrow', '1':'next week'}, [ '0', '1' ], 'Blog posts'); 
        start =  moment('2020-06-08', 'YYYY-MM-DD', true);
        until = moment('2014-11-02', 'YYYY-MM-DD', true);
        let id1 = test_initiative.add_goal([start.toString(), 3, 'weeks', until.toString()], 'text', {'0': 'tonight'}, [ '1', '2' ], 'Weekly update');
        //console.log('new goals', test_initiative.goals);
        //console.log('goal 1 id: ', id, '\ngoal 2 id: ', id1);
        expect(id, "Does not return correct id").to.equal('0');
        expect(id1, "Does not return correct id").to.equal('1');
    });

    // test dynamic preformace of goals map 
    it('should remove a goal then re-add', () => {
        let start =  moment('2020-06-08', 'YYYY-MM-DD', true);
        let until =  moment('2020-07-25', 'YYYY-MM-DD', true);
        test_initiative.add_goal([ start.toString(), 1, 'days', until.toString()], 'email', {'0': 'tomorrow', '1':'next week'}, [ '0', '1' ], 'Daily Update'); 
        start =  moment('2014-06-08', 'YYYY-MM-DD', true);
        until = moment('2014-11-02', 'YYYY-MM-DD', true);
        test_initiative.add_goal([ start.toString(), 3, 'weeks', until.toString()], 'text', {'0': 'tonight'}, [ '1', '3' ], 'Weekly newsletter');
        //console.log('new goals', test_initiative.goals);
        // remove goal and test
        test_initiative.goals.delete('0');
        //console.log('removed messages', test_initiative.goals);
        let goal0 = test_initiative.goals.has('0')
        expect(goal0).to.be.false;
        let goal1 = test_initiative.goals.get('1')
        //console.log('goal1:', test_initiative.goals.get('1'))
        expect(goal1.frequency[0], 'Goal does not have correct frequency start').to.be.a('string').that.includes('Sun Jun 08 2014 00:00:00');
        expect(goal1.frequency[1], 'Goal does not have correct frequency').to.equal(3);
        expect(goal1.frequency[2], 'Goal does not have correct frequency denomination').to.be.a('string').that.equals('weeks');
        expect(goal1.frequency[3], 'Goal does not have correct frequency date until').to.be.a('string').that.includes('Sun Nov 02 2014 00:00:00');
        expect(goal1.type, 'Goal does not have correct type').to.be.a('string').that.includes('text');
        expect(goal1.reminder, 'Goal does not have correct reminder').to.be.an('object').that.includes({'0': 'tonight'});
        expect(goal1.linked_aves, 'Goal does not have correct ave ids linked').to.be.an('array').that.includes('1').and.includes('3');
        expect(goal1.description, 'Goal does not have correct description').to.be.an('string').that.equals('Weekly newsletter');

        // Test re-add goal
        start =  moment('2020-06-08', 'YYYY-MM-DD', true);
        until =  moment('2020-07-25', 'YYYY-MM-DD', true);
        test_initiative.add_goal([ start.toString(), 1, 'days', until.toString()], 'email', {'0': 'tomorrow', '1':'next week'}, [ '0', '1' ], 'Daily Update'); 
        //console.log('re-added message:', test_initiative.goals)
        goal0 = test_initiative.goals.get('0')
        //console.log('goal0:', test_initiative.goals.get('0'));
        expect(goal0.frequency[0], 'Goal does not have correct frequency start').to.be.a('string').that.includes('Mon Jun 08 2020 00:00:00');
        expect(goal0.frequency[1], 'Goal does not have correct frequency').to.equal(1);
        expect(goal0.frequency[2], 'Goal does not have correct frequency denomination').to.be.a('string').that.equals('days');
        expect(goal0.frequency[3], 'Goal does not have correct frequency date until').to.be.a('string').that.includes('Sat Jul 25 2020 00:00:00');
        expect(goal0.type, 'Goal does not have correct type').to.be.a('string').that.includes('email');
        expect(goal0.reminder, 'Goal does not have correct reminder').to.be.an('object').that.includes({'0': 'tomorrow'}).and.to.includes({'1': 'next week'});
        expect(goal0.linked_aves, 'Goal does not have correct ave ids linked').to.be.an('array').that.includes('0').and.includes('1');
        expect(goal0.description, 'Goal does not have correct description').to.be.an('string').that.equals('Daily Update');

        // Test adding additional goal after that
        start =  moment('2019-01-11', 'YYYY-MM-DD', true);
        until = moment('2019-03-10', 'YYYY-MM-DD', true);
        test_initiative.add_goal([ start.toString(), 9, 'years', until.toString()], 'facebook', {'0': 'in a month', '1':'when I need to'}, [ '1', '2' ], 'Blog posts'); 
        //console.log('added additional goal:', test_initiative.goals) 
        goal2 = test_initiative.goals.get('2')
        //console.log('goal2:', test_initiative.goals.get('2'))
        expect(goal2.frequency[0], 'Goal does not have correct frequency start').to.be.a('string').that.includes('Fri Jan 11 2019 00:00:00');
        expect(goal2.frequency[1], 'Goal does not have correct frequency').to.equal(9);
        expect(goal2.frequency[2], 'Goal does not have correct frequency denomination').to.be.a('string').that.equals('years');
        expect(goal2.frequency[3], 'Goal does not have correct frequency date until').to.be.a('string').that.includes('Sun Mar 10 2019 00:00:00');
        expect(goal2.type, 'Goal does not have correct type').to.be.a('string').that.includes('facebook');
        expect(goal2.reminder, 'Goal does not have correct reminder').to.be.an('object').that.includes({'0': 'in a month'}).and.to.includes({'1': 'when I need to'});
        expect(goal2.linked_aves, 'Goal does not have correct ave ids linked').to.be.an('array').that.includes('1').and.includes('2');
        expect(goal2.description, 'Goal does not have correct description').to.be.an('string').that.equals('Blog posts');
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
        let date =  moment('2020-07-25', 'YYYY-MM-DD', true);
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, '2', date.toString(), '2');
        // test single string values for people, and message ids  
        date = moment('2019-03-10', 'YYYY-MM-DD', true);
        test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message1', date.toString(), '1');
        //console.log('new avenues', test_initiative.avenues);

        let avenue0 = test_initiative.avenues.get('0')
        //console.log('avenue0:', test_initiative.avenues.get('0'))
        expect(avenue0.avenue_type, 'Does not have proper avenue_type').to.be.an('string').that.includes('email');
        expect(avenue0.description, 'Does not have proper description').to.be.an('string').that.includes('this is an email');
        expect(avenue0.person, 'Does not have proper people').to.be.an('array').that.includes('Bob').and.includes('Jill');
        expect(avenue0.sent, 'Does not have proper sent value').to.be.true;
        expect(avenue0.message_id, 'Does not have proper message id').to.be.a('string').that.equals('2');
        expect(avenue0.date, 'Does not have proper date').to.be.a('string').that.includes('Sat Jul 25 2020 00:00:00');
        expect(avenue0.goal_id, 'Does not have proper goal id').to.be.a('string').that.equals('2');

        let avenue1 = test_initiative.avenues.get('1')
        //console.log('avenue1:', test_initiative.avenues.get('1'))
        expect(avenue1.avenue_type,'Does not have proper avenue_type').to.be.an('string').that.includes('text');
        expect(avenue1.description, 'Does not have proper description').to.be.an('string').that.includes('this is a text');
        expect(avenue1.person, 'Does not have proper people').to.be.an('array').that.includes('Bill');
        expect(avenue1.sent, 'Does not have proper sent value').to.be.true;
        expect(avenue1.message_id, 'Does not have proper message id').to.be.an('string').that.equals('message1');
        expect(avenue1.date, 'Does not have proper date').to.be.a('string').that.includes('Sun Mar 10 2019 00:00:00');
        expect(avenue1.goal_id, 'Does not have proper goal id').to.be.a('string').that.equals('1');
    });

    // test the return of the add avenue method 
    it('should return the id of the avenue from add avenue method return', () => {
        let date =  moment('2020-07-25', 'YYYY-MM-DD', true);
        let id = test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, 'message2', date.toString(), '2');
        date = moment('2019-03-10', 'YYYY-MM-DD', true);
        let id1 = test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message4', date.toString(), '1');
        //console.log('new avenues', test_initiative.avenues);
        //console.log('avenue 1 id: ', id, '\navenue 2 id: ', id1);
        expect(id,"Does not return correct id").to.equal('0');
        expect(id1, "Does not return correct id").to.equal('1');
    });

    // test dynamic preformace of avenues map  
    it('should remove an avenue then re-add', () => {
        let date =  moment('2020-07-25', 'YYYY-MM-DD', true);
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, 'message1', date.toString(), '1');
        date = moment('2019-03-10', 'YYYY-MM-DD', true);
        test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message4', date.toString(), '2');
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
        expect(avenue1.date, 'Does not have proper date').to.be.a('string').that.includes('Sun Mar 10 2019 00:00:00');
        expect(avenue1.goal_id, 'Does not have proper goal id').to.be.a('string').that.equals('2');

        // Test re-add avenue
        date =  moment('2020-07-25', 'YYYY-MM-DD', true);
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, 'message3', date.toString(), '1');
        avenue0 = test_initiative.avenues.get('0')
        //console.log('re-added avenue:', test_initiative.avenues)
        expect(avenue0).to.exist
        expect(avenue0.avenue_type, 'Does not have proper avenue type').to.be.an('string').that.includes('email');
        expect(avenue0.description, 'Does not have proper description').to.be.an('string').that.includes('this is an email');
        expect(avenue0.person, 'Does not have proper people').to.be.an('array').that.includes('Bob').and.includes('Jill');
        expect(avenue0.sent, 'Does not have proper sent value').to.be.true;
        expect(avenue0.message_id, 'Does not have proper message id').to.be.an('string').that.equals('message3');
        expect(avenue0.date, 'Does not have proper date').to.be.a('string').that.includes('Sat Jul 25 2020 00:00:00');
        expect(avenue0.goal_id, 'Does not have proper goal id').to.be.a('string').that.equals('1');

        // Test adding additional avenue after that
        date =  moment('2000-02-20', 'YYYY-MM-DD', true);
        test_initiative.add_avenue('facebook', 'this is a facebook post', ['Tim', 'Bently'], true, 'message1', date.toString(), '0');
        //console.log('added asditional avenue:', test_initiative.avenues)
        let avenue2 = test_initiative.avenues.get('2')
        //console.log('avenue2:', test_initiative.avenues.get('2'))
        expect(avenue2, 'Avenue was not removed').to.exist
        expect(avenue2.avenue_type, 'Does not have proper avenue type').to.be.an('string').that.includes('facebook');
        expect(avenue2.description, 'Does not have proper description').to.be.an('string').that.includes('this is a facebook post');
        expect(avenue2.person, 'Does not have proper people').to.be.an('array').that.includes('Tim').and.includes('Bently');
        expect(avenue2.sent, 'Does not have proper sent value').to.be.true;
        expect(avenue2.message_id, 'Does not have proper message ids').to.be.an('string').that.equals('message1');
        expect(avenue2.date, 'Does not have proper date').to.be.a('string').that.includes('Sun Feb 20 2000 00:00:00');
        expect(avenue2.goal_id, 'Does not have proper goal id').to.be.a('string').that.equals('0');
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
        let date =  moment('2020-07-25', 'YYYY-MM-DD', true);
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, '', date.toString()); 
        date =  moment('2000-02-20', 'YYYY-MM-DD', true);
        test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message1', date.toString());
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
        let date =  moment('2020-07-25', 'YYYY-MM-DD', true);
        test_initiative.add_avenue('email', 'this is an email', ['Bob', 'Jill'], true, '', date.toString()); 
        date =  moment('2020-10-13', 'YYYY-MM-DD', true);
        test_initiative.add_avenue('text', 'this is a text', 'Bill', true, 'message1', date.toString());
        test_initiative.add_avenue(); // dummy avenue
        date =  moment('2019-08-05', 'YYYY-MM-DD', true);
        test_initiative.add_avenue('mail', 'this is a postcard', 'Tom', true, 'message1', date.toString())
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
        test_initiative.add_group('my peeps', [ ['Phil', '703-123-4565', 'philsemail@email.com'] ]);
        let start =  moment('2020-05-11', 'YYYY-MM-DD', true);
        let until =  moment('2020-07-25', 'YYYY-MM-DD', true);
        test_initiative.add_goal([ start.toString(), 1, 'days', until.toString() ], 'text', 'tomorrow', [ '0', '1' ], 'Blog posts');
        test_initiative.add_message('This is the title of the first message', 'this is its greeting', 'this is the content.', 'this is the signature', ['avenue1', 'avenue2']);
        let date =  moment('2020-10-05', 'YYYY-MM-DD', true);
        test_initiative.add_avenue('email', 'for all my peeps', 'Bob', true, '23', date.toString(), '0');
        //console.log('Initiative before packing:', test_initiative);
        let returned_initiative = test_initiative.pack_for_ipc();
        //console.log('Packed initiative:', returned_initiative);
        expect(returned_initiative, 'Initiative does not have proper keys').to.be.an('object').that.has.keys('name', 'description', 'groups', 'goals', 'messages', 'avenues', 'avenue_types');
        expect(returned_initiative.name, 'Name is not correct').to.be.a('string').that.equals('My Initiative');
        expect(returned_initiative.description, 'Description is not correct').to.be.a('string').that.equals('This is an initiavtive to communicate with people');
        
        // Nested Group Object
        expect(returned_initiative.groups, 'Groups type not packed').to.be.a('object').that.is.not.instanceOf(Map);
        let group0 = returned_initiative.groups['0'];
        //console.log(group0)
        expect(group0.group_name, 'name incorrect').to.be.a('string').that.equals('my peeps');
        expect(group0.contacts, 'Groups type not packed').to.not.be.instanceOf(Map);
        let contact0 = group0.contacts['00'];
        expect(contact0).to.be.an('array').that.includes('Phil').that.includes('703-123-4565').and.includes('philsemail@email.com');

        // Nested Goals object
        expect(returned_initiative.goals, 'Goals is not a map').to.be.instanceOf(Object);
        let goal0 = returned_initiative.goals['0'];
        //console.log(goal0)
        expect(goal0, 'Goal does not have proper keys').to.be.an('object').that.has.keys('frequency', 'type', 'reminder', 'linked_aves', 'description');
        expect(goal0.frequency[0], 'Goal does not have correct frequency date start').to.be.a('string').that.includes('Mon May 11 2020 00:00:00');
        expect(goal0.frequency[1], 'Goal does not have correct frequency').to.equal(1);
        expect(goal0.frequency[2], 'Goal does not have correct frequency denomination').to.be.a('string').that.equals('days');
        expect(goal0.frequency[3], 'Goal does not have correct frequency date until').to.be.a('string').that.includes('Sat Jul 25 2020 00:00:00');
        expect(goal0.type, 'Type is not correct').to.be.a('string').that.equals('text');
        expect(goal0.reminder, 'Reminder is not correct').to.be.a('string').that.equals('tomorrow');
        expect(goal0.linked_aves, 'Goal does not have correct ave ids linked').to.be.an('array').that.includes('0').and.includes('1');
        expect(goal0.description, 'Goal does not have correct description').to.be.an('string').that.equals('Blog posts');

        // Nested Message object
        expect(returned_initiative.messages, 'Messages is not a map').to.be.instanceOf(Object);
        let message0 = returned_initiative.messages['0'];
        //console.log(message0)
        expect(message0, 'Message does not have proper keys').to.be.an('object').that.has.keys('title', 'greeting', 'content', 'signature', 'avenue_ids');
        expect(message0.title, 'Title is not correct').to.be.a('string').that.equals('This is the title of the first message');
        expect(message0.greeting, 'Greeting is not correct').to.be.a('string').that.equals('this is its greeting');
        expect(message0.content, 'Content is not correct').to.be.a('string').that.equals('this is the content.');
        expect(message0.signature, 'Signature is not correct').to.be.a('string').that.equals('this is the signature');
        expect(message0.avenue_ids, 'Avenue_ids is not correct').to.be.a('array').that.includes('avenue1').and.includes('avenue2');
        
        // Nested Avenues object
        expect(returned_initiative.avenues, 'Avenues is not a map').to.be.instanceOf(Object);
        let avenue0 = returned_initiative.avenues['0'];
        //console.log(avenue0);
        expect(avenue0, 'Avenue does not have proper keys').to.be.an('object').that.has.keys('avenue_type', 'description', 'person', 'date', 'sent', 'message_id', 'goal_id');
        expect(avenue0.avenue_type, 'Avenue_type is not correct').to.be.a('string').that.equals('email');
        expect(avenue0.description, 'Description is not correct').to.be.a('string').that.equals('for all my peeps');
        expect(avenue0.person, 'Person is not correct').to.be.an('array').that.includes('Bob');
        expect(avenue0.date, 'Date is not correct').to.be.a('string').that.includes('Mon Oct 05 2020 00:00:00');
        expect(avenue0.sent, 'Sent is not correct').to.be.true; 
        expect(avenue0.message_id, 'Message_id is not correct').to.be.a('string').that.equals('23'); 
        expect(avenue0.goal_id, 'Goal_id is not correct').to.be.a('string').that.equals('0');
        
        // Avenue types
        expect(returned_initiative.avenue_types, 'avenue types are not correct').to.be.a('array').that.includes('Email').and.includes('Text').and.includes('Facebook').and.includes('Instagram').and.includes('Handout').and.includes('Poster').and.includes('Other');
    });
    
    // test converting back to maps and date objects from json string 
    it('should return unpacked objects', () => {
        test_initiative.change_name('My Initiative');
        test_initiative.change_description('This is an initiavtive to communicate with people');
        test_initiative.add_group('my peeps', [ ['Phil', '342-235-7653', 'myEmail@email.com'] ]);
        let start =  moment('2020-05-11', 'YYYY-MM-DD', true);
        let until =  moment('2020-07-25', 'YYYY-MM-DD', true);
        test_initiative.add_goal([ start.toString(), 1, 'days', until.toString() ], 'text', 'tomorrow', [ '0', '1' ], 'Blog posts');
        test_initiative.add_message('This is the title of the first message', 'this is its greeting', 'this is the content.', 'this is the signature', ['avenue1', 'avenue2']);
        let date =  moment('2016-01-08', 'YYYY-MM-DD', true);
        test_initiative.add_avenue('email', 'for all my peeps', 'Bob', true, '23', date.toString(), '0');
        //console.log('Initiative before packing:', test_initiative);
        returned_initiative = test_initiative.pack_for_ipc();
        test_initiative.unpack_from_ipc(returned_initiative);
        //console.log('converted objects:', test_initiative);
        expect(test_initiative, 'Initiative does not have proper keys').to.be.instanceOf(templates.Initiative).that.has.keys('name', 'description', 'groups', 'goals', 'messages', 'avenues', 'avenue_types');
        expect(test_initiative.name, 'Name is not correct').to.be.a('string').that.equals('My Initiative');
        expect(test_initiative.description, 'Description is not correct').to.be.a('string').that.equals('This is an initiavtive to communicate with people');
        
        // Nested Group Object
        expect(test_initiative.groups, 'Groups type not unpacked').to.be.instanceOf(Map);
        let group0 = test_initiative.groups.get('0');
        //console.log('groups: ', test_initiative.groups)
        expect(group0.group_name, 'name incorrect').to.be.a('string').that.equals('my peeps');
        expect(group0.contacts, 'Groups contacts not unpacked').to.be.instanceOf(Map);
        let contact0 = group0.contacts.get('00');
        //console.log('contact: ', contact0)
        expect(contact0).to.be.an('array').that.includes('Phil').that.includes('342-235-7653').and.includes('myEmail@email.com');

        
        // Nested Goals object
        expect(test_initiative.goals, 'Goals is not a map').to.be.instanceOf(Map);
        let goal0 = test_initiative.goals.get('0');
        //console.log(goal0);
        expect(goal0, 'Not a goal object').to.be.instanceOf(templates.Goal);
        expect(goal0, 'Goal does not have proper keys').to.have.keys('frequency', 'type', 'reminder', 'linked_aves', 'description');
        expect(goal0.frequency[0], 'Goal does not have correct frequency date start').to.be.a('string').that.includes('Mon May 11 2020 00:00:00');
        expect(goal0.frequency[1], 'Goal does not have correct frequency').to.equal(1);
        expect(goal0.frequency[2], 'Goal does not have correct frequency denomination').to.be.a('string').that.equals('days');
        expect(goal0.frequency[3], 'Goal does not have correct frequency date until').to.be.a('string').that.includes('Sat Jul 25 2020 00:00:00');
        expect(goal0.type, 'Type is not correct').to.be.a('string').that.equals('text');
        expect(goal0.reminder, 'Reminder is not correct').to.be.a('string').that.equals('tomorrow');
        expect(goal0.linked_aves, 'Goal does not have correct ave ids linked').to.be.an('array').that.includes('0').and.includes('1');
        expect(goal0.description, 'Goal does not have correct description').to.be.a('string').that.equals('Blog posts');

        // Nested Message object
        expect(test_initiative.messages, 'Messages is not a map').to.be.instanceOf(Map);
        let message0 = test_initiative.messages.get('0');
        //console.log(message0)
        expect(message0, 'Not a message object').to.be.instanceOf(templates.Message);
        expect(message0, 'Message does not have proper keys').to.have.keys('title', 'greeting', 'content', 'signature', 'avenue_ids');
        expect(message0.title, 'Title is not correct').to.be.a('string').that.equals('This is the title of the first message');
        expect(message0.greeting, 'Greeting is not correct').to.be.a('string').that.equals('this is its greeting');
        expect(message0.content, 'Content is not correct').to.be.a('string').that.equals('this is the content.');
        expect(message0.signature, 'Signature is not correct').to.be.a('string').that.equals('this is the signature');
        expect(message0.avenue_ids, 'Avenue_ids is not correct').to.be.a('array').that.includes('avenue1').and.includes('avenue2');
        
        // Nested Avenues object
        expect(test_initiative.avenues, 'Avenues is not a map').to.be.instanceOf(Map);
        let avenue0 = test_initiative.avenues.get('0');
        //console.log(avenue0)
        expect(avenue0, 'Not an avenue object').to.be.instanceOf(templates.Avenue);
        expect(avenue0, 'Avenue does not have proper keys').to.be.an('object').that.has.keys('avenue_type', 'description', 'person', 'date', 'sent', 'message_id', 'goal_id');
        expect(avenue0.avenue_type, 'Avenue_type is not correct').to.be.a('string').that.equals('email');
        expect(avenue0.description, 'Description is not correct').to.be.a('string').that.equals('for all my peeps');
        expect(avenue0.person, 'Person is not correct').to.be.an('array').that.includes('Bob');
        expect(avenue0.date, 'Date is not correct').to.be.a('string').that.includes('Fri Jan 08 2016 00:00:00');
        expect(avenue0.sent, 'Sent is not correct').to.be.true; 
        expect(avenue0.message_id, 'Message_id is not correct').to.be.a('string').that.includes('23'); 
        expect(avenue0.goal_id, 'Goal_id is not correct').to.be.a('string').that.equals('0');

        // Avenue types
        expect(test_initiative.avenue_types, 'avenue types are not correct').to.be.a('array').that.includes('Email').and.includes('Text').and.includes('Facebook').and.includes('Instagram').and.includes('Handout').and.includes('Poster').and.includes('Other');
    });
});

describe("Group object", function () {
    /*
    Test group constructor
    */
   var test_group;
    
   this.beforeEach( function () {
       test_group = new templates.Group('0');
   });

   it('should have all initial Group object keys', function () {
       //console.log(test_group);
       expect(test_group, 'Missing a key').to.have.keys('group_id','group_name', 'contacts');
       expect(test_group.group_id, 'Id is not a string').is.a('string');
       expect(test_group.group_name, 'Name is not a string').is.a('string');
       expect(test_group.contacts, 'Contacts is not a map').is.instanceOf(Map);
    });

   it('should add name and contacts on group creation', function () {
        // Add new group with contacts
        let new_group = new templates.Group('0', 'my group', [ ['Phil','343-452-2343', 'email'], ['Bill', '800-123-2342', 'myEmail@email.com'] ])
        expect(new_group.contacts, 'Contacts is not a map').is.instanceOf(Map);
        //console.log('group with contacts: ', new_group)
        // Verify name
        let name = new_group.group_name;
        expect(name, 'Group_name is incorrect').to.be.a('string').that.equals('my group');
        // Verify contacts added correctly 
        let contact0 = new_group.contacts.get('00');
        expect(contact0[0], 'Name incorrect').to.be.a('string').that.equals('Phil');
        expect(contact0[1], 'Phone number incorrect').to.be.a('string').that.equals('343-452-2343');
        expect(contact0[2], 'Email incorrect').to.be.a('string').that.equals('email');
        let contact1 = new_group.contacts.get('01');
        expect(contact1[0], 'Name incorrect').to.be.a('string').that.equals('Bill');
        expect(contact1[1], 'Phone number incorrect').to.be.a('string').that.equals('800-123-2342');
        expect(contact1[2], 'Email incorrect').to.be.a('string').that.equals('myEmail@email.com');
    });

    // test change group name 
    it('should change group name', () => {
        // Make sure that name is empty on start
        expect(test_group.group_name).to.be.a('string').that.equals('');
        // Change name
        test_group.change_group_name('John');
        // Verify change
        //console.log('new group name', test_group);
        expect(test_group.group_name, 'Name was not changed').to.be.a('string').equal('John');
    });
  
    // test get group name
    it('should return group name', () => {
        let name = test_group.get_group_name();
        expect(name, 'Name was not changed').to.be.a('string').equal('');
        // Change name 
        test_group.change_group_name('John');
        // Get the new name
        name = test_group.get_group_name();
        expect(name, 'Name was not changed').to.be.a('string').equal('John');
        //console.log('returned name', name);
    });

    // test add contact  
    it('should add contact', () => {
        test_group.add_contact('Bill', '745-123-3457', 'myEmail@email.com');
        let contact0 = test_group.contacts.get('00');
        expect(contact0[0], 'Name was not changed').to.be.a('string').that.equals('Bill');
        expect(contact0[1], 'Phone number was not changed').to.be.a('string').that.equals('745-123-3457');
        expect(contact0[2], 'Email was not changed').to.be.a('string').that.equals('myEmail@email.com');
        //console.log('new contact', test_group);
    });

    // test the return of the add avenue method 
    it('should return the id of the avenue from add avenue method return', () => {
        let id = test_group.add_contact('Bill', '745-123-3457', 'myEmail@email.com');
        let id1 = test_group.add_contact('Phil', '234-345-5432', 'philphil@email.com');
        //console.log('New contacts', test_group.contacts);
        //console.log('contact 1 id: ', id, '\ncontact 2 id: ', id1);
        expect(id,"Does not return correct id").to.equal('00');
        expect(id1, "Does not return correct id").to.equal('01');
    });

    // test dynamic preformance of contact map  
    it('should remove a contact then re-add', () => {
        test_group.add_contact('Bill', '745-123-3457', 'myEmail@email.com');
        test_group.add_contact('Phil', '432-234-2343', 'philphil@email.com');
        // remove contact and test
        test_group.contacts.delete('00');
        //console.log('removed contact',  test_group.contacts);
        let contact0 = test_group.contacts.has('00');
        expect(contact0).to.be.false;
        let contact1 = test_group.contacts.get('01')
        //console.log('contact1:', test_group.contacts.get('01'))
        expect(contact1[0], 'Name was not changed').to.be.a('string').that.equals('Phil');
        expect(contact1[1], 'Phone number was not changed').to.be.a('string').that.equals('432-234-2343');
        expect(contact1[2], 'Email was not changed').to.be.a('string').that.equals('philphil@email.com');
        // re-add contact
        test_group.add_contact('Bill', '745-123-3457', 'myEmail@email.com');
        contact0 = test_group.contacts.get('00');
        expect(contact0[0], 'Name was not changed').to.be.a('string').that.equals('Bill');
        expect(contact0[1], 'Phone number was not changed').to.be.a('string').that.equals('745-123-3457');
        expect(contact0[2], 'Email was not changed').to.be.a('string').that.equals('myEmail@email.com');
        //console.log('new contact', test_group);
    });

    // test pack group into vanilla objects 
    it('should pack group for ipc', () => {
        // Fill group
        test_group.change_group_name('My group'); 
        test_group.add_contact('Bill', '745-123-3457', 'myEmail@email.com');
        //console.log('group before packing: ', test_group);
        // Pack for ipc
        let packed_group = test_group.pack_grp_for_ipc();
        //console.log('group after packing: ', packed_group);
        expect(packed_group.group_id, 'Id did not pack correctly').to.be.a('string').that.equals('0');
        expect(packed_group.group_name, 'Name did not pack correctly').to.be.a('string').that.equals('My group');
        expect(packed_group.contacts, 'Contacts did not pack correctly').to.be.an('object').and.not.instanceof(Map);
        let contacts = packed_group.contacts;
        expect(contacts['00'][0], 'Name incorrect').to.be.a('string').that.equals('Bill');
        expect(contacts['00'][1], 'Phone number incorrect').to.be.a('string').that.equals('745-123-3457');
        expect(contacts['00'][2], 'Email incorrect').to.be.a('string').that.equals('myEmail@email.com');
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
       expect(test_goal, 'Missing a key').to.have.keys('frequency', 'type', 'reminder', 'linked_aves', 'description');
       expect(test_goal.frequency, 'frequency is not an array').is.a('array');
       expect(test_goal.type, 'type is not a string').is.a('string');
       expect(test_goal.reminder, 'reminder is not an object').is.an('object');
       expect(test_goal.linked_aves, 'linked avenue ids is not array').is.an('array');
       expect(test_goal.description, 'description is not a string').is.a('string');
    });

    // test change frequency 
    it('should change goal frequency', () => {
        let start =  moment('2020-06-08', 'YYYY-MM-DD', true);
        let until =  moment('2020-08-12', 'YYYY-MM-DD', true);
        test_goal.change_frequency(start.toString(), 1, 'days', until.toString());
        //console.log('new goal frequency', test_goal);
        expect(test_goal.frequency[0], 'Frequency start was not changed').to.be.a('string').that.includes('Mon Jun 08 2020 00:00:00');
        expect(test_goal.frequency[1], 'Frequency was not changed').to.equal(1);
        expect(test_goal.frequency[2], 'Frequency type was not changed').to.be.a('string').that.equals('days');
        expect(test_goal.frequency[3], 'Frequency until was not changed').to.be.a('string').that.includes('Wed Aug 12 2020 00:00:00');
    });
  
    // test return frequency
    it('should return frequency', () => {
        let start =  moment('2020-06-08', 'YYYY-MM-DD', true);
        let until =  moment('2020-08-12', 'YYYY-MM-DD', true);
        test_goal.change_frequency( start.toString(), 1, 'days', until.toString());
        // get the new frequency
        let frequency =  test_goal.get_frequency();
        //console.log('returned frequency', frequency);
        expect(frequency[0], 'Frequency start was not changed').to.be.a('string').that.includes('Mon Jun 08 2020 00:00:00');
        expect(frequency[1], 'Frequency was not changed').to.equal(1);
        expect(frequency[2], 'Frequency type was not changed').to.be.a('string').that.equals('days');
        expect(frequency[3], 'Frequency until was not changed').to.be.a('string').that.includes('Wed Aug 12 2020 00:00:00');
    });

     // test change type 
     it('should change goal type', () => {
        test_goal.change_type('email');
        //console.log('new goal type', test_goal);
        expect(test_goal.type, 'Type was not changed').to.be.a('string').that.equals('email');
    });
  
    // test return type
    it('should return type', () => {
        test_goal.change_type('text');
        // get the new type
        let type =  test_goal.get_type();
        //console.log('returned type', type);
        expect(type, 'Type was not returned').to.be.a('string').that.equals('text');
    });

     // test change linked avenue ids
     it('should change linked avenue ids', () => {
        test_goal.change_avenue_id('1');
        //console.log('new avenue id', test_goal);
        expect(test_goal.linked_aves, 'Avenue id was not changed').to.be.an('array').that.includes('1');
    });
    
    // test add avenue id 
    it('should add an avenue id', () => {
        test_goal.add_avenue_id('0');
        test_goal.add_avenue_id('1');
        test_goal.add_avenue_id('2');
        test_goal.add_avenue_id('3');
        //console.log('new avenue ids:', test_goal);
        expect(test_goal.linked_aves, 'New avenue ids were not added').to.be.an('array').that.includes('0').and.includes('1').and.includes('2').and.includes('3');
    });
    
    // test return avenue ids 
    it('should return avenue ids', () => {
        test_goal.add_avenue_id('0');
        test_goal.add_avenue_id('1');
        test_goal.add_avenue_id('2');
        test_goal.add_avenue_id('3');
        let avenue_ids = test_goal.get_avenue_ids();
        //console.log('new avenue ids:', test_goal);;
        expect(avenue_ids, 'Avenue ids were not returned').to.be.an('array').that.includes('0').and.includes('1').and.includes('2').and.includes('3');
    });

    // test clear avenue ids 
    it('should clear avenue ids', () => {
        test_goal.add_avenue_id('0');
        test_goal.add_avenue_id('1');
        test_goal.add_avenue_id('2');
        test_goal.add_avenue_id('3');
        //console.log('new avenue ids:', test_goal);;
        test_goal.clear_avenue_ids();
        //console.log('cleared avenue ids:', test_goal);;
        expect(test_goal.linked_aves, 'Avenue ids were not cleared').to.be.an('array').and.to.have.length(0);
    });

    // test change description
    it('should change description', () => {
        test_goal.change_description('This is a new description');
        //console.log('new description:', test_goal);
        expect(test_goal.description, 'Description was not changed').to.be.an('string').that.equals('This is a new description');
    });
    
    // test return description
    it('should return description', () => {
        test_goal.change_description('This is a new description');
        let goal_description = test_goal.get_description();
        //console.log('returned description:', avenue_goal);
        expect(goal_description, 'Goal description was not returned').to.be.an('string').that.equals('This is a new description');
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
        expect(test_message).to.have.keys('title', 'greeting', 'content', 'signature', 'avenue_ids')
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
        test_message.change_avenue_id('1');
        //console.log('new avenue id', test_message);
        expect(test_message.avenue_ids, 'Avenue id was not changed').to.be.an('array').that.includes('1');
    });
    
    // test add avenue id 
    it('should add an avenue id', () => {
        test_message.add_avenue_id('0');
        test_message.add_avenue_id('1');
        test_message.add_avenue_id('2');
        test_message.add_avenue_id('3');
        //console.log('new avenue ids:', test_message);
        expect(test_message.avenue_ids, 'New avenue ids were not added').to.be.an('array').that.includes('0').and.includes('1').and.includes('2').and.includes('3');
    });
    
    // test return avenue ids 
    it('should return avenue ids', () => {
        test_message.add_avenue_id('0');
        test_message.add_avenue_id('1');
        test_message.add_avenue_id('2');
        test_message.add_avenue_id('3');
        let avenue_ids = test_message.get_avenue_ids();
        //console.log('new avenue ids:', test_message);;
        expect(avenue_ids, 'Avenue ids were not returned').to.be.an('array').that.includes('0').and.includes('1').and.includes('2').and.includes('3');
    });

    // test clear avenue ids 
    it('should clear avenue ids', () => {
        test_message.add_avenue_id('0');
        test_message.add_avenue_id('1');
        test_message.add_avenue_id('2');
        test_message.add_avenue_id('3');
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
       expect(test_avenue, 'Missing a key').to.have.keys('avenue_type', 'description', 'person', 'date', 'sent', 'message_id', 'goal_id');
       expect(test_avenue.avenue_type, 'avenue_type is not a string').is.a('string');
       expect(test_avenue.description, 'descrition is not a string').is.a('string');
       expect(test_avenue.person, 'person is not an array').is.an('array');
       expect(test_avenue.date, 'date is not a date').is.a('string');
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
        let date =  moment('2020-07-25', 'YYYY-MM-DD', true);
        test_avenue.change_date(date.toString());
        //console.log('new dates', test_avenue.date);
        expect(test_avenue.date).to.be.a('string').that.includes('Sat Jul 25 2020 00:00:00');
    });
   
    // test return dates
    it('should return date', () => {
        let date =  moment('2020-07-25', 'YYYY-MM-DD', true);
        test_avenue.change_date(date.toString());
        //console.log('changed date:', test_avenue.date);
        let avenue_date = test_avenue.get_dates();
        //console.log('returned date:', avenue_date);
        expect(avenue_date, 'Date was not returned').to.be.a('string').that.includes('Sat Jul 25 2020 00:00:00');
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
        test_avenue.change_message_id('1');
       //console.log('new message id', test_avenue);
        expect(test_avenue.message_id, 'Message_id was not changed').to.be.an('string').that.equals('1');
    });
  
    // test return message id 
    it('should return message id', () => {
        test_avenue.change_message_id('1');
        // get the new id
        let message_id = test_avenue.get_message_id();
        //console.log('returned message id:', message_id);
        expect(message_id, 'Message_id was not returned').to.be.an('string').that.equals('1');
    });

    // test clear message id 
    it('should clear message id', () => {
        test_avenue.change_message_id('1');
        //console.log('message id added:', test_avenue);
        // Clear the id
        test_avenue.clear_message_id();
        //console.log('cleared message id:', test_avenue);
        expect(test_avenue.message_id, 'Message ids were not cleared').to.be.an('string').that.equals('');
    });

    // test change goal id
    it('should change goal id', () => {
        test_avenue.change_goal_id('1');
       //console.log('new goal id', test_avenue);
        expect(test_avenue.goal_id, 'Goal_id was not changed').to.be.an('string').that.equals('1');
    });
  
    // test return goal id 
    it('should return goal id', () => {
        test_avenue.change_goal_id('1');
        // get the new id
        let goal_id = test_avenue.get_goal_id();
        //console.log('returned goal id:', goal_id);
        expect(goal_id, 'Goal_id was not returned').to.be.an('string').that.equals('1');
    });

    // test clear goal id 
    it('should clear goal id', () => {
        test_avenue.change_goal_id('1');
        //console.log('goal id added:', test_avenue);
        // clear the id
        test_avenue.clear_goal_id();
        //console.log('cleared goal id:', test_avenue);
        expect(test_avenue.goal_id, 'Goal ids were not cleared').to.be.an('string').that.equals('');
    });
});
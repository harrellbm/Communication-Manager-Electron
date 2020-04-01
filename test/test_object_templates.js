const expect = require('chai').expect;
const templates = require('../src/objectTemplate.js')

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
        expect(test_message).to.include.keys('title', 'greeting', 'content', 'signature', 'avenue_types', 'avenue_count')
        expect(test_message.title, 'title is not a string').is.a('string');
        expect(test_message.greeting, 'greeting is not a string').is.a('string');
        expect(test_message.content, 'content is not a string').is.a('string');
        expect(test_message.signature, 'signature is not a string').is.a('string');
        expect(test_message.avenue_types, 'avenue_types is not an array').is.an('array');
        expect(test_message.avenue_count, 'avenue_count is not a number').is.a('number');
    })

    // test change title method 
    it('should have a new title', () => {
        let new_title = 'This is a new Title'
        test_message.change_title(new_title)
        //console.log(test_message)
        expect(test_message.title).to.be.a('string').that.includes('This is a new Title')
    })

    // test change greeting method 
    it('should have a new greeting', () => {
        let new_greeting = 'This is a new Greeting'
        test_message.change_greeting(new_greeting)
        //console.log('Greeting', test_message)
        expect(test_message.greeting).to.be.a('string').that.includes('This is a new Greeting')
    })

    // test change content method 
    it('should have new content', () => {
        let new_content = 'This is new Content'
        test_message.change_content(new_content)
        //console.log('Content', test_message)
        expect(test_message.content).to.be.a('string').that.includes('This is new Content')
    })
    
     // test change signature method 
    it('should have a new signature', () => {
        let new_signature = 'This is a new Signature'
        test_message.change_signature(new_signature)
        //console.log('Signature', test_message)
        expect(test_message.signature).to.be.a('string').that.includes('This is a new Signature')
    })

    // test adding avenue_type method 
    it('should have new avenue_type', () => {
        let new_avenue_type = 'Facebook'
        test_message.add_type(new_avenue_type)
        //console.log('avenue types', test_message)
        expect(test_message.avenue_types).to.be.an('array').that.includes('Facebook')
    })

    // test filling lowest id method 
    it('should return lowest available id', () => {
        test_message.avenues = {'0': 'avenue', '1': 'avenue2', '2': 'avenue3'};
        //console.log(test_message.avenues);
        let test = test_message.avenue_id_fill();
        //console.log(test);
        expect(test).to.be.a('number').that.equals(3);
        test_message.avenues = {'0': 'avenue', '2': 'avenue3'};
        //console.log(test_message.avenues);
        test = test_message.avenue_id_fill();
        //console.log(test);
        expect(test).to.be.a('number').that.equals(1);
        test_message.avenues = {'1': 'avenue2', '2': 'avenue3'};
        //console.log(test_message.avenues);
        test = test_message.avenue_id_fill();
        //console.log(test);
        expect(test).to.be.a('number').that.equals(0);
    })
    // test adding avenue method 
    it('should have a new avenue', () => {
        // test giving array of people, dates, and gui ids
        test_message.add_avenue('email', 'this is an email', ['Bob', 'Jill'], ['12-12-12', '1-1-1'], true, ['test', 'left', 'right']);
        // test single string values for people, dates, and gui ids 
        test_message.add_avenue('text', 'this is a text', 'Bill', '11-1-11', true, 'test');
        //console.log('new avenue', test_message.avenues);
        expect(test_message.avenues[0].avenue_type).to.be.an('string').that.includes('email');
        expect(test_message.avenues[0].description).to.be.an('string').that.includes('this is an email');
        expect(test_message.avenues[0].person).to.be.an('array').that.includes('Bob').and.includes('Jill');
        expect(test_message.avenues[0].date).to.be.an('array').that.includes('12-12-12').and.includes('1-1-1');
        expect(test_message.avenues[0].sent).to.be.true;
        expect(test_message.avenues[0].gui_ids).to.be.an('array').that.includes('test').and.includes('left').and.includes('right');
        expect(test_message.avenues[1].avenue_type).to.be.an('string').that.includes('text');
        expect(test_message.avenues[1].description).to.be.an('string').that.includes('this is a text');
        expect(test_message.avenues[1].person).to.be.an('array').that.includes('Bill');
        expect(test_message.avenues[1].date).to.be.an('array').that.includes('11-1-11');
        expect(test_message.avenues[1].sent).to.be.true;
        expect(test_message.avenues[1].gui_ids).to.be.an('array').that.includes('test');
    })

    it('should get the id of the avenue from add avenue method return', () => {
        let id = test_message.add_avenue('email', 'this is an email', ['Bob', 'Jill'], ['12-12-12', '1-1-1'], true, ['test', 'left', 'right']);
        let id2 = test_message.add_avenue('text', 'this is a text', 'Bill', '11-1-11', true, 'test');
        let id3 = test_message.add_avenue('facebook', 'this is a facebook post', 'Bonny', '3-1-89', true, 'test');
        //console.log('new avenues', test_message.avenues);
        //console.log('avenue 1 id: ', id, '\navenue 2 id: ', id2, '\navenue 3 id: ', id3);
        expect(id).to.equal(0);
        expect(id2).to.equal(1);
        expect(id3).to.equal(2);
    })
    
    // test removing avenue method 
    it('should remove an avenue', () => {
        test_message.add_avenue('email', 'this is an email', ['Bob', 'Jill'], ['12-12-12', '1-1-1'], true, ['test', 'left', 'right']);
        test_message.add_avenue('text', 'this is a text', 'Bill', '11-1-11', true, 'test');
        //console.log('new avenues', test_message.avenues);
        test_message.remove_avenue(0);
        //console.log('removed avenues', test_message.avenues);
        expect(test_message.avenues[0]).to.not.exist;
        expect(test_message.avenues[1].avenue_type).to.be.an('string').that.includes('text');
        expect(test_message.avenues[1].description).to.be.an('string').that.includes('this is a text');
        expect(test_message.avenues[1].person).to.be.an('array').that.includes('Bill');
        expect(test_message.avenues[1].date).to.be.an('array').that.includes('11-1-11');
        expect(test_message.avenues[1].sent).to.be.true;
        expect(test_message.avenues[1].gui_ids).to.be.an('array').that.includes('test');

        // test re-add avenue
        test_message.add_avenue('phone', 'this is a phone call', ['Bob', 'Jill'], ['12-12-12', '8-9-8'], true, ['test', 'left', 'right']);
        expect(test_message.avenues[0]).to.exist
        expect(test_message.avenues[0].avenue_type).to.be.an('string').that.includes('phone');
        expect(test_message.avenues[0].description).to.be.an('string').that.includes('this is a phone call');
        expect(test_message.avenues[0].person).to.be.an('array').that.includes('Bob').and.includes('Jill');
        expect(test_message.avenues[0].date).to.be.an('array').that.includes('12-12-12').and.includes('8-9-8');
        expect(test_message.avenues[0].sent).to.be.true;
        expect(test_message.avenues[0].gui_ids).to.be.an('array').that.includes('test');
        test_message.add_avenue('facebook', 'this is a facebook post', ['Tim', 'Bently'], ['12-7-1993', '2-31-2020'], true, ['test', 'left', 'right']);
        expect(test_message.avenues[2]).to.exist
        expect(test_message.avenues[2].avenue_type).to.be.an('string').that.includes('facebook');
        expect(test_message.avenues[2].description).to.be.an('string').that.includes('this is a facebook post');
        expect(test_message.avenues[2].person).to.be.an('array').that.includes('Tim').and.includes('Bently');
        expect(test_message.avenues[2].date).to.be.an('array').that.includes('12-7-1993').and.includes('2-31-2020');
        expect(test_message.avenues[2].sent).to.be.true;
        expect(test_message.avenues[2].gui_ids).to.be.an('array').that.includes('test');
    })
    
    it('should clear all avenues', () => {
        test_message.add_avenue('email', 'this is an email', ['Bob', 'Jill'], ['12-12-12', '1-1-1'], true, ['test', 'left', 'right']);
        test_message.add_avenue('text', 'this is a text', 'Bill', '11-1-11', true, 'test');
        test_message.add_avenue('facebook', 'this is a facebook post', 'Bonny', '3-1-89', true, 'test');
        //console.log('new avenues', test_message.avenues);
        test_message.remove_all_avenues()
        //console.log('no avenues', test_message.avenues);
        expect(test_message.avenues[0]).to.not.exist;
        expect(test_message.avenues[1]).to.not.exist;
        expect(test_message.avenues[2]).to.not.exist;
    })

    // test change avenue type
    it('should change avenue type', () => {
        test_message.add_avenue();
        test_message.add_avenue();
        test_message.change_avenue_type(0, 'Aliens');
        test_message.change_avenue_type(1, 'Facebook');
        //console.log('new avenue types', test_message);
        expect(test_message.avenues[0].avenue_type).to.be.an('string').that.includes('Aliens');
        expect(test_message.avenues[1].avenue_type).to.be.an('string').that.includes('Facebook');
    })
  
    // test return avenue types
    it('should return avenue type', () => {
        test_message.add_avenue('Alien');
        test_message.add_avenue('Facebook', '', '', '', false, '');
        let avenue_type1 = test_message.get_avenue_type(0);
        let avenue_type2 = test_message.get_avenue_type(1);
        //console.log('returned avenues', avenue_type1, avenue_type2);
        expect(avenue_type1).to.be.an('string').that.includes('Alien');
        expect(avenue_type2).to.be.an('string').that.includes('Facebook');
    })
  
    // test change description
    it('should have a new description', () => {
        test_message.add_avenue('email', 'this is an email', ['Bob', 'Jill'], ['12-12-12', '1-1-1'], true, ['test', 'left', 'right']);
        test_message.add_avenue('text', 'this is a text', 'Bill', '11-1-11', true, 'test');
        test_message.change_description(0, 'This is a new description 1');
        test_message.change_description(1, 'This is a new description 2');
        //console.log('new descriptions', test_message);
        expect(test_message.avenues[0].description).to.be.an('string').that.includes('This is a new description 1');
        expect(test_message.avenues[1].description).to.be.an('string').that.includes('This is a new description 2');
    })
    
    // test return description
    it('should return description', () => {
        test_message.add_avenue('email', 'this is an email', ['Bob', 'Jill'], ['12-12-12', '1-1-1'], true, ['test', 'left', 'right']);
        test_message.add_avenue('text', 'this is a text', 'Bill', '11-1-11', true, 'test');
        test_message.change_description(0, 'This is a new description 1');
        test_message.change_description(1, 'This is a new description 2');
        let avenue_description1 = test_message.get_description(0);
        let avenue_description2 = test_message.get_description(1);
        //console.log('returned descriptions', avenue_description1, avenue_description2);
        expect(avenue_description1).to.be.an('string').that.includes('This is a new description 1');
        expect(avenue_description2).to.be.an('string').that.includes('This is a new description 2');
    })
    
    // test change person
    it('should have a new person', () => {
        test_message.add_avenue('email', 'this is an email', ['Bob', 'Jill'], ['12-12-12', '1-1-1'], true, ['test', 'left', 'right']);
        test_message.add_avenue('text', 'this is a text', 'Bill', '11-1-11', true, 'test');
        test_message.change_person(0, 'Jill');
        test_message.change_person(1, 'Bob');
        //console.log('new person', test_message);
        expect(test_message.avenues[0].person).to.be.an('string').that.includes('Jill');
        expect(test_message.avenues[1].person).to.be.an('string').that.includes('Bob');
    })
    
    // test add person - keep working on 
    it('should add a new person', () => {
        test_message.add_avenue('email', 'this is an email', ['Phil', 'Tom'], ['12-12-12', '1-1-1'], true, ['test', 'left', 'right']);
        test_message.add_avenue('text', 'this is a text', 'John', '11-1-11', true, 'test');
        test_message.add_person(0, 'Jill');
        test_message.add_person(0, 'Bob');
        test_message.add_person(1, 'Tim');
        test_message.add_person(1, 'Bill');
        //console.log('new people', test_message.avenues);
        expect(test_message.avenues[0].person).to.be.an('array').that.includes('Jill').and.includes('Bob').and.includes("Tom").and.includes('Phil');
        expect(test_message.avenues[1].person).to.be.an('array').that.includes('Tim').and.includes('Bill').and.includes('John');
    })
    
    // test return people
    it('should return people', () => {
        test_message.add_avenue('email', 'this is an email', ['Bob', 'Jill'], ['12-12-12', '1-1-1'], true, ['test', 'left', 'right']);
        test_message.add_avenue('text', 'this is a text', 'Bill', '11-1-11', true, 'test');
        test_message.add_person(0, 'Joe');
        test_message.add_person(0, 'Phil');
        test_message.add_person(1, 'Jill');
        test_message.add_person(1, 'John');
        let avenue_people1 = test_message.get_people(0);
        let avenue_people2 = test_message.get_people(1);
        //console.log('returned people', avenue_people1, 'and', avenue_people2);
        expect(avenue_people1).to.be.a('string').that.includes('Joe').and.includes('Phil').and.includes('Bob');
        expect(avenue_people2).to.be.a('string').that.includes('John').and.includes('Jill').and.includes('Bill');
    })
   
    // test change date
    it('should have a new date', () => {
        test_message.add_avenue('email', 'this is an email', ['Bob', 'Jill'], ['9-9-9', '1-1-1'], true, ['test', 'left', 'right']);
        test_message.add_avenue('text', 'this is a text', 'Bill', '8-8-8', true, 'test');
        test_message.change_date(0, '12-12-12');
        test_message.change_date(1, '11-1-11');
        //console.log('new dates', test_message.avenues);
        expect(test_message.avenues[0].date).to.be.an('string').that.includes('12-12-12').and.not.include('9-9-9').and.not.include('1-1-1');
        expect(test_message.avenues[1].date).to.be.an('string').that.includes('11-1-11').and.not.include('8-8-8');
    })
   
    // test add date
    it('should add a new date', () => {
        test_message.add_avenue('email', 'this is an email', ['Bob', 'Jill'], ['9-9-9', '1-1-1'], true, ['test', 'left', 'right']);
        test_message.add_avenue('text', 'this is a text', 'Bill', '8-8-8', true, 'test');
        test_message.add_date(0, '12-12-12');
        test_message.add_date(0, '11-1-11');
        test_message.add_date(1, '10-9-10');
        test_message.add_date(1, '9-9-9');
        //console.log('new dates', test_message.avenues);
        expect(test_message.avenues[0].date).to.be.an('array').that.includes('12-12-12').and.includes('11-1-11').and.includes('9-9-9').and.includes('1-1-1');
        expect(test_message.avenues[1].date).to.be.an('array').that.includes('10-9-10').and.includes('9-9-9').and.includes('8-8-8');
    })

    // test return dates
    it('should return dates', () => {
        test_message.add_avenue('email', 'this is an email', ['Bob', 'Jill'], ['9-9-9', '1-1-1'], true, ['test', 'left', 'right']);
        test_message.add_avenue('text', 'this is a text', 'Bill', '5-5-5', true, 'test');
        test_message.add_date(0, '12-12-12');
        test_message.add_date(0, '11-1-11');
        test_message.add_date(1, '10-9-10');
        test_message.add_date(1, '8-8-8');
        let avenue_dates1 = test_message.get_dates(0);
        let avenue_dates2 = test_message.get_dates(1);
        //console.log('returned people', avenue_dates1, avenue_dates2);
        expect(avenue_dates1).to.be.an('string').that.includes('12-12-12').and.includes('11-1-11').and.includes('9-9-9').and.includes('1-1-1');;
        expect(avenue_dates2).to.be.an('string').that.includes('10-9-10').and.includes('8-8-8').and.includes('5-5-5');
    })
  
    // test change sent
    it('should have a new sent value', () => {
        test_message.add_avenue('email', 'this is an email', ['Bob', 'Jill'], ['9-9-9', '1-1-1'], false, ['test', 'left', 'right']);
        test_message.add_avenue('text', 'this is a text', 'Bill', '5-5-5', true, 'test');
        test_message.change_sent(0, true);
        test_message.change_sent(1, false);
        //console.log('new sent', test_message);
        expect(test_message.avenues[0].sent).to.be.true;
        expect(test_message.avenues[1].sent).to.be.false;
    })
})

describe("Avenue object", function () {
    /*
    Test Avenue constructor
    */
   it('should have all initial Avenue object keys', function () {
       let test_avenue = templates.createAvenue(['test', 'left', 'right']);
       //console.log(test_avenue);
       expect(test_avenue, 'Missing a key').to.include.keys('avenue_type', 'description', 'person', 'date', 'sent', 'gui_ids')
       expect(test_avenue.avenue_type, 'avenue_type is not a string').is.a('string');
       expect(test_avenue.description, 'descrition is not a string').is.a('string');
       expect(test_avenue.person, 'person is not an array').is.an('array');
       expect(test_avenue.date, 'date is not an array').is.an('array');
       expect(test_avenue.sent, 'sent is not a boolean').is.an('boolean');
       expect(test_avenue.gui_ids, 'gui_ids are not an array').is.an('array');

    })

})

/*       
class TestCampaign(unittest.TestCase):
    """
    Tests all methods of the Campaign class
    """
    pass
*/
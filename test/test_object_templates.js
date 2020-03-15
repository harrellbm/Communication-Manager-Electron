const expect = require('chai').expect;
var templates = require('../objectTemplate.js')

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

    // test adding avenue method 
    it('should have a new avenue', () => {
        let new_avenue1 = templates.createAvenue(['test', 'left', 'right']);
        test_message.add_avenue(new_avenue1);
        let new_avenue2 = templates.createAvenue(['test2', 'left2', 'right2']);
        test_message.add_avenue(new_avenue2);
        //console.log('new avenue', test_message);
        expect(test_message.avenues).to.be.an('array').that.includes(new_avenue1).and.includes(new_avenue2)
    })

    // test change avenue type
    it('should change avenue type', () => {
        let new_avenue1 = templates.createAvenue(['test', 'left', 'right']);
        test_message.add_avenue(new_avenue1);
        let new_avenue2 = templates.createAvenue(['test2', 'left2', 'right2']);
        test_message.add_avenue(new_avenue2);
        test_message.change_avenue_type(0, 'Aliens');
        test_message.change_avenue_type(1, 'Facebook');
        //console.log('new avenue types', test_message);
        expect(test_message.avenues[0].avenue_type).to.be.an('string').that.includes('Aliens');
        expect(test_message.avenues[1].avenue_type).to.be.an('string').that.includes('Facebook');
    })
  
    // test return avenue types
    it('should return avenue type', () => {
        let new_avenue1 = templates.createAvenue(['test', 'left', 'right']);
        test_message.add_avenue(new_avenue1);
        let new_avenue2 = templates.createAvenue(['test2', 'left2', 'right2']);
        test_message.add_avenue(new_avenue2);
        test_message.change_avenue_type(0, 'Aliens');
        test_message.change_avenue_type(1, 'Facebook');
        let avenue_type1 = test_message.get_avenue_type(0);
        let avenue_type2 = test_message.get_avenue_type(1);
        //console.log('returned avenues', avenue_type1, avenue_type2);
        expect(avenue_type1).to.be.an('string').that.includes('Aliens');
        expect(avenue_type2).to.be.an('string').that.includes('Facebook');
    })
  
    // test change description
    it('should have a new description', () => {
        let new_avenue1 = templates.createAvenue(['test', 'left', 'right']);
        test_message.add_avenue(new_avenue1);
        let new_avenue2 = templates.createAvenue(['test2', 'left2', 'right2']);
        test_message.add_avenue(new_avenue2);
        test_message.change_description(0, 'This is a new description 1');
        test_message.change_description(1, 'This is a new description 2');
        //console.log('new descriptions', test_message);
        expect(test_message.avenues[0].description).to.be.an('string').that.includes('This is a new description 1');
        expect(test_message.avenues[1].description).to.be.an('string').that.includes('This is a new description 2');
    })
    
    // test return description
    it('should return description', () => {
        let new_avenue1 = templates.createAvenue(['test', 'left', 'right']);
        test_message.add_avenue(new_avenue1);
        let new_avenue2 = templates.createAvenue(['test2', 'left2', 'right2']);
        test_message.add_avenue(new_avenue2);
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
        let new_avenue1 = templates.createAvenue(['test', 'left', 'right']);
        test_message.add_avenue(new_avenue1);
        let new_avenue2 = templates.createAvenue(['test2', 'left2', 'right2']);
        test_message.add_avenue(new_avenue2);
        test_message.change_person(0, 'Jill');
        test_message.change_person(1, 'Bob');
        //console.log('new person', test_message);
        expect(test_message.avenues[0].person).to.be.an('string').that.includes('Jill');
        expect(test_message.avenues[1].person).to.be.an('string').that.includes('Bob');
    })
    
    // test add person - keep working on 
    it('should add a new person', () => {
        let new_avenue1 = templates.createAvenue(['test', 'left', 'right']);
        test_message.add_avenue(new_avenue1);
        let new_avenue2 = templates.createAvenue(['test2', 'left2', 'right2']);
        test_message.add_avenue(new_avenue2);
        test_message.add_person(0, 'Jill');
        test_message.add_person(0, 'Bob');
        test_message.add_person(1, 'Tim');
        test_message.add_person(1, 'Bill');
        console.log('new people', test_message);
        expect(test_message.avenues[0].person).to.be.an('array').that.includes('Jill');
        expect(test_message.avenues[0].person).to.be.an('array').that.includes('Bob');
        expect(test_message.avenues[1].person).to.be.an('array').that.includes('Tim');
        expect(test_message.avenues[1].person).to.be.an('array').that.includes('Bill');
    })
    
    // test return people
    it('should return people', () => {
        let new_avenue1 = templates.createAvenue(['test', 'left', 'right']);
        test_message.add_avenue(new_avenue1);
        let new_avenue2 = templates.createAvenue(['test2', 'left2', 'right2']);
        test_message.add_avenue(new_avenue2);
        test_message.add_person(0, 'Joe');
        test_message.add_person(1, 'John');
        let avenue_people1 = test_message.get_people(0);
        let avenue_people2 = test_message.get_people(1);
        console.log('returned people', avenue_people1, avenue_people2);
        expect(avenue_people1).to.be.an('array').that.includes('Joe');
        expect(avenue_people2).to.be.an('array').that.includes('John');
    })
   
    // test change date
    it('should have a new date', () => {
        let new_avenue1 = templates.createAvenue(['test', 'left', 'right']);
        test_message.add_avenue(new_avenue1);
        let new_avenue2 = templates.createAvenue(['test2', 'left2', 'right2']);
        test_message.add_avenue(new_avenue2);
        test_message.change_date(0, '12-12-12');
        test_message.change_date(1, '11-1-11');
        console.log('new dates', test_message);
        expect(test_message.avenues[0].date).to.be.an('string').that.includes('12-12-12');
        expect(test_message.avenues[1].date).to.be.an('string').that.includes('11-1-11');
    })
   
    // test add date
    it('should add a new date', () => {
        let new_avenue1 = templates.createAvenue(['test', 'left', 'right']);
        test_message.add_avenue(new_avenue1);
        let new_avenue2 = templates.createAvenue(['test2', 'left2', 'right2']);
        test_message.add_avenue(new_avenue2);
        test_message.add_date(0, '12-12-12');
        test_message.add_date(0, '11-1-11');
        test_message.add_date(1, '10-9-10');
        test_message.add_date(1, '9-9-9');
        console.log('new dates', test_message);
        expect(test_message.avenues[0].date).to.be.an('array').that.includes('12-12-12').and.includes('11-1-11');
        expect(test_message.avenues[1].date).to.be.an('array').that.includes('10-9-10').and.includes('9-9-9');
    })

    // test return dates
    it('should return dates', () => {
        let new_avenue1 = templates.createAvenue(['test', 'left', 'right']);
        test_message.add_avenue(new_avenue1);
        let new_avenue2 = templates.createAvenue(['test2', 'left2', 'right2']);
        test_message.add_avenue(new_avenue2);
        test_message.add_date(0, '12-12-12');
        test_message.add_date(0, '11-1-11');
        test_message.add_date(1, '10-9-10');
        test_message.add_date(1, '9-9-9');
        let avenue_dates1 = test_message.get_dates(0);
        let avenue_dates2 = test_message.get_dates(1);
        console.log('returned people', avenue_people1, avenue_people2);
        expect(avenue_dates1).to.be.an('array').that.includes('12-12-12').and.includes('11-1-11');
        expect(avenue_dates2).to.be.an('array').that.includes('10-9-10').and.includes('9-9-9');
    })
  
    // test change sent
    it('should have a new sent value', () => {
        let new_avenue1 = templates.createAvenue(['test', 'left', 'right']);
        test_message.add_avenue(new_avenue1);
        let new_avenue2 = templates.createAvenue(['test2', 'left2', 'right2']);
        test_message.add_avenue(new_avenue2);
        test_message.change_sent(0, true);
        test_message.change_sent(1, false);
        console.log('new sent', test_message);
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
       console.log(test_avenue);
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
 
    def test_change_greeting(self):
        test_message = template.Message()

        new_avenue_1 = template.Avenue(['test', 'test'])
        new_avenue_2 = template.Avenue(['test', 'test'])
        new_avenue_3 = template.Avenue(['test', 'test'])

        test_message.add_avenue(new_avenue_1, new_avenue_2, new_avenue_3)
        new_greeting = 'Hello from the other side'
        test_message.change_greeting(new_greeting)

        self.assertIn(new_greeting, test_message.message_dict.values())

    def test_change_content(self):
        test_message = template.Message()

        new_avenue_1 = template.Avenue(['test', 'test'])
        new_avenue_2 = template.Avenue(['test', 'test'])
        new_avenue_3 = template.Avenue(['test', 'test'])

        test_message.add_avenue(new_avenue_1, new_avenue_2, new_avenue_3)
        new_content = 'This is New Content'
        test_message.change_content(new_content)

        self.assertIn(new_content, test_message.message_dict.values())

    def test_change_signature(self):
        test_message = template.Message()

        new_avenue_1 = template.Avenue(['test', 'test'])
        new_avenue_2 = template.Avenue(['test', 'test'])
        new_avenue_3 = template.Avenue(['test', 'test'])

        test_message.add_avenue(new_avenue_1, new_avenue_2, new_avenue_3)
        new_signature = 'Signed, Bigfoot'
        test_message.change_signature(new_signature)

        self.assertIn(new_signature, test_message.message_dict.values())

    def test_add_avenue(self):
        test_message = template.Message()

        new_avenue_1 = template.Avenue(['test', 'test'])
        new_avenue_2 = template.Avenue(['test', 'test'])
        new_avenue_3 = template.Avenue(['test', 'test'])

        test_message.add_avenue(new_avenue_1, new_avenue_2, new_avenue_3)
        self.assertIn(new_avenue_1.avenue_dict, test_message.message_dict.values())
        self.assertIn(new_avenue_2.avenue_dict, test_message.message_dict.values())
        self.assertIn(new_avenue_3.avenue_dict, test_message.message_dict.values())

    def test_delete_avenue(self):
        test_message = template.Message()

        new_avenue_1 = template.Avenue(['test', 'test'])
        new_avenue_2 = template.Avenue(['test', 'test'])
        new_avenue_3 = template.Avenue(['test', 'test'])

        test_message.add_avenue(new_avenue_1, new_avenue_2, new_avenue_3)
        self.assertIn('0', test_message.message_dict.keys())
        self.assertIn('1', test_message.message_dict.keys())
        self.assertIn('2', test_message.message_dict.keys())

        test_message.delete_avenue('0')
        self.assertNotIn('0', test_message.message_dict.keys())

    def test_get_main_avenue_key(self):  # TODO: finish
        pass

    def test_assert_raise_avenue_delete(self):
        test_message = template.Message()

        new_avenue_1 = template.Avenue(['test', 'test'])
        new_avenue_2 = template.Avenue(['test', 'test'])
        new_avenue_3 = template.Avenue(['test', 'test'])

        test_message.add_avenue(new_avenue_1, new_avenue_2, new_avenue_3)

        self.assertRaises(AssertionError, test_message.delete_avenue, 'crackers')

    def test_get_gui_avenue_keys(self):  # TODO: finish
        pass

    def test_change_avenue_type(self):
        test_message = template.Message()

        new_avenue_1 = template.Avenue(['test', 'test'])
        new_avenue_2 = template.Avenue(['test', 'test'])
        new_avenue_3 = template.Avenue(['test', 'test'])

        test_message.add_avenue(new_avenue_1, new_avenue_2, new_avenue_3)

        test_message.change_avenue_type('0', 'string and cans')
        self.assertIn('string and cans', test_message.message_dict['0']['avenue_type'])

    def test_get_avenue_type(self):  # TODO: finish
        pass

    def test_change_description(self):  # TODO: finish
        pass

    def test_get_description(self):  # TODO: finish
        pass

    def test_change_person(self):
        test_message = template.Message()

        new_avenue_1 = template.Avenue(['test', 'test'])
        new_avenue_2 = template.Avenue(['test', 'test'])
        new_avenue_3 = template.Avenue(['test', 'test'])

        test_message.add_avenue(new_avenue_1, new_avenue_2, new_avenue_3)
        new_person = 'Joe the new person'
        test_message.change_person('0', new_person)

        self.assertIn(new_person, test_message.message_dict['0']['person'])

    def test_add_person(self):  # TODO: finish
        pass

    def test_get_people(self):  # TODO: finish
        pass

    def test_change_date(self):
        test_message = template.Message()

        new_avenue_1 = template.Avenue(['test', 'test'])
        new_avenue_2 = template.Avenue(['test', 'test'])
        new_avenue_3 = template.Avenue(['test', 'test'])

        test_message.add_avenue(new_avenue_1, new_avenue_2, new_avenue_3)

        test_message.change_date('0', '3-12-6')
        self.assertIn('3-12-6', test_message.message_dict['0']['date'])

    def test_add_date(self):
        test_message = template.Message()

        new_avenue_1 = template.Avenue(['test', 'test'])
        new_avenue_2 = template.Avenue(['test', 'test'])
        new_avenue_3 = template.Avenue(['test', 'test'])

        test_message.add_avenue(new_avenue_1, new_avenue_2, new_avenue_3)

        test_message.add_date('0', '3-12-6')
        self.assertIn('3-12-6', test_message.message_dict['0']['date'])

    def test_get_dates(self):  # TODO: finish
        pass

    def test_change_sent(self):
        test_message = template.Message()

        new_avenue_1 = template.Avenue(['test', 'test'])
        new_avenue_2 = template.Avenue(['test', 'test'])
        new_avenue_3 = template.Avenue(['test', 'test'])

        test_message.add_avenue(new_avenue_1, new_avenue_2, new_avenue_3)

        print(test_message.message_dict)
        self.assertEquals(False, test_message.message_dict['0']['sent'])

        test_message.change_sent('0', True)

        self.assertEquals(True, test_message.message_dict['0']['sent'])
        self.assertNotEquals(False, test_message.message_dict['0']['sent'])

    def save(self):  # TODO: finish
        pass

    def test_compose_message_for_avenue(self):
        test_message = template.Message()

        new_avenue_1 = template.Avenue(['test', 'test'])
        new_avenue_2 = template.Avenue(['test', 'test'])
        new_avenue_3 = template.Avenue(['test', 'test'])

        test_message.add_avenue(new_avenue_1, new_avenue_2, new_avenue_3)

        test_message.add_date('1', '3-12-6')
        self.assertIn('3-12-6', test_message.message_dict['1']['date'])
        test_message.compose_message_for_avenue('1')


class TestCampaign(unittest.TestCase):
    """
    Tests all methods of the Campaign class
    """
    pass
*/
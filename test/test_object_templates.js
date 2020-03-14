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
        console.log('avenue types', test_message)
        expect(test_message.avenue_types).to.be.an('array').that.includes('Facebook')
    })

     // test adding avenue method 
     it('should have a new avenue', () => {
        let new_avenue1 = templates.createAvenue(['test', 'left', 'right']);
        test_message.add_avenue(new_avenue1);
        let new_avenue2 = templates.createAvenue(['test2', 'left2', 'right2']);
        test_message.add_avenue(new_avenue2);
        console.log('new avenue', test_message);
        expect(test_message.avenues).to.be.an('array').that.includes(new_avenue1).and.includes(new_avenue2)
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
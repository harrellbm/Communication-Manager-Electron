const expect = require('chai').expect;
var templates = require('../objectTemplate.js')

describe('#Message', function() {
    /*
    Tests all methods of the message class
    */

    // Initiate Message - need to finish 
    it('should have all initial message object keys', () => {
        let test_message = templates.createMessage()
        console.log(test_message)
        expect(test_message).to.include.keys('title', 'greeting', 'content', 'signature', 'avenue_types', 'avenue_count')
    })

    // test change title method 
    it('should have a new title', () => {
        let test_message = templates.createMessage()
        let new_title = 'This is a new Title'
        test_message.change_title(new_title)
        console.log(test_message)
        expect(test_message.title).to.be.a('string').includes('This is a new Title')
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
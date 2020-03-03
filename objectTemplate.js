class Message {
    constructor () {
     // Person is a list value so that multiple people can be added
     this.title = '';
     this.greeting = '';
     this.content = '';
     this.signature ='';
     this.avenue_types = ['Other', 'Email', 'Text', 'Social Media', 'Handout', 'Poster']
     this.avenue_count = 0
        }
    
    change_title(new_title){  // TODO: need data validation
            this.title = new_title
        }
    };

function createMessage () {
    return new Message()
}

module.exports = {
    createMessage
}
/*
    change_greeting(self, new_greeting){  // TODO: need data validation
        self.message_dict['greeting'] = new_greeting
    }

    // TODO: greeting in avenue that can be used instead of default

     change_content(self, new_content){  // TODO: need data validation
        self.message_dict['content'] = new_content
     }

     change_signature(self, new_signature){  // TODO: need data validation
        self.message_dict['signature'] = new_signature
     }

    // TODO: signature in avenue that can be used instead of ault

     add_avenue(self, *args){
        for new_avenue in args:
            self.message_dict[str(self.avenue_count)] = new_avenue.avenue_dict
            self.avenue_count += 1
     }

     delete_avenue(self, avenue_key){
        assert avenue_key in self.message_dict.keys(), 'Avenue does not exist'
        del self.message_dict[avenue_key]
     }

    // TODO: test get main avenue keys, test get gui keys, returns the avenue specific data
     get_main_avenue_key(self){
        avenue_keys = []
        for avenue in range(0, self.avenue_count):
            avenue_keys.append(str(avenue))
        return avenue_keys
     }

     get_gui_avenue_keys(self){
        all_avenue_gui_keys = []
        avenues = self.get_main_avenue_key()
        for avenue in avenues:
            temp = self.message_dict[avenue]['gui_keys']
            for key in temp:
                all_avenue_gui_keys.append(key)
        return all_avenue_gui_keys
     }

     change_avenue_type(self, avenue, new_type){  // TODO: need data validation, redo test
        self.message_dict[str(avenue)]['avenue_type'] = new_type
     }

     get_avenue_type(self, avenue){  // TODO: need test
        return self.message_dict[avenue]['avenue_type']
     }

     change_description(self, avenue, new_description){  // TODO: need test
        self.message_dict[str(avenue)]['description'] = new_description
     }

     get_description(self, avenue){
        return self.message_dict[avenue]['description']
     }

    // Completely writes over current values in person values
     change_person(self, avenue, new_person){  // TODO: need data validation
        self.message_dict[avenue]['person'] = new_person
     }

    // Adds a person to the person list for that specific avenue
     add_person(self, avenue, new_person){  // TODO: add test
        self.message_dict[avenue]['person'].append(new_person)
        // Removes the empty string that is used to initialize the message object
        if self.message_dict[avenue]['person'][0] == '':
            self.message_dict[avenue]['person'].remove('')
     }

    // Returns the list of people for the given avenue as a simple string
     get_people(self, avenue){  // TODO: add test
        people = ''
        for person in self.message_dict[avenue]['person']:
            if person != '':
                people += person + '\n'
        return people
     }

    // TODO: delete a person responsible(need to validate that there is at least one person)

     change_date(self, avenue_key, new_date){  // TODO: need data validation
        self.message_dict[avenue_key]['date'] = new_date
     }

        // Adds a person to the person list for that specific avenue

     add_date(self, avenue, new_date){  // TODO: add test
        self.message_dict[avenue]['date'].append(new_date)
        // Removes the empty string that is used to initialize the message object
        if self.message_dict[avenue]['date'][0] == '':
            self.message_dict[avenue]['date'].remove('')
     }

        // Returns the list of people for the given avenue as a simple string

     get_dates(self, avenue){  // TODO: add test
        dates = ''
        for date in self.message_dict[avenue]['date']:
            if date != '':
                dates += date + '\n'
        return dates
     }

    // TODO: delete date from Avenue (need to make sure that there is at least one date)
    // TODO: get dates

     change_sent(self, avenue, new_sent){  // TODO: need data validation
        self.message_dict[str(avenue)]['sent'] = new_sent
     }

     save(self, title, greeting, signature, content, *args){  // TODO: write test
        // avenue data sent in list of lists through *args
        self.change_title(title)
        self.change_greeting(greeting)
        self.change_signature(signature)
        self.change_content(content)
        for avenue in range(0, self.avenue_count):
            self.change_description(avenue, args[0][avenue][0])
            self.change_sent(avenue, args[0][avenue][1])
            self.change_avenue_type(avenue, args[0][avenue][2])
        print(self.message_dict)
     }

     compose_message_for_avenue(self, avenue){
        // TODO: finish compose message for avenue
        // finsh get avenue will make this step a lot easier
        // print(self.message_dict.keys())
        // print(self.message_dict[avenue])
        for date in self.message_dict[avenue]['date']:
            composed_message = {date: self.message_dict['title']}
            // print(composed_message)
            // self.message_dict
        //
        // add method to compose message into single string call it "Compose for Avenue" that takes  a Message and Avenue
        // then pulls unique greeting and signature oF applicable and puts it all into a condensed dictionary
     }
     */
/*
// TODO: update tests with new avenue_type, description, and key element
class Avenue{
     constructor( gui_keys){
        // date is a list so that multiple dates can be added
        // Sent is whether the message is sent or not
        // Keys holds the output keys for this avenue specifically, they should be entered as a list upon initialization
        self.avenue_dict = {'avenue_type': '', 'description': '', 'person': [''], 'date': [''], 'sent': False,
                            'gui_keys': gui_keys}
     }

    }


class Campaign{
     constructor (self, *args){  // possibly **wkargs better?
        self.messages = []
        for message in args:
            self.messages.append(message)
     }
     add_message(self, *args){  // possibly **wkargs better?
        self.messages.append(args)
        // TODO: add test for this method
     }

     get_message(self){
        return self.messages
     }

    // TODO: delete message
    }

class Profile{
     constructor(){}
    }*/
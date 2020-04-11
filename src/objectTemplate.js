// Constructor for Initiative object.  Top tier data structure 
class Initiative {
   constructor() {
      // date is an array so that multiple dates can be added
      // Sent is whether the message is sent or not
      // gui_id holds the output ids for this avenue specifically, they should be entered as an array upon initialization
      this.description = ''; //used to state the purpose of initiative 
      this.groups = [];
      this.goals = {};
      this.messages = {};
      this.avenues = {};
      this.avenue_types = ['Email', 'Text', 'Facebook', 'Instagram', 'Handout', 'Poster','Other']
      }
   // add goal
   // delete goal 
   // add message
   // delete message
   // link message and avenue with ids 
   // compose to single string
   // default signature and greeting 

   
   
   // makes sure that the lowest possible id is assigned to a new avenue 
   id_fill(objects){
      let Id = 0
      let obj;
      for(obj in objects){
         if (Id == obj){
            Id += 1
            } else { // when avenueId does not equal ave we know that the spot is empty
               return Id
            }
         } 
      return Id
      }

// --- Avenue Related Methods ---
   add_avenue(avenue_type='', description='', person='', sent=false, message_ids='', year=1000, month=0, day=1, hour=0, min=0){
      let new_avenue = new Avenue;
      new_avenue.avenue_type = avenue_type;
      new_avenue.description = description;

      // able to take single string argument or array of strings for person, and message_id fields
      // could refractor to function that would be used three times for persons, dates, and gui_ids
      let array = [person]
      let value;
      let name;
      for(value of array){ 
         // if it is a single string argument then push to the avenue's array
         if(typeof value === "string"){
            new_avenue.person.push(value)
            // if it is an array of values then loop through them and push to avenue's array
         } else if (value.constructor === Array){
            for(name of value){
               new_avenue.person.push(name)
            }
         }
      }

      // Set sent status 
      new_avenue.sent = sent;

      // Same as people
      let array2 = [message_ids]
      let value2;
      let id;
      for(value2 of array2){
         if(typeof value2 === "string"){
            new_avenue.message_id.push(value2)
         } else if (value2.constructor === Array){
            for(id of value2){
               new_avenue.message_id.push(id)
            }
         }
      }
      
      // Set date object
      new_avenue.date.setFullYear(year, month, day);
      new_avenue.date.setHours(hour, min, 0, 0);

      let avenueId = this.id_fill(this.avenues)// fill in the lowest available id
      this.avenues[avenueId] = new_avenue
      return avenueId
      }
      
   remove_avenue(avenueId){
      if (avenueId > -1){
         delete this.avenues[avenueId];
         }
      }
   
   remove_all_avenues(){
      let ave;
      for(ave in this.avenues){
         delete this.avenues[ave];
         }
      }  
   
// --- Avenue Type Realted Methods --- 
   // add new type of avenue on the fly
   add_type(new_type){
      this.avenue_types[this.avenue_types.length] = new_type;
      }
  };

// Constructor wrapper for exporting 
function createInitiative () {
   return new Initiative()
   }

class Goal {
   constructor() {
      // Frequency is going to eventually be some kind of date object to tell how often to schedule this communication
      // Type is the type of communication for this goal Sent is whether the message is sent or not
      // Reminder will be a way to hold the reminders that you set for this goal 
      this.frequency= 0;
      this.type = '';
      this.reminder = {};
      }
      //need to add getters and setters as well as tests
  }

// Constructor wrapper for exporting 
function createGoal () {
   return new Goal();
}

class Message {
   constructor () {
     // Person is a list value so that multiple people can be added
      this.title = '';
      this.greeting = '';
      this.content = '';
      this.signature ='';
      this.avenue_ids = []
      }
    
   change_title(new_title){
      this.title = new_title
      }
      
   change_greeting(new_greeting){
      this.greeting = new_greeting
      }

   change_content(new_content){ 
      this.content = new_content
      }
   
   change_signature(new_signature){ 
      this.signature = new_signature
      }
      
   // need get avenue ids
   // need add avenue ids
   // need remove avenue ids
   // need clear avenue ids
   };

// Constructor wrapper for exporting 
function createMessage () {
    return new Message()
}

// Constructor for Avenue object.  All methods are held within the Message object  
class Avenue {
   constructor() {
      // date is an array so that multiple dates can be added
      // Sent is whether the message is sent or not
      // gui_id holds the output ids for this avenue specifically, they should be entered as an array upon initialization
      this.avenue_type = '';
      this.description = '';
      this.person = [];
      this.date = new Date(); // only one date 
      this.sent = false;
      this.message_id = []
      }
      
   change_avenue_type(new_type){ 
      this.avenue_type = new_type
      }

   get_avenue_type(){
      return this.avenue_type
      }

   change_description(new_description){ 
      this.description = new_description
      }

   get_description(){
      return this.description
      }

   // Completely writes over current values in person values
   change_person(new_person){  
      this.person = new_person
      }

   //keep working on it
   // Adds a person to the person list for that specific avenue
   add_person(new_person){  
      this.person.push(new_person)
      }
   
   // Returns the list of people for the given avenue as a simple string
   get_people(){  // TODO: add test
         let people = '';
         let person;
         for (person of this.person) {
            if (person != '') {
               people += person + '\n'
            }
         }
         return people
      }
 
   // TODO: delete a person responsible(need to validate that there is at least one person)

   //need test
   change_date(new_date){  // TODO: need data validation
      this.date = new_date
      }
 
   // Returns the list of dates for the given avenue as a simple string
   get_dates(){
      return this.date
      }

   change_sent(new_sent){  // TODO: need data validation
      this.sent = new_sent
      }
   
       
   // need get message ids
   // need change message id
   // need clear message id
   };

// Constructor wrapper for exporting 
function createAvenue () {
    return new Avenue()
}

module.exports = {
   createInitiative,
   createGoal, 
   createMessage,
   createAvenue,
}

/*
    // TODO: greeting in avenue that can be used instead of default

    // TODO: signature in avenue that can be used instead of ault

     
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
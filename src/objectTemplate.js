// Constructor for Initiative object.  Top tier data structure 
class Initiative {
   constructor() {
      // groups will evenutally be the default people an initiative is aimed toward
      // goals, messages, and avenues are all map objects so that they can be added and manipulated more easily
        // Note: they as well as the date objects used need converted before saving to json
      // avenue_type holds the basic types of avenues, can add new on the fly with add_type method
      this.description = ''; //used to state the purpose of initiative 
      this.groups = [];
      this.goals = new Map; // change to map 
      this.messages = new Map;
      this.avenues = new Map;
      this.avenue_types = ['Email', 'Text', 'Facebook', 'Instagram', 'Handout', 'Poster','Other']
      }
   // Note: useful built in methods for maps: set(key, value), delete(key), get(key), has(key), clear()
      // keys(), values(), entries(), forEach(), size
   
   change_description(new_description){ 
      this.description = new_description
      }

   get_description(){
      return this.description
      }

   // need add groups 
   // need get groups
   // need remove groups 
   // need clear groups 
   
   // makes sure that the lowest possible id is assigned to a new avenue 
   id_fill(objects){
      let Id = 0;
      let strId; // holds id that is converted to string
      let has = true; // holds boolean for if object has key or not 
      while(has == true){
         strId = Id.toString(); // turn id to string so that it can be evaluated and possibly returned
         if (objects.has(strId) == true){ // check to see if map has id or not
            Id += 1
            } else { // when avenueId does not equal ave we know that the spot is empty
               return strId
               }
      }
   };

   // add an goal to the goals map in the initiative 
   add_goal(frequency = 0, type = '', reminder = {}){
      
      let new_goal = new Goal;
      new_goal.frequency = frequency;
      new_goal.type = type;
      new_goal.reminder = reminder

      let goalId = this.id_fill(this.goals)// fill in the lowest available id
      this.goals.set(goalId, new_goal);
      return goalId
      }
   
   // add a message to the messages map in the initiative 
   add_message(title = '', greeting = '', content = '', signature ='', avenue_ids=''){
      let new_message = new Message;
      new_message.title = title;
      new_message.greeting = greeting;
      new_message.content = content;
      new_message.signature = signature;

      // Set any initial avenue ids.  Can take a single string or array of strings
      let array = [avenue_ids]
      let value;
      let id;
      for(value of array){
         if(typeof value === "string"){
            new_message.avenue_ids.push(value)
         } else if (value.constructor === Array){
            for(id of value){
               new_message.avenue_ids.push(id)
            }
         }
      }

      let messageId = this.id_fill(this.messages)// fill in the lowest available id
      this.messages.set(messageId, new_message);
      return messageId
      }
   
   // add an avenue to the avenues map in the initiative 
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
      this.avenues.set(avenueId, new_avenue);
      return avenueId
      }
   
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

      change_frequency(new_frequency){ 
         this.frequency = new_frequency
         }
   
      get_frequency(){
         return this.frequency
         }
      
      change_type(new_type){ 
         this.type = new_type
         }
      
      get_type(){
         return this.type
         }
      
      // possibly implement date object for frequency 

      // need add reminder
      // need get reminder
      // need remove reminder 
      // need clear reminders 
      // implement date object in reminder

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
   
   // Changes the title for the given message    
   change_title(new_title){
      this.title = new_title
      }
   
   // Returns the title for the given message
   get_title(){
      return this.title
      }
   
   // Changes the greeting for the given message    
   change_greeting(new_greeting){
      this.greeting = new_greeting
      }

   // Returns the greeting for the given message
   get_greeting(){
      return this.greeting
      }

   // Changes the content for the given message    
   change_content(new_content){ 
      this.content = new_content
      }
   
   // Returns the content for the given message
   get_content(){
      return this.content
      }

   // Changes the signature for the given message    
   change_signature(new_signature){ 
      this.signature = new_signature
      }
   
   // Returns the signature for the given message
   get_signature(){
      return this.signature
      }

   // need get avenue ids
   // need add avenue ids
   // need remove avenue id
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

   // Change the date object 
   change_date(year, month, day, hour, min){  // TODO: need data validation
      this.date.setFullYear(year, month, day);
      this.date.setHours(hour, min, 0, 0);
      }
 
   // Returns the date for the given avenue as a date object
   get_dates(){
      return this.date
      }

   change_sent(new_sent){  // TODO: need data validation
      this.sent = new_sent
      }
   
   // Returns the date for the given avenue as a date object
   get_sent(){
      return this.sent
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

class Profile{
     constructor(){}
    }*/
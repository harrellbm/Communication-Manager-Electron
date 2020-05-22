class initiativeCollection {
   constructor() {
      this.initiatives = new Map();
      };
   // Makes sure that the lowest possible id is assigned to a new avenue 
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

   // Add a goal to the goals map in the initiative 
   add_initiative(name='', description='') {
      let new_initiative = new Initiative();
      new_initiative.name = name
      new_initiative.description = description
      
      // groups, goals, messages, and avenues will be added after initialization 
      
      let initiativeId = this.id_fill(this.initiatives)// fill in the lowest available id
      this.initiatives.set(initiativeId, new_initiative);
      return initiativeId
      }

   update_init(initId, ipc) {
      let initiative = new Initiative();
      initiative.unpack_from_ipc(ipc);
      this.initiatives.set(initId, initiative)
      //console.log('updated collection: ', this.initiatives)
   }

   update_mess(initId, messId, ipc) {
      let initiative = this.initiatives.get(initId);
      let message = initiative.messages.get(messId);
      // Create message if it was not there before
      let newMess;
      if (message == undefined) {
         newMess = new Message();
         initiative.messages.set(messId, newMess)
         message = initiative.messages.get(messId);
      }
      
      message.change_title(ipc.title);
      message.change_greeting(ipc.greeting);
      message.change_content(ipc.content);
      message.change_signature(ipc.signature);
      //console.log('message in update method: ', message)
   }
   // Prepare initiative to be stringified for Json or sent over ipc by converting nonstandard objects
   // Note: pack returns a new object that is packed and does not change the current collection
   pack_for_file(){ // Note: dynamic test held in test_main.js, unit test in test_object_templates.js
      // Create temporary collection 
      var container = new initiativeCollection();
      // Pack each initiative and put in the temporary collection
      this.initiatives.forEach(function (initiative, key) {
         let packed = initiative.pack_for_ipc()
         container.initiatives.set(key, packed)
      })
      // Pack collection itself into a vanilla object  
      let collection_for_ipc = new Object;
      collection_for_ipc.initiatives = Object.fromEntries(container.initiatives); 
      
      return collection_for_ipc // Returns the packaged collection  
   }

   // Unpack values passed in by Json format from saved file or ipc
   // Note: unpack from file changed current collection to match incoming data
   unpack_from_file( file ){ // Note: dynamic test held in test_main.js, unit test in test_object_templates.js
      // Convert Initiatives back from saved vanilla object
      this.initiatives = new Map(); 
      // Reload each initiative into the collection's map 
      let initiative;
      for (initiative of Object.entries(file.initiatives)) { // Iterate over the key value pairs from the vanilla object
         let id = initiative[0];
         let content = initiative[1];
         let unpacked = new Initiative(); // Create new Initiative object 
         // Load all contents into the new Initiative object       
         unpacked.unpack_from_ipc(content); // unpack all of the initiative's properties  
         // Add the new Initiative object back to the collection
         this.initiatives.set(id, unpacked); 
         }
      //console.log('new unpacked initiative: ', this.initiatives);
   }
};

// Constructor for Initiative object.  Top tier data structure 
class Initiative {
   constructor() {
      // groups will evenutally be the default people an initiative is aimed toward
      // goals, messages, and avenues are all map objects so that they can be added and manipulated more easily
        // Note: they as well as the date objects used need converted before saving to json
      // avenue_type holds the basic types of avenues, can add new on the fly with add_type method
      this.name = '';
      this.description = ''; //used to state the purpose of initiative 
      this.groups = new Map();
      this.goals = new Map();  
      this.messages = new Map();
      this.avenues = new Map();
      this.avenue_types = ['Email', 'Text', 'Phone Call', 'Facebook', 'Instagram', 'Card', 'Handout', 'Poster','Other']
      }
   // Note: useful built in methods for maps: set(key, value), delete(key), get(key), has(key), clear()
      // keys(), values(), entries(), forEach(), size

   // Changes the initiative's name  
   change_name(new_name){ 
      this.name = new_name;
   };

   // Gets the initiative's name 
   get_name(){
      return this.name;
   };

   // Changes the initiative's description  
   change_description(new_description){ 
      this.description = new_description;
   };

   // Gets the initiative's description 
   get_description(){
      return this.description;
   };

   // Makes sure that the lowest possible id is assigned to a new avenue 
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

   // Add a goal to the goals map in the initiative 
   add_group(name, contacts){ // Note: Contact are accepted in the following structure [ [name, phone, email], etc. ]
      let new_group = new Group(name, contacts);

      let groupId = this.id_fill(this.groups);// fill in the lowest available id
      this.groups.set(groupId, new_group);
      return groupId;
   };

   // Add a goal to the goals map in the initiative 
   add_goal(frequency = 0, type = '', reminder = {}){
      
      let new_goal = new Goal();
      new_goal.frequency = frequency;
      new_goal.type = type;
      new_goal.reminder = reminder;

      let goalId = this.id_fill(this.goals);// fill in the lowest available id
      this.goals.set(goalId, new_goal);
      return goalId;
   };
   
   // Add a message to the messages map in the initiative 
   add_message(title = '', greeting = '', content = '', signature ='', avenue_ids=''){
      let new_message = new Message();
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
   };
   
   // Add an avenue to the avenues map in the initiative 
   add_avenue(avenue_type='', description='', person='', sent=false, message_id='', dateString=''){
      let new_avenue = new Avenue();
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

      // Set message id associated with avenue
      new_avenue.message_id = message_id
      
      // Set date object
      new_avenue.date = dateString;

      let avenueId = this.id_fill(this.avenues)// fill in the lowest available id
      this.avenues.set(avenueId, new_avenue);
      return avenueId
   };
   
   // Add new type of avenue on the fly
   add_type(new_type){
      this.avenue_types[this.avenue_types.length] = new_type;
   };
   
   // Returns avenue types as an array
   get_types(){
      return this.avenue_types
   };
   
   // Link an avenue and message 
      // Note: avenues can only have one linked message assigning a new message will override any old ones 
   link_ids(aveId, mesId){
      try{ 
         let avenue = this.avenues.get(aveId);
         avenue.change_message_id(mesId);

         let message = this.messages.get(mesId);
         if (message.avenue_ids[0] == ''){ // If avenue ids has empty string get rid of it, otherwise add new avenue id
            message.change_avenue_id(aveId);
         } else { 
            message.add_avenue_id(aveId); 
            }
         } catch(err){
            console.log('Invalid Id: ' + err);
            }
   };

   // Unlink an avenue and message 
      // Note: method will return true if unlinking is successful, otherwise false in order to avoid accidentally deleting one id
   unlink_ids(aveId, mesId){
      try{
         var avenue = this.avenues.get(aveId);
         var message = this.messages.get(mesId);
         } catch(err){
            console.log('Invalid Id: ' + err);
            }
      avenue.change_message_id('');
      let id;
      for (id in message.avenue_ids){
         if (aveId == message.avenue_ids[id]){
            message.avenue_ids.splice(id, 1);
            return true;
            }
         }
   };

   // Prepare initiative to be stringified for Json or sent over ipc by converting nonstandard objects
   // Note: pack returns a new packed object and does not change current initiative 
   pack_for_ipc(){ // Note: dynamic test held in test_main.js, unit test in test_object_templates.js
      let initiative_for_ipc = new Object(); 
      initiative_for_ipc.name = this.name;
      initiative_for_ipc.description = this.description;
      
      // Convert both groups map and nested contacts map to vanilla objects 
      initiative_for_ipc.groups = new Object;
      this.groups.forEach(function (value, key){
         let packed = value.pack_grp_for_ipc();
         //console.log('packed: ', packed)
         initiative_for_ipc.groups[key] = packed;
      })

      initiative_for_ipc.goals = Object.fromEntries(this.goals);// Convert maps to vanilla objects
      initiative_for_ipc.messages = Object.fromEntries(this.messages);  
      initiative_for_ipc.avenues = Object.fromEntries(this.avenues);
      initiative_for_ipc.avenue_types = this.avenue_types;

      return initiative_for_ipc; // returns the packaged initiative 
      // Note: date objects are not converted here because Json stringify will convert them to strings without lost of data
   };

   // Unpack values passed in by Json format from saved file or ipc
   // Note: unpack changes the current initiative from in coming ipc or file Json format to object template format
   unpack_from_ipc( ipc ){ // Note: dynamic test held in test_main.js, unit test in test_object_templates.js
      this.name = ipc.name;
      this.description = ipc.description; // string 
      
      // Convert Groups back from saved vanilla objects
      this.groups = new Map(); // Reset initiative.groups to a map object
      // Reload each group into a Group object 
      let group;
      for (group of Object.entries(ipc.groups)) { // Iterate over the key value pairs from the vanilla object
         let id = group[0];
         let content = group[1];
         let unpacked = new Group(); // Create new Group object 
         // Load all contents into new Goal object
         unpacked.group_name = content.group_name;
         // Unpack contacts into a new map
         unpacked.contacts = new Map();
         let contact;
         for (contact of Object.entries(content.contacts)) {  
            let id = contact[0];
            let content = contact[1];
            unpacked.contacts.set(id, content);
         };
         // Add the new group object back to the Initiative.ggroups map
         this.groups.set(id, unpacked); 
      };
      //console.log('new unpacked group: ', this.groups);

      // Convert Goals back from saved vanilla objects
      this.goals = new Map(); // Reset initiative.goals to a map object
      // Reload each goal into an Goal object 
      let goal;
      for (goal of Object.entries(ipc.goals)) { // Iterate over the key value pairs from the vanilla object
         let id = goal[0];
         let content = goal[1];
         let unpacked = new Goal(); // Create new Goal object 
         // Load all contents into new Goal object
         unpacked.frequency= content.frequency;
         unpacked.type = content.type;
         unpacked.reminder = content.reminder;
         
         // Add the new goal object back to the Initiative.goals map
         this.goals.set(id, unpacked); 
         }
      //console.log('new unpacked goals: ', this.goals);

       
      // Convert Messages back from saved vanilla objects
      this.messages = new Map(); // Reset initiative.messages to a map object
      // Reload each message into an Message object 
      let mess;
      for (mess of Object.entries(ipc.messages)) { // Iterate over the key value pairs from the vanilla object
         let id = mess[0];
         let content = mess[1];
         let unpacked = new Message(); // Create new message object 
         // Load all contents into new Message object
         unpacked.title = content.title;
         unpacked.greeting = content.greeting;
         unpacked.content = content.content;
         unpacked.signature = content.signature;
         unpacked.avenue_ids = content.avenue_ids;
      
         // Add the new message object back to the Initiative.messages map
         this.messages.set(id, unpacked); 
         }
      //console.log('new unpacked messages: ', this.messages);

      // Convert Avenues back from saved vanilla objects
      this.avenues = new Map(); // Reset initiative.avenues to a map object 
      // Reload each avenue into an Avenue object 
      let ave;
      for (ave of Object.entries(ipc.avenues)) { // Iterate over the key value pairs from the vanilla object
         let id = ave[0];
         let content = ave[1];
         let unpacked = new Avenue(); // Create new avenue object 
         // Load all contents into new Avenue object
         unpacked.avenue_type = content.avenue_type; // String 
         unpacked.description = content.description; // String 
         unpacked.person = content.person; // Array 
         unpacked.date = content.date; // String 
         unpacked.sent = content.sent; // Boolean
         unpacked.message_id = content.message_id; // String
      
         // Add the new avenue object back to the Initiative.avenues map
         this.avenues.set(id, unpacked); 
         }
      //console.log('new unpacked avenues: ', this.avenues);

      this.avenue_types = ipc.avenue_types; // array
   };
};

class Group {
   // Constructor takes new contacts in the form of [ [name, phone, email], etc. ]
   constructor(group_name='', new_contacts=[]) {
      this.group_name = group_name; // Name of the contact group 
      this.contacts = new Map(); // Key is the name of individual, value is contact info
      
      let leng = new_contacts.length;
      if (new_contacts != []) {
         for (let i=0; i<leng; i++) {
            this.add_contact(new_contacts[i][0], new_contacts[i][1], new_contacts[i][2]);
         };
      };
   };
   // Note: useful built in methods for maps: set(key, value), delete(key), get(key), has(key), clear()
      // keys(), values(), entries(), forEach(), size
   
   // Changes the groups name 
   change_group_name(new_name){ 
      this.group_name = new_name;
   };
   
   // Gets the groups name  
   get_group_name(){
      return this.group_name;
   };

    // Makes sure that the lowest possible id is assigned to a new contact 
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

   // Add a contact to the contacts map  
   add_contact(name='', phone='', email=''){ 
      let contactId = this.id_fill(this.contacts)// fill in the lowest available id
      this.contacts.set(contactId, [name, phone, email]);
      return contactId;
   };

   pack_grp_for_ipc(){ // Note: dynamic test held in test_main.js, unit test in test_object_templates.js
      // Pack group into a vanilla object  
      let group_for_ipc = new Object;
      group_for_ipc.group_name = this.group_name;
      group_for_ipc.contacts = Object.fromEntries(this.contacts); 
      //console.log('packed group', group_for_ipc);
      return group_for_ipc; // Returns the packaged group  
   };
};

class Goal {
   constructor() {
      // Frequency is going to eventually be some kind of date object to tell how often to schedule this communication
      // Type is the type of communication for this goal Sent is whether the message is sent or not
      // Reminder will be a way to hold the reminders that you set for this goal 
      this.frequency= 0;
      this.type = '';
      this.reminder = {};
      };
   
   /* possibly implement date object for frequency */ 
   
   // Changes the goal's frequency 
   change_frequency(new_frequency){ 
      this.frequency = new_frequency;
      };
   
   // Gets the goal's frequency 
   get_frequency(){
      return this.frequency;
      };
   
   // Changes the goal's avenue type 
   change_type(new_type){ 
      this.type = new_type;
      };
   
   // Gets the goal's avenue type 
   get_type(){
      return this.type;
      };
      
      /* need add reminder */
      /* need get reminder */
      /* need remove reminder */
      /* need clear reminders */
      /* implement date object in reminder */
  };

class Message {
   constructor () {
      // Avenue ids holds the ids of the avenues that are associated with this message
         // Only one message is allowed for each avenue, but you can add multiple avenues to a message
      this.title = '';
      this.greeting = '';
      this.content = '';
      this.signature ='';
      this.avenue_ids = [];
      }
   
   // Changes the title for the given message    
   change_title(new_title){
      this.title = new_title;
      }
   
   // Returns the title for the given message
   get_title(){
      return this.title;
      }
   
   // Changes the greeting for the given message    
   change_greeting(new_greeting){
      this.greeting = new_greeting;
      }

   // Returns the greeting for the given message
   get_greeting(){
      return this.greeting;
      }

   // Changes the content for the given message    
   change_content(new_content){ 
      this.content = new_content;
      }
   
   // Returns the content for the given message
   get_content(){
      return this.content;
      }

   // Changes the signature for the given message    
   change_signature(new_signature){ 
      this.signature = new_signature;
      }
   
   // Returns the signature for the given message
   get_signature(){
      return this.signature;
      }
   
   // Completely writes over current values in avenue ids 
   change_avenue_id(new_id){   // TODO: need data validation
      this.avenue_ids = [new_id]
      }

   // Adds an avenue id to the list of ids for this message
   add_avenue_id(new_id){  // TODO: need data validation
      this.avenue_ids.push(new_id)
      }
   
   // Returns the list of avenue ids as an array
   get_avenue_ids(){  
         return this.avenue_ids
      }

   // Clears all avenue ids for this message 
   clear_avenue_ids(){
      this.avenue_ids = []
      }
};
 
class Avenue {
   constructor() {
      // date is a built in dat object only one date is assigned per avenue
      // Sent is whether the message is sent or not
      // Message id holds the id of the message that is associated with this avenue 
         //Only one message is allowed for each avenue, but you can add multiple avenues to a message
      this.avenue_type = '';
      this.description = '';
      this.person = [];
      this.date = new Date(); // Only one date 
      this.sent = false;
      this.message_id = '' // Only one message id
      }
   
   // Completely writes over current avenue type 
   change_avenue_type(new_type){ // TODO: need data validation
      this.avenue_type = new_type
      }
   
   // Returns the avenue type of this avenue as a simple string
   get_avenue_type(){
      return this.avenue_type
      }

   // Completely writes over current description
   change_description(new_description){ // TODO: need data validation
      this.description = new_description
      }

   // Returns the description of this avenue as a simple string
   get_description(){
      return this.description
      }

   // Completely writes over current values in person values
   change_person(new_person){   // TODO: need data validation
      this.person = [new_person]
      }

   // Adds a person to the person list for that specific avenue
   add_person(new_person){  // TODO: need data validation
      this.person.push(new_person)
      }
   
   // Returns the list of people for the given avenue as a simple string
   get_people(){  
         let people = '';
         let person;
         for (person of this.person) {
            if (person != '') {
               people += person + '\n'
            }
         }
         return people
      }

   // Clears all people for this avenue  
   clear_people(){
      this.person = []
      }

   // Change the date object 
   change_date(dateString){  // TODO: need data validation
      this.date = dateString;
      }
 
   // Returns the date for the given avenue as a date object
   get_dates(){
      return this.date
      }

   // Change the sent status 
   change_sent(new_sent){  // TODO: need data validation
      this.sent = new_sent
      }
   
   // Returns the sent value for the given avenue as a boolean
   get_sent(){
      return this.sent
      }

   // Completely writes over current value of message id
   change_message_id(new_id){ // TODO: need data validation
      this.message_id = new_id
      }
   
   // Returns the message id associated with this avenue
   get_message_id(){
      return this.message_id
      }
   
   // Clears the message id 
   clear_message_id(){
      this.message_id = ''
      }
};

module.exports = {
   initiativeCollection,
   Initiative,
   Group,
   Goal,
   Message,
   Avenue
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
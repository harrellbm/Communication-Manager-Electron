// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//this is the js file for the message manager tab
const ipc = require('electron').ipcRenderer;
const templates = require('./objectTemplate.js')

var currentMessage = templates.createMessage();

//handles event from the save button
document.getElementById('save').addEventListener("click", saveFile);
function saveFile () {
  let titleValue = document.getElementById('title').value;
  let greetingValue = document.getElementById('greeting').value;
  let contentValue = document.getElementById('content').value;
  let signatureValue = document.getElementById('signature').value;
  currentMessage.change_title(titleValue);
  currentMessage.change_greeting(greetingValue);
  currentMessage.change_content(contentValue);
  currentMessage.change_signature(signatureValue);

  // unpack values from each avenue that is added
  let avenuesValue = document.getElementById('avenueIn').getElementsByClassName('avenue');
  for (i = avenuesValue.length-1; i>=0; i--) {//each iteration goes through one avenue
    let avenue = avenuesValue.item(i);
    let dropdown = avenue.children[0].value;
    let sent = avenue.children[4].children[0].checked;
    let description = avenue.children[5].value;
    let persons = avenue.children[6].value;
    let dates = avenue.children[7].value;
    //console.log('specific elements',avenue, dropdown, sent, description, persons, dates)
    currentMessage.add_avenue(dropdown, description, persons, dates, sent)
    }
  
  ipc.send('save', currentMessage)
};

// Handles the event from the open button
// Uses synchronous call for now 
document.getElementById('open').addEventListener("click", openFile);
function openFile () {
  let file = ipc.sendSync('open-file')
  //console.log('on renderer side' , file)
  document.getElementById('title').value = file.title
  document.getElementById('greeting').value = file.greeting
  document.getElementById('content').value = file.content
  document.getElementById('signature').value = file.signature
  // Loads each avenue from the file 
  for (i = file.avenues.length-1; i>=0; i--) {//each iteration goes through one avenue
    let avenue = file.avenues[i];
    //console.log(`avenue${i} to load`, avenue)
    let dropdown = avenue.avenue_type;
    let sent = avenue.sent;
    let description = avenue.description;
    let persons = avenue.person;
    let dates = avenue.date;
    addAvenue(dropdown, sent, description, persons, dates)
    }
};


// Adds an avenue to do the DOM
document.getElementById('add').addEventListener("click", addAvenue);
var avenueCount = 0;
function addAvenue (avenue_typeValue='', sentValue='', descriptionValue='', personsValue='', datesValue='') {

  //creates main div to hold an individual avenue
  let ave = document.createElement("div");
  ave.setAttribute("class", "avenue");
  ave.setAttribute("id", `avenue${avenueCount}`);
  
  // Creates drop down list 
  let dropdown = document.createElement("select");
  dropdown.setAttribute("class", "dropdown");
  dropdown.setAttribute("id", `avenue_type${avenueCount}`);
  
  // TODO: need to make options load off of loop 
  let option1 = document.createElement("option");
  option1.setAttribute("value", "option1");
  option1.innerHTML = "Option 1";
  dropdown.appendChild(option1);

  let option2 = document.createElement("option");
  option2.setAttribute("value", "option2");
  option2.innerHTML = "Option 2";
  dropdown.appendChild(option2);

  let option3 = document.createElement("option");
  option3.setAttribute("value", "option3");
  option3.innerHTML = "Option 3";
  dropdown.appendChild(option3);

  if(avenue_typeValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    dropdown.value = avenue_typeValue;
    }
  ave.appendChild(dropdown);//add the dropdown menu to the avenue
  
  // Creates title paragraphs 
  let description_title = document.createElement("p");// Title for Description 
  description_title.setAttribute("class", "description_title");
  description_title.setAttribute("id", "description_title");
  description_title.innerHTML = "Description:";
  ave.appendChild(description_title);//add the title to the avenue

  let person_title = document.createElement("p");// Title for Persons responsible 
  person_title.setAttribute("class", "persons_title");
  person_title.setAttribute("id", "persons_title");
  person_title.innerHTML = "Person:";
  ave.appendChild(person_title);//add the title to the avenue

  let date_title = document.createElement("p");// Title for Date 
  date_title.setAttribute("class", "date_title");
  date_title.setAttribute("id", "date_title");
  date_title.innerHTML = "Date:";
  ave.appendChild(date_title);//add the title to the avenue

  // Creates sent box
  let sent_box = document.createElement("p");
  sent_box.setAttribute("class", "sent_box");
  sent_box.setAttribute("id", `sent_box${avenueCount}`);

  let sent_checkbox = document.createElement("input");
  sent_checkbox.setAttribute("class", "sent_checkbox");
  sent_checkbox.setAttribute("id", `sent_checkbox${avenueCount}`);
  sent_checkbox.setAttribute("type", "checkbox");
  if(sentValue != ''){// if creating an avenue that is being pulled from a file set it's value
    sent_checkbox.checked = sentValue;
    }
  sent_box.appendChild(sent_checkbox);//add check box to the smaller area

  let sent_label = document.createElement("label");
  sent_label.setAttribute("class", "sent_label");
  sent_label.setAttribute("id", "sent_label");
  sent_label.setAttribute("for", "sent_checkbox");
  sent_label.innerHTML = "Sent";
  sent_box.appendChild(sent_label)//add label to the smaller area

  ave.appendChild(sent_box);//add smaller area to the avenue

  // Creates textareas 
  let description = document.createElement("textarea");
  description.setAttribute("class", "description");
  description.setAttribute("id", "description");
  if(descriptionValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    description.value = descriptionValue;
    }
  ave.appendChild(description);

  let persons = document.createElement("textarea");
  persons.setAttribute("class", "persons");
  persons.setAttribute("id", "persons");
  if(personsValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    persons.value = personsValue;
    }
  ave.appendChild(persons);

  let dates = document.createElement("textarea");
  dates.setAttribute("class", "dates");
  dates.setAttribute("id", "dates");
  if(datesValue != ''){// if creating an avenue that is being pulled from a file set it's value 
    dates.value = datesValue;
    }
  ave.appendChild(dates);

  // Creates and adds dynamic event listener to delete button
  let deleteBtn = document.createElement("input")
  deleteBtn.setAttribute("class", "delete")
  deleteBtn.setAttribute("id", `delete${avenueCount}`)
  deleteBtn.setAttribute("type", "button")
  deleteBtn.setAttribute("value", "x")
  deleteBtn.addEventListener("click", function () {deleteAvenue(ave)}) 
  ave.appendChild(deleteBtn)

  // Get the main div that holds all the avenues and append the new one
  //console.log("avenue", ave);
  document.getElementById("avenueIn").appendChild(ave);
  ++avenueCount;
};

// Deletes an avenue from the DOM
function deleteAvenue (ave) {
  ave.parentElement.removeChild(ave)
};
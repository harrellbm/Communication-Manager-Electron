// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
document.getElementById('save').addEventListener("click", buttonPush);
function buttonPush () {
alert('Saving')
};

// Adds and avenue to do the DOM
document.getElementById('add').addEventListener("click", addAvenue);
var avenueCount = 0;
function addAvenue () {
  // Makes the main div to hold an avenue
  let ave = document.createElement("div");
  ave.id = `avenue${avenueCount}`;
  ave.class = "avenue";
  // Creates simple text input
  let a = document.createElement("input")
  ave.appendChild(a)
  // Creats delete button
  let b = document.createElement("input");
  b.type = "button";
  b.id = `delete${avenueCount}`;
  b.value = "delete";
  // Adds dynamic event listener to delete button
  let id = ave.id
  b.addEventListener("click", function() {deleteAvenue(id)}) //only works if it was the last one added
  ave.appendChild(b)

  console.log(ave);
  document.getElementById("avenueIn").appendChild(ave);
  ++avenueCount;
};

// Deletes an avenue from the DOM
function deleteAvenue (id) {
  var a = document.getElementById(id)
  a.parentNode.removeChild(a);
};

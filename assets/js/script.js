var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

// saves tasks object in localStorage - tasks are saved in an array that's a property of an object 
var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".card .list-group").sortable({
  // enables dragging across lists
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  // tells jQuery to create a copy of the dragged element and move the copy instead of the original
  helper: "clone",
  // The activate and deactivate events trigger once for all connected lists as soon as dragging starts and stops.
  activate: function(event, ui) {
    console.log(ui);
  },
  deactivate: function(event, ui) {
    console.log(ui);
  },
  // The over and out events trigger when a dragged item enters or leaves a connected list.
  over: function(event) {
    console.log(event);
  }, 
  out: function(event) {
    console.log(event);
  },
  // The update event triggers when the contents of a list have changed (e.g., the items were re-ordered, an item was removed, or an item was added).
  update: function() {
    var tempArr = [];
    // loop over current set of children in sortable list
    $(this).children().each(function() {

      // add task data to the temp array as an object
      tempArr.push({
        text: $(this)
        .find("p")
        .text()
        .trim(),
        date: $(this)
        .find("span")
        .text()
        .trim()
      });
    });

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    console.log("drop");
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

// begins editing task on click 
$(".list-group").on("click", "p", function() {
  var text = $(this).text();
  console.log(text);
// $("<textarea>") tells jQuery to create a new <textarea> element. uses the HTML syntax for an opening tag to indicate the element to be created.
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);

  $(this).replaceWith(textInput);
  textInput.trigger("focus");

});

// allows you to save your editted task item 
$(".list-group").on("blur", "textarea", function () {
  // get the textarea's current value/text
  var text = $(this)
    .val();
  // get status type and position in the list
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  var index = $(this)
    .closest(".list-group-item")
    .index();
  
    tasks[status][index].text = text;
    saveTasks();

  // recreate p element 
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace text area w p element
  $(this).replaceWith(taskP);
});

//due date was clicked - but does not allow edit to save
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  //swap out elements
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed and saved
$(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-","");

  //get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element w bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});



// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// EU clicked the Save Changes button to add the task to the list
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();



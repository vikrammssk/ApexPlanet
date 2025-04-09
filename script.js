// Form Validation
document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const error = document.getElementById("formError");
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      error.textContent = "Please enter a valid email.";
    } else {
      error.textContent = "";
      alert("Form submitted successfully!");
      this.reset();
    }
  });
  
  // To-Do List
  function addTask() {
    const taskInput = document.getElementById("taskInput");
    const task = taskInput.value.trim();
    if (task === "") return;
  
    const li = document.createElement("li");
    li.textContent = task;
  
    li.addEventListener("click", () => li.remove());
  
    document.getElementById("taskList").appendChild(li);
    taskInput.value = "";
  }
  
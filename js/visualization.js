// Immediately Invoked Function Expression to limit access to variables
((() => {
  // Add event listener for the dark mode toggle
document.getElementById("dark-mode-toggle").addEventListener("change", (event) => {
  if (event.target.checked) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
});

})());
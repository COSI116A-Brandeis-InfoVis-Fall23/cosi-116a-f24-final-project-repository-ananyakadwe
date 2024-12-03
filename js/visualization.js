// Immediately Invoked Function Expression to limit access to variables
((() => {
document.getElementById("dark-mode-toggle").addEventListener("change", function () {
  if (this.checked) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
});
})());
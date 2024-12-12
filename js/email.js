(function() {
  // Get all data in form and return an object
  function getFormData(form) {
    var elements = form.elements;
    var honeypot;

    var fields = Object.keys(elements).filter(function(k) {
      if (elements[k].name === "honeypot") {
        honeypot = elements[k].value;
        return false;
      }
      return true;
    }).map(function(k) {
      if (elements[k].name !== undefined) {
        return elements[k].name;
      } else if (elements[k].length > 0) { // For multiple elements
        return elements[k].item(0).name;
      }
    }).filter(function(item, pos, self) {
      return self.indexOf(item) == pos && item;
    });

    var formData = {};
    fields.forEach(function(name) {
      var element = elements[name];
      formData[name] = element.value;

      // Handle multiple elements (e.g., checkboxes, dropdowns)
      if (element.length) {
        var data = [];
        for (var i = 0; i < element.length; i++) {
          var item = element.item(i);
          if (item.checked || item.selected) {
            data.push(item.value);
          }
        }
        formData[name] = data.join(', ');
      }
    });

    return { data: formData, honeypot: honeypot };
  }

  function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission
    var form = event.target;
    var formData = getFormData(form);

    // If honeypot field is filled, abort submission
    if (formData.honeypot) {
      console.log("Honeypot triggered. Submission aborted.");
      return false;
    }

    disableAllButtons(form);

    // Prepare data for POST request
    var url = form.action;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json"); // Sending JSON data
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          console.log("Form submission successful:", xhr.responseText);
          form.reset();
          showSuccessMessage();
        } else {
          console.error("Form submission failed:", xhr.status, xhr.statusText);
          showErrorMessage();
        }
        enableAllButtons(form);
      }
    };

    // Send data as JSON
    var jsonPayload = JSON.stringify(formData.data);
    xhr.send(jsonPayload);
  }

  function showSuccessMessage() {
    var messageBox = document.getElementById("messages");
    if (messageBox) {
      messageBox.textContent = "Thank you! Your message has been sent.";
      messageBox.classList.remove("hide");
      messageBox.classList.add("success");
    }
  }

  function showErrorMessage() {
    var messageBox = document.getElementById("messages");
    if (messageBox) {
      messageBox.textContent = "Oops! Something went wrong. Please try again later.";
      messageBox.classList.remove("hide");
      messageBox.classList.add("error");
    }
  }

  function disableAllButtons(form) {
    var buttons = form.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  }

  function enableAllButtons(form) {
    var buttons = form.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = false;
    }
  }

  function loaded() {
    // Bind to the submit event of forms with class "gform"
    var forms = document.querySelectorAll("form.gform");
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", handleFormSubmit, false);
    }
  }

  document.addEventListener("DOMContentLoaded", loaded, false);
})();

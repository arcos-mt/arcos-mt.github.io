(function () {
  "use strict";

  let forms = document.querySelectorAll(".php-email-form");

  forms.forEach(function (e) {
    e.addEventListener("submit", function (event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute("action");
      let recaptcha = thisForm.getAttribute("data-recaptcha-site-key");

      if (!action) {
        displayError(thisForm, "The form action property is not set!");
        return;
      }
      thisForm.querySelector(".loading").classList.add("d-block");
      thisForm.querySelector(".error-message").classList.remove("d-block");
      thisForm.querySelector(".sent-message").classList.remove("d-block");

      let formData = new FormData(thisForm);

      if (recaptcha) {
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.ready(function () {
            try {
              grecaptcha
                .execute(recaptcha, { action: "php_email_form_submit" })
                .then((token) => {
                  formData.set("recaptcha-response", token);
                  php_email_form_submit(thisForm, action, formData);
                });
            } catch (error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(
            thisForm,
            "The reCaptcha javascript API url is not loaded!"
          );
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    const object = {};
    formData.forEach((value, key) => {
      object[key] = value;
    });
    const json = JSON.stringify(object);
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: json,
    })
      .then(async (response) => {
        let json = await response.json();
        thisForm.querySelector(".loading").classList.remove("d-block");
        if (response.status == 200) {
          thisForm.querySelector(".sent-message").classList.add("d-block");
          thisForm.reset();
        } else {
          throw new Error(
            json.message
              ? json.message
              : "Form submission failed and no error message returned from: " +
                action
          );
        }
      })
      .catch((error) => {
        displayError(thisForm, error);
      });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector(".loading").classList.remove("d-block");
    thisForm.querySelector(".error-message").innerHTML = error;
    thisForm.querySelector(".error-message").classList.add("d-block");
  }
})();

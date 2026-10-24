document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission behavior

    const formData = new FormData(this); // Collect the form data
    fetch(this.action, {
        method: this.method,
        body: formData,
        headers: { Accept: "application/json" },
    })
        .then((response) => {
            if (response.ok) {
                alert("Thank you for your submission!");
                this.reset(); // Clear the form fields
            } else {
                alert("Oops! There was an issue submitting your form.");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("There was an error submitting your form.");
        });
});

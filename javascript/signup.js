document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("signup-email").value;
      const fname = document.getElementById("signup-fname").value;
      const lname = document.getElementById("signup-lname").value;
      const password = document.getElementById("signup-password").value;

      // Combine names to match backend schema
      const fullName = `${fname} ${lname}`;

      const userData = {
        name: fullName,
        email: email,
        password: password,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          alert("Account created successfully! Please log in.");
          window.location.href = "signin.html";
        } else {
          const error = await response.json();
          alert(`Signup failed: ${error.detail || "Something went wrong"}`);
        }
      } catch (err) {
        console.error("Network error:", err);
        alert("Cannot connect to server. Is the backend running?");
      }
    });
  }
});

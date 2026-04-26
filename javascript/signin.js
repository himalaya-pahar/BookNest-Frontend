document.addEventListener("DOMContentLoaded", () => {
  const signinForm = document.getElementById("signin-form");
  const errorMsg = document.getElementById("signin-error");

  if (signinForm) {
    signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMsg.style.display = "none";

      const email = document.getElementById("signin-email").value;
      const password = document.getElementById("signin-password").value;

      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();

          localStorage.setItem("token", data.access_token);

          localStorage.setItem("currentUserEmail", email);

          window.location.href = "marketplace.html";
        } else {
          errorMsg.style.display = "block";
        }
      } catch (err) {
        console.error("Network error:", err);
        alert("Server connection failed.");
      }
    });
  }
});
